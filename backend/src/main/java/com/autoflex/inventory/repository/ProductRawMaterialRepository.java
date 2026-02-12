package com.autoflex.inventory.repository;

import com.autoflex.inventory.entity.ProductRawMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
/**
 * Repository interface for managing Product-RawMaterial associations.
 * Primarily used for internal cascading or specific lookups if needed.
 */
public interface ProductRawMaterialRepository extends JpaRepository<ProductRawMaterial, Long> {
}
