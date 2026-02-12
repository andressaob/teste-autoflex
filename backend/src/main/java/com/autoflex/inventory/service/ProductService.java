package com.autoflex.inventory.service;

import com.autoflex.inventory.dto.ProductDTO;
import com.autoflex.inventory.dto.ProductRawMaterialDTO;
import com.autoflex.inventory.entity.Product;
import com.autoflex.inventory.entity.ProductRawMaterial;
import com.autoflex.inventory.entity.RawMaterial;
import com.autoflex.inventory.exception.ResourceNotFoundException;
import com.autoflex.inventory.repository.ProductRepository;
import com.autoflex.inventory.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 * Service class for managing Products and their composition.
 * Handles product creation (basic info) and raw material association management.
 */
public class ProductService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    /**
     * Retrieves all products.
     * @return List of ProductDTOs containing full details.
     */
    @Transactional(readOnly = true)
    public List<ProductDTO> findAll() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves product by ID.
     * @param id The product ID.
     * @return The product DTO.
     */
    @Transactional(readOnly = true)
    public ProductDTO findById(Long id) {
        return productRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    /**
     * Creates or updates a product's basic info (Code, Name, Value).
     * @param dto The product data.
     * @return THe saved ProductDTO.
     */
    @Transactional
    public ProductDTO save(ProductDTO dto) {
        Product product = new Product();
        if (dto.getId() != null && dto.getId() > 0) {
            product = productRepository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        }
        product.setCode(dto.getCode());
        product.setName(dto.getName());
        product.setValue(dto.getValue());
        // Note: raw material associations are handled via addRawMaterial/removeRawMaterial
        
        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    @Transactional
    public void delete(Long id) {
        productRepository.deleteById(id);
    }
    
    /**
     * Associates a raw material with a product or updates the quantity if already associated.
     * Implements an UPSERT (Update/Insert) logic for the association.
     * 
     * @param productId ID of the product.
     * @param rawMaterialId ID of the raw material.
     * @param quantity Quantity required per unit of product.
     */
    @Transactional
    public void addRawMaterial(Long productId, Long rawMaterialId, java.math.BigDecimal quantity) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if association already exists to update quantity instead of duplicating
        var existingAssociation = product.getRawMaterials().stream()
                .filter(prm -> prm.getRawMaterial().getId().equals(rawMaterialId))
                .findFirst();

        if (existingAssociation.isPresent()) {
            existingAssociation.get().setQuantity(quantity);
        } else {
            RawMaterial rawMaterial = rawMaterialRepository.findById(rawMaterialId)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));
                
            ProductRawMaterial association = new ProductRawMaterial();
            association.setProduct(product);
            association.setRawMaterial(rawMaterial);
            association.setQuantity(quantity);
            
            product.getRawMaterials().add(association);
        }
        productRepository.save(product);
    }
    
    /**
     * Removes a raw material association from a product.
     * @param productId ID of the product.
     * @param rawMaterialId ID of the raw material to remove.
     */
    @Transactional
    public void removeRawMaterial(Long productId, Long rawMaterialId) {
         Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
            
         product.getRawMaterials().removeIf(prm -> prm.getRawMaterial().getId().equals(rawMaterialId));
         productRepository.save(product);
    }

    /**
     * helper to convert Entity to DTO, including nested raw material data.
     */
    private ProductDTO convertToDTO(Product entity) {
        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setValue(entity.getValue());
        
        List<ProductRawMaterialDTO> rmDtos = entity.getRawMaterials().stream().map(prm -> {
            ProductRawMaterialDTO rmDto = new ProductRawMaterialDTO();
            rmDto.setId(prm.getId());
            rmDto.setRawMaterialId(prm.getRawMaterial().getId());
            rmDto.setRawMaterialName(prm.getRawMaterial().getName());
            rmDto.setQuantity(prm.getQuantity());
            return rmDto;
        }).collect(Collectors.toList());
        
        dto.setRawMaterials(rmDtos);
        return dto;
    }
}
