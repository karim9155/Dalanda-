package com.example.dalanda.Repositories;

import com.example.dalanda.Entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByCreatedBy_Id(UUID userId);

    List<Invoice> findAllByCreatedBy_Id(UUID createdById);
}
