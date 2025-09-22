package com.example.dalanda.ServicesImp;

import com.example.dalanda.Repositories.InvoiceRepository;
import com.example.dalanda.Services.StatisticsService;
import com.example.dalanda.dto.ChartData;
import com.example.dalanda.dto.NameValueDTO;
import com.example.dalanda.dto.StatsDTO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    private final InvoiceRepository invoiceRepository;

    public StatisticsServiceImpl(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    @Override
    public StatsDTO getStatistics() {
        StatsDTO statsDTO = new StatsDTO();
        statsDTO.setInvoicesByStatus(getInvoicesByStatus());
        statsDTO.setMonthlySales(getMonthlySales());
        statsDTO.setTopClients(getTopClients());
        return statsDTO;
    }

    private List<NameValueDTO> getInvoicesByStatus() {
        return invoiceRepository.countInvoicesByStatus().stream()
                .map(result -> new NameValueDTO((String) result[0], (Number) result[1]))
                .collect(Collectors.toList());
    }

    private List<ChartData> getMonthlySales() {
        // This is a simplified implementation. A more robust solution would handle years and different currencies.
        List<Object[]> results = invoiceRepository.findMonthlySales();
        List<NameValueDTO> salesData = results.stream()
                .map(result -> new NameValueDTO(result[0].toString() + "-" + result[1].toString(), (Number) result[2]))
                .collect(Collectors.toList());
        return List.of(new ChartData("Monthly Sales", salesData));
    }

    private List<NameValueDTO> getTopClients() {
        return invoiceRepository.findTopClients().stream()
                .map(result -> new NameValueDTO((String) result[0], (Number) result[1]))
                .collect(Collectors.toList());
    }
}
