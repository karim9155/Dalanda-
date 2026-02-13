package com.example.dalanda.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsDTO {
    private List<NameValueDTO> invoicesByStatus;
    private List<ChartData> monthlySales;
    private List<NameValueDTO> topClients;
}
