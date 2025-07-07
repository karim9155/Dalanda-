package com.example.dalanda.Services;

import com.example.dalanda.Entities.Invoice;

public interface PdfGenerator {
    /**
     * Render the given Invoice as a PDF byte‐array.
     */
    byte[] generate(Invoice invoice) throws Exception;

    /**
     * A short key you’ll use to pick this generator (e.g. "iText").
     */
    String getKey();
}
