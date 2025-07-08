
package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.*;
import com.example.dalanda.Repositories.*;
import com.example.dalanda.Services.InvoiceService;
import com.example.dalanda.ServicesImp.TaxStrategyFactory;
import com.example.dalanda.ServicesImp.PdfGeneratorFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class InvoiceServiceImpl implements InvoiceService {
    private final InvoiceRepository invoiceRepo;
    private final CompanyRepository companyRepo;
    private final ClientRepository clientRepo;
    private final UserRepository userRepo;
    private final TaxStrategyFactory taxFactory;
    private final PdfGeneratorFactory pdfFactory;

    public InvoiceServiceImpl(InvoiceRepository invoiceRepo,
                              CompanyRepository companyRepo,
                              ClientRepository clientRepo,
                              UserRepository userRepo,
                              TaxStrategyFactory taxFactory,
                              PdfGeneratorFactory pdfFactory) {
        this.invoiceRepo   = invoiceRepo;
        this.companyRepo   = companyRepo;
        this.clientRepo    = clientRepo;
        this.userRepo      = userRepo;
        this.taxFactory    = taxFactory;
        this.pdfFactory    = pdfFactory;
    }

    @Override
    public Invoice createInvoice(Invoice invoice) {
        Company company = companyRepo.findById(invoice.getCompany().getId())
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        Client client = clientRepo.findById(invoice.getClient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        User creator = userRepo.findById(invoice.getCreatedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        invoice.setCompany(company);
        invoice.setClient(client);
        invoice.setCreatedBy(creator);

        BigDecimal subtotal = invoice.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTax = invoice.getTaxOptions().stream()
                .map(opt -> taxFactory.forOption(opt).calculateTax(subtotal))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setTotalAmount(subtotal.add(totalTax));
        invoice.getItems().forEach(item -> {
            item.setInvoice(invoice);
        });
        return invoiceRepo.save(invoice);
    }

    @Override
    public Invoice updateInvoice(Long id, Invoice updated) {
        Invoice existing = invoiceRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));

        // basic fields
        existing.setDate(updated.getDate());
        existing.setDueDate(updated.getDueDate());
        existing.setTaxOptions(updated.getTaxOptions());
        existing.setStatus(updated.getStatus()); // Add this line to update status

        // 1) Clear out old items
        existing.getItems().clear();

        // 2) Attach new items, setting the back-reference
        updated.getItems().forEach(item -> {
            item.setInvoice(existing);
            existing.getItems().add(item);
        });

        // 3) Re-calc total (subtotal + taxes)
        BigDecimal subtotal = existing.getItems().stream()
                .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTax = existing.getTaxOptions().stream()
                .map(opt -> taxFactory.forOption(opt).calculateTax(subtotal))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        existing.setTotalAmount(subtotal.add(totalTax));

        return invoiceRepo.save(existing);
    }


    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> getInvoice(Long id) {
        return invoiceRepo.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepo.findAll();
    }

    @Override
    public void deleteInvoice(Long id) {
        invoiceRepo.deleteById(id);
    }

    @Override
    public byte[] generateInvoicePdf(Long invoiceId, String generatorKey) throws Exception {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
        return pdfFactory.getGenerator(generatorKey).generate(invoice);
    }

    public List<Invoice> findByUser(UUID userId) {
        return invoiceRepo.findAllByCreatedBy_Id(userId);
    }
}
