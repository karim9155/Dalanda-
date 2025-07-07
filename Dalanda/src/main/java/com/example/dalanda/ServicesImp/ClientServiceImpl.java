package com.example.dalanda.ServicesImp;

import com.example.dalanda.Entities.Client;
import com.example.dalanda.Repositories.ClientRepository;
import com.example.dalanda.Services.ClientService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClientServiceImpl implements ClientService {

    private final ClientRepository repo;

    public ClientServiceImpl(ClientRepository repo) {
        this.repo = repo;
    }

    @Override
    public Client save(Client client) {
        return repo.save(client);
    }

    @Override
    public Optional<Client> findById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Optional<Client> findByName(String name) {
        return repo.findByCompanyName(name);
    }

    @Override
    public List<Client> findAll() {
        return repo.findAll();
    }

    @Override
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
