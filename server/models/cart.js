const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

// AUTO CALCULATE TOTAL PRICE
cartSchema.pre("save", function (next) {
  this.totalPrice = this.price * this.quantity;
  next();
});

cartSchema.index({ product: 1, userId: 1 }, { unique: true });


cartSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

cartSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Cart", cartSchema);