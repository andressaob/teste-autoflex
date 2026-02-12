package com.autoflex.inventory.repository;

import com.autoflex.inventory.entity.RawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
/**
 * Repository interface for managing RawMaterial entities.
 * Extends JpaRepository to provide standard CRUD operations.
 */
public interface RawMaterialRepository extends JpaRepository<RawMaterial, Long> {
}
