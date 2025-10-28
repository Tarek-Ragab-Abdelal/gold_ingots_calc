// Gold calculation service with comprehensive math operations
import { CalculationError, GOLD_PRODUCTS_CONFIG } from './types.js';
export class GoldCalculator {
    /**
     * Main calculation method that determines calculation type and delegates
     */
    calculate(input, products) {
        const product = this.findProduct(input.productId, products);
        if (!product) {
            throw new CalculationError('Product not found', 'productId');
        }
        // Calculate automatic fees based on karat type
        const automaticFee = this.calculateAutomaticFee(input.karat, input.quantity || input.moneyAmount || 1, input.customFee18k);
        const inputWithFees = { ...input, feePercent: automaticFee.feePercent };
        if (input.calcType === 'goldToMoney') {
            return this.calculateGoldToMoney(inputWithFees, product);
        }
        else {
            return this.calculateMoneyToGoldWithBreakdown(inputWithFees, product);
        }
    }
    /**
     * Calculate automatic fees based on karat and quantity/amount
     */
    calculateAutomaticFee(karat, amount, customFee18k) {
        if (karat === '21k') {
            // 21k gold fees based on product size
            if (amount >= 8)
                return { feePercent: 0, feePerGram: 75 }; // Gold Pound
            if (amount >= 4)
                return { feePercent: 0, feePerGram: 80 }; // Half Pound
            return { feePercent: 0, feePerGram: 85 }; // Quarter Pound
        }
        else if (karat === '24k') {
            // 24k gold fees based on quantity ranges (sorted from largest to smallest)
            if (amount >= 100)
                return { feePercent: 0, feePerGram: 71 };
            if (amount >= 50)
                return { feePercent: 0, feePerGram: 77 };
            if (amount >= 31.1)
                return { feePercent: 0, feePerGram: 79 };
            if (amount >= 20)
                return { feePercent: 0, feePerGram: 80 };
            if (amount >= 10)
                return { feePercent: 0, feePerGram: 82 };
            if (amount >= 5)
                return { feePercent: 0, feePerGram: 85 };
            if (amount >= 2.5)
                return { feePercent: 0, feePerGram: 110 };
            return { feePercent: 0, feePerGram: 185 }; // 1 gram
        }
        else if (karat === '18k') {
            // 18k gold - use custom fee if provided, otherwise default to 0
            if (customFee18k !== undefined && customFee18k > 0) {
                return { feePercent: 0, feePerGram: customFee18k };
            }
            return { feePercent: 0, feePerGram: 0 };
        }
        return { feePercent: 0, feePerGram: 0 };
    }
    /**
     * Calculate how much money you get/pay for a given quantity of gold
     */
    calculateGoldToMoney(input, product) {
        const quantity = input.quantity;
        if (!quantity || quantity <= 0) {
            throw new CalculationError('Please enter a valid quantity', 'quantity');
        }
        const buyPrice = Number.parseFloat(String(product.ask)); // What you pay when buying
        const sellPrice = Number.parseFloat(String(product.bid)); // What you get when selling
        const weightPerPiece = this.parseProductWeight(product);
        const isPerGramProduct = this.isPerGramProduct(product);
        let totalBuyValue = 0;
        let totalSellValue = 0;
        let totalWeightG = 0;
        if (isPerGramProduct) {
            // Quantity interpreted as grams for per-gram products (21K, 24K)
            totalWeightG = quantity;
            totalBuyValue = quantity * buyPrice;
            totalSellValue = quantity * sellPrice;
        }
        else {
            // Quantity interpreted as pieces for ingots/coins
            const pieceWeight = input.weightPerPiece && input.weightPerPiece > 0
                ? input.weightPerPiece
                : weightPerPiece;
            totalWeightG = quantity * pieceWeight;
            totalBuyValue = quantity * buyPrice;
            totalSellValue = quantity * sellPrice;
        }
        // Calculate fees using automatic fee calculation or provided percentage
        const feeInfo = this.calculateAutomaticFee(input.karat, totalWeightG, input.customFee18k);
        let buyFeeAmount = 0;
        let sellFeeAmount = 0;
        if (feeInfo.feePerGram > 0) {
            // Fixed fee per gram
            buyFeeAmount = totalWeightG * feeInfo.feePerGram;
            sellFeeAmount = totalWeightG * feeInfo.feePerGram;
        }
        else if (input.feePercent && input.feePercent > 0) {
            // Percentage fee
            buyFeeAmount = totalBuyValue * (input.feePercent / 100);
            sellFeeAmount = totalSellValue * (input.feePercent / 100);
        }
        // Apply fees (add when buying, subtract when selling)
        const finalBuyValue = this.applyRounding(totalBuyValue + buyFeeAmount, input.rounding);
        const finalSellValue = this.applyRounding(totalSellValue - sellFeeAmount, input.rounding);
        return {
            type: 'goldToMoney',
            product: product.formatted_name,
            buyPrice,
            sellPrice,
            quantity,
            totalBuyValue,
            totalSellValue,
            feePercent: input.feePercent || feeInfo.feePercent,
            buyFeeAmount,
            sellFeeAmount,
            finalBuyValue,
            finalSellValue,
            totalWeightG
        };
    }
    /**
     * Calculate how much gold you can get for a given amount of money
     */
    calculateMoneyToGold(input, product) {
        const moneyAmount = input.moneyAmount;
        if (!moneyAmount || moneyAmount <= 0) {
            throw new CalculationError('Please enter a valid amount', 'moneyAmount');
        }
        const buyPrice = parseFloat(String(product.ask)); // What you pay when buying
        const sellPrice = parseFloat(String(product.bid)); // What you get when selling
        const weightPerPiece = this.parseProductWeight(product);
        const isPerGramProduct = this.isPerGramProduct(product);
        const preferPieces = input.preferenceType === 'pieces';
        // Calculate fees using automatic fee calculation or provided percentage
        const feeInfo = this.calculateAutomaticFee(input.karat, 1, input.customFee18k); // Base calculation
        let buyFeeAmount = 0;
        let sellFeeAmount = 0;
        if (input.feePercent && input.feePercent > 0) {
            buyFeeAmount = moneyAmount * (input.feePercent / 100);
            sellFeeAmount = moneyAmount * (input.feePercent / 100);
        }
        // Calculate for buying scenario (you pay ask price)
        const usableMoneyBuy = moneyAmount - buyFeeAmount;
        // Calculate for selling scenario (you get bid price after fees)
        const usableMoneySell = moneyAmount + sellFeeAmount;
        let buyWholePieces = 0;
        let buyGramsObtained = 0;
        let buyRemainder;
        let sellWholePieces = 0;
        let sellGramsObtained = 0;
        let sellRemainder;
        // Calculate for buying scenario
        if (isPerGramProduct || !preferPieces) {
            // Calculate in grams
            buyGramsObtained = usableMoneyBuy / buyPrice;
            buyGramsObtained = this.applyRounding(buyGramsObtained, input.rounding);
            buyRemainder = usableMoneyBuy - (buyGramsObtained * buyPrice);
        }
        else {
            // Calculate in whole pieces
            buyWholePieces = Math.floor(usableMoneyBuy / buyPrice);
            buyRemainder = usableMoneyBuy - (buyWholePieces * buyPrice);
            buyGramsObtained = buyWholePieces * weightPerPiece;
        }
        // Calculate for selling scenario
        if (isPerGramProduct || !preferPieces) {
            // Calculate in grams
            sellGramsObtained = moneyAmount / sellPrice;
            sellGramsObtained = this.applyRounding(sellGramsObtained, input.rounding);
            sellRemainder = moneyAmount - (sellGramsObtained * sellPrice);
        }
        else {
            // Calculate in whole pieces
            sellWholePieces = Math.floor(moneyAmount / sellPrice);
            sellRemainder = moneyAmount - (sellWholePieces * sellPrice);
            sellGramsObtained = sellWholePieces * weightPerPiece;
        }
        return {
            type: 'moneyToGold',
            product: product.formatted_name,
            buyPrice,
            sellPrice,
            moneyAmount,
            feePercent: input.feePercent || feeInfo.feePercent,
            buyFeeAmount,
            sellFeeAmount,
            usableMoneyBuy,
            buyWholePieces,
            buyGramsObtained,
            buyRemainder: this.applyRounding(buyRemainder, input.rounding),
            sellWholePieces,
            sellGramsObtained,
            sellRemainder: this.applyRounding(sellRemainder, input.rounding),
            rounding: input.rounding
        };
    }
    /**
     * Calculate money to gold with optimal product breakdown
     */
    calculateMoneyToGoldWithBreakdown(input, product) {
        const baseResult = this.calculateMoneyToGold(input, product);
        // Add product breakdown for optimal purchasing
        if (input.karat === '21k' || input.karat === '24k') {
            const breakdown = this.calculateOptimalBreakdown(input.moneyAmount || 0, input.karat, product.ask);
            return { ...baseResult, breakdown };
        }
        return baseResult;
    }
    /**
     * Calculate optimal product breakdown for a given amount of money
     */
    calculateOptimalBreakdown(moneyAmount, karat, baseGoldPrice) {
        const breakdown = [];
        let remainingMoney = moneyAmount;
        if (karat === '21k') {
            // For 21k gold, optimize using pound, half-pound, quarter-pound
            const products = GOLD_PRODUCTS_CONFIG['21k'];
            for (const productConfig of products) {
                if (remainingMoney <= 0)
                    break;
                const totalCostPerGram = baseGoldPrice + productConfig.fee_per_gram;
                const totalCostPerUnit = totalCostPerGram * productConfig.weight_grams;
                const quantity = Math.floor(remainingMoney / totalCostPerUnit);
                if (quantity > 0) {
                    const totalCost = quantity * totalCostPerUnit;
                    breakdown.push({
                        productName: productConfig.name,
                        weight_grams: productConfig.weight_grams,
                        quantity,
                        fee_per_gram: productConfig.fee_per_gram,
                        total_cost: totalCost,
                        remaining_money: remainingMoney - totalCost
                    });
                    remainingMoney -= totalCost;
                }
            }
        }
        else if (karat === '24k') {
            // For 24k gold, optimize using different gram sizes
            const products = GOLD_PRODUCTS_CONFIG['24k'];
            for (const productConfig of products) {
                if (remainingMoney <= 0)
                    break;
                const totalCostPerGram = baseGoldPrice + productConfig.fee_per_gram;
                const totalCostPerUnit = totalCostPerGram * productConfig.weight_grams;
                const quantity = Math.floor(remainingMoney / totalCostPerUnit);
                if (quantity > 0) {
                    const totalCost = quantity * totalCostPerUnit;
                    breakdown.push({
                        productName: `${productConfig.weight_grams}g Gold Bar`,
                        weight_grams: productConfig.weight_grams,
                        quantity,
                        fee_per_gram: productConfig.fee_per_gram,
                        total_cost: totalCost,
                        remaining_money: remainingMoney - totalCost
                    });
                    remainingMoney -= totalCost;
                }
            }
        }
        return breakdown;
    }
    /**
     * Apply rounding based on the specified rounding type
     */
    applyRounding(value, rounding) {
        if (rounding === 'none')
            return parseFloat(String(value));
        const floatVal = parseFloat(String(value));
        if (Number.isNaN(floatVal))
            return value;
        if (rounding === '1')
            return Math.round(floatVal);
        const step = parseFloat(rounding);
        if (!Number.isNaN(step) && step > 0) {
            return Math.floor(floatVal / step) * step; // Round down to nearest step
        }
        return floatVal;
    }
    /**
     * Determine if a product is sold per gram (like 21K, 24K gold)
     */
    isPerGramProduct(product) {
        const name = product.formatted_name.toLowerCase();
        return /21k|24k/i.test(name) && !/^\d+\s+gram/i.test(name);
    }
    /**
     * Parse product weight from name or use provided weight
     */
    parseProductWeight(product) {
        // Use explicit weight if provided
        if (product.weight_grams && product.weight_grams > 0) {
            return product.weight_grams;
        }
        const name = (product.formatted_name || '').toLowerCase();
        // Extract gram amount from product name (e.g., "5 Gram Ingot")
        const gramMatch = name.match(/^(\d+(?:\.\d+)?)\s*gram/);
        if (gramMatch)
            return parseFloat(gramMatch[1]);
        // Known weights for special products
        if (name.includes('pound'))
            return 8; // Egyptian gold pound ≈ 8g
        if (name.includes('ounce') || name.includes('oz'))
            return 31.1034768; // Troy ounce
        // Default: 1 (for per-gram products like 21K/24K)
        return 1;
    }
    /**
     * Find a product by ID from the products array
     */
    findProduct(productId, products) {
        return products.find(p => String(p.id) === productId);
    }
    /**
     * Calculate profit/loss between buy and sell prices
     */
    calculateSpread(product) {
        const buyPrice = parseFloat(String(product.ask));
        const sellPrice = parseFloat(String(product.bid));
        const spread = buyPrice - sellPrice;
        const spreadPercent = (spread / buyPrice) * 100;
        return { spread, spreadPercent };
    }
    /**
     * Calculate break-even point considering fees
     */
    calculateBreakEven(product, feePercent) {
        const buyPrice = parseFloat(String(product.ask));
        const sellPrice = parseFloat(String(product.bid));
        // Price gold needs to appreciate to break even after fees
        const totalCostFactor = (1 + feePercent / 100);
        const totalSellFactor = (1 - feePercent / 100);
        return (buyPrice * totalCostFactor) / totalSellFactor;
    }
    /**
     * Convert weight between different units
     */
    convertWeight(amount, fromUnit, toUnit) {
        const gramsConversion = {
            'g': 1,
            'gram': 1,
            'grams': 1,
            'oz': 31.1034768,
            'ounce': 31.1034768,
            'pound': 8, // Egyptian gold pound
            'kg': 1000,
            'kilogram': 1000
        };
        const fromGrams = gramsConversion[fromUnit.toLowerCase()] || 1;
        const toGrams = gramsConversion[toUnit.toLowerCase()] || 1;
        return (amount * fromGrams) / toGrams;
    }
    /**
     * Calculate compound returns for gold investment
     */
    calculateCompoundReturns(principal, annualReturn, years, compoundingFrequency = 1) {
        const finalAmount = principal * Math.pow((1 + annualReturn / (100 * compoundingFrequency)), compoundingFrequency * years);
        const totalReturn = finalAmount - principal;
        const annualizedReturn = (Math.pow(finalAmount / principal, 1 / years) - 1) * 100;
        return { finalAmount, totalReturn, annualizedReturn };
    }
    /**
     * Calculate dollar cost averaging for regular gold purchases
     */
    calculateDollarCostAveraging(monthlyInvestment, goldPriceHistory, months) {
        let totalInvested = 0;
        let totalGrams = 0;
        for (let i = 0; i < Math.min(months, goldPriceHistory.length); i++) {
            const priceThisMonth = goldPriceHistory[i];
            const gramsThisMonth = monthlyInvestment / priceThisMonth;
            totalInvested += monthlyInvestment;
            totalGrams += gramsThisMonth;
        }
        const averageCost = totalInvested / totalGrams;
        return { totalInvested, totalGrams, averageCost };
    }
    /**
     * Validate calculation input
     */
    validateInput(input) {
        const errors = [];
        if (!input.productId) {
            errors.push('Product selection is required');
        }
        if (input.feePercent !== undefined && (input.feePercent < 0 || input.feePercent > 100)) {
            errors.push('Fee percentage must be between 0 and 100');
        }
        if (input.calcType === 'goldToMoney') {
            if (!input.quantity || input.quantity <= 0) {
                errors.push('Quantity must be greater than 0');
            }
        }
        else if (input.calcType === 'moneyToGold') {
            if (!input.moneyAmount || input.moneyAmount <= 0) {
                errors.push('Money amount must be greater than 0');
            }
        }
        if (input.weightPerPiece && input.weightPerPiece <= 0) {
            errors.push('Weight per piece must be greater than 0');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
}
//# sourceMappingURL=calculator.js.map