import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface PdfPreviewDialogData {
  pdfUrl: string;
  pdfBlob: Blob;
  fileName: string;
}

@Component({
  selector: 'app-pdf-preview-dialog',
  standalone: false,
  templateUrl: './pdf-preview-dialog.component.html',
  styleUrls: ['./pdf-preview-dialog.component.css']
})
export class PdfPreviewDialogComponent implements OnInit, OnDestroy {
  safePdfUrl: SafeResourceUrl | null = null;

  constructor(
    public dialogRef: MatDialogRef<PdfPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfPreviewDialogData,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (this.data.pdfUrl) {
      this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.pdfUrl);
    }
  }

  ngOnDestroy(): void {
    if (this.data.pdfUrl) {
      // Revoke the object URL to free up resources
      URL.revokeObjectURL(this.data.pdfUrl);
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  downloadPdf(): void {
    const link = document.createElement('a');
    link.href = this.data.pdfUrl; // Object URL can be used for download as well
    link.download = this.data.fileName || 'invoice.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // No need to revoke here as it's handled in ngOnDestroy
  }
}
