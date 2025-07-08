package com.example.dalanda.dto;

import java.math.BigDecimal;

public class InvoiceItemDTO {
    private Long id;
    private String description;
    private Integer qty;
    private BigDecimal unitPrice;
    // lineTotal can be calculated if needed, or passed directly

    // Constructors, Getters, Setters
    public InvoiceItemDTO() {}

    public InvoiceItemDTO(Long id, String description, Integer qty, BigDecimal unitPrice) {
        this.id = id;
        this.description = description;
        this.qty = qty;
        this.unitPrice = unitPrice;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description.trim();
    }

    public Integer getQty() {
        return qty;
    }

    public void setQty(Integer qty) {
        this.qty = qty;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}
