package com.example.dalanda.dto;

import com.example.dalanda.Entities.TaxOption; // Assuming TaxOption is an enum and can be used directly

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private LocalDate date;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private CompanyDTO company;
    private ClientDTO client;
    private UserDTO createdBy;
    private List<InvoiceItemDTO> items;
    private Set<TaxOption> taxOptions; // Assuming TaxOption enum is safe to expose directly

    // Constructors, Getters, Setters
    public InvoiceDTO() {}

    public InvoiceDTO(Long id, String invoiceNumber, LocalDate date, LocalDate dueDate,
                      BigDecimal totalAmount, CompanyDTO company, ClientDTO client,
                      UserDTO createdBy, List<InvoiceItemDTO> items, Set<TaxOption> taxOptions) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.date = date;
        this.dueDate = dueDate;
        this.totalAmount = totalAmount;
        this.company = company;
        this.client = client;
        this.createdBy = createdBy;
        this.items = items;
        this.taxOptions = taxOptions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public CompanyDTO getCompany() { return company; }
    public void setCompany(CompanyDTO company) { this.company = company; }
    public ClientDTO getClient() { return client; }
    public void setClient(ClientDTO client) { this.client = client; }
    public UserDTO getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserDTO createdBy) { this.createdBy = createdBy; }
    public List<InvoiceItemDTO> getItems() { return items; }
    public void setItems(List<InvoiceItemDTO> items) { this.items = items; }
    public Set<TaxOption> getTaxOptions() { return taxOptions; }
    public void setTaxOptions(Set<TaxOption> taxOptions) { this.taxOptions = taxOptions; }
}
