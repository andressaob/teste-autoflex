package com.autoflex.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
/**
 * Data Transfer Object for Product.
 * Used to transfer product data between the controller and service layers.
 * Contains both basic product info and its raw material composition.
 */
public class ProductDTO {
    private Long id;
    private String code;
    private String name;
    private BigDecimal value;
    /**
     * List of raw materials associated with this product.
     */
    private List<ProductRawMaterialDTO> rawMaterials;
}
