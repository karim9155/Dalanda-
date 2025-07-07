// src/main/java/com/example/dalanda/tax/Vat19Strategy.java
package com.example.dalanda.ServicesImp;

import java.math.BigDecimal;

import com.example.dalanda.Services.TaxStrategy;
import org.springframework.stereotype.Component;
import com.example.dalanda.Entities.TaxOption;

@Component
public class Tva19Strategy implements TaxStrategy {
    private static final BigDecimal RATE = BigDecimal.valueOf(0.19);

    @Override
    public BigDecimal calculateTax(BigDecimal baseAmount) {
        return baseAmount.multiply(RATE);
    }

    @Override
    public TaxOption getTaxOption() {
        return TaxOption.VAT_19;
    }
}
