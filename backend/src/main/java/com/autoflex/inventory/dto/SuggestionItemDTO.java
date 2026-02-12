package com.autoflex.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
/**
 * DTO representing a single item in the production suggestion.
 * Indicates which product to produce, how much, and the value it adds.
 */
public class SuggestionItemDTO {
    private String productName;
    private String productCode;

    /**
     * The quantity of this product suggested for production.
     */
    private Integer quantity;

    /**
     * The subtotal value (Product Value * Quantity).
     */
    private BigDecimal subtotal;
}
