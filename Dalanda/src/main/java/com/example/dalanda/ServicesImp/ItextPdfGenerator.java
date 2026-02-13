// src/main/java/com/example/dalanda/pdf/ItextPdfGenerator.java
package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.Client;
import com.example.dalanda.Entities.Company;
import com.example.dalanda.Entities.Invoice;
import com.example.dalanda.Entities.InvoiceItem;
import com.example.dalanda.Entities.TaxOption;
import com.example.dalanda.Services.PdfGenerator;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ItextPdfGenerator implements PdfGenerator {
    private static final Logger log = LoggerFactory.getLogger(ItextPdfGenerator.class);
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Fonts
    private static final Font FONT_TITLE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, BaseColor.DARK_GRAY);
    private static final Font FONT_HEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
    private static final Font FONT_SUBHEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.DARK_GRAY);
    private static final Font FONT_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.GRAY);
    private static final Font FONT_VALUE = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
    private static final Font FONT_TABLE_HEADER = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, BaseColor.WHITE);
    private static final Font FONT_TABLE_CELL = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.DARK_GRAY);
    private static final Font FONT_TOTAL_LABEL = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.BLACK);
    private static final Font FONT_TOTAL_VALUE = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.BLACK);

    // Colors
    private static final BaseColor COLOR_PRIMARY = new BaseColor(76, 175, 80); // A modern green
    private static final BaseColor COLOR_TABLE_HEADER_BG = new BaseColor(68, 84, 106); // Dark blue/grey
    private static final BaseColor COLOR_TABLE_BORDER = new BaseColor(200, 200, 200);
    private static final BaseColor COLOR_LIGHT_GREY_BACKGROUND = new BaseColor(245, 245, 245);


    private final TaxStrategyFactory taxFactory;
    private final DecimalFormat df = new DecimalFormat("#,##0.00");

    public ItextPdfGenerator(TaxStrategyFactory taxFactory) {
        this.taxFactory = taxFactory;
    }

    @Override
    public byte[] generate(Invoice inv) throws Exception {
        Document doc = new Document(PageSize.A4, 36, 36, 50, 36); // Increased top margin
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(doc, baos);

        // Page Events for Header/Footer (optional, can be added later if complex header/footer needed)
        // HeaderFooterPageEvent event = new HeaderFooterPageEvent();
        // writer.setPageEvent(event);

        doc.open();

        // === HEADER SECTION ===
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 2}); // Logo takes less space
        headerTable.setSpacingAfter(20f);

        // Logo
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBorder(Rectangle.NO_BORDER);
        if (inv.getCompany().getLogo() != null) {
            try {
                Image logoImg = Image.getInstance(inv.getCompany().getLogo());
                logoImg.scaleToFit(80, 80); // Adjusted scale
                logoCell.addElement(logoImg);
            } catch (Exception e) {
                log.error("Error adding company logo to PDF: {}", e.getMessage());
            }
        }
        headerTable.addCell(logoCell);

        // Company Info & Invoice Title
        PdfPCell companyInfoCell = new PdfPCell();
        companyInfoCell.setBorder(Rectangle.NO_BORDER);
        companyInfoCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph invoiceTitle = new Paragraph("FACTURE", FONT_TITLE);
        invoiceTitle.setAlignment(Element.ALIGN_RIGHT);
        companyInfoCell.addElement(invoiceTitle);
        Paragraph companyName = new Paragraph(inv.getCompany().getCompanyName(), FONT_HEADER);
        companyName.setAlignment(Element.ALIGN_RIGHT);
        companyInfoCell.addElement(companyName);
        // Potentially add company address/contact here if available and desired
        headerTable.addCell(companyInfoCell);
        doc.add(headerTable);

        // === PARTIES AND INVOICE METADATA ===
        PdfPTable partiesTable = new PdfPTable(3); // From, To, Invoice Details
        partiesTable.setWidthPercentage(100);
        partiesTable.setWidths(new float[]{1.2f, 0.1f, 1.2f}); // company, spacer, client
        partiesTable.setSpacingAfter(25f);

        // From (Company)
        PdfPCell fromCell = createCompanyPartyCell("DE (Vendeur)", inv.getCompany());
        partiesTable.addCell(fromCell);

        PdfPCell spacerCell = new PdfPCell(); // Spacer
        spacerCell.setBorder(Rectangle.NO_BORDER);
        partiesTable.addCell(spacerCell);

        // To (Client)
        PdfPCell toCell = createClientPartyCell("À (Client)", inv.getClient());
        partiesTable.addCell(toCell);
        doc.add(partiesTable);

        // Invoice Info (Number, Date, Due Date)
        PdfPTable metaDataTable = new PdfPTable(1);
        metaDataTable.setWidthPercentage(40);
        metaDataTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        metaDataTable.setSpacingAfter(20f);

        addMetaInfo(metaDataTable, "Numéro de Facture:", inv.getInvoiceNumber());
        addMetaInfo(metaDataTable, "Date d'émission:", inv.getDate().toString()); // Format date if needed
        addMetaInfo(metaDataTable, "Date d'échéance:", inv.getDueDate().toString()); // Format date if needed
        doc.add(metaDataTable);


        // === ITEMS TABLE ===
        PdfPTable itemsTable = new PdfPTable(new float[]{0.8f, 3.5f, 0.8f, 1.2f, 1.2f, 1.2f, 1.5f}); // Réf, Desc, Qty, PU, Tax, Total HT, Total TTC
        itemsTable.setWidthPercentage(100);
        itemsTable.setSpacingBefore(10f);
        itemsTable.setSpacingAfter(20f);
        itemsTable.setHeaderRows(1); // Repeat header on new page

        addItemsTableHeader(itemsTable, new String[]{"Réf.", "Description", "Qté", "P.U. HT", "Taxe", "Total HT", "Total TTC"});

        final BigDecimal baseSubtotal = inv.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (InvoiceItem it : inv.getItems()) {
            BigDecimal lineHt = it.getUnitPrice().multiply(BigDecimal.valueOf(it.getQty()));
            Map<TaxOption, BigDecimal> taxMap = inv.getTaxOptions().stream()
                    .collect(Collectors.toMap(opt -> opt,
                            opt -> taxFactory.forOption(opt).calculateTax(lineHt)));
            BigDecimal totalTaxLine = taxMap.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal lineTtc = lineHt.add(totalTaxLine);

            itemsTable.addCell(createItemsTableCell(it.getId() != null ? it.getId().toString() : "N/A", Element.ALIGN_LEFT));
            itemsTable.addCell(createItemsTableCell(it.getDescription(), Element.ALIGN_LEFT));
            itemsTable.addCell(createItemsTableCell(String.valueOf(it.getQty()), Element.ALIGN_CENTER));
            itemsTable.addCell(createItemsTableCell(df.format(it.getUnitPrice()), Element.ALIGN_RIGHT));
            itemsTable.addCell(createItemsTableCell(df.format(totalTaxLine), Element.ALIGN_RIGHT));
            itemsTable.addCell(createItemsTableCell(df.format(lineHt), Element.ALIGN_RIGHT));
            itemsTable.addCell(createItemsTableCell(df.format(lineTtc), Element.ALIGN_RIGHT));
        }
        doc.add(itemsTable);

        // === TOTALS SECTION ===
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(50); // Adjust width as needed
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.setSpacingBefore(10f);

        BigDecimal totalTaxOverall = inv.getTaxOptions().stream()
                .map(opt -> taxFactory.forOption(opt).calculateTax(baseSubtotal))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grandTotal = baseSubtotal.add(totalTaxOverall);

        addTotalRow(totalsTable, "Sous-total HT:", df.format(baseSubtotal) + " DT");
        addTotalRow(totalsTable, "Montant Total Taxes:", df.format(totalTaxOverall) + " DT");
        addTotalRow(totalsTable, "TOTAL À PAYER:", df.format(grandTotal) + " DT", FONT_TOTAL_LABEL, FONT_TOTAL_VALUE, true);
        doc.add(totalsTable);

        // === SIGNATURE SECTION ===
        doc.add(new Paragraph("\n\n\n")); // Add some vertical space
        if (inv.getCompany() != null && inv.getCompany().getStampSignature() != null) {
            byte[] stampBytes = inv.getCompany().getStampSignature();
            log.info("Attempting to add stamp signature. Data present: {}, Size: {} bytes", (stampBytes != null && stampBytes.length > 0), stampBytes != null ? stampBytes.length : 0);
            if (stampBytes.length > 0) {
                try {
                    Image stampImage = Image.getInstance(stampBytes);
                    stampImage.scaleToFit(150, 75); // Adjusted scale
                    stampImage.setAlignment(Element.ALIGN_RIGHT);

                    // Create a table to position the signature to the far right bottom
                    PdfPTable signatureTable = new PdfPTable(1);
                    signatureTable.setWidthPercentage(100);
                    PdfPCell sigCell = new PdfPCell(stampImage);
                    sigCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                    sigCell.setBorder(Rectangle.NO_BORDER);
                    signatureTable.addCell(sigCell);
                    doc.add(signatureTable);

                    log.info("Stamp signature image added to PDF.");
                } catch (Exception e) {
                    log.error("Error adding stamp signature image to PDF: {}", e.getMessage());
                }
            } else {
                log.warn("Stamp signature data is empty, not adding to PDF.");
            }
        } else {
            log.warn("No company or stamp signature data found for PDF.");
        }

        // === FOOTER (Optional: Terms and Conditions, Thank you note) ===
        Paragraph footerText = new Paragraph("Merci pour votre confiance!", FONT_VALUE);
        footerText.setAlignment(Element.ALIGN_CENTER);
        footerText.setSpacingBefore(30f);
        doc.add(footerText);


        doc.close();
        return baos.toByteArray();
    }

    private PdfPCell createCompanyPartyCell(String title, Company company) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(10f);

        List<String> disabledFields = parseDisabledFields(company.getDisabledFields());

        Paragraph titleP = new Paragraph(title.toUpperCase(), FONT_SUBHEADER);
        titleP.setSpacingAfter(3f);
        cell.addElement(titleP);

        addDetailIfNotDisabled(cell, "Nom de la société", company.getCompanyName(), disabledFields);
        addDetailIfNotDisabled(cell, "Adresse", company.getAddress(), disabledFields);
        addDetailIfNotDisabled(cell, "E-Mail", company.getEmail(), disabledFields);
        addDetailIfNotDisabled(cell, "Numéro de téléphone", company.getPhoneNumber(), disabledFields);
        addDetailIfNotDisabled(cell, "RIB", company.getRib(), disabledFields);
        addDetailIfNotDisabled(cell, "Matricule Fiscal", company.getFiscalMatricule(), disabledFields);

        addCustomFields(cell, company.getCustomFields(), disabledFields);
        return cell;
    }

    private PdfPCell createClientPartyCell(String title, Client client) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPaddingBottom(10f);

        List<String> disabledFields = parseDisabledFields(client.getDisabledFields());

        Paragraph titleP = new Paragraph(title.toUpperCase(), FONT_SUBHEADER);
        titleP.setSpacingAfter(3f);
        cell.addElement(titleP);

        addDetailIfNotDisabled(cell, "Nom de la société", client.getCompanyName(), disabledFields);
        addDetailIfNotDisabled(cell, "Nom du contact", client.getContactName(), disabledFields);
        addDetailIfNotDisabled(cell, "Adresse", client.getAddress(), disabledFields);
        addDetailIfNotDisabled(cell, "E-Mail", client.getEmail(), disabledFields);
        addDetailIfNotDisabled(cell, "Numéro de téléphone", client.getPhoneNumber(), disabledFields);
        addDetailIfNotDisabled(cell, "RIB", client.getRib(), disabledFields);
        addDetailIfNotDisabled(cell, "Matricule Fiscal", client.getFiscalMatricule(), disabledFields);

        addCustomFields(cell, client.getCustomFields(), disabledFields);
        return cell;
    }

    private List<String> parseDisabledFields(String disabledFieldsJson) {
        if (disabledFieldsJson == null || disabledFieldsJson.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(disabledFieldsJson, new TypeReference<List<String>>() {});
        } catch (IOException e) {
            log.error("Error parsing disabledFields JSON: {}", e.getMessage());
            return Collections.emptyList(); // Return empty list on error
        }
    }

    private void addDetailIfNotDisabled(PdfPCell cell, String label, String value, List<String> disabledFields) {
        if (value != null && !value.isEmpty() && !disabledFields.contains(label)) {
            Paragraph p = new Paragraph();
            p.add(new Chunk(label + ": ", FONT_LABEL));
            p.add(new Chunk(value, FONT_VALUE));
            p.setSpacingBefore(2f);
            cell.addElement(p);
        }
    }

    private void addCustomFields(PdfPCell cell, String customFieldsJson, List<String> disabledFields) {
        if (customFieldsJson == null || customFieldsJson.trim().isEmpty()) {
            return;
        }
        try {
            Map<String, String> customFieldsMap = objectMapper.readValue(customFieldsJson, new TypeReference<Map<String, String>>() {});
            for (Map.Entry<String, String> entry : customFieldsMap.entrySet()) {
                if (!disabledFields.contains(entry.getKey())) { // Also check if custom field key is in disabled list
                    addDetailIfNotDisabled(cell, entry.getKey(), entry.getValue(), disabledFields);
                }
            }
        } catch (IOException e) {
            log.error("Error parsing customFields JSON: {}", e.getMessage());
        }
    }


    private void addMetaInfo(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, FONT_LABEL));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPaddingRight(5f);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, FONT_VALUE));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_LEFT);

        PdfPTable lineTable = new PdfPTable(2);
        lineTable.setWidthPercentage(100);
        try {
            lineTable.setWidths(new float[]{1,1});
        } catch (DocumentException e) { /*ignore*/ }
        lineTable.addCell(labelCell);
        lineTable.addCell(valueCell);

        PdfPCell containerCell = new PdfPCell(lineTable);
        containerCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(containerCell);
    }


    private void addItemsTableHeader(PdfPTable table, String[] headers) {
        for (String header : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(header, FONT_TABLE_HEADER));
            cell.setBackgroundColor(COLOR_TABLE_HEADER_BG);
            cell.setBorderColor(COLOR_TABLE_BORDER);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(8f);
            table.addCell(cell);
        }
    }

    private PdfPCell createItemsTableCell(String text, int horizontalAlignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, FONT_TABLE_CELL));
        cell.setHorizontalAlignment(horizontalAlignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6f);
        cell.setBorderColor(COLOR_TABLE_BORDER);
        return cell;
    }

    private void addTotalRow(PdfPTable table, String label, String value) {
        addTotalRow(table, label, value, FONT_LABEL, FONT_VALUE, false);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont, boolean isGrandTotal) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        if(isGrandTotal) {
            labelCell.setBorder(Rectangle.TOP);
            labelCell.setBorderColor(BaseColor.LIGHT_GRAY);
            labelCell.setPaddingTop(5f);
        }
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        labelCell.setPaddingRight(10f);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        if(isGrandTotal) {
            valueCell.setBorder(Rectangle.TOP);
            valueCell.setBorderColor(BaseColor.LIGHT_GRAY);
            valueCell.setPaddingTop(5f);
        }
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }


    @Override
    public String getKey() {
        return "iText";
    }

    // Removed old helper methods as they are replaced by more specific ones or inlined.
    // private PdfPCell infoCell(String label, String value)
    // private void addTableHeader(PdfPTable table, String[] headers)
    // private PdfPCell bodyCell(String text)
    // private PdfPCell bodyCell(String text, int align)
    // private PdfPCell summaryCell(String text)
    // private PdfPCell summaryCell(String text, int align)
}
