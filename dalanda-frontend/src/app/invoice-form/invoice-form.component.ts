import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PdfPreviewDialogComponent, PdfPreviewDialogData } from '../pdf-preview-dialog/pdf-preview-dialog.component';

import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { CompanyService } from '../services/company.service';

import { Client, Company, Invoice } from '../models/invoice';
import { TaxOption } from '../models/tax-option';
import { FullInvoicePayload } from '../models/full-invoice-payload';
import { of, forkJoin, Observable, from } from 'rxjs';
import { switchMap, map, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-form',
  standalone: false,
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.css']
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  clients: Client[] = [];
  companies: Company[] = [];
  taxOptions = Object.values(TaxOption);

  // Tax rates mapping (you can make this configurable)
  private taxRates: { [key: string]: number } = {
    'VAT': 20,
    'GST': 10,
    'Sales Tax': 8.5,
    'Service Tax': 15
  };

  isLoading = false;
  useExistingClient = true;
  useExistingCompany = true;
  isEditMode = false;
  invoiceId: number | null = null;

  // Loading states for better UX
  loadingClients = false;
  loadingCompanies = false;

  // Error handling
  error: string | null = null;

  // File handling for company logo and stamp
  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | ArrayBuffer | null = null;
  selectedStampFile: File | null = null;
  stampPreviewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private companyService: CompanyService,
    private dialog: MatDialog // Inject MatDialog
  ) {
    this.invoiceForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.invoiceId = +params['id'];
        this.loadInvoiceForEdit(this.invoiceId);
      }
    });

    this.loadClients();
    this.loadCompanies();
    this.setupFormValidation();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      clientId: [null],
      newClientName: [''],
      newClientOtherInfo: [''],

      companyId: [null],
      newCompanyName: [''],

      invoiceNumber: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
      status: ['pending', Validators.required], // Added status field

      items: this.fb.array([this.createItem()]),
      taxOptions: this.fb.array([])
    });
  }

  private createItem(): FormGroup {
    return this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      qty: [1, [Validators.required, Validators.min(1), Validators.max(9999)]],
      unitPrice: [0, [Validators.required, Validators.min(0), Validators.max(999999)]]
    });
  }

  private setupFormValidation(): void {
    // Dynamic validation based on toggle states
    this.invoiceForm.get('clientId')?.setValidators(
      this.useExistingClient ? [Validators.required] : []
    );

    this.invoiceForm.get('newClientName')?.setValidators(
      !this.useExistingClient ? [Validators.required, Validators.minLength(2)] : []
    );

    this.invoiceForm.get('companyId')?.setValidators(
      this.useExistingCompany ? [Validators.required] : []
    );

    this.invoiceForm.get('newCompanyName')?.setValidators(
      !this.useExistingCompany ? [Validators.required, Validators.minLength(2)] : []
    );

    // Due date should be after invoice date
    this.invoiceForm.get('dueDate')?.setValidators([
      Validators.required,
      this.dueDateValidator.bind(this)
    ]);
  }

  private dueDateValidator(control: AbstractControl): { [key: string]: any } | null {
    const invoiceDate = this.invoiceForm?.get('date')?.value;
    const dueDate = control.value;

    if (invoiceDate && dueDate && new Date(dueDate) <= new Date(invoiceDate)) {
      return { 'dueDateInvalid': true };
    }
    return null;
  }

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get taxOptionsArray(): FormArray {
    return this.invoiceForm.get('taxOptions') as FormArray;
  }

  addItem(): void {
    this.itemsArray.push(this.createItem());
    this.showSnackBar('Item added successfully');
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.showSnackBar('Item removed');
    } else {
      this.showSnackBar('At least one item is required', 'error');
    }
  }

  toggleTaxOption(option: string): void {
    const currentValues = this.taxOptionsArray.value;
    const idx = currentValues.indexOf(option);

    if (idx === -1) {
      this.taxOptionsArray.push(this.fb.control(option));
      this.showSnackBar(`${option} tax added`);
    } else {
      this.taxOptionsArray.removeAt(idx);
      this.showSnackBar(`${option} tax removed`);
    }
  }

  isTaxSelected(option: string): boolean {
    return this.taxOptionsArray.value.includes(option);
  }

  getTaxRate(option: string): number {
    return this.taxRates[option] || 0;
  }

  calculateSubtotal(): number {
    return this.itemsArray.controls.reduce((total, item) => {
      const qty = item.get('qty')?.value || 0;
      const price = item.get('unitPrice')?.value || 0;
      return total + (qty * price);
    }, 0);
  }

  calculateTax(): number {
    const subtotal = this.calculateSubtotal();
    const selectedTaxes = this.taxOptionsArray.value;

    return selectedTaxes.reduce((totalTax: number, taxOption: string) => {
      const rate = this.getTaxRate(taxOption) / 100;
      return totalTax + (subtotal * rate);
    }, 0);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTax();
  }

  toggleClientMode(): void {
    this.useExistingClient = !this.useExistingClient;

    if (this.useExistingClient) {
      this.invoiceForm.patchValue({
        newClientName: '',
        newClientOtherInfo: ''
      });
      this.invoiceForm.get('clientId')?.setValidators([Validators.required]);
      this.invoiceForm.get('newClientName')?.clearValidators();
    } else {
      this.invoiceForm.get('clientId')?.setValue(null);
      this.invoiceForm.get('clientId')?.clearValidators();
      this.invoiceForm.get('newClientName')?.setValidators([Validators.required, Validators.minLength(2)]);
    }

    this.invoiceForm.get('clientId')?.updateValueAndValidity();
    this.invoiceForm.get('newClientName')?.updateValueAndValidity();
  }

  toggleCompanyMode(): void {
    this.useExistingCompany = !this.useExistingCompany;

    if (this.useExistingCompany) {
      this.invoiceForm.get('newCompanyName')?.setValue('');
      this.invoiceForm.get('companyId')?.setValidators([Validators.required]);
      this.invoiceForm.get('newCompanyName')?.clearValidators();
    } else {
      this.invoiceForm.get('companyId')?.setValue(null);
      this.invoiceForm.get('companyId')?.clearValidators();
      this.invoiceForm.get('newCompanyName')?.setValidators([Validators.required, Validators.minLength(2)]);
    }

    this.invoiceForm.get('companyId')?.updateValueAndValidity();
    this.invoiceForm.get('newCompanyName')?.updateValueAndValidity();
  }

  private loadClients(): void {
    this.loadingClients = true;
    this.clientService.list()
      .pipe(
        catchError(err => {
          console.error('Error loading clients', err);
          this.showSnackBar('Failed to load clients', 'error');
          return of([]);
        }),
        finalize(() => this.loadingClients = false)
      )
      .subscribe(data => {
        this.clients = data;
      });
  }

  private loadCompanies(): void {
    this.loadingCompanies = true;
    this.companyService.list()
      .pipe(
        catchError(err => {
          console.error('Error loading companies', err);
          this.showSnackBar('Failed to load companies', 'error');
          return of([]);
        }),
        finalize(() => this.loadingCompanies = false)
      )
      .subscribe(data => {
        this.companies = data;
      });
  }

  private loadInvoiceForEdit(id: number): void {
    this.isLoading = true;
    this.invoiceService.getById(id)
      .pipe(
        catchError(err => {
          console.error('Error loading invoice', err);
          this.showSnackBar('Failed to load invoice', 'error');
          this.router.navigate(['/home']);
          return of(null);
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(invoice => {
        if (invoice) {
          this.populateFormWithInvoice(invoice);
        }
      });
  }

  private populateFormWithInvoice(invoice: Invoice): void {
    // Populate basic fields
    this.invoiceForm.patchValue({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status || 'pending', // Populate status
    });

    // Populate items
    if (invoice.items && invoice.items.length > 0) {
      this.itemsArray.clear();
      invoice.items.forEach(item => {
        this.itemsArray.push(this.fb.group({
          description: [item.description, [Validators.required, Validators.minLength(3)]],
          qty: [item.qty, [Validators.required, Validators.min(1)]],
          unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]]
        }));
      });
    }

    // Populate tax options
    if (invoice.taxOptions && invoice.taxOptions.length > 0) {
      this.taxOptionsArray.clear();
      invoice.taxOptions.forEach(tax => {
        this.taxOptionsArray.push(this.fb.control(tax));
      });
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) {
      this.markFormGroupTouched(this.invoiceForm);
      this.showSnackBar('Please fix the form errors', 'error');
      return;
    }

    this.isLoading = true;
    this.error = null;

    const fv = this.invoiceForm.value;

    // Prepare client and company observables
    const client$ = this.prepareClientObservable(fv);
    const company$ = this.prepareCompanyObservable(fv);

    // Execute the invoice creation/update
    forkJoin([client$, company$])
      .pipe(
        switchMap(([clientRes, companyRes]) => {
          const payload = this.buildInvoicePayload(fv, clientRes.id, companyRes.id);

          return this.isEditMode && this.invoiceId
            ? this.invoiceService.updateInvoice(this.invoiceId, payload)
            : this.invoiceService.createInvoice(payload);
        }),
        catchError(err => {
          console.error('Error saving invoice', err);
          this.error = 'Failed to save invoice. Please try again.';
          this.showSnackBar(this.error, 'error');
          throw err;
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          const message = this.isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully';
          this.showSnackBar(message, 'success');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          // Error already handled in catchError
        }
      });
  }

  private prepareClientObservable(formValue: any): Observable<{ id: number }> {
    if (this.useExistingClient) {
      return of({ id: formValue.clientId });
    } else {
      return this.clientService.create({
        id: formValue.clientId,
        companyName: formValue.newClientName,
        otherInfo: formValue.newClientOtherInfo
      }).pipe(map(c => ({ id: c.id })));
    }
  }

  private prepareCompanyObservable(formValue: any): Observable<{ id: number }> {
    if (this.useExistingCompany) {
      return of({ id: formValue.companyId, companyName: '', logo: undefined, stampSignature: undefined }); // Added dummy fields to satisfy type, actual data not used
    } else {
      // Prepare company data
      const companyData: Partial<Company> = { // Use Partial<Company> for flexibility
        companyName: formValue.newCompanyName
      };

      // Observables for file conversions
      const logoObs = this.selectedLogoFile
        ? from(this.getFileAsBase64(this.selectedLogoFile))
        : of(null);
      const stampObs = this.selectedStampFile
        ? from(this.getFileAsBase64(this.selectedStampFile))
        : of(null);

      return forkJoin([logoObs, stampObs]).pipe(
        switchMap(([logoBase64, stampBase64]) => {
          if (logoBase64) {
            companyData.logo = logoBase64;
          }
          if (stampBase64) {
            companyData.stampSignature = stampBase64;
          }
          // The companyService.create method expects a Company-like object.
          // We provide id as undefined or null for new company.
          // The actual Company interface in models/invoice.ts includes `id: number`.
          // We might need to adjust the type here or in the service if `id` is strictly required.
          // For now, assuming companyService.create can handle `id` being absent or null for new entities.
          return this.companyService.create(companyData as Company).pipe(map(c => ({ id: c.id, companyName: c.companyName, logo: c.logo, stampSignature: c.stampSignature })));
        })
      );
    }
  }

  private buildInvoicePayload(formValue: any, clientId: number, companyId: number): {
    invoiceNumber: any;
    date: any;
    dueDate: any;
    totalAmount: number;
    client: { id: number };
    company: { id: number };
    createdBy: { id: string };
    items: any;
    taxOptions: string[];
    status: 'pending' | 'paid' | 'overdue' | 'draft'
  } {
    const totalAmount = this.calculateTotal();
    const createdBy = { id: localStorage.getItem('userUuid')! };

    return {
      invoiceNumber: formValue.invoiceNumber,
      date: formValue.date,
      dueDate: formValue.dueDate,
      totalAmount,
      client: { id: clientId },
      company: { id: companyId },
      createdBy,
      items: formValue.items,
      taxOptions: formValue.taxOptions as string[],
      status: formValue.status // Add status to payload
    };
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const config = {
      duration: 3000,
      horizontalPosition: 'end' as const,
      verticalPosition: 'top' as const,
      panelClass: [`snackbar-${type}`]
    };

    this.snackBar.open(message, 'Close', config);
  }

  // Navigation and utility methods
  cancel(): void {
    if (this.invoiceForm.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) {
        return;
      }
    }
    this.router.navigate(['/home']);
  }

  saveDraft(): void {
    // Set status to 'draft'
    this.invoiceForm.get('status')?.setValue('draft');

    // Potentially bypass some validators if a draft doesn't need to be fully valid.
    // For now, we'll assume a draft uses the same validation rules.
    // If specific fields were optional for drafts, we'd adjust validators here before calling onSubmit.

    this.showSnackBar('Attempting to save as draft...', 'info');
    this.onSubmit(); // Call the main submit logic
  }

  previewInvoice(): void {
    if (this.invoiceId !== null) {
      // Existing invoice, proceed to fetch PDF
      this.isLoading = true; // Optional: show a loading indicator
      this.invoiceService.downloadPdf(this.invoiceId).subscribe({
        next: (blob) => {
          this.isLoading = false;
          if (blob.size === 0) {
            this.showSnackBar('No PDF available or PDF is empty.', 'error');
            return;
          }
          const pdfUrl = URL.createObjectURL(blob);
          const invoiceNumber = this.invoiceForm.get('invoiceNumber')?.value || 'invoice';
          const dialogData: PdfPreviewDialogData = {
            pdfUrl: pdfUrl,
            pdfBlob: blob,
            fileName: `${invoiceNumber}.pdf`
          };

          this.dialog.open(PdfPreviewDialogComponent, {
            data: dialogData,
            width: '90vw', // Or your preferred size, consistent with home page
            height: '95vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            panelClass: ['pdf-preview-dialog-panel', 'full-screen-dialog'] // Use classes from previous step if desired
          });
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error downloading PDF for preview:', err);
          this.showSnackBar('Failed to load PDF for preview. Please try again.', 'error');
        }
      });
    } else {
      // New invoice, not saved yet
      this.showSnackBar('Please save the invoice first to enable preview.', 'info');
    }
  }

  // Utility method for form field error checking
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.invoiceForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.invoiceForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return `${fieldName} is required`;
    if (errors['minlength']) return `${fieldName} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['min']) return `${fieldName} must be at least ${errors['min'].min}`;
    if (errors['max']) return `${fieldName} cannot exceed ${errors['max'].max}`;
    if (errors['pattern']) return `${fieldName} format is invalid`;
    if (errors['dueDateInvalid']) return 'Due date must be after invoice date';

    return 'Invalid input';
  }

  // Track by function for better performance with *ngFor
  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackByTaxOption(index: number, option: string): string {
    return option;
  }

  // File selection handlers
  onLogoFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList[0]) {
      this.selectedLogoFile = fileList[0];
      // Generate preview
      const reader = new FileReader();
      reader.onload = e => this.logoPreviewUrl = reader.result;
      reader.readAsDataURL(this.selectedLogoFile);
    } else {
      this.selectedLogoFile = null;
      this.logoPreviewUrl = null;
    }
  }

  clearLogoFile(event: MouseEvent): void {
    event.stopPropagation(); // Prevent default behavior if any
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    // If using ngx-mat-file-input, you might need to reset its value as well
    // This depends on the specific implementation of ngx-mat-file-input
    // For a standard input, you might do:
    // const logoInput = document.getElementById('logo-input-id') as HTMLInputElement;
    // if (logoInput) logoInput.value = '';
  }

  onStampFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList[0]) {
      this.selectedStampFile = fileList[0];
      // Generate preview
      const reader = new FileReader();
      reader.onload = e => this.stampPreviewUrl = reader.result;
      reader.readAsDataURL(this.selectedStampFile);
    } else {
      this.selectedStampFile = null;
      this.stampPreviewUrl = null;
    }
  }

  clearStampFile(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedStampFile = null;
    this.stampPreviewUrl = null;
    // Similar to clearLogoFile, might need to reset input element if not using a component that handles it
  }

  // Helper to convert file to Base64
  private async getFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // result is DataURL: "data:image/png;base64,iVBORw0KGg..."
        // We need to strip the "data:image/png;base64," part
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }
}
