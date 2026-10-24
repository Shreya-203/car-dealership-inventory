const request = require("supertest");
const app = require("../src/app");
const db = require("../src/config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

describe("Vehicle Inventory API", () => {
let adminToken;
let userToken;
let vehicleId;

beforeEach(() => {
db.prepare("DELETE FROM vehicles").run();
db.prepare("DELETE FROM users").run();

const passwordHash = bcrypt.hashSync("SecurePass123", 10);

const adminResult = db.prepare(`
  INSERT INTO users (name, email, password, role)
  VALUES (?, ?, ?, ?)
`).run("Admin", "admin@test.com", passwordHash, "admin");

const userResult = db.prepare(`
  INSERT INTO users (name, email, password, role)
  VALUES (?, ?, ?, ?)
`).run("Test User", "user@test.com", passwordHash, "user");

adminToken = jwt.sign(
  { id: adminResult.lastInsertRowid, role: "admin" },
  process.env.JWT_SECRET
);

userToken = jwt.sign(
  { id: userResult.lastInsertRowid, role: "user" },
  process.env.JWT_SECRET
);

const vehicleResult = db.prepare(`
  INSERT INTO vehicles (make, model, category, price, quantity)
  VALUES (?, ?, ?, ?, ?)
`).run("Toyota", "Innova", "SUV", 2500000, 5);

vehicleId = vehicleResult.lastInsertRowid;


});

afterAll(() => {
db.close();
});

test("lists vehicles for an authenticated user", async () => {
const response = await request(app)
.get("/api/vehicles")
.set("Authorization", `Bearer ${userToken}`);


expect(response.status).toBe(200);
expect(response.body).toHaveLength(1);
expect(response.body[0].make).toBe("Toyota");


});

test("rejects vehicle listing without a token", async () => {
const response = await request(app).get("/api/vehicles");


expect(response.status).toBe(401);


});

test("allows an admin to add a vehicle", async () => {
const response = await request(app)
.post("/api/vehicles")
.set("Authorization", `Bearer ${adminToken}`)
.send({
make: "Hyundai",
model: "Creta",
category: "SUV",
price: 1500000,
quantity: 3
});


expect(response.status).toBe(201);
expect(response.body.make).toBe("Hyundai");


});

test("rejects vehicle creation by a normal user", async () => {
const response = await request(app)
.post("/api/vehicles")
.set("Authorization", `Bearer ${userToken}`)
.send({
make: "Hyundai",
model: "Creta",
category: "SUV",
price: 1500000,
quantity: 3
});


expect(response.status).toBe(403);


});

test("searches vehicles by make", async () => {
const response = await request(app)
.get("/api/vehicles/search?make=Toyota")
.set("Authorization", `Bearer ${userToken}`);


expect(response.status).toBe(200);
expect(response.body).toHaveLength(1);
expect(response.body[0].make).toBe("Toyota");

});

test("decreases stock after a successful purchase", async () => {
const response = await request(app)
.post(`/api/vehicles/${vehicleId}/purchase`)
.set("Authorization", `Bearer ${userToken}`);


expect(response.status).toBe(200);
expect(response.body.vehicle.quantity).toBe(4);


});

test("allows an admin to restock a vehicle", async () => {
const response = await request(app)
.post(`/api/vehicles/${vehicleId}/restock`)
.set("Authorization", `Bearer ${adminToken}`)
.send({ amount: 3 });


expect(response.status).toBe(200);
expect(response.body.vehicle.quantity).toBe(8);


});

test("rejects restocking by a normal user", async () => {
const response = await request(app)
.post(`/api/vehicles/${vehicleId}/restock`)
.set("Authorization", `Bearer ${userToken}`)
.send({ amount: 3 });


expect(response.status).toBe(403);


});

test("allows an admin to update a vehicle", async () => {
const response = await request(app)
.put(`/api/vehicles/${vehicleId}`)
.set("Authorization", `Bearer ${adminToken}`)
.send({ price: 2400000 });


expect(response.status).toBe(200);
expect(response.body.price).toBe(2400000);


});

test("allows an admin to delete a vehicle", async () => {
const response = await request(app)
.delete(`/api/vehicles/${vehicleId}`)
.set("Authorization", `Bearer ${adminToken}`);


expect(response.status).toBe(200);

const vehicle = db.prepare(
  "SELECT * FROM vehicles WHERE id = ?"
).get(vehicleId);

expect(vehicle).toBeUndefined();

});
});
