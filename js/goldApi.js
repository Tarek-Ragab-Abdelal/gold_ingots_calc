// Gold API service with multiple fallback sources
import { ApiError } from './types.js';
export class GoldApiService {
    constructor(apiKeys = {}) {
        this.goldPrices = [];
        this.lastUpdated = null;
        this.currentSource = 'btc';
        // Exchange rate caching
        this.cachedExchangeRate = null;
        this.EXCHANGE_RATE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        this.apiKeys = apiKeys;
        // Initialize with current time to avoid "Invalid Date" issues
        const now = new Date();
        this.lastUpdated = {
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString()
        };
        // Initialize exchange rates in background
        this.updateExchangeRatesInBackground();
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
        // Fetch gold prices
        const products = await this.fetchPrices();
        // Always update exchange rates in background (don't wait for it to complete)
        // This ensures we have up-to-date exchange rates even when BTC API is working
        this.updateExchangeRatesInBackground();
        // Provide current date/time as fallback if no API timestamp available
        const now = new Date();
        const fallbackDate = now.toLocaleDateString();
        const fallbackTime = now.toLocaleTimeString();
        return {
            products,
            source: this.currentSource,
            lastUpdated: this.lastUpdated || { date: fallbackDate, time: fallbackTime },
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
        // Convert from troy ounce to gram and from USD to EGP
        const goldPricePerOunce = 1 / data.rates.XAU; // USD per ounce
        const goldPricePerGram = goldPricePerOunce / 31.1034768; // USD per gram
        // Get current USD to EGP exchange rate dynamically
        const { usdToEgp } = await this.getExchangeRates();
        const goldPriceEGP = goldPricePerGram * usdToEgp;
        console.log(`MetalsAPI conversion: $${goldPricePerGram.toFixed(2)}/g * ${usdToEgp.toFixed(2)} EGP/USD = ${goldPriceEGP.toFixed(2)} EGP/g`);
        this.lastUpdated = {
            date: data.date || new Date().toLocaleDateString(),
            time: data.timestamp ? new Date(data.timestamp * 1000).toLocaleTimeString() : new Date().toLocaleTimeString()
        };
        return this.createStandardProducts(goldPriceEGP);
    }
    // Fallback API 2 - Gold-API.io (free tier)
    async fetchFromGoldApiIO() {
        // Try multiple endpoints for gold-api.com as they may have changed
        const endpoints = [
            'https://api.gold-api.com/price/XAU',
            'https://api.metals.live/v1/spot/gold',
            'https://api.goldapi.io/api/XAU/USD' // Alternative endpoint
        ];
        let lastError = null;
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(endpoint);
                if (!response.ok) {
                    lastError = new Error(`HTTP ${response.status} from ${endpoint}`);
                    continue;
                }
                const data = await response.json();
                console.log(`Gold API response from ${endpoint}:`, data); // Debug log
                // Handle different response formats
                let priceInUSD;
                let timestamp;
                // gold-api.com format
                if (data.price) {
                    priceInUSD = data.price;
                    timestamp = data.timestamp;
                }
                // metals.live format
                else if (data.price_usd) {
                    priceInUSD = data.price_usd;
                    timestamp = data.updated_at;
                }
                // goldapi.io format
                else if (data.price_gram_24k) {
                    priceInUSD = data.price_gram_24k;
                    timestamp = data.timestamp;
                }
                if (!priceInUSD || priceInUSD <= 0) {
                    lastError = new Error(`Invalid price data from ${endpoint}: ${JSON.stringify(data)}`);
                    continue;
                }
                // Convert from USD per ounce to USD per gram (if needed)
                let goldPricePerGramUSD;
                if (endpoint.includes('goldapi.io')) {
                    // goldapi.io returns price per gram
                    goldPricePerGramUSD = priceInUSD;
                }
                else {
                    // Others return price per troy ounce
                    goldPricePerGramUSD = priceInUSD / 31.1034768;
                }
                // Get current USD to EGP exchange rate dynamically
                const { usdToEgp } = await this.getExchangeRates();
                console.log(`Fetched gold price from ${endpoint}: $${goldPricePerGramUSD.toFixed(2)}/g and USD/EGP: ${usdToEgp.toFixed(2)}`);
                const goldPriceEGP = goldPricePerGramUSD * usdToEgp;
                console.log(`Gold conversion: $${goldPricePerGramUSD.toFixed(2)}/g * ${usdToEgp.toFixed(2)} EGP/USD = ${goldPriceEGP.toFixed(2)} EGP/g`);
                this.lastUpdated = {
                    date: timestamp ? new Date(timestamp * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                    time: timestamp ? new Date(timestamp * 1000).toLocaleTimeString() : new Date().toLocaleTimeString()
                };
                return this.createStandardProducts(goldPriceEGP);
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.warn(`Gold API endpoint ${endpoint} failed:`, lastError.message);
                continue;
            }
        }
        throw new ApiError(`All Gold API endpoints failed. Last error: ${lastError?.message}`, 'gold_api_io');
    }
    // Fallback API 3 - Free alternative API with estimated gold price
    async fetchFromFreeApi() {
        try {
            // Get current USD to EGP exchange rate
            const { usdToEgp } = await this.getExchangeRates();
            // Use a reasonable estimate for gold price in USD per gram (24K)
            // This is based on approximate current market rates
            const estimatedGoldPriceUSD = 77; // Approximately $77 per gram for 24K gold
            const goldPriceEGP = estimatedGoldPriceUSD * usdToEgp;
            console.log(`FreeAPI conversion: $${estimatedGoldPriceUSD}/g * ${usdToEgp.toFixed(2)} EGP/USD = ${goldPriceEGP.toFixed(2)} EGP/g`);
            this.lastUpdated = {
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };
            return this.createStandardProducts(goldPriceEGP);
        }
        catch (error) {
            // If exchange rate fetching fails, use a complete fallback
            console.warn('Exchange rate fetch failed in free API, using complete fallback');
            const fallbackGoldPrice = 3800; // Approximate EGP per gram for 24K
            this.lastUpdated = {
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };
            return this.createStandardProducts(fallbackGoldPrice);
        }
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
    // Update exchange rates in the background without blocking main operations
    updateExchangeRatesInBackground() {
        // Don't wait for this to complete - run in background
        this.getExchangeRates().catch(error => {
            console.warn('Background exchange rate update failed:', error);
        });
    }
    // Force refresh exchange rates (clears cache and fetches new rate)
    async refreshExchangeRates() {
        this.clearExchangeRateCache();
        return this.getExchangeRates();
    }
    // Get current exchange rates with caching and enhanced error handling
    async getExchangeRates() {
        const fallbackRate = 47.5; // fallback rate
        const now = Date.now();
        // Check if we have a valid cached rate
        if (this.cachedExchangeRate &&
            (now - this.cachedExchangeRate.timestamp) < this.EXCHANGE_RATE_CACHE_DURATION) {
            return { usdToEgp: this.cachedExchangeRate.rate };
        }
        // Try multiple free currency APIs for better reliability
        const apis = [
            'https://api.exchangerate-api.com/v4/latest/USD',
            'https://api.fxapi.com/v1/latest?access_key=fxapi-demo&base=USD&symbols=EGP',
            'https://api.currencyapi.com/v3/latest?apikey=demo&base_currency=USD&currencies=EGP'
        ];
        for (const apiUrl of apis) {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok)
                    continue;
                const data = await response.json();
                // Handle different API response formats
                let rate;
                if (data.rates?.EGP) {
                    rate = data.rates.EGP;
                }
                else if (data.data?.EGP?.value) {
                    rate = data.data.EGP.value;
                }
                else if (data.EGP) {
                    rate = data.EGP;
                }
                if (rate && rate > 0) {
                    // Cache the successful rate
                    this.cachedExchangeRate = { rate, timestamp: now };
                    return { usdToEgp: rate };
                }
            }
            catch (error) {
                console.warn(`Currency API failed: ${error}`);
                continue;
            }
        }
        console.warn('All currency APIs failed, using fallback rate');
        // Cache the fallback rate for a shorter duration to retry sooner
        this.cachedExchangeRate = { rate: fallbackRate, timestamp: now - (this.EXCHANGE_RATE_CACHE_DURATION * 0.8) };
        return { usdToEgp: fallbackRate };
    }
    // Test Gold API specifically with detailed logging
    async testGoldApiWithExchangeRate() {
        try {
            console.log('Testing Gold API with exchange rate conversion...');
            // Test exchange rate first
            const { usdToEgp } = await this.getExchangeRates();
            console.log(`Current exchange rate: 1 USD = ${usdToEgp} EGP`);
            // Test gold price
            const goldProducts = await this.fetchFromGoldApiIO();
            if (goldProducts.length > 0) {
                const gold24k = goldProducts.find(p => p.karat === '24k');
                if (gold24k) {
                    return {
                        success: true,
                        goldPrice: gold24k.ask / usdToEgp, // Convert back to USD for verification
                        exchangeRate: usdToEgp,
                        finalPrice: gold24k.ask
                    };
                }
            }
            return { success: false, error: 'No 24k gold product found' };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : String(error) };
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
    // Clear cached exchange rate (useful for testing or forced refresh)
    clearExchangeRateCache() {
        this.cachedExchangeRate = null;
    }
    // Get cached exchange rate info
    getCachedExchangeRate() {
        if (!this.cachedExchangeRate)
            return null;
        const now = Date.now();
        const isExpired = (now - this.cachedExchangeRate.timestamp) >= this.EXCHANGE_RATE_CACHE_DURATION;
        return {
            rate: this.cachedExchangeRate.rate,
            timestamp: this.cachedExchangeRate.timestamp,
            isExpired
        };
    }
}
//# sourceMappingURL=goldApi.js.map