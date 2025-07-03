const { Schema, model } = require("mongoose");

const WatchlistSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        coinId: { type: String, required: true },
        symbol: { type: String, required: true },
        name: { type: String, required: true },
        image: String,
        price: Number,
        priceChange24h: Number,
        lastUpdated: Date,
        notes: String,
        targetPrice: Number,
      },
    ],
  },
  { timestamps: true }
);

const WatchList = model("WatchList", WatchlistSchema);

module.exports = WatchList;
