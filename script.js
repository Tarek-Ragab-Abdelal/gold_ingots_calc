// Global variables to store prices
let buyPrice = 0;
let sellPrice = 0;

let originalBuyPrice = 0;
let originalSellPrice = 0;

// Fetch prices on page load
window.addEventListener("load", () => {
  fetchPrices();
});

const loadingIndicator = document.getElementById("loadingIndicator");
const calculateButton = document.querySelector("button");
const weightInput = document.getElementById("weight");
const buyValueElement = document.getElementById("buyValue");
const sellValueElement = document.getElementById("sellValue");

async function fetchPrices() {
  try {
    // Disable input field and button, show loading indicator
    weightInput.disabled = true;
    calculateButton.disabled = true;
    loadingIndicator.style.display = "block";

    // Fetch prices from the API
    const response = await fetch(
      "https://btcegyptgold.com/wp-admin/admin-ajax.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=btc_get_stock_ajax",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch prices");
    }

    const data = await response.json();

    // Process the API response and update prices
    const goldPrices = data?.data?.obj?.table;

    if (goldPrices) {
      const targetPrice = goldPrices.find((item) => item.name === "24k/E");
      if (targetPrice) {
        originalBuyPrice = targetPrice.ask;
        originalSellPrice = targetPrice.bid;
        document.getElementById("unitBuyValue").innerText = originalBuyPrice;
        document.getElementById("unitSellValue").innerText = originalSellPrice;

        // Update the UI with the calculated buy and sell prices
        buyValueElement.textContent = originalBuyPrice.toFixed(2) + " EGP";
        sellValueElement.textContent = originalSellPrice.toFixed(2) + " EGP";
      } else {
        throw new Error("Gold price data not found");
      }
    } else {
      throw new Error("Invalid API response");
    }
  } catch (error) {
    console.error("Error fetching prices:", error.message);
  } finally {
    // Enable input field and button, hide loading indicator
    weightInput.disabled = false;
    calculateButton.disabled = false;
    loadingIndicator.style.display = "none";
  }
}

function calculate() {
  // Check if prices are available
  const buyValueText = buyValueElement.textContent.trim();
  const sellValueText = sellValueElement.textContent.trim();

  if (
    buyValueText === "Prices not available. Fetch prices first." ||
    sellValueText === "Prices not available. Fetch prices first."
  ) {
    console.warn("Prices not available. Fetch prices first.");
    return;
  }

  // Clear previous values
  buyValueElement.innerText = "";
  sellValueElement.innerText = "";

  // Get the weight input value
  const weight = document.getElementById("weight").value;

  // Simple calculation based on the original prices
  const buyValue = parseFloat(weight) * originalBuyPrice;
  const sellValue = parseFloat(weight) * originalSellPrice;

  // Format the values using Intl.NumberFormat
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  });

  // Display the formatted values
  document.getElementById("buyValue").innerText = formatter.format(buyValue);
  document.getElementById("sellValue").innerText = formatter.format(sellValue);
}

function findGoldPrice(prices, targetEntity) {
  if (prices && prices.length > 0) {
    for (const price of prices) {
      if (price?.name === targetEntity) {
        return price;
      }
    }
  }
  return null;
}
