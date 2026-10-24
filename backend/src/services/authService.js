const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    const error = new Error("Name, email and password are required");
    error.status = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error = new Error("Invalid email address");
    error.status = 400;
    throw error;
  }

  if (password.length < 8) {
    const error = new Error("Password must contain at least 8 characters");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(normalizedEmail);

  if (existingUser) {
    const error = new Error("Email already registered");
    error.status = 409;
    throw error;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `).run(name.trim(), normalizedEmail, hashedPassword);

  return db.prepare(`
    SELECT id, name, email, role FROM users WHERE id = ?
  `).get(result.lastInsertRowid);
}

function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = db.prepare(`
    SELECT * FROM users WHERE email = ?
  `).get(normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    secret,
    { expiresIn: "2h" }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = { registerUser, loginUser };