// src/app/invoice-form/invoice-form.component.ts
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { CompanyService } from '../services/company.service';

import { Client, Company } from '../models/invoice';
import { TaxOption } from '../models/tax-option';
import { FullInvoicePayload } from '../models/full-invoice-payload';  // ← new
import { of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';


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

  isLoading = false;
  useExistingClient = true;
  useExistingCompany = true;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private companyService: CompanyService
  ) {
    this.invoiceForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadCompanies();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      clientId: [null],
      newClientName: [''],
      newClientOtherInfo: [''],

      companyId: [null],
      newCompanyName: [''],

      invoiceNumber: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],

      items: this.fb.array([this.createItem()]),
      taxOptions: this.fb.array([])
    });
  }

  private createItem(): FormGroup {
    return this.fb.group({
      description: ['', Validators.required],
      qty: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  get taxOptionsArray(): FormArray {
    return this.invoiceForm.get('taxOptions') as FormArray;
  }

  addItem(): void {
    this.itemsArray.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
    }
  }

  toggleTaxOption(option: string): void {
    const idx = this.taxOptionsArray.value.indexOf(option);
    if (idx === -1) {
      this.taxOptionsArray.push(this.fb.control(option));
    } else {
      this.taxOptionsArray.removeAt(idx);
    }
  }

  isTaxSelected(option: string): boolean {
    return this.taxOptionsArray.value.includes(option);
  }

  toggleClientMode(): void {
    this.useExistingClient = !this.useExistingClient;
    if (this.useExistingClient) {
      this.invoiceForm.patchValue({
        newClientName: '',
        newClientOtherInfo: ''
      });
    } else {
      this.invoiceForm.get('clientId')?.setValue(null);
    }
  }

  toggleCompanyMode(): void {
    this.useExistingCompany = !this.useExistingCompany;
    if (this.useExistingCompany) {
      this.invoiceForm.get('newCompanyName')?.setValue('');
    } else {
      this.invoiceForm.get('companyId')?.setValue(null);
    }
  }

  private loadClients(): void {
    this.clientService.list().subscribe(
      data => (this.clients = data),
      err => console.error('Error loading clients', err)
    );
  }

  private loadCompanies(): void {
    this.companyService.list().subscribe(
      data => (this.companies = data),
      err => console.error('Error loading companies', err)
    );
  }

  onSubmit(): void {
    if (this.invoiceForm.invalid) { return; }
    this.isLoading = true;

    const fv = this.invoiceForm.value;

    // 1) Prepare the raw pieces for client & company creation or reuse:
    const client$ = this.useExistingClient
      ? of({ id: fv.clientId } as { id: number })
      : this.clientService
        .create({id: fv.clientId, companyName: fv.newClientName!, otherInfo: fv.newClientOtherInfo })
        .pipe(map(c => ({ id: c.id })));

    const company$ = this.useExistingCompany
      ? of({ id: fv.companyId } as { id: number })
      : this.companyService
        .create({id: fv.clientId, companyName: fv.newCompanyName! })
        .pipe(map(c => ({ id: c.id })));

    // 2) Fork both observables: wait for client + company to be ready
    forkJoin([ client$, company$ ])
      .pipe(
        switchMap(([ clientRes, companyRes ]) => {
          // 3) Now build the full invoice payload
          const totalAmount = fv.items
            .map((i:any) => i.qty * i.unitPrice)
            .reduce((sum:number, curr:number) => sum + curr, 0);

          // pull stored UUID
          const createdBy = { id: localStorage.getItem('userUuid')! };

          const payload: FullInvoicePayload = {
            invoiceNumber: fv.invoiceNumber,
            date:           fv.date,
            dueDate:        fv.dueDate,
            totalAmount,
            client:    { id: clientRes.id },
            company:   { id: companyRes.id },
            createdBy,
            items:     fv.items,
            taxOptions: fv.taxOptions as TaxOption[]
          };

          // 4) finally call the invoice API
          return this.invoiceService.createInvoice(payload);
        })
      )
      .subscribe({
        next: msg => {
          // msg is your 201-response string
          this.isLoading = false;
          this.router.navigate(['/home']);
        },
        error: err => {
          console.error('Error creating invoice', err);
          this.isLoading = false;
        }
      });
  }


  cancel(): void {
    this.router.navigate(['/home']);
  }
}
