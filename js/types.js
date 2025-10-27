// TypeScript interfaces and types for the Gold Calculator App
// Error types
export class ApiError extends Error {
    constructor(message, source, statusCode) {
        super(message);
        this.source = source;
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}
export class CalculationError extends Error {
    constructor(message, field) {
        super(message);
        this.field = field;
        this.name = 'CalculationError';
    }
}
// Predefined gold product configurations
export const GOLD_PRODUCTS_CONFIG = {
    '21k': [
        { name: 'Gold Pound', weight_grams: 8, fee_per_gram: 60 },
        { name: 'Half Pound', weight_grams: 4, fee_per_gram: 60 },
        { name: 'Quarter Pound', weight_grams: 2, fee_per_gram: 60 }
    ],
    '24k': [
        { weight_grams: 1, fee_per_gram: 185 },
        { weight_grams: 2.5, fee_per_gram: 150 },
        { weight_grams: 5, fee_per_gram: 85 },
        { weight_grams: 10, fee_per_gram: 85 },
        { weight_grams: 20, fee_per_gram: 85 },
        { weight_grams: 50, fee_per_gram: 85 },
        { weight_grams: 100, fee_per_gram: 85 }
    ]
};
//# sourceMappingURL=types.js.map