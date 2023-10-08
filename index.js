const cors = require("cors");
const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = 8095;

const omise = require("omise")({
  secretKey: "skey_test_5x2aulaz757hwjvfypb",
  omiseVersion: "2019-05-29",
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/checkout", (req, res) => {
  const { tokenId, amount, billId } = req.body;

  if (!tokenId || !amount || !billId) {
    res.status(400).send("Invalid request");
  }

  if (amount < 0) {
    res.status(400).send("Invalid amount");
  }

  console.log("Request body: ", req.body);

  omise.charges.create(
    {
      description: "Charge for bill ID: " + billId,
      amount: amount * 100, // "100000", // 1,000 Baht
      currency: "thb",
      capture: true,
      return_uri: "http://localhost:3000/success",
      card: tokenId,
    },
    function (err, resp) {
      if (err) throw err;
      // console.log(resp);
      res.json(resp);
      // if (resp["paid"]) {
      //   res.redirect("http://localhost:3000/success");
      // } else {
      //   //Handle failure
      //   throw resp.failure_code;
      // }
    }
  );
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
