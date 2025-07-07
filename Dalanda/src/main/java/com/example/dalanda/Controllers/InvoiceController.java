package com.example.dalanda.Controllers;

import com.example.dalanda.Entities.Invoice;
import com.example.dalanda.Services.InvoiceService;
import com.example.dalanda.ServicesImp.PdfGeneratorFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfGeneratorFactory pdfFactory;

    public InvoiceController(InvoiceService invoiceService,
                             PdfGeneratorFactory pdfFactory) {
        this.invoiceService = invoiceService;
        this.pdfFactory = pdfFactory;
    }

    @GetMapping()
    public List<Invoice> getAll() {
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Invoice>> getByUser(@PathVariable UUID userId) {
        List<Invoice> list = invoiceService.findByUser(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getOne(@PathVariable Long id) {
        return invoiceService.getInvoice(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @PostMapping
    public ResponseEntity<String> create(@RequestBody Invoice invoice) {
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
