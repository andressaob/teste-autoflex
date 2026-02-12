package com.autoflex.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
/**
 * DTO for Product - Raw Material Association.
 * Represents the quantity of a specific raw material needed for a product.
 * Used within the ProductDTO list.
 */
public class ProductRawMaterialDTO {
    /**
     * ID of the association.
     */
    private Long id;

    /**
     * ID of the Raw Material.
     */
    private Long rawMaterialId;

    /**
     * Name of the Raw Material.
     * Useful for display purposes without separate lookups.
     */
    private String rawMaterialName;

    /**
     * Quantity of this raw material required for one unit of the product.
     */
    private BigDecimal quantity;
}
