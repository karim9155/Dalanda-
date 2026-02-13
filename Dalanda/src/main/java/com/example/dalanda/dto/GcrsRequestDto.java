package com.example.dalanda.dto;

import lombok.Data;

@Data
public class GcrsRequestDto {
    private String dateFacturation;
    private String invoiceNumber;
    private Double amountTTC;
    private String tauxRetenue;
    private String companyName;
    private String companyAddress;
    private String companyId;
    private String clientType;
    private String clientName;
    private String clientAddress;
    private String clientId;
}
