import {Component, OnInit} from '@angular/core';
import {TokenService} from '../services/token.service';
import {Router} from '@angular/router';
import { InvoiceService } from '../services/invoice.service';
import {Invoice, Client, Company} from '../models/invoice'; // Import Client and Company
import { MatSnackBar } from '@angular/material/snack-bar'; // Import MatSnackBar
import { switchMap } from 'rxjs/operators';
import {FullInvoicePayload} from '../models/full-invoice-payload';
import {MatSelectChange} from '@angular/material/select'; // Import MatSelectChange

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
    private snackBar: MatSnackBar // Inject MatSnackBar
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
}
