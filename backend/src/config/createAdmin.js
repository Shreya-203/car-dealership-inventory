require("dotenv").config();

const db = require("./database");
const bcrypt = require("bcryptjs");
const readline = require("readline");

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Administrator";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first"
    );
  }

  if (password.length < 12) {
    throw new Error("Admin password must be at least 12 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = db.prepare(
    "SELECT id, role FROM users WHERE email = ?"
  ).get(normalizedEmail);

  if (existing) {
    console.log(
      `Account already exists with role: ${existing.role}. No changes made.`
    );
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  db.prepare(`
    INSERT INTO users (name, email, password, role)
    VALUES (?, ?, ?, 'admin')
  `).run(name, normalizedEmail, hashedPassword);

  console.log("Admin account created successfully.");
}

createAdmin()
  .catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => db.close());