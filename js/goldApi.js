// Gold API service with multiple fallback sources
import { ApiError } from './types.js';
export class GoldApiService {
    constructor(apiKeys = {}) {
        this.goldPrices = [];
        this.lastUpdated = null;
        this.currentSource = 'btc';
        this.apiKeys = apiKeys;
    }
    async fetchPrices() {
        const strategies = [
            { source: 'btc', fetch: () => this.fetchFromBTC() },
            { source: 'metals-api', fetch: () => this.fetchFromMetalsApi() },
            { source: 'gold-api', fetch: () => this.fetchFromGoldApiIO() },
            { source: 'fallback', fetch: () => this.fetchFromFreeApi() }
        ];
        let lastError = null;
        for (const strategy of strategies) {
            try {
                const prices = await strategy.fetch();
                if (prices.length > 0) {
                    this.goldPrices = prices;
                    this.currentSource = strategy.source;
                    return prices;
                }
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.warn(`API strategy failed: ${lastError.message}`);
            }
        }
        throw new ApiError(lastError?.message || 'Failed to fetch from all sources', 'all_sources');
    }
    async fetchPricesWithSource() {
        const products = await this.fetchPrices();
        return {
            products,
            source: this.currentSource,
            lastUpdated: this.lastUpdated || { date: 'Unknown', time: 'Unknown' },
            isAccurate: this.currentSource === 'btc' // Only BTC is considered fully accurate
        };
    }
    getCurrentSource() {
        return this.currentSource;
    }
    isUsingFallback() {
        return this.currentSource !== 'btc';
    }
    getLastUpdated() {
        return this.lastUpdated;
    }
    getCachedPrices() {
        return [...this.goldPrices];
    }
    // Primary API - BTC (Bullion Trading Center)
    async fetchFromBTC() {
        const response = await fetch("https://bulliontradingcenter.com/wp-admin/admin-ajax.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "action=btc_get_stock_ajax",
        });
        if (!response.ok) {
            throw new ApiError(`BTC API error: ${response.status}`, 'btc', response.status);
        }
        const data = await response.json();
        if (!data?.success || !data?.data?.obj?.table) {
            throw new ApiError('Invalid BTC API response format', 'btc');
        }
        this.lastUpdated = {
            date: data.data.obj.updated_date || new Date().toLocaleDateString(),
            time: data.data.obj.updated_time || new Date().toLocaleTimeString()
        };
        // Transform BTC API data to our simplified structure
        const btcProducts = data.data.obj.table;
        return this.mapBTCToStandardProducts(btcProducts);
    }
    // Fallback API 1 - Metals-API (requires API key)
    async fetchFromMetalsApi() {
        const apiKey = this.apiKeys.metalsApi;
        if (!apiKey) {
            throw new ApiError('Metals API key not provided', 'metals_api');
        }
        const response = await fetch(`https://metals-api.com/api/latest?access_key=${apiKey}&base=USD&symbols=XAU`);
        if (!response.ok) {
            throw new ApiError(`Metals API error: ${response.status}`, 'metals_api', response.status);
        }
        const data = await response.json();
        if (!data.success || !data.rates?.XAU) {
            throw new ApiError('Invalid Metals API response', 'metals_api');
        }
        // Convert from troy ounce to gram and from USD to EGP (approximate)
        const goldPricePerOunce = 1 / data.rates.XAU; // USD per ounce
        const goldPricePerGram = goldPricePerOunce / 31.1034768; // USD per gram
        const egpRate = 50; // Approximate USD to EGP rate (should be dynamic)
        const goldPriceEGP = goldPricePerGram * egpRate;
        this.lastUpdated = {
            date: data.date || new Date().toLocaleDateString(),
            time: new Date(data.timestamp * 1000).toLocaleTimeString()
        };
        return this.createStandardProducts(goldPriceEGP);
    }
    // Fallback API 2 - Gold-API.io (free tier)
    async fetchFromGoldApiIO() {
        const response = await fetch('https://api.gold-api.com/price/XAU');
        if (!response.ok) {
            throw new ApiError(`Gold-API.io error: ${response.status}`, 'gold_api_io', response.status);
        }
        const data = await response.json();
        if (!data.price) {
            throw new ApiError('Invalid Gold-API.io response', 'gold_api_io');
        }
        // Convert from USD per ounce to EGP per gram
        const goldPricePerGram = data.price / 31.1034768; // USD per gram
        const egpRate = 50; // Approximate conversion rate
        const goldPriceEGP = goldPricePerGram * egpRate;
        this.lastUpdated = {
            date: new Date(data.timestamp).toLocaleDateString(),
            time: new Date(data.timestamp).toLocaleTimeString()
        };
        return this.createStandardProducts(goldPriceEGP);
    }
    // Fallback API 3 - Free alternative API
    async fetchFromFreeApi() {
        // Using a free financial API as last resort
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (!response.ok) {
            throw new ApiError(`Free API error: ${response.status}`, 'free_api', response.status);
        }
        const data = await response.json();
        // Use a fixed gold price as absolute fallback
        // This is not ideal but provides basic functionality
        const fallbackGoldPrice = 3800; // Approximate EGP per gram for 24K
        this.lastUpdated = {
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        return this.createStandardProducts(fallbackGoldPrice);
    }
    // Map BTC API products to our standard structure
    mapBTCToStandardProducts(btcProducts) {
        // Find 21k and 24k products from BTC API
        const gold21k = btcProducts.find(p => p.formatted_name?.toLowerCase().includes('21k'));
        const gold24k = btcProducts.find(p => p.formatted_name?.toLowerCase().includes('24k'));
        // Create standardized products
        const products = [];
        // 18k Gold (estimated from 24k if available)
        if (gold24k) {
            const gold18kPrice = Number.parseFloat(String(gold24k.ask)) * 0.75;
            products.push({
                id: '18k_gold',
                name: '18K Gold',
                formatted_name: '18K Gold',
                karat: '18k',
                ask: Math.round(gold18kPrice),
                bid: Math.round(gold18kPrice * 0.98), // 2% spread
                weight_grams: 1
            });
        }
        // 21k Gold (from BTC API)
        if (gold21k) {
            products.push({
                id: '21k_gold',
                name: '21K Gold',
                formatted_name: '21K Gold',
                karat: '21k',
                ask: Number.parseFloat(String(gold21k.ask)),
                bid: Number.parseFloat(String(gold21k.bid)),
                weight_grams: 1
            });
        }
        // 24k Gold (from BTC API)
        if (gold24k) {
            products.push({
                id: '24k_gold',
                name: '24K Gold',
                formatted_name: '24K Gold',
                karat: '24k',
                ask: Number.parseFloat(String(gold24k.ask)),
                bid: Number.parseFloat(String(gold24k.bid)),
                weight_grams: 1
            });
        }
        // If we don't have products from BTC, create fallback
        if (products.length === 0 && btcProducts.length > 0) {
            const anyGold = btcProducts[0];
            const basePrice = Number.parseFloat(String(anyGold.ask));
            return this.createStandardProducts(basePrice);
        }
        return products;
    }
    // Create standard product set from gold price (only 18k, 21k, 24k as requested)
    createStandardProducts(goldPricePerGram24K) {
        const gold21KPrice = goldPricePerGram24K * 0.875; // 21K is 87.5% pure
        const gold18KPrice = goldPricePerGram24K * 0.75; // 18K is 75% pure
        const spread = 0.02; // 2% spread between buy and sell
        return [
            {
                id: '18k_gold',
                name: '18K Gold',
                formatted_name: '18K Gold',
                karat: '18k',
                ask: Math.round(gold18KPrice * (1 + spread)),
                bid: Math.round(gold18KPrice * (1 - spread)),
                weight_grams: 1
            },
            {
                id: '21k_gold',
                name: '21K Gold',
                formatted_name: '21K Gold',
                karat: '21k',
                ask: Math.round(gold21KPrice * (1 + spread)),
                bid: Math.round(gold21KPrice * (1 - spread)),
                weight_grams: 1
            },
            {
                id: '24k_gold',
                name: '24K Gold',
                formatted_name: '24K Gold',
                karat: '24k',
                ask: Math.round(goldPricePerGram24K * (1 + spread)),
                bid: Math.round(goldPricePerGram24K * (1 - spread)),
                weight_grams: 1
            }
        ];
    }
    // Parse product weight from name (same logic as original)
    parseProductWeight(product) {
        const name = (product.formatted_name || '').toLowerCase();
        // Extract gram amount from product name
        const gramMatch = name.match(/^(\d+(?:\.\d+)?)\s*gram/);
        if (gramMatch)
            return parseFloat(gramMatch[1]);
        if (name.includes('pound'))
            return 8; // Egyptian gold pound ≈ 8g
        if (name.includes('ounce') || name.includes('oz'))
            return 31.1034768;
        // Default: 1 (for per-gram products like 21K/24K)
        return product.weight_grams || 1;
    }
    // Get current exchange rates (for future enhancement)
    async getExchangeRates() {
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            return {
                usdToEgp: data.rates?.EGP || 50 // fallback rate
            };
        }
        catch {
            return { usdToEgp: 50 }; // fallback rate
        }
    }
    // Test all APIs to check availability
    async testAllApis() {
        const results = {};
        const tests = [
            { name: 'btc', fn: () => this.fetchFromBTC() },
            { name: 'metals_api', fn: () => this.fetchFromMetalsApi() },
            { name: 'gold_api_io', fn: () => this.fetchFromGoldApiIO() },
            { name: 'free_api', fn: () => this.fetchFromFreeApi() }
        ];
        for (const test of tests) {
            try {
                await test.fn();
                results[test.name] = true;
            }
            catch {
                results[test.name] = false;
            }
        }
        return results;
    }
}
//# sourceMappingURL=goldApi.js.map