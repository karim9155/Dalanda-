import { TaxOption } from './tax-option';

export interface InvoiceItemDto {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceDto {
  companyId?: number;          // existing company
  newCompanyName?: string;     // if companyId is null
  clientId?: number;           // existing client
  newClientName?: string;
  newClientOtherInfo?: string;// if clientId is null
  invoiceNumber: string;
  date: string;                // ISO string, e.g. "2025-05-01"
  dueDate: string;             // ISO string
  items: InvoiceItemDto[];
  taxOptions: TaxOption[];
  logo?: File;                 // file upload
  stampSignature?: File;       // file upload
}
