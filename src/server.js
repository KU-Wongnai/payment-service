const cors = require("cors");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const redis = require("./lib/redis");

const {
  createOrUpdateCustomer,
  createCharge,
  getCustomers,
  findLatestAddedCard,
} = require("./services/customer");

const authMiddleware = require("./middlewares/auth");

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/checkout", authMiddleware, async (req, res) => {
  try {
    let { tokenId, amount, billId, save, cardId } = req.body;

    if ((!tokenId && !cardId) || !amount || !billId) {
      res.status(400).send("Invalid request");
    }

    if (amount < 0) {
      res.status(400).send("Invalid amount");
    }

    const userId = req.user.id;
    const key = "user:" + userId;

    // Will return the customer id or null if not exists
    let customerId = await redis.get(key);

    if (save) {
      const customer = await createOrUpdateCustomer(
        tokenId,
        userId,
        customerId
      );
      cardId = await findLatestAddedCard(customer);
      await redis.set(key, customer.id);
      customerId = customer.id;
    }

    const charge = await createCharge(
      amount,
      "Charge for bill ID: " + billId,
      "http://localhost:3000/checkout/success",
      tokenId,
      customerId,
      cardId
    );

    res.json(charge);
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid request");
  }
});

app.get("/api/customers/me", authMiddleware, async (req, res) => {
  try {
    const key = "user:" + req.user.id;
    const customerId = await redis.get(key);

    if (!customerId) {
      res.status(404).send("Not found");
    }

    const customer = await getCustomers(customerId);

    res.json(customer);
  } catch (err) {
    console.log(err);
    res.status(400).send("Invalid request");
  }
});

module.exports = app;
