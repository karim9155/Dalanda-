// src/main/java/com/example/dalanda/pdf/ItextPdfGenerator.java
package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.Invoice;
import com.example.dalanda.Entities.InvoiceItem;
import com.example.dalanda.Entities.TaxOption;
import com.example.dalanda.Services.PdfGenerator;
import com.example.dalanda.ServicesImp.TaxStrategyFactory;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ItextPdfGenerator implements PdfGenerator {
    private static final Font HEADER_FONT    = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font SUBHEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font LABEL_FONT     = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final Font VALUE_FONT     = FontFactory.getFont(FontFactory.HELVETICA, 10);
    private static final Font TABLE_HEADER   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
    private static final BaseColor HEADER_BG = new BaseColor(230, 230, 230);

    private final TaxStrategyFactory taxFactory;
    private final DecimalFormat df = new DecimalFormat("#,##0.00");

    public ItextPdfGenerator(TaxStrategyFactory taxFactory) {
        this.taxFactory = taxFactory;
    }

    @Override
    public byte[] generate(Invoice inv) throws Exception {
        Document doc = new Document(PageSize.A4, 36, 36, 70, 36);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(doc, baos);
        doc.open();

        // Compute base subtotal once (final for lambda)
        final BigDecimal baseSubtotal = inv.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Header with logo and company
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{3, 1});

        PdfPCell cellLeft = new PdfPCell();
        cellLeft.setBorder(Rectangle.NO_BORDER);
        cellLeft.addElement(new Paragraph(inv.getCompany().getCompanyName(), HEADER_FONT));
        header.addCell(cellLeft);

        PdfPCell cellRight = new PdfPCell();
        cellRight.setBorder(Rectangle.NO_BORDER);
        if (inv.getCompany().getLogo() != null) {
            Image logo = Image.getInstance(inv.getCompany().getLogo());
            logo.scaleToFit(100, 50);
            logo.setAlignment(Element.ALIGN_RIGHT);
            cellRight.addElement(logo);
        }
        header.addCell(cellRight);
        doc.add(header);
        doc.add(Chunk.NEWLINE);

        // Parties and invoice info
        PdfPTable info = new PdfPTable(2);
        info.setWidthPercentage(100);
        info.setWidths(new float[]{1, 1});

        PdfPCell from = infoCell("DE", inv.getCompany().getCompanyName());
        PdfPCell to   = infoCell("À", inv.getClient().getCompanyName());
        info.addCell(from);
        info.addCell(to);

        PdfPCell invMeta = new PdfPCell();
        invMeta.setBorder(Rectangle.NO_BORDER);
        invMeta.addElement(new Paragraph("Numéro: " + inv.getInvoiceNumber(), LABEL_FONT));
        invMeta.addElement(new Paragraph("Date: "   + inv.getDate(), VALUE_FONT));
        invMeta.addElement(new Paragraph("Échéance: " + inv.getDueDate(), VALUE_FONT));
        info.addCell(invMeta);
        info.addCell(new PdfPCell()); // empty
        doc.add(info);
        doc.add(Chunk.NEWLINE);

        // Items table
        List<InvoiceItem> itemsList = inv.getItems();
        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2, 4, 1, 2, 2, 2, 2});

        addTableHeader(table, new String[]{"Réf.", "Description", "Qté", "PU HT", "Taxe", "Total HT", "Total TTC"});

        for (InvoiceItem it : itemsList) {
            BigDecimal lineHt  = it.getUnitPrice().multiply(BigDecimal.valueOf(it.getQty()));
            Map<TaxOption, BigDecimal> taxMap = inv.getTaxOptions().stream()
                    .collect(Collectors.toMap(opt -> opt,
                            opt -> taxFactory.forOption(opt).calculateTax(lineHt)));
            BigDecimal totalTaxLine = taxMap.values().stream()
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal lineTtc = lineHt.add(totalTaxLine);

            table.addCell(bodyCell(it.getId().toString()));
            table.addCell(bodyCell(it.getDescription()));
            table.addCell(bodyCell(String.valueOf(it.getQty()), Element.ALIGN_RIGHT));
            table.addCell(bodyCell(df.format(it.getUnitPrice()), Element.ALIGN_RIGHT));
            table.addCell(bodyCell(df.format(totalTaxLine), Element.ALIGN_RIGHT));
            table.addCell(bodyCell(df.format(lineHt), Element.ALIGN_RIGHT));
            table.addCell(bodyCell(df.format(lineTtc), Element.ALIGN_RIGHT));
        }
        doc.add(table);
        doc.add(Chunk.NEWLINE);

        // Summary
        BigDecimal totalTax = inv.getTaxOptions().stream()
                .map(opt -> taxFactory.forOption(opt).calculateTax(baseSubtotal))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal total = baseSubtotal.add(totalTax);

        PdfPTable summary = new PdfPTable(2);
        summary.setWidthPercentage(40);
        summary.setHorizontalAlignment(Element.ALIGN_RIGHT);
        summary.addCell(summaryCell("Sous-total:"));
        summary.addCell(summaryCell(df.format(baseSubtotal), Element.ALIGN_RIGHT));
        summary.addCell(summaryCell("Taxes:"));
        summary.addCell(summaryCell(df.format(totalTax), Element.ALIGN_RIGHT));
        summary.addCell(summaryCell("Total à payer:"));
        summary.addCell(summaryCell(df.format(total) + " DT", Element.ALIGN_RIGHT));
        doc.add(summary);

        doc.close();
        return baos.toByteArray();
    }

    @Override
    public String getKey() {
        return "iText";
    }

    private PdfPCell infoCell(String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.addElement(new Paragraph(label, SUBHEADER_FONT));
        cell.addElement(new Paragraph(value, VALUE_FONT));
        return cell;
    }

    private void addTableHeader(PdfPTable table, String[] headers) {
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, TABLE_HEADER));
            cell.setBackgroundColor(HEADER_BG);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }
    }

    private PdfPCell bodyCell(String text) {
        return bodyCell(text, Element.ALIGN_LEFT);
    }

    private PdfPCell bodyCell(String text, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, VALUE_FONT));
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        return cell;
    }

    private PdfPCell summaryCell(String text) {
        return summaryCell(text, Element.ALIGN_LEFT);
    }

    private PdfPCell summaryCell(String text, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, LABEL_FONT));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setHorizontalAlignment(align);
        return cell;
    }
}
