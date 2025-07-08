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

import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { CompanyService } from '../services/company.service';

import { Client, Company, Invoice } from '../models/invoice';
import { TaxOption } from '../models/tax-option';
import { FullInvoicePayload } from '../models/full-invoice-payload';
import { of, forkJoin, Observable } from 'rxjs';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private companyService: CompanyService
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
      return of({ id: formValue.companyId });
    } else {
      return this.companyService.create({
        id: formValue.companyId,
        companyName: formValue.newCompanyName
      }).pipe(map(c => ({ id: c.id })));
    }
  }

  private buildInvoicePayload(formValue: any, clientId: number, companyId: number): FullInvoicePayload {
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
      taxOptions: formValue.taxOptions as string[]
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
    // Implement draft saving logic
    this.showSnackBar('Draft saved successfully', 'success');
  }

  previewInvoice(): void {
    if (this.invoiceForm.valid) {
      // Implement preview logic
      this.showSnackBar('Preview functionality coming soon', 'info');
    } else {
      this.showSnackBar('Please complete the form to preview', 'error');
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
}
