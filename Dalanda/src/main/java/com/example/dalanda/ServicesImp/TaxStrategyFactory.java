package com.example.dalanda.ServicesImp;

import java.util.Map;
import java.util.stream.Collectors;

import com.example.dalanda.Services.TaxStrategy;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.dalanda.Entities.TaxOption;

@Component
public class TaxStrategyFactory {
    private final Map<TaxOption, TaxStrategy> strategyMap;

    @Autowired
    public TaxStrategyFactory(java.util.List<TaxStrategy> strategies) {
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(TaxStrategy::getTaxOption, s -> s));
    }

    /**
     * Retrieve the matching strategy for the given TaxOption.
     */
    public TaxStrategy forOption(TaxOption option) {
        TaxStrategy strat = strategyMap.get(option);
        if (strat == null) {
            throw new IllegalArgumentException("No TaxStrategy for " + option);
        }
        return strat;
    }
}
