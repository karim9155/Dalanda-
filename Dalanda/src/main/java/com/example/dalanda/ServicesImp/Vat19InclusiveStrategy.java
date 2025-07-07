package com.example.dalanda.ServicesImp;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.example.dalanda.Services.TaxStrategy;
import org.springframework.stereotype.Component;
import com.example.dalanda.Entities.TaxOption;

@Component
public class Vat19InclusiveStrategy implements TaxStrategy {
    private static final BigDecimal RATE = BigDecimal.valueOf(0.19);
    private static final BigDecimal DIV = BigDecimal.ONE.add(RATE);

    @Override
    public BigDecimal calculateTax(BigDecimal grossAmount) {
        return grossAmount.multiply(RATE)
                .divide(DIV, 2, RoundingMode.HALF_UP);
    }

    @Override
    public TaxOption getTaxOption() {
        return TaxOption.VAT_19_INCLUSIVE;
    }
}