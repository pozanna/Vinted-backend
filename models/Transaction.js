const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  title: String,
  amount: Number,
});

module.exports = Transaction;
