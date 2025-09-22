package com.example.dalanda.Controllers;

import com.example.dalanda.Services.StatisticsService;
import com.example.dalanda.dto.StatsDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping
    public ResponseEntity<StatsDTO> getStatistics() {
        return ResponseEntity.ok(statisticsService.getStatistics());
    }
}
