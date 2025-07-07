package com.example.dalanda.Services;

import com.example.dalanda.Entities.Company;

import java.util.List;
import java.util.Optional;

public interface CompanyService {
    Company save(Company company);
    Optional<Company> findById(Long id);
    Optional<Company> findByName(String name);
    List<Company> findAll();
    void delete(Long id);
}
