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
  companyName: string; // Nom de la société
  email?: string; // E-Mail
  phoneNumber?: string; // Numéro de téléphone
  rib?: string; // Relevé d'identité bancaire (RIB)
  fiscalMatricule?: string; // Matricule Fiscal
  address?: string; // Adresse
  /** Base64-encoded logo image (from byte[]) - typically handled by separate upload */
  logo?: string;
  /** Base64-encoded stamp signature image (from byte[]) - typically handled by separate upload */
  stampSignature?: string;
  customFields?: string;  // JSON string for custom fields
  disabledFields?: string; // JSON string for list of disabled fields (e.g., '["rib", "customFieldName"]')
}

// src/app/models/client.ts
export interface Client {
  id: number;
  companyName: string;    // Nom de la société
  contactName?: string;   // Nom du contact
  email?: string;         // E-Mail
  phoneNumber?: string;   // Numéro de téléphone
  rib?: string;           // RIB
  fiscalMatricule?: string; // Matricule Fiscal
  address?: string;       // Adresse
  customFields?: string;  // JSON string for custom fields
  disabledFields?: string; // JSON string for list of disabled fields
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
  declaration?: number; // 0 for not declared, 1 for declared
  // amount?: number;
  // clientName?: string;
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
