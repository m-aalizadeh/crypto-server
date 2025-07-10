const axios = require("axios");

module.exports = (cryptoNamespace) => {
  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false"
      );
      const prices = [];
      response.data.forEach((coin) => {
        prices.push({
          id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          image: coin.image,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          market_cap_rank: coin.market_cap_rank,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          total_volume: coin.total_volume,
          circulating_supply: coin.circulating_supply,
          max_supply: coin.max_supply,
        });
      });
      return prices;
    } catch (error) {
      console.error("Crypto API error:", error);
      return [];
    }
  };

  cryptoNamespace.on("connection", (socket) => {
    console.log(`Crypto data connection: ${socket.id}`);

    // Send initial data on connection
    fetchCryptoPrices().then((prices) => {
      socket.emit("initialPrices", prices);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Crypto data disconnected: ${socket.id}`);
    });
  });

  // Update all clients at intervals
  setInterval(async () => {
    const prices = await fetchCryptoPrices();
    cryptoNamespace.emit("updatePrices", prices);
  }, 60000);
};
