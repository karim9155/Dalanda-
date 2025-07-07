package com.example.dalanda.Services;

import java.math.BigDecimal;
import com.example.dalanda.Entities.TaxOption;

public interface TaxStrategy {
    /**
     * Calculate the tax amount for a given base amount.
     */
    BigDecimal calculateTax(BigDecimal baseAmount);

    /**
     * Which TaxOption this strategy implements.
     */
    TaxOption getTaxOption();
}
