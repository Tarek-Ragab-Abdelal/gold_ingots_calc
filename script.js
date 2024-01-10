// Global variables to store prices
let buyPrice = 0;
let sellPrice = 0;
let originalBuyPrice = 0;
let originalSellPrice = 0;

// Elements for displaying prices and last updated information
const buyValueElement = document.getElementById("buyValue");
const sellValueElement = document.getElementById("sellValue");
const unitBuyValue_24Element = document.getElementById("unitBuyValue_24");
const unitSellValue_24Element = document.getElementById("unitSellValue_24");
const unitBuyValue_21Element = document.getElementById("unitBuyValue_21");
const unitSellValue_21Element = document.getElementById("unitSellValue_21");
const lastUpdatedElement = document.getElementById("lastUpdated");

// Fetch prices on page load
window.addEventListener("load", () => {
  fetchPrices();
});

const loadingIndicator = document.getElementById("loadingIndicator");
const calculateButton = document.querySelector("button");
const weightInput = document.getElementById("weight");

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
        unitBuyValue_24Element.innerText = originalBuyPrice.toFixed(2) + " EGP";
        unitSellValue_24Element.innerText =
          originalSellPrice.toFixed(2) + " EGP";

        unitBuyValue_21Element.innerText =
          (originalBuyPrice * (21 / 24)).toFixed(2) + " EGP";
        unitSellValue_21Element.innerText =
          (originalSellPrice * (21 / 24)).toFixed(2) + " EGP";

        // Update the UI with the calculated buy and sell prices
        buyValueElement.textContent = originalBuyPrice.toFixed(2) + " EGP";
        sellValueElement.textContent = originalSellPrice.toFixed(2) + " EGP";

        // Display last updated date and time
        const updatedDate = data?.data?.obj?.updated_date;
        const updatedTime = data?.data?.obj?.updated_time;
        if (updatedDate && updatedTime) {
          lastUpdatedElement.textContent =
            "Last Updated: " + updatedDate + " " + updatedTime;
        }
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

// Modify the calculate function to check if prices are available before calculating
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
  const buyValue = parseFloat(weight) * (originalBuyPrice + 48);
  const sellValue = parseFloat(weight) * (originalSellPrice + 23);

  // Format the values using Intl.NumberFormat
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  });

  // Display the formatted values
  buyValueElement.innerText = formatter.format(buyValue);
  sellValueElement.innerText = formatter.format(sellValue);
}
