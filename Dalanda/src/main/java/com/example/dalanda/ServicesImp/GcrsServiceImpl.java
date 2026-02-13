package com.example.dalanda.ServicesImp;

import com.example.dalanda.Services.GcrsService;
import com.example.dalanda.dto.GcrsRequestDto;
import org.springframework.stereotype.Service;

import java.io.IOException;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DecimalFormat;

@Service
public class GcrsServiceImpl implements GcrsService {

    @Override
    public byte[] generateCertificate(GcrsRequestDto dto) throws IOException {
        Document document = new Document();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Header
            addCenteredParagraph(document, "REPUBLIQUE TUNISIENNE", headerFont);
            addCenteredParagraph(document, "MINISTERE DU PLAN ET DES FINANCES", headerFont);
            addCenteredParagraph(document, "DIRECTION GENERALE DU CONTROLE FISCAL", headerFont);
            document.add(new Paragraph("\n"));

            // Title
            addCenteredParagraph(document, "CERTIFICAT DE RETENUE D’IMPOT SUR LE REVENU OU D’IMPOT SUR LES SOCIETES", titleFont);
            document.add(new Paragraph("\n"));

            // Subheaders
            document.add(new Paragraph("Retenue effectuée le " + dto.getDateFacturation() + " ou pendant :", normalFont));
            document.add(new Paragraph("Facture : " + dto.getInvoiceNumber(), normalFont));
            document.add(new Paragraph("\n"));

            // A. PERSONNE OU ORGANISME PAYEUR
            document.add(new Paragraph("A. PERSONNE OU ORGANISME PAYEUR", sectionFont));
            document.add(new Paragraph("IDENTIFIANT : " + dto.getCompanyId(), normalFont));
            document.add(new Paragraph("Dénomination : " + dto.getCompanyName(), normalFont));
            document.add(new Paragraph("Adresse : " + dto.getCompanyAddress(), normalFont));
            document.add(new Paragraph("\n"));

            // B. RETENUES AFFECTÉES SUR
            document.add(new Paragraph("B. RETENUES AFFECTÉES SUR", sectionFont));
            List list = new List(List.UNORDERED);
            list.add(new ListItem("Revenu des comptes spéciaux d’épargne-pension", normalFont));
            list.add(new ListItem("Revenu des capitaux mobilier", normalFont));
            list.add(new ListItem("Revenu des bons de caisse", normalFont));
            document.add(list);
            document.add(new Paragraph("\n"));

            // Table
            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.addCell(createCell("MONTANT BRUT", sectionFont));
            table.addCell(createCell("RETENUE " + dto.getTauxRetenue(), sectionFont));
            table.addCell(createCell("MONTANT NET", sectionFont));

            double amountTTC = dto.getAmountTTC();
            double taux = Double.parseDouble(dto.getTauxRetenue().replace("%", "")) / 100;
            double retenue = amountTTC * taux;
            double netAmount = amountTTC - retenue;

            DecimalFormat df = new DecimalFormat("#.##");

            table.addCell(createCell(df.format(amountTTC) + " DT", normalFont));
            table.addCell(createCell(df.format(retenue) + " DT", normalFont));
            table.addCell(createCell(df.format(netAmount) + " DT", normalFont));

            table.addCell(createCell("Total Général", sectionFont));
            table.addCell(createCell("", normalFont));
            table.addCell(createCell(df.format(netAmount) + " DT", normalFont));

            document.add(table);
            document.add(new Paragraph("\n"));

            // C. BENEFICIAIRE
            document.add(new Paragraph("C. BENEFICIAIRE", sectionFont));
            document.add(new Paragraph("N° de la carte ou de séjour pour les étrangers :", normalFont));
            document.add(new Paragraph("IDENTIFIANT : " + dto.getClientId(), normalFont));
            document.add(new Paragraph("Nom/prénoms ou raison sociale : " + dto.getClientName(), normalFont));
            document.add(new Paragraph("Adresse professionnelle : " + dto.getClientAddress(), normalFont));
            document.add(new Paragraph("Adresse de résidence : " + dto.getClientAddress(), normalFont));
            document.add(new Paragraph("\n\n"));

            // Footer
            document.add(new Paragraph("Je soussigné, certifie exacts les renseignements figurant sur le présent certificat et m’expose aux sanctions prévues par la loi pour toute inexactitude.", normalFont));
            document.add(new Paragraph("\n"));
            PdfPTable footerTable = new PdfPTable(2);
            footerTable.setWidthPercentage(100);
            footerTable.getDefaultCell().setBorder(Rectangle.NO_BORDER);
            footerTable.addCell(new Paragraph("TUNIS le " + dto.getDateFacturation(), normalFont));
            PdfPCell cell = new PdfPCell(new Paragraph("Cachet et signature du payeur", normalFont));
            cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            cell.setBorder(Rectangle.NO_BORDER);
            footerTable.addCell(cell);
            document.add(footerTable);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
        return baos.toByteArray();
    }

    private void addCenteredParagraph(Document document, String text, Font font) throws DocumentException {
        Paragraph p = new Paragraph(text, font);
        p.setAlignment(Element.ALIGN_CENTER);
        document.add(p);
    }

    private PdfPCell createCell(String content, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(content, font));
        cell.setPadding(5);
        return cell;
    }
}
