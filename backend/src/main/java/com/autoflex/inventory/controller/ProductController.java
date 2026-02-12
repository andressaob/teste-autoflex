package com.autoflex.inventory.controller;

import com.autoflex.inventory.dto.ProductDTO;
import com.autoflex.inventory.service.ProductService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
/**
 * REST Controller for Product operations.
 * Exposes endpoints to creating, retrieving, updating and deleting products.
 * Also manages the association between products and raw materials.
 */
public class ProductController {

    private final ProductService service;

    /**
     * Get all products.
     * @return List of ProductDTO.
     */
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    /**
     * Get product by ID.
     * @param id Product ID.
     * @return ProductDTO.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    /**
     * Create a new product.
     * @param dto Product data.
     * @return Created ProductDTO.
     */
    @PostMapping
    public ResponseEntity<ProductDTO> create(@RequestBody ProductDTO dto) {
        return new ResponseEntity<>(service.save(dto), HttpStatus.CREATED);
    }

    /**
     * Update an existing product.
     * @param id Product ID.
     * @param dto Product data.
     * @return Updated ProductDTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable Long id, @RequestBody ProductDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(service.save(dto));
    }

    /**
     * Delete a product.
     * @param id Product ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Add a raw material association to a product.
     * @param id Product ID.
     * @param request Request body containing raw material ID and quantity.
     */
    @PostMapping("/{id}/raw-materials")
    public ResponseEntity<Void> addRawMaterial(@PathVariable Long id, @RequestBody AddRawMaterialRequest request) {
        service.addRawMaterial(id, request.getRawMaterialId(), request.getQuantity());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Remove a raw material association from a product.
     * @param id Product ID.
     * @param rawMaterialId Raw Material ID.
     */
    @DeleteMapping("/{id}/raw-materials/{rawMaterialId}")
    public ResponseEntity<Void> removeRawMaterial(@PathVariable Long id, @PathVariable Long rawMaterialId) {
        service.removeRawMaterial(id, rawMaterialId);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Inner DTO Class for AddRawMaterial request body.
     */
    @Data
    public static class AddRawMaterialRequest {
        private Long rawMaterialId;
        private BigDecimal quantity;
    }
}
