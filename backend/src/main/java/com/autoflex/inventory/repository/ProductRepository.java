package com.autoflex.inventory.repository;

import com.autoflex.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
/**
 * Repository interface for managing Product entities.
 * Extends JpaRepository to provide standard CRUD operations.
 */
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * Custom query to retrieve all products ordered by their value in descending order.
     * This is crucial for the "Greedy" production suggestion algorithm, which
     * attempts to maximize profit by prioritizing the most expensive items.
     *
     * @return List of products sorted by value (highest first).
     */
    @Query("SELECT p FROM Product p ORDER BY p.value DESC")
    List<Product> findAllOrderByValueDesc();
}
