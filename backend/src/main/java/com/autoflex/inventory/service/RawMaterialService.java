package com.autoflex.inventory.service;

import com.autoflex.inventory.dto.RawMaterialDTO;
import com.autoflex.inventory.entity.RawMaterial;
import com.autoflex.inventory.exception.ResourceNotFoundException;
import com.autoflex.inventory.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 * Service class for managing Raw Materials.
 * Handles business logic for creating, retrieving, and deleting raw materials.
 */
public class RawMaterialService {

    private final RawMaterialRepository repository;

    /**
     * Retrieves all raw materials from the database.
     * @return List of RawMaterialDTOs.
     */
    public List<RawMaterialDTO> findAll() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a specific raw material by ID.
     * @param id The ID of the raw material.
     * @return RawMaterialDTO found.
     * @throws ResourceNotFoundException if not found.
     */
    public RawMaterialDTO findById(Long id) {
        return repository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));
    }

    /**
     * Creates or updates a raw material.
     * @param dto The raw material data.
     * @return The saved RawMaterialDTO.
     */
    @Transactional
    public RawMaterialDTO save(RawMaterialDTO dto) {
        RawMaterial entity = new RawMaterial();
        if (dto.getId() != null && dto.getId() > 0) {
            entity = repository.findById(dto.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Raw Material not found"));
        }
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setStockQuantity(dto.getStockQuantity());
        
        RawMaterial saved = repository.save(entity);
        return convertToDTO(saved);
    }

    /**
     * Deletes a raw material by ID.
     * @param id The ID of the raw material to delete.
     */
    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }

    /**
     * Helper method to convert Entity to DTO.
     */
    private RawMaterialDTO convertToDTO(RawMaterial entity) {
        RawMaterialDTO dto = new RawMaterialDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setStockQuantity(entity.getStockQuantity());
        return dto;
    }
}
