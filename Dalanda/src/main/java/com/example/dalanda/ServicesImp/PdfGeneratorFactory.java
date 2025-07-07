package com.example.dalanda.ServicesImp;

import java.util.Map;
import java.util.stream.Collectors;

import com.example.dalanda.Services.PdfGenerator;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

@Component
public class PdfGeneratorFactory {
    private final Map<String, PdfGenerator> generators;

    @Autowired
    public PdfGeneratorFactory(java.util.List<PdfGenerator> generatorList) {
        this.generators = generatorList.stream()
                .collect(Collectors.toMap(PdfGenerator::getKey, g -> g));
    }

    /**
     * Look up a PdfGenerator by its key ("iText", etc.).
     * Throws if no match.
     */
    public PdfGenerator getGenerator(String key) {
        PdfGenerator gen = generators.get(key);
        if (gen == null) {
            throw new IllegalArgumentException("Unsupported PDF generator: " + key);
        }
        return gen;
    }
}
