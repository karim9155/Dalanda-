package com.example.dalanda.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "logo", columnDefinition = "LONGBLOB")
    private byte[] logo;

    @Lob
    @Column(name = "stamp_signature", columnDefinition = "LONGBLOB")
    private byte[] stampSignature;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @JsonIgnore
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = false)
    private java.util.List<Invoice> issuedInvoices = new java.util.ArrayList<>();

    // getters + setters
}
