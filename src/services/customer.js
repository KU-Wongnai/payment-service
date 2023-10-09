const omise = require("omise")({
  secretKey: "skey_test_5x2aulaz757hwjvfypb",
  omiseVersion: "2019-05-29",
});

module.exports = {
  async createOrUpdateCustomer(tokenId, userId, customerId = null) {
    let customer;

    if (customerId) {
      customer = await omise.customers.update(customerId, {
        card: tokenId,
      });
    } else {
      customer = await omise.customers.create({
        // 'email': 'john.doe@example.com',
        description: "User ID: " + userId,
        card: tokenId,
      });
    }

    console.log("Customer: ", customer);

    return customer;
  },
  async createCharge(
    amount,
    description,
    return_uri,
    tokenId,
    customerId = null,
    cardId = null
  ) {
    const request = {
      description,
      amount: amount * 100, // "100000" -> 1,000 Baht
      currency: "thb",
      capture: true,
      return_uri,
    };

    if (customerId && cardId) {
      request.customer = customerId;
      request.card = cardId;
    } else {
      request.card = tokenId;
    }

    const charge = await omise.charges.create(request);

    return charge;
  },
  async getCustomers(customerId) {
    const customer = await omise.customers.retrieve(customerId);
    return customer;
  },
  async findLatestAddedCard(customer) {
    return customer.cards.data.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    })[0].id;
  },
};
