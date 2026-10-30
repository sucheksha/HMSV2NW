import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type PDFExportColumn<T> = {
  header: string;
  value: (row: T) => unknown;
};

export type PDFExportOptions<T> = {
  title: string;
  fileName: string;
  columns: PDFExportColumn<T>[];
  rows: T[];
  orientation?: "portrait" | "landscape";
};

const formatCellValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("en-IN");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export function downloadTablePDF<T>({
  title,
  fileName,
  columns,
  rows,
  orientation = "landscape",
}: PDFExportOptions<T>): void {
  if (columns.length === 0) {
    throw new Error("At least one PDF column is required.");
  }

  if (rows.length === 0) {
    throw new Error("There are no records available to export.");
  }

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Report heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(25, 55, 90);
  doc.text(title, 14, 18);

  // Report information
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);

  doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 14, 25);

  doc.text(`Total records: ${rows.length}`, pageWidth - 14, 25, {
    align: "right",
  });

  // Generate bordered table
  autoTable(doc, {
    startY: 32,

    head: [columns.map((column) => column.header)],

    body: rows.map((row) => columns.map((column) => formatCellValue(column.value(row)))),

    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
      valign: "middle",
      lineColor: [190, 190, 190],
      lineWidth: 0.2,
      textColor: [40, 40, 40],
    },

    headStyles: {
      fillColor: [30, 85, 130],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      lineColor: [120, 120, 120],
      lineWidth: 0.3,
    },

    alternateRowStyles: {
      fillColor: [245, 248, 252],
    },

    margin: {
      top: 32,
      right: 14,
      bottom: 18,
      left: 14,
    },

    showHead: "everyPage",

    rowPageBreak: "avoid",
  });

  // Add page number to every page.
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 110, 110);

    doc.text(`Page ${page} of ${totalPages}`, pageWidth - 14, pageHeight - 8, { align: "right" });
  }

  // Download the PDF.
  const safeFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  doc.save(safeFileName);
}
