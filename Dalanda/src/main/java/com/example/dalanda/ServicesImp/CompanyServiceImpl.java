package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.Company;
import com.example.dalanda.Repositories.CompanyRepository;
import com.example.dalanda.Services.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository repo;

    public CompanyServiceImpl(CompanyRepository repo) {
        this.repo = repo;
    }

    @Override
    public Company save(Company company) {
        return repo.save(company);
    }

    @Override
    public Optional<Company> findById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Optional<Company> findByName(String name) {
        return repo.findByCompanyName(name);
    }

    @Override
    public List<Company> findAll() {
        return repo.findAll();
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
