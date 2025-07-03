const axios = require("axios");

exports.fetchAllCryptos = async (req, res) => {
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
    return res.status(200).json({
      status: "success",
      data: prices,
      message: "Fetched All coins successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
