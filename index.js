const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const Redis = require("ioredis");
const jwt = require("jsonwebtoken");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = 8095;

const redis = new Redis({
  port: 6380,
  host: "localhost",
});

const omise = require("omise")({
  secretKey: "skey_test_5x2aulaz757hwjvfypb",
  omiseVersion: "2019-05-29",
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/redis/:value", (req, res) => {
  const { value } = req.params;
  redis.set("key", value);
  res.send("OK");
});

app.get("/api/redis", async (req, res) => {
  // redis.get("key", (err, result) => {
  //   res.send(result);
  // });
  const value = await redis.get("key");
  res.send(value);
});

app.post("/api/checkout", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  console.log(token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let { tokenId, amount, billId, save, cardId } = req.body;

    if ((!tokenId && !cardId) || !amount || !billId) {
      res.status(400).send("Invalid request");
    }

    if (amount < 0) {
      res.status(400).send("Invalid amount");
    }

    console.log("Request body: ", req.body);
    console.log("Decoded: ", decoded);

    const { sub: userId } = decoded;
    const key = "user:" + userId;

    // Will return the customer id or null if not exists
    let value = await redis.get(key);

    if (save) {
      // If customer id not exists, create a new customer
      if (!value) {
        const customer = await omise.customers.create({
          // 'email': 'john.doe@example.com',
          description: "User ID: " + userId,
          card: tokenId,
        });

        await redis.set(key, customer.id);
        console.log(customer);
        value = customer.id;

        cardId = customer.cards.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        })[0].id;
      } else {
        // If customer id exists, update the card
        const customer = await omise.customers.update(value, {
          card: tokenId,
        });
        console.log(customer);
        // Get the new added card id
        cardId = customer.cards.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        })[0].id;
      }
    }

    const request = {
      description: "Charge for bill ID: " + billId,
      amount: amount * 100, // "100000" -> 1,000 Baht
      currency: "thb",
      capture: true,
      return_uri: "http://localhost:3000/checkout/success",
    };

    if (value && cardId) {
      request.customer = value;
      request.card = cardId;
    } else {
      request.card = tokenId;
    }

    const charge = await omise.charges.create(request);

    res.json(charge);
  } catch (err) {
    console.log(err);
    res.status(401).send("Invalid token");
  }
});

app.get("/api/customers/me", async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { sub: userId } = decoded;
    const key = "user:" + userId;
    const value = await redis.get(key);

    if (!value) {
      res.status(404).send("Not found");
    }

    const customer = await omise.customers.retrieve(value);

    res.json(customer);
  } catch (err) {
    console.log(err);
    res.status(401).send("Invalid token");
  }
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
