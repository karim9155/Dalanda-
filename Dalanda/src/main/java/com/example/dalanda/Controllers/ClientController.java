package com.example.dalanda.Controllers;

import com.example.dalanda.Entities.Client;
import com.example.dalanda.Services.ClientService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<Client> getAll() {
        return clientService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getOne(@PathVariable Long id) {
        return clientService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Client create(@RequestBody Client client) {
        return clientService.save(client);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> update(@PathVariable Long id, @RequestBody Client client) {
        return clientService.findById(id)
                .map(existingClient -> {
                    existingClient.setCompanyName(client.getCompanyName());
                    existingClient.setContactName(client.getContactName());
                    existingClient.setEmail(client.getEmail());
                    existingClient.setPhoneNumber(client.getPhoneNumber());
                    existingClient.setRib(client.getRib());
                    existingClient.setFiscalMatricule(client.getFiscalMatricule());
                    existingClient.setAddress(client.getAddress());
                    existingClient.setCustomFields(client.getCustomFields());
                    existingClient.setDisabledFields(client.getDisabledFields());
                    return ResponseEntity.ok(clientService.save(existingClient));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        clientService.delete(id);
    }
}
