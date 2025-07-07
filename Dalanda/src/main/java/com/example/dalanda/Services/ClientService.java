package com.example.dalanda.Services;

import com.example.dalanda.Entities.Client;

import java.util.List;
import java.util.Optional;

public interface ClientService {
    Client save(Client client);
    Optional<Client> findById(Long id);
    Optional<Client> findByName(String name);
    List<Client> findAll();
    void delete(Long id);
}
