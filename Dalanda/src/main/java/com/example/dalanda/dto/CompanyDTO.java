package com.example.dalanda.dto;

public class CompanyDTO {
    private Long id;
    private String companyName;
    // Add other fields like logo, stampSignature if needed by the frontend for the list view
    // For now, keeping it simple.

    // Constructors, Getters, Setters
    public CompanyDTO() {}

    public CompanyDTO(Long id, String companyName) {
        this.id = id;
        this.companyName = companyName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
}
