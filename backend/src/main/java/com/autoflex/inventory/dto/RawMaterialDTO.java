package com.autoflex.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
/**
 * Data Transfer Object for Raw Material.
 * Used for listing and manipulating raw materials via the API.
 */
public class RawMaterialDTO {
    private Long id;
    private String code;
    private String name;
    private BigDecimal stockQuantity;
}
