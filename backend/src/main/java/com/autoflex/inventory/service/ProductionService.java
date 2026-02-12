package com.autoflex.inventory.service;

import com.autoflex.inventory.dto.ProductionSuggestionDTO;
import com.autoflex.inventory.dto.SuggestionItemDTO;
import com.autoflex.inventory.entity.Product;
import com.autoflex.inventory.entity.ProductRawMaterial;
import com.autoflex.inventory.entity.RawMaterial;
import com.autoflex.inventory.repository.ProductRepository;
import com.autoflex.inventory.repository.RawMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
/**
 * Service responsible for calculating the optimized Production Plan.
 * Uses a 'Greedy Algorithm' strategy to suggest products that maximize total value
 * based on the currently available raw material stock.
 */
public class ProductionService {

    private final ProductRepository productRepository;
    private final RawMaterialRepository rawMaterialRepository;

    /**
     * Calculates the production suggestion.
     * <p>
     * Algorithm Steps:
     * 1. Retrieve all products sorted by Value (Highest to Lowest).
     * 2. Fetch current stock of all Raw Materials.
     * 3. Iterate through products (Greedy approach: prioritize most expensive):
     *    a. Check how many units can be produced with remaining stock.
     *    b. If possible, add to suggestion list.
     *    c. Deduct required materials from the temporary stock model.
     *    d. Repeat for next product.
     * </p>
     * @return ProductionSuggestionDTO containing items to produce and estimated total value.
     */
    @Transactional(readOnly = true)
    public ProductionSuggestionDTO calculateSuggestion() {
        // 1. Fetch all products sorted by value DESC
        List<Product> products = productRepository.findAllOrderByValueDesc();

        // 2. Fetch all raw materials and creates a map of available stock
        List<RawMaterial> rawMaterials = rawMaterialRepository.findAll();
        Map<Long, BigDecimal> stock = rawMaterials.stream()
                .collect(Collectors.toMap(RawMaterial::getId, RawMaterial::getStockQuantity));

        List<SuggestionItemDTO> suggestionItems = new ArrayList<>();
        BigDecimal totalValue = BigDecimal.ZERO;

        // 3. Greedy algorithm
        for (Product product : products) {
            // Skip products with no materials defined
            if (product.getRawMaterials().isEmpty()) continue;

            // Calculate max units we can produce with current stock
            int maxUnits = Integer.MAX_VALUE;

            for (ProductRawMaterial prm : product.getRawMaterials()) {
                BigDecimal neededPerUnit = prm.getQuantity();
                BigDecimal available = stock.getOrDefault(prm.getRawMaterial().getId(), BigDecimal.ZERO);

                // If any material is needed but unavailable, we can't produce this item
                if (neededPerUnit.compareTo(BigDecimal.ZERO) == 0) continue;

                // How many units can be supported by this specific material?
                BigDecimal possibleDecimal = available.divide(neededPerUnit, 0, RoundingMode.FLOOR);
                maxUnits = Math.min(maxUnits, possibleDecimal.intValue());
            }

            // If we can produce at least one unit
            if (maxUnits > 0 && maxUnits != Integer.MAX_VALUE) {
                // Deduct from temporary stock to reserve materials for this product
                for (ProductRawMaterial prm : product.getRawMaterials()) {
                    BigDecimal neededTotal = prm.getQuantity().multiply(new BigDecimal(maxUnits));
                    BigDecimal currentStock = stock.get(prm.getRawMaterial().getId());
                    stock.put(prm.getRawMaterial().getId(), currentStock.subtract(neededTotal));
                }

                // Add to suggestion list
                BigDecimal subtotal = product.getValue().multiply(new BigDecimal(maxUnits));
                totalValue = totalValue.add(subtotal);

                SuggestionItemDTO item = new SuggestionItemDTO();
                item.setProductCode(product.getCode());
                item.setProductName(product.getName());
                item.setQuantity(maxUnits);
                item.setSubtotal(subtotal);
                suggestionItems.add(item);
            }
        }

        ProductionSuggestionDTO result = new ProductionSuggestionDTO();
        result.setItems(suggestionItems);
        result.setTotalValue(totalValue);

        return result;
    }
}
