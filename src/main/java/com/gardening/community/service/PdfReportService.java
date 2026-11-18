package com.gardening.community.service;

import com.gardening.community.model.GardeningProject;
import com.gardening.community.model.ProjectLog;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service responsible for generating PDF project reports using the OpenPDF library.
 * Each report includes project metadata, plant types, and a detailed milestone log table.
 */
@Service
public class PdfReportService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(45, 106, 79));
    private static final Font HEADING_FONT = new Font(Font.HELVETICA, 14, Font.BOLD, new Color(30, 41, 59));
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(51, 65, 85));
    private static final Font LABEL_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, new Color(71, 85, 105));
    private static final Font TABLE_HEADER_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
    private static final Font TABLE_CELL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(51, 65, 85));

    /**
     * Generates a PDF report for the given gardening project and its log entries.
     *
     * @param project the gardening project to generate a report for
     * @param logs    the list of progress log entries for the project
     * @return byte array containing the generated PDF document
     */
    public byte[] generateProjectReport(GardeningProject project, List<ProjectLog> logs) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, outputStream);
            document.open();

            addDocumentHeader(document, project);
            addProjectDetails(document, project);
            addProgressLogTable(document, logs);
            addFooter(document);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF report for project: " + project.getTitle(), e);
        }

        return outputStream.toByteArray();
    }

    /**
     * Adds the report title and generation date header.
     */
    private void addDocumentHeader(Document document, GardeningProject project) throws DocumentException {
        Paragraph title = new Paragraph("Project Report", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Paragraph projectName = new Paragraph(project.getTitle(), HEADING_FONT);
        projectName.setAlignment(Element.ALIGN_CENTER);
        projectName.setSpacingBefore(8);
        document.add(projectName);

        Paragraph generatedDate = new Paragraph(
                "Generated on: " + java.time.LocalDate.now().format(DATE_FORMAT), NORMAL_FONT);
        generatedDate.setAlignment(Element.ALIGN_CENTER);
        generatedDate.setSpacingBefore(4);
        generatedDate.setSpacingAfter(20);
        document.add(generatedDate);

        addHorizontalLine(document);
    }

    /**
     * Adds the project metadata section including description, plant types, dates, and status.
     */
    private void addProjectDetails(Document document, GardeningProject project) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("Project Details", HEADING_FONT);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        addLabelValuePair(document, "Description:", project.getDescription());
        addLabelValuePair(document, "Plant Types:", project.getPlantTypes());
        addLabelValuePair(document, "Status:", project.getStatus().name());

        if (project.getStartDate() != null) {
            addLabelValuePair(document, "Start Date:", project.getStartDate().format(DATE_FORMAT));
        }
        if (project.getTargetHarvestDate() != null) {
            addLabelValuePair(document, "Target Harvest:", project.getTargetHarvestDate().format(DATE_FORMAT));
        }

        addHorizontalLine(document);
    }

    /**
     * Adds the progress log table with date, milestone, and notes columns.
     */
    private void addProgressLogTable(Document document, List<ProjectLog> logs) throws DocumentException {
        Paragraph sectionTitle = new Paragraph("Progress Log", HEADING_FONT);
        sectionTitle.setSpacingBefore(15);
        sectionTitle.setSpacingAfter(10);
        document.add(sectionTitle);

        if (logs.isEmpty()) {
            Paragraph noLogs = new Paragraph("No progress logs have been recorded for this project.", NORMAL_FONT);
            noLogs.setSpacingAfter(10);
            document.add(noLogs);
            return;
        }

        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 2.5f, 5.5f});
        table.setSpacingBefore(5);

        Color headerBg = new Color(45, 106, 79);
        addTableHeader(table, "Date", headerBg);
        addTableHeader(table, "Milestone", headerBg);
        addTableHeader(table, "Notes", headerBg);

        boolean alternate = false;
        for (ProjectLog log : logs) {
            Color rowBg = alternate ? new Color(241, 245, 249) : Color.WHITE;

            addTableCell(table, log.getLogDate() != null ? log.getLogDate().format(DATE_FORMAT) : "-", rowBg);
            addTableCell(table, log.getMilestone() != null && !log.getMilestone().isEmpty() ? log.getMilestone() : "-", rowBg);
            addTableCell(table, log.getNote(), rowBg);

            alternate = !alternate;
        }

        document.add(table);
    }

    /**
     * Adds a styled header cell to the table.
     */
    private void addTableHeader(PdfPTable table, String text, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_HEADER_FONT));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    /**
     * Adds a styled data cell to the table.
     */
    private void addTableCell(PdfPTable table, String text, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, TABLE_CELL_FONT));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    /**
     * Adds a label-value pair paragraph to the document.
     */
    private void addLabelValuePair(Document document, String label, String value) throws DocumentException {
        Paragraph paragraph = new Paragraph();
        paragraph.add(new Chunk(label + " ", LABEL_FONT));
        paragraph.add(new Chunk(value != null ? value : "Not specified", NORMAL_FONT));
        paragraph.setSpacingAfter(4);
        document.add(paragraph);
    }

    /**
     * Adds a visual horizontal line separator.
     */
    private void addHorizontalLine(Document document) throws DocumentException {
        Paragraph line = new Paragraph(
                "________________________________________________________________________________", NORMAL_FONT);
        line.setSpacingBefore(10);
        line.setSpacingAfter(5);
        document.add(line);
    }

    /**
     * Adds a footer with platform branding.
     */
    private void addFooter(Document document) throws DocumentException {
        Paragraph footer = new Paragraph();
        footer.setSpacingBefore(30);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.add(new Chunk("Online Gardening Community Platform", LABEL_FONT));
        document.add(footer);

        Paragraph disclaimer = new Paragraph("This report was auto-generated by the platform.", NORMAL_FONT);
        disclaimer.setAlignment(Element.ALIGN_CENTER);
        disclaimer.setSpacingBefore(2);
        document.add(disclaimer);
    }
}
