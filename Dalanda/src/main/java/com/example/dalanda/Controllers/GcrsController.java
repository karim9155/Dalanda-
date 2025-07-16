package com.example.dalanda.Controllers;

import com.example.dalanda.dto.GcrsRequestDto;
import com.example.dalanda.Services.GcrsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gcrs")
@CrossOrigin(origins = "http://localhost:4200")
public class GcrsController {

    private final GcrsService gcrsService;

    public GcrsController(GcrsService gcrsService) {
        this.gcrsService = gcrsService;
    }

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateCertificate(@RequestBody GcrsRequestDto dto) {
        try {
            byte[] pdfBytes = gcrsService.generateCertificate(dto);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "certificat.pdf");
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
