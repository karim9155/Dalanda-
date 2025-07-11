
package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.*;
import com.example.dalanda.Repositories.*;
import com.example.dalanda.Services.InvoiceService;
import com.example.dalanda.ServicesImp.TaxStrategyFactory;
import com.example.dalanda.ServicesImp.PdfGeneratorFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Arrays; // For logging byte array content/length

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class InvoiceServiceImpl implements InvoiceService {
    private static final Logger log = LoggerFactory.getLogger(InvoiceServiceImpl.class);

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
        log.info("InvoiceService.createInvoice called. Processing company details...");
        if (invoice.getCompany() != null) {
            log.info("Company Name from payload: {}", invoice.getCompany().getCompanyName());
            log.info("Company ID from payload: {}", invoice.getCompany().getId());
            byte[] logoBytesService = invoice.getCompany().getLogo();
            byte[] stampBytesService = invoice.getCompany().getStampSignature();
            log.info("Company Logo in service (pre-save): {} (Size: {} bytes)", logoBytesService != null ? "Present" : "NULL", logoBytesService != null ? logoBytesService.length : 0);
            log.info("Company Stamp in service (pre-save): {} (Size: {} bytes)", stampBytesService != null ? "Present" : "NULL", stampBytesService != null ? stampBytesService.length : 0);
        } else {
            log.warn("Company details are NULL in InvoiceService.createInvoice payload.");
            // This case should ideally be caught by the controller or previous checks,
            // but good to log if it reaches here.
        }

        Company companyToSaveOrFetch;
        if (invoice.getCompany() != null && invoice.getCompany().getId() == null) {
            Company newCompany = invoice.getCompany();
            if (newCompany.getCompanyName() == null || newCompany.getCompanyName().trim().isEmpty()) {
                log.error("Attempted to create a new company with an empty name.");
                throw new IllegalArgumentException("Company name is required for a new company.");
            }
            log.info("Attempting to save new company: {}", newCompany.getCompanyName());
            byte[] logoBytesForSave = newCompany.getLogo();
            byte[] stampBytesForSave = newCompany.getStampSignature();
            log.info("Logo for new company (before save): {} (Size: {} bytes)", logoBytesForSave != null ? "Present" : "NULL", logoBytesForSave != null ? logoBytesForSave.length : 0);
            log.info("Stamp for new company (before save): {} (Size: {} bytes)", stampBytesForSave != null ? "Present" : "NULL", stampBytesForSave != null ? stampBytesForSave.length : 0);

            companyToSaveOrFetch = companyRepo.save(newCompany);
            log.info("Saved new company. ID: {}, Name: {}", companyToSaveOrFetch.getId(), companyToSaveOrFetch.getCompanyName());
            byte[] logoBytesAfterSave = companyToSaveOrFetch.getLogo();
            byte[] stampBytesAfterSave = companyToSaveOrFetch.getStampSignature();
            log.info("Logo for new company (after save from returned entity): {} (Size: {} bytes)", logoBytesAfterSave != null ? "Present" : "NULL", logoBytesAfterSave != null ? logoBytesAfterSave.length : 0);
            log.info("Stamp for new company (after save from returned entity): {} (Size: {} bytes)", stampBytesAfterSave != null ? "Present" : "NULL", stampBytesAfterSave != null ? stampBytesAfterSave.length : 0);

        } else if (invoice.getCompany() != null && invoice.getCompany().getId() != null) {
            log.info("Fetching existing company with ID: {}", invoice.getCompany().getId());
            companyToSaveOrFetch = companyRepo.findById(invoice.getCompany().getId())
                    .orElseThrow(() -> {
                        log.error("Company not found with ID: {}", invoice.getCompany().getId());
                        return new IllegalArgumentException("Company not found with ID: " + invoice.getCompany().getId());
                    });
            log.info("Fetched existing company: {}", companyToSaveOrFetch.getCompanyName());
        } else {
            log.error("Company information is missing or malformed in the invoice for InvoiceService.");
            throw new IllegalArgumentException("Company information is missing in the invoice.");
        }

        Client client = clientRepo.findById(invoice.getClient().getId())
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));
        User creator = userRepo.findById(invoice.getCreatedBy().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        invoice.setCompany(companyToSaveOrFetch);
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
