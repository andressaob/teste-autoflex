package com.autoflex.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
/**
 * DTO representing the result of the production suggestion algorithm.
 * Contains the list of items to produce and the estimated total value.
 */
public class ProductionSuggestionDTO {
    /**
     * List of suggested production items.
     */
    private List<SuggestionItemDTO> items;

    /**
     * Total potential value (revenue) if the suggestion is followed.
     */
    private BigDecimal totalValue;
}
