// src/app/models/full-invoice-payload.ts
export interface FullInvoicePayload {
  invoiceNumber: string;
  date: string;       // "YYYY-MM-DD"
  dueDate: string;    // "YYYY-MM-DD"
  totalAmount: number;
  company: { id: number } | { companyName: string };
  client:  { id: number } | { companyName: string; otherInfo?: string };
  createdBy: { id: string };
  items: Array<{
    description: string;
    qty: number;
    unitPrice: number;
  }>;
  taxOptions: string[];
  status?: 'pending' | 'paid' | 'overdue' | 'draft';
}
