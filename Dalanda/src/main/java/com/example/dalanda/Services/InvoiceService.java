package com.example.dalanda.Services;

import com.example.dalanda.Entities.Invoice;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvoiceService {
    Invoice createInvoice(Invoice invoice);
    Invoice updateInvoice(Long id, Invoice updated);
    Optional<Invoice> getInvoice(Long id);
    List<Invoice> getAllInvoices();
    void deleteInvoice(Long id);
    byte[] generateInvoicePdf(Long invoiceId, String generatorKey) throws Exception;
    List<Invoice> findByUser(UUID userId);
}
