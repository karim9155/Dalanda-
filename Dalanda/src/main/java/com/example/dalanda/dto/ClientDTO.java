package com.example.dalanda.dto;

public class ClientDTO {
    private Long id;
    private String companyName;
    private String otherInfo;

    // Constructors, Getters, Setters
    public ClientDTO() {}

    public ClientDTO(Long id, String companyName, String otherInfo) {
        this.id = id;
        this.companyName = companyName;
        this.otherInfo = otherInfo;
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

    public String getOtherInfo() {
        return otherInfo;
    }

    public void setOtherInfo(String otherInfo) {
        this.otherInfo = otherInfo;
    }
}
