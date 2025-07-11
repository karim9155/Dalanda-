package com.example.dalanda.Controllers;

import com.example.dalanda.Entities.Invoice;
import com.example.dalanda.Services.InvoiceService;
import com.example.dalanda.ServicesImp.PdfGeneratorFactory;
import com.example.dalanda.dto.InvoiceDTO;
import com.example.dalanda.dto.InvoiceMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Arrays; // For logging byte array content/length
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private static final Logger log = LoggerFactory.getLogger(InvoiceController.class);

    private final InvoiceService invoiceService;
    private final PdfGeneratorFactory pdfFactory;
    private final InvoiceMapper invoiceMapper;

    public InvoiceController(InvoiceService invoiceService,
                             PdfGeneratorFactory pdfFactory,
                             InvoiceMapper invoiceMapper) {
        this.invoiceService = invoiceService;
        this.pdfFactory = pdfFactory;
        this.invoiceMapper = invoiceMapper;
    }

    @GetMapping()
    public List<InvoiceDTO> getAll() {
        return invoiceService.getAllInvoices().stream()
                .map(invoiceMapper::toInvoiceDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<InvoiceDTO>> getByUser(@PathVariable UUID userId) {
        List<Invoice> list = invoiceService.findByUser(userId);
        List<InvoiceDTO> dtoList = list.stream()
                .map(invoiceMapper::toInvoiceDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getOne(@PathVariable Long id) {
        return invoiceService.getInvoice(id)
                .map(invoiceMapper::toInvoiceDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public ResponseEntity<String> create(@RequestBody Invoice invoice) {
        log.info("Received request to create invoice. Company details in payload:");
        if (invoice.getCompany() != null) {
            log.info("Company Name: {}", invoice.getCompany().getCompanyName());
            log.info("Company ID: {}", invoice.getCompany().getId());
            byte[] logoBytes = invoice.getCompany().getLogo();
            byte[] stampBytes = invoice.getCompany().getStampSignature();
            log.info("Company Logo in payload: {} (Size: {} bytes)", logoBytes != null ? "Present" : "NULL", logoBytes != null ? logoBytes.length : 0);
            log.info("Company Stamp in payload: {} (Size: {} bytes)", stampBytes != null ? "Present" : "NULL", stampBytes != null ? stampBytes.length : 0);
            // Avoid logging full byte array content directly if it's large, log presence/size.
        } else {
            log.warn("Company details are NULL in the incoming invoice payload.");
        }

        invoiceService.createInvoice(invoice);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Invoice added successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> update(@PathVariable Long id, @RequestBody Invoice invoice) {
        try {
            return ResponseEntity.ok(invoiceService.updateInvoice(id, invoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }

    @PutMapping("/{id}/toggle-declaration")
    public ResponseEntity<InvoiceDTO> toggleDeclarationStatus(@PathVariable Long id) {
        try {
            Invoice invoice = invoiceService.getInvoice(id)
                    .orElseThrow(() -> new IllegalArgumentException("Invoice not found with id: " + id));

            Integer currentDeclaration = invoice.getDeclaration();
            // Default to 0 if null, though it should be initialized
            invoice.setDeclaration(currentDeclaration == null || currentDeclaration == 0 ? 1 : 0);

            Invoice updatedInvoice = invoiceService.createInvoice(invoice); // Assuming saveInvoice persists the changes
            return ResponseEntity.ok(invoiceMapper.toInvoiceDTO(updatedInvoice));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // Log the exception e
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<ByteArrayResource> downloadPdf(@PathVariable Long id,
                                                         @RequestParam(defaultValue = "iText") String generator) {
        try {
            Invoice invoice = invoiceService.getInvoice(id)
                    .orElseThrow(() -> new IllegalArgumentException("Invoice not found"));
            byte[] pdfBytes = pdfFactory.getGenerator(generator).generate(invoice);
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
