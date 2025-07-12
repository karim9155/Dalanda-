package com.example.dalanda.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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
    private String companyName; // Nom de la société

    @Column(name = "email")
    private String email; // E-Mail

    @Column(name = "phone_number")
    private String phoneNumber; // Numéro de téléphone

    @Column(name = "rib")
    private String rib; // Relevé d'identité bancaire (RIB)

    @Column(name = "fiscal_matricule")
    private String fiscalMatricule; // Matricule Fiscal

    @Column(name = "address")
    private String address; // Adresse

    @Lob
    @Column(name = "custom_fields", columnDefinition = "TEXT")
    private String customFields; // JSON string for custom fields

    @Lob
    @Column(name = "disabled_fields", columnDefinition = "TEXT")
    private String disabledFields; // JSON string for list of disabled fields

    @JsonIgnore
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Invoice> issuedInvoices = new ArrayList<>();

    // getters + setters are handled by Lombok
}
