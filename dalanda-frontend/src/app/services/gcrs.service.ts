import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { PdfPreviewDialogComponent } from '../pdf-preview-dialog/pdf-preview-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class GcrsService {
  private apiUrl = 'http://localhost:8080/api/gcrs/generate';

  constructor(private http: HttpClient, private dialog: MatDialog) { }

  preview(data: any): void {
    this.http.post(this.apiUrl, data, { responseType: 'blob' }).subscribe(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        this.dialog.open(PdfPreviewDialogComponent, {
          width: '80%',
          height: '90%',
          data: {
            pdfUrl: reader.result as string
          }
        });
      };
      reader.readAsDataURL(blob);
    });
  }

  download(data: any): void {
    this.http.post(this.apiUrl, data, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificat.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
