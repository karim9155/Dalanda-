package com.example.dalanda.Repositories;

import com.example.dalanda.Entities.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Optional<Invoice> findByCreatedBy_Id(UUID userId);

    List<Invoice> findAllByCreatedBy_Id(UUID createdById);

    @Query("SELECT i.status, COUNT(i) FROM Invoice i GROUP BY i.status")
    List<Object[]> countInvoicesByStatus();

    @Query("SELECT FUNCTION('YEAR', i.date), FUNCTION('MONTH', i.date), SUM(i.totalAmount) FROM Invoice i GROUP BY FUNCTION('YEAR', i.date), FUNCTION('MONTH', i.date) ORDER BY FUNCTION('YEAR', i.date), FUNCTION('MONTH', i.date)")
    List<Object[]> findMonthlySales();

    @Query("SELECT c.companyName, SUM(i.totalAmount) AS total FROM Invoice i JOIN i.client c GROUP BY c.companyName ORDER BY total DESC")
    List<Object[]> findTopClients();
}
