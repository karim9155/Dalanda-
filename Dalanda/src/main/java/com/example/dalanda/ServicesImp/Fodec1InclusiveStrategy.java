package com.example.dalanda.ServicesImp;

import java.math.BigDecimal;
import java.math.RoundingMode;

import com.example.dalanda.Services.TaxStrategy;
import org.springframework.stereotype.Component;
import com.example.dalanda.Entities.TaxOption;

@Component
public class Fodec1InclusiveStrategy implements TaxStrategy {
    private static final BigDecimal RATE = BigDecimal.valueOf(0.01);
    private static final BigDecimal DIVISOR = BigDecimal.ONE.add(RATE);

    @Override
    public BigDecimal calculateTax(BigDecimal grossAmount) {
        // Extract the 1% FODEC included in the gross amount
        return grossAmount.multiply(RATE)
                .divide(DIVISOR, 2, RoundingMode.HALF_UP);
    }

    @Override
    public TaxOption getTaxOption() {
        return TaxOption.FODEC_1_INCLUSIVE;
    }
}
