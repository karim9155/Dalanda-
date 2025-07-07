package com.example.dalanda.Repositories;

import com.example.dalanda.Entities.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    // (you can add custom queries here if needed)
}
