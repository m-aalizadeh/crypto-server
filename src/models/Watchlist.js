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
        id: { type: String, required: true },
        symbol: { type: String, required: true },
        name: { type: String, required: true },
        image: String,
        current_price: Number,

        price_change_percentage_24h: Number,
        // lastUpdated: Date,
        // notes: String,
        market_cap: Number,
      },
    ],
  },
  { timestamps: true }
);

const WatchList = model("WatchList", WatchlistSchema);

module.exports = WatchList;
