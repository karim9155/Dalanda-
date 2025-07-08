package com.example.dalanda.Entities;

import com.example.dalanda.Entities.Client;
import com.example.dalanda.Entities.Company;
import com.example.dalanda.Entities.TaxOption;
import com.example.dalanda.Entities.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = true) // Assuming status can be initially null or set to a default
    private String status;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "invoice",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    @JsonManagedReference
    private List<InvoiceItem> items = new ArrayList<>();

    @ElementCollection(targetClass = TaxOption.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "invoice_tax_options",
            joinColumns = @JoinColumn(name = "invoice_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "tax_option")
    private Set<TaxOption> taxOptions = new HashSet<>();

    // getters + setters
}
