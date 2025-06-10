const axios = require("axios");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ کاربر جدید متصل شد:", socket.id);

    socket.on("sendMessage", (message) => {
      io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("❌ کاربر قطع شد:", socket.id);
    });
  });

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(
        "https://api.binance.com/api/v3/ticker/24hr"
      );
      const prices = [];
      response.data.coins.forEach((coin) => {
        prices.push({
          name: coin.name,
          price: coin.price,
          symbol: coin.symbol,
          change: coin.change,
          sparkline: coin.sparkline,
        });
      });
      return prices;
    } catch (error) {
      console.error("خطا در دریافت قیمت‌ها:", error);
      return {};
    }
  };

  setInterval(async () => {
    const prices = await fetchCryptoPrices();
    io.emit("updatePrices", prices);
  }, 10000);
};
