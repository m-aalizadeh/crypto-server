const axios = require("axios");
const User = require("../models/User");
const { verifyToken } = require("../utils/isAuth");
const jwt = require("jsonwebtoken");
module.exports = (io) => {
  const users = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication Error"));
      }
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error("Authentication error"));
      }
      socket.user = user;
      users.set(user._id.toString(), socket.id);
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    socket.join(`user_${socket.user._id}`);

    socket.on("sendMessage", async ({ recipientId, message }) => {
      try {
        const recipientSocketId = users.get(recipientId);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receiveMessage", {
            sender: socket.user._id,
            message,
            timestamp: new Date(),
          });
        }

        // await saveMessageToDB(socket.user._id, recipientId, message);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      users.delete(socket.user._id.toString());
      console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
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
