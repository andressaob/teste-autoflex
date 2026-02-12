package com.autoflex.inventory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Represents a Raw Material in the system.
 * A raw material is a material used to manufacture products.
 */
public class RawMaterial {

    /**
     * Unique identifier for the raw material.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique code for the raw material (e.g., "RM-001").
     */
    @Column(nullable = false, unique = true)
    private String code;

    /**
     * Name of the raw material (e.g., "Metal Sheet").
     */
    @Column(nullable = false)
    private String name;

    /**
     * Current quantity available in stock.
     */
    @Column(nullable = false, name = "stock_quantity")
    private BigDecimal stockQuantity;
}
