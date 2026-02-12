package com.autoflex.inventory.controller;

import com.autoflex.inventory.dto.ProductionSuggestionDTO;
import com.autoflex.inventory.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
/**
 * REST Controller for Production Planning.
 * Exposes endpoints related to production suggestions and reports.
 */
public class ProductionController {

    private final ProductionService service;

    /**
     * Calculates and returns a production suggestion based on current stock.
     * Uses a maximization algorithm (Greedy) to prioritize high-value products.
     * @return ProductionSuggestionDTO with items and total estimated value.
     */
    @GetMapping("/suggestion")
    public ResponseEntity<ProductionSuggestionDTO> getSuggestion() {
        return ResponseEntity.ok(service.calculateSuggestion());
    }
}
