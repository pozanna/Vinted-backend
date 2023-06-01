const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51NEIVRALprE2xxeA7eibPykAAtts03zAO2W79TbUJ3VDvYJtqLd8tSiNCGoQkbcxWcqBlZdkJST7xXpGNC4Ddrmt00GGbBbYqR"
);
const Transaction = require("./models/Transaction");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// mongoose.connect("mongodb://127.0.0.1/vinted");
mongoose.connect(process.env.MONGODB_URI);
const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.post("/payment", async (req, res) => {
  // Réception du token créer via l'API Stripe depuis le Frontend
  const stripeToken = req.body.stripeToken;
  // Créer la transaction
  const response = await stripe.charges.create({
    amount: req.body.amount,
    currency: "eur",
    description: req.body.title,
    // On envoie ici le token
    source: stripeToken,
  });
  console.log(response.status);

  const transaction = new Transaction({
    title: req.body.title,
    amount: req.body.amount,
  });

  await transaction.save();
  res.json(response);
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});
