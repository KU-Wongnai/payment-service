const dotenv = require("dotenv");
dotenv.config();

const app = require("./server");

const PORT = 8095;

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
