// --- Domain Models ---

/**
 * Represents a Product in the inventory system.
 * A product is a manufactured item composed of raw materials.
 */
export interface Product {
    id: number;
    code: string;
    /** Human-readable name of the product. */
    name: string;
    /** Selling price of the product. */
    value: number;
    /** List of raw materials required to produce this item. */
    rawMaterials: ProductRawMaterial[];
}

/**
 * Input DTO for creating or updating basic product details.
 */
export interface ProductInput {
    code: string;
    name: string;
    value: number;
}

/**
 * Represents a Raw Material.
 * These are base components used in product manufacturing.
 */
export interface RawMaterial {
    id: number;
    code: string;
    name: string;
    /** Current available stock quantity. */
    stockQuantity: number;
}

/**
 * Association between a Product and a Raw Material.
 * Defines the recipe/formula for the product.
 */
export interface ProductRawMaterial {
    id?: number;
    rawMaterialId: number;
    /** Optional name for display purposes. */
    rawMaterialName?: string;
    /** Quantity needed to produce ONE unit of the product. */
    quantity: number; 
}

// --- Production Planning Models ---

/**
 * Represents a single item line in the production suggestion report.
 */
export interface SuggestionItem {
    productName: string;
    productCode: string;
    /** How many units are suggested to be produced. */
    quantity: number;
    /** Estimated revenue (Price * Suggested Qty). */
    subtotal: number;
}

/**
 * The complete Production Suggestion report.
 * Contains the list of items to produce and total estimated value.
 */
export interface ProductionSuggestion {
    items: SuggestionItem[];
    totalValue: number;
}
