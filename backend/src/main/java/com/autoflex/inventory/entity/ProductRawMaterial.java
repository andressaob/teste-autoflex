package com.autoflex.inventory.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product_raw_material", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "raw_material_id"}))
/**
 * Represents the association between a Product and a Raw Material.
 * Defines the quantity of a specific raw material needed to produce.
 * one unit of the associated product.
 */
public class ProductRawMaterial {

    /**
     * Unique identifier for the association.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The product associated with this raw material requirement.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Product product;

    /**
     * The raw material required.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "raw_material_id", nullable = false)
    private RawMaterial rawMaterial;

    /**
     * The quantity of raw material needed to produce ONE unit of the product.
     */
    @Column(nullable = false)
    private BigDecimal quantity;
}
