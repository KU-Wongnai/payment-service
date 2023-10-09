const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { sub: userId } = decoded;
    req.user = { id: userId };

    console.log("Token: ", token);
    console.log("Decoded: ", decoded);

    next();
  } catch (err) {
    console.log(err);
    res.status(401).send("Invalid token");
  }
}

module.exports = authMiddleware;
