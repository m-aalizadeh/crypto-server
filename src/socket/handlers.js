const axios = require("axios");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("sendMessage", (message) => {
      io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });

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
      console.error("Error while fetching data:", error);
      return {};
    }
  };

  setInterval(async () => {
    const prices = await fetchCryptoPrices();
    io.emit("updatePrices", prices);
  }, 60000);
};
