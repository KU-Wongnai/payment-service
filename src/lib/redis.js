const Redis = require("ioredis");

const redis = new Redis({
  port: 6380,
  host: "localhost",
});

module.exports = redis;
