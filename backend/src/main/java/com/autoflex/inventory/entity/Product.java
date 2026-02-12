package com.autoflex.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
/**
 * Represents a Product in the system.
 * A product is an item that can be manufactured and sold.
 * It is composed of one or more raw materials.
 */
public class Product {

    /**
     * Unique identifier for the product.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique code for the product (e.g., "PROD-001").
     */
    @Column(nullable = false, unique = true)
    private String code;

    /**
     * Name of the product (e.g., "Office Chair").
     */
    @Column(nullable = false)
    private String name;

    /**
     * Selling price of the product.
     */
    @Column(nullable = false)
    private BigDecimal value;

    /**
     * List of raw materials required to manufacture this product.
     * The relationship is managed by the ProductRawMaterial entity.
     */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductRawMaterial> rawMaterials = new ArrayList<>();
}
