package com.example.dalanda.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ClientDTO {
    private Long id;
    private String companyName; // Nom de la société
    private String contactName; // Nom du contact
    private String email; // E-Mail
    private String phoneNumber; // Numéro de téléphone
    private String rib; // RIB
    private String fiscalMatricule; // Matricule Fiscal
    private String address; // Adresse
    private String customFields; // JSON string for custom fields
    private String disabledFields; // JSON string for list of disabled fields

    // Constructor for all fields (optional, Lombok can generate if needed)
    public ClientDTO(Long id, String companyName, String contactName, String email, String phoneNumber,
                     String rib, String fiscalMatricule, String address, String customFields, String disabledFields) {
        this.id = id;
        this.companyName = companyName;
        this.contactName = contactName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.rib = rib;
        this.fiscalMatricule = fiscalMatricule;
        this.address = address;
        this.customFields = customFields;
        this.disabledFields = disabledFields;
    }

    // Getters and Setters are handled by Lombok
}
