const db = require("../config/database");

function getAllVehicles() {
  return db.prepare(`
    SELECT * FROM vehicles
    ORDER BY id DESC
  `).all();
}

function searchVehicles({ make, model, category, minPrice, maxPrice }) {
  let sql = "SELECT * FROM vehicles WHERE 1 = 1";
  const params = [];

  if (make) {
    sql += " AND make LIKE ?";
    params.push(`%${make}%`);
  }

  if (model) {
    sql += " AND model LIKE ?";
    params.push(`%${model}%`);
  }

  if (category) {
    sql += " AND category = ?";
    params.push(category);
  }

  if (minPrice !== undefined && minPrice !== "") {
    sql += " AND price >= ?";
    params.push(Number(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== "") {
    sql += " AND price <= ?";
    params.push(Number(maxPrice));
  }

  sql += " ORDER BY id DESC";

  return db.prepare(sql).all(...params);
}

function addVehicle(vehicle) {
  const { make, model, category, price, quantity, image_url } = vehicle;

  if (
    typeof make !== "string" || !make.trim() ||
    typeof model !== "string" || !model.trim() ||
    typeof category !== "string" || !category.trim() ||
    !Number.isFinite(price) || price < 0 ||
    !Number.isInteger(quantity) || quantity < 0
  ) {
    const error = new Error(
      "Valid make, model, category, price and quantity are required"
    );
    error.status = 400;
    throw error;
  }

  const result = db.prepare(`
    INSERT INTO vehicles
      (make, model, category, price, quantity, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    make.trim(),
    model.trim(),
    category.trim(),
    price,
    quantity,
    image_url || null
  );

  return db.prepare(
    "SELECT * FROM vehicles WHERE id = ?"
  ).get(result.lastInsertRowid);
}

function updateVehicle(id, vehicle) {
  const existing = db.prepare(
    "SELECT * FROM vehicles WHERE id = ?"
  ).get(id);

  if (!existing) {
    const error = new Error("Vehicle not found");
    error.status = 404;
    throw error;
  }

  const updated = {
    make: vehicle.make ?? existing.make,
    model: vehicle.model ?? existing.model,
    category: vehicle.category ?? existing.category,
    price: vehicle.price ?? existing.price,
    quantity: vehicle.quantity ?? existing.quantity,
    image_url: vehicle.image_url ?? existing.image_url
  };

  if (
    typeof updated.make !== "string" || !updated.make.trim() ||
    typeof updated.model !== "string" || !updated.model.trim() ||
    typeof updated.category !== "string" || !updated.category.trim() ||
    !Number.isFinite(updated.price) || updated.price < 0 ||
    !Number.isInteger(updated.quantity) || updated.quantity < 0
  ) {
    const error = new Error("Invalid vehicle details");
    error.status = 400;
    throw error;
  }

  db.prepare(`
    UPDATE vehicles
    SET make = ?, model = ?, category = ?,
        price = ?, quantity = ?, image_url = ?
    WHERE id = ?
  `).run(
    updated.make.trim(),
    updated.model.trim(),
    updated.category.trim(),
    updated.price,
    updated.quantity,
    updated.image_url,
    id
  );

  return db.prepare(
    "SELECT * FROM vehicles WHERE id = ?"
  ).get(id);
}

function deleteVehicle(id) {
  const result = db.prepare(
    "DELETE FROM vehicles WHERE id = ?"
  ).run(id);

  return result.changes > 0;
}

function purchaseVehicle(id) {
  // Atomically decrease stock only when stock is available.
  const result = db.prepare(`
    UPDATE vehicles
    SET quantity = quantity - 1
    WHERE id = ? AND quantity > 0
  `).run(id);

  if (result.changes === 0) {
    const vehicle = db.prepare(
      "SELECT id FROM vehicles WHERE id = ?"
    ).get(id);

    const error = new Error(
      vehicle ? "Vehicle is out of stock" : "Vehicle not found"
    );

    error.status = vehicle ? 409 : 404;
    throw error;
  }

  return db.prepare(
    "SELECT * FROM vehicles WHERE id = ?"
  ).get(id);
}

function restockVehicle(id, amount) {
  if (!Number.isInteger(amount) || amount <= 0) {
    const error = new Error(
      "Restock quantity must be a positive integer"
    );
    error.status = 400;
    throw error;
  }

  const result = db.prepare(`
    UPDATE vehicles
    SET quantity = quantity + ?
    WHERE id = ?
  `).run(amount, id);

  if (result.changes === 0) {
    const error = new Error("Vehicle not found");
    error.status = 404;
    throw error;
  }

  return db.prepare(
    "SELECT * FROM vehicles WHERE id = ?"
  ).get(id);
}

module.exports = {
  getAllVehicles,
  searchVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
};