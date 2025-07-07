package com.example.dalanda.ServicesImp;

import java.math.BigDecimal;

import com.example.dalanda.Services.TaxStrategy;
import org.springframework.stereotype.Component;
import com.example.dalanda.Entities.TaxOption;

@Component
public class Vat7Strategy implements TaxStrategy {
    private static final BigDecimal RATE = BigDecimal.valueOf(0.07);

    @Override
    public BigDecimal calculateTax(BigDecimal baseAmount) {
        return baseAmount.multiply(RATE);
    }

    @Override
    public TaxOption getTaxOption() {
        return TaxOption.VAT_7;
    }
}
