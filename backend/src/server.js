const app = require("./app");

const PORT = process.env.PORT || 5000;

console.log("Registered Express app:", typeof app);
console.log("Has listen method:", typeof app.listen);

app.listen(PORT, () => {
  console.log(`Car Dealership API running on port ${PORT}`);
});