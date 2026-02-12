package com.autoflex.inventory.controller;

import com.autoflex.inventory.dto.RawMaterialDTO;
import com.autoflex.inventory.service.RawMaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/raw-materials")
@RequiredArgsConstructor
/**
 * REST Controller for Raw Material operations.
 * Exposes endpoints to manage the stock of raw materials.
 */
public class RawMaterialController {

    private final RawMaterialService service;

    /**
     * Retrieve all raw materials.
     */
    @GetMapping
    public ResponseEntity<List<RawMaterialDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /**
     * Retrieve a specific raw material by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RawMaterialDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    /**
     * Create a new raw material.
     */
    @PostMapping
    public ResponseEntity<RawMaterialDTO> create(@RequestBody RawMaterialDTO dto) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    /**
     * Update an existing raw material.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RawMaterialDTO> update(@PathVariable Long id, @RequestBody RawMaterialDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(service.save(dto));
    }

    /**
     * Delete a raw material.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
