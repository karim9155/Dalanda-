import { TaxOption } from './tax-option';

export interface InvoiceItem {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Company {
  id: number;
  companyName: string;
  /** Base64-encoded logo image (from byte[]) */
  logo?: string;
  /** Base64-encoded stamp signature image (from byte[]) */
  stampSignature?: string;}

// src/app/models/client.ts
export interface Client {
  id: number;
  companyName: string;
  otherInfo?: string;
}


export interface Invoice {
  id: number;
  invoiceNumber: string;
  date: string;        // ISO date
  dueDate: string;     // ISO date
  totalAmount: number;
  items: InvoiceItem[];
  taxOptions: TaxOption[];
  company: Company;
  client: Client;
  status?: 'pending' | 'paid' | 'overdue' | 'draft';
}
// export interface Invoice {
//   id: number;
//   invoiceNumber: string;
//   date: Date | string;
//   dueDate?: Date | string;
//   clientName?: string;
//   clientId?: number;
//   companyName?: string;
//   companyId?: number;
//   amount?: number;
//   totalAmount?: number;
//   status?: 'pending' | 'paid' | 'overdue' | 'draft';
//   items?: InvoiceItem[];
//   taxAmount?: number;
//   subtotal?: number;
//   createdAt?: Date | string;
//   updatedAt?: Date | string;
// }
