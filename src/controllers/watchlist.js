const axios = require("axios");
const WatchList = require("../models/Watchlist");

exports.addToWatchlist = async (req, res) => {
  try {
    const { userId, coinData } = req.body;

    let watchlist = await WatchList.findOne({ user: userId });

    if (watchlist) {
      const coinExits = watchlist.items.find((item) => item.id === coinData.id);
      if (coinExits) {
        return res.status(400).json({
          status: "error",
          message: "Coin already exists in watchlist!!",
        });
      }
    }

    const updatedWatchlist = await WatchList.findOneAndUpdate(
      { user: userId },
      {
        $push: { items: coinData },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      message: "Coin added to watchlist successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error while creating watchlist",
      error,
    });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { coinId, userId } = req.body;

    const watchlist = await WatchList.findOne({ user: userId });
    if (watchlist) {
      watchlist.items = watchlist.items.filter((item) => item.id !== coinId);
      await watchlist.save();
      return res.status(200).json({
        status: "success",
        message: "Coin removed from watchlist successfully",
      });
    }
    return res.status(400).json({
      status: "error",
      message: "watchlist not found!!",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error while removing coin from watchlist",
    });
  }
};

exports.getWatchlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const watchlist = await WatchList.findOne({ user: userId });

    if (watchlist) {
      return res.status(200).json({ status: "success", data: watchlist.items });
    }

    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
