import {Component, OnInit} from '@angular/core';
import {TokenService} from '../services/token.service';
import {Router} from '@angular/router';
import { InvoiceService } from '../services/invoice.service';
import {Invoice, Client, Company} from '../models/invoice'; // Import Client and Company
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { switchMap } from 'rxjs/operators';
import {FullInvoicePayload} from '../models/full-invoice-payload';
import {MatSelectChange} from '@angular/material/select'; // Import MatSelectChange
import { MatDialog } from '@angular/material/dialog';
import { PdfPreviewDialogComponent, PdfPreviewDialogData } from '../pdf-preview-dialog/pdf-preview-dialog.component';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  invoices: Invoice[] = [];
  userUuid!: string;

  constructor(
    private tokenSvc: TokenService,
    private invoiceService: InvoiceService,
    private router: Router,
    private snackBar: MatSnackBar, // Inject MatSnackBar
    private dialog: MatDialog // Inject MatDialog
  ) {}
  ngOnInit() {
    // read the real user id that you stored on login
    const uuid = localStorage.getItem('userUuid');
    if (!uuid) {
      this.router.navigate(['/login']);
      return;
    }
    this.userUuid = uuid;

    this.invoiceService.getByUser(uuid)
      .subscribe(list => {
        console.log('Invoices received from backend:', list);
        this.invoices = list;
      });
  }


  private loadInvoices() {
    this.invoiceService.list().subscribe({
      next: invs => this.invoices = invs,
      error: err => console.error('Error loading invoices', err)
    });
  }

  /**
   * If id is passed, go to edit;
   * otherwise open blank form for new
   */
  navigateToInvoiceForm(id?: number) {
    if (id != null) {
      this.router.navigate(['/invoice-form', id]);
    } else {
      this.router.navigate(['/invoice-form']);
    }
  }

  logout() {
    // 1) clear the stored JWT
    this.tokenSvc.clear();

    // 2) navigate back to login
    this.router.navigate(['/login']);
  }

  // navigateToInvoiceForm() {
  //   this.router.navigate(['/invoices/new']);
  // }

  quickUpdateStatus(invoiceId: number, newStatus: "pending" | "paid" | "overdue" | "draft", event?: MatSelectChange<any>): void {
    // MatSelectChange doesn't have stopPropagation/preventDefault methods
    // The click propagation is already handled in the template with (click)="$event.stopPropagation()"

    this.invoiceService.getById(invoiceId).pipe(
      switchMap(invoiceToUpdate => {
        if (!invoiceToUpdate) {
          throw new Error('Invoice not found');
        }
        // The service expects FullInvoicePayload. We need to ensure the fetched invoice
        // conforms to this structure or can be mapped to it.
        // Assuming the fetched 'Invoice' object is compatible enough or
        // the service's updateInvoice can handle it.
        // The key parts for FullInvoicePayload are:
        // invoiceNumber, date, dueDate, totalAmount, client:{id}, company:{id}, createdBy:{id}, items, taxOptions, and now status.

        const createdByPayload = { id: localStorage.getItem('userUuid')! };
        if (!createdByPayload.id) {
          throw new Error('User UUID not found in localStorage. Cannot update invoice.');
        }

        // @ts-ignore
        const payload: FullInvoicePayload = {
          // Map fields from invoiceToUpdate to FullInvoicePayload explicitly
          invoiceNumber: invoiceToUpdate.invoiceNumber,
          date: invoiceToUpdate.date, // Assuming date is already string in ISO format
          dueDate: invoiceToUpdate.dueDate, // Assuming dueDate is already string in ISO format
          totalAmount: invoiceToUpdate.totalAmount,
          client: { id: invoiceToUpdate.client.id },
          company: { id: invoiceToUpdate.company.id },
          createdBy: createdByPayload,
          items: invoiceToUpdate.items.map(item => ({ // Ensure items match InvoiceItemDTO structure if necessary
            id: item.id, // This might be an issue if backend expects items without IDs for update, or specific DTOs
            description: item.description,
            qty: item.qty,
            unitPrice: item.unitPrice,
            // lineTotal is usually calculated, not sent. Assuming FullInvoicePayload's items don't need it.
          })),
          taxOptions: invoiceToUpdate.taxOptions, // Assuming TaxOption[] is compatible
          status: newStatus,
        };

        return this.invoiceService.updateInvoice(invoiceId, payload);
      })
    ).subscribe({
      next: updatedInvoice => {
        const index = this.invoices.findIndex(inv => inv.id === invoiceId);
        if (index !== -1) {
          // Ensure the status is updated on the local object for immediate UI feedback
          this.invoices[index] = { ...this.invoices[index], status: newStatus };
          // Or, if the backend returns the full updated invoice:
          this.invoices[index] = updatedInvoice;
        }
        this.snackBar.open(`Invoice status updated to ${newStatus}`, 'Close', { duration: 3000 });
      },
      error: err => {
        console.error('Error updating invoice status', err);
        this.snackBar.open('Failed to update status. Please try again.', 'Error', { duration: 3000 });
        // Optionally, revert the status change in the UI if it was optimistic
      }
    });
  }

  toggleDeclaration(invoice: Invoice, event: MatSlideToggleChange): void {
    // The slide toggle has already visually changed its state due to user interaction.
    // `event.checked` reflects the new state (true if toggled on, false if off).
    const intendedDeclarationStatus = event.checked ? 1 : 0;

    // Temporarily update local data for optimistic UI update.
    // This is optional but provides better UX.
    const originalDeclaration = invoice.declaration;
    invoice.declaration = intendedDeclarationStatus;

    this.invoiceService.toggleInvoiceDeclaration(invoice.id).subscribe({
      next: (updatedInvoice) => {
        // Backend confirmed the change, update local data with the authoritative response.
        const index = this.invoices.findIndex(inv => inv.id === updatedInvoice.id);
        if (index !== -1) {
          this.invoices[index] = updatedInvoice;
          // Ensure the view updates if OnPush change detection is used
          this.invoices = [...this.invoices];
        }
        this.snackBar.open(`Invoice ${updatedInvoice.invoiceNumber} marked as ${updatedInvoice.declaration === 1 ? 'Declared' : 'Not Declared'}.`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error toggling invoice declaration', err);
        // Revert the optimistic update on error.
        const index = this.invoices.findIndex(inv => inv.id === invoice.id);
        if (index !== -1) {
          this.invoices[index].declaration = originalDeclaration; // Revert to original state
          // Force view update
          this.invoices = [...this.invoices];
        }
        this.snackBar.open('Failed to update declaration status. Please try again.', 'Error', { duration: 3000 });
      }
    });
  }

  openPdfPreview(invoice: Invoice, event: MouseEvent): void {
    event.stopPropagation(); // Prevent card click event from firing

    if (!invoice || typeof invoice.id !== 'number') {
      console.error('Invalid invoice or invoice ID for PDF preview.');
      this.snackBar.open('Could not preview PDF: Invalid invoice data.', 'Close', { duration: 3000 });
      return;
    }

    this.invoiceService.downloadPdf(invoice.id).subscribe({
      next: (blob) => {
        if (blob.size === 0) {
          this.snackBar.open('No PDF available or PDF is empty.', 'Close', { duration: 3000 });
          return;
        }
        const pdfUrl = URL.createObjectURL(blob);
        const dialogData: PdfPreviewDialogData = {
          pdfUrl: pdfUrl,
          pdfBlob: blob,
          fileName: `${invoice.invoiceNumber || 'invoice'}.pdf`
        };

        this.dialog.open(PdfPreviewDialogComponent, {
          data: dialogData,
          width: '90vw',
          height: '95vh',
          panelClass: 'pdf-preview-dialog-panel' // Optional: for custom global styling
        });
      },
      error: (err) => {
        console.error('Error downloading PDF for preview:', err);
        this.snackBar.open('Failed to load PDF for preview. Please try again.', 'Error', { duration: 3000 });
      }
    });
  }
}
