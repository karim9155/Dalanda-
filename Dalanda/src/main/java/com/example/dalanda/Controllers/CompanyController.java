package com.example.dalanda.Controllers;

import com.example.dalanda.Entities.Company;
import com.example.dalanda.Services.CompanyService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public List<Company> getAll() {
        return companyService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getOne(@PathVariable Long id) {
        return companyService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Company create(@RequestBody Company company) {
        return companyService.save(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> update(@PathVariable Long id, @RequestBody Company company) {
        return companyService.findById(id)
                .map(existing -> {
                    existing.setCompanyName(company.getCompanyName());
                    existing.setLogo(company.getLogo());
                    existing.setStampSignature(company.getStampSignature());
                    return ResponseEntity.ok(companyService.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        companyService.delete(id);
    }

    @PostMapping("/{id}/logo")
    public ResponseEntity<?> uploadLogo(@PathVariable Long id,
                                           @RequestParam("file") MultipartFile file) throws Exception {
        return companyService.findById(id)
                .map(existing -> {
                    try {
                        existing.setLogo(file.getBytes());
                        companyService.save(existing);
                        return ResponseEntity.ok().build();
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to upload logo", e);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/stamp")
    public ResponseEntity<?> uploadStamp(@PathVariable Long id,
                                            @RequestParam("file") MultipartFile file) throws Exception {
        return companyService.findById(id)
                .map(existing -> {
                    try {
                        existing.setStampSignature(file.getBytes());
                        companyService.save(existing);
                        return ResponseEntity.ok().build();
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to upload stamp", e);
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
