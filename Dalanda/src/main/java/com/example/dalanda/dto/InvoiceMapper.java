package com.example.dalanda.dto;

import com.example.dalanda.Entities.Client;
import com.example.dalanda.Entities.Company;
import com.example.dalanda.Entities.Invoice;
import com.example.dalanda.Entities.InvoiceItem;
import com.example.dalanda.Entities.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class InvoiceMapper {

    public UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        return new UserDTO(user.getId(), user.getUsername());
    }

    public ClientDTO toClientDTO(Client client) {
        if (client == null) {
            return null;
        }
        return new ClientDTO(client.getId(), client.getCompanyName(), client.getOtherInfo());
    }

    public CompanyDTO toCompanyDTO(Company company) {
        if (company == null) {
            return null;
        }
        // Assuming logo and stampSignature are not needed for the list view DTO
        return new CompanyDTO(company.getId(), company.getCompanyName());
    }

    public InvoiceItemDTO toInvoiceItemDTO(InvoiceItem item) {
        if (item == null) {
            return null;
        }
        return new InvoiceItemDTO(
                item.getId(),
                item.getDescription(),
                item.getQty(),
                item.getUnitPrice()
        );
    }

    public InvoiceDTO toInvoiceDTO(Invoice invoice) {
        if (invoice == null) {
            return null;
        }
        return new InvoiceDTO(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getDate(),
                invoice.getDueDate(),
                invoice.getTotalAmount(),
                toCompanyDTO(invoice.getCompany()),
                toClientDTO(invoice.getClient()),
                toUserDTO(invoice.getCreatedBy()),
                invoice.getItems() != null ? invoice.getItems().stream().map(this::toInvoiceItemDTO).collect(Collectors.toList()) : Collections.emptyList(),
                invoice.getTaxOptions(), // Assuming TaxOption enum can be used directly
                invoice.getStatus()
        );
    }
}
