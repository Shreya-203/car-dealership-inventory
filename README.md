# AutoHub — Car Dealership Inventory System

AutoHub is a full-stack web application for managing a car dealership's vehicle inventory. Customers can register, log in, browse vehicles, search and filter inventory, and purchase available stock. Administrators can add, edit, delete, and restock vehicles.

**GitHub Repository:** https://github.com/Shreya-203/car-dealership-inventory

## Features

### 1. Authentication and Authorization

* User registration and login.
* Password hashing with bcrypt.
* JWT-based authentication.
* Role-based authorization for administrator operations.
* Separate customer and administrator experiences.

### 2. Vehicle Inventory

* View available vehicles.
* Search vehicles by make, model, and category.
* Filter vehicles by maximum price.
* Add new vehicles as an administrator.
* Update vehicle details.
* Delete vehicles as an administrator.
* Purchase vehicles and decrease available stock.
* Restock vehicles as an administrator.
* Prevent purchases when stock is unavailable.

### 3. Security

* Passwords are hashed before storage.
* Protected API endpoints require a valid JWT.
* Administrator-only operations use role checks.
* Database queries use parameterized statements.
* Environment variables are used for configuration.

## Technology Stack

### Frontend

* React
* Vite
* HTML5
* CSS3
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JSON Web Tokens (JWT)
* bcryptjs

### Database

* SQLite
* better-sqlite3

### Testing

* Jest
* Supertest

## Project Structure

```text
car-dealership-inventory/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   │   ├── auth.test.js
│   │   └── vehicle.test.js
│   ├── package.json
│   └── .env                 # Create locally; do not commit
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── screenshots/
│   ├── admin.png
│   ├── inventory.png
│   ├── login.png
│   ├── search.png
│   └── test.png
├── PROMPTS.md
└── README.md
```

## Prerequisites

Install the following before running the project:

* Node.js and npm
* Visual Studio Code or another code editor
* Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Shreya-203/car-dealership-inventory.git
cd car-dealership-inventory
```

### 2. Configure the backend

Open a terminal in the project root and run:

```bash
cd backend
npm install
```

Create a file named `.env` inside the `backend` directory.

Add the following configuration, replacing the example values with your own secure credentials:

```env
PORT=5000
JWT_SECRET=CarDealership_Incubyte_2026_SecureKey_9xK7mP2vL8qR
ADMIN_NAME=shreya
ADMIN_EMAIL=jathanshreya34@gmail.com
ADMIN_PASSWORD=SH123@20JATHAN
```

**Important:**

* Use a strong, unique JWT secret.
* Set a unique administrator password of at least 12 characters.
* Keep `.env` private.
* Never commit `.env` or database files to GitHub.

### 3. Create the administrator account

From the `backend` directory, run:

```bash
node src/config/createAdmin.js
```

The script uses the administrator details configured in the backend .env file.

If the configured account does not exist, the script creates an administrator account.
If the account already has the administrator role, the script reports that it is already an administrator.
If the account exists with a regular user role, the script promotes it to administrator.

Use the configured administrator email and password to log in.

### 4. Start the backend

From the `backend` directory, run:

```bash
npm start
```

The API should run at:

http://localhost:5000

Health check:

http://localhost:5000/api/health

Keep this terminal open while using the application.

### 5. Start the frontend

Open a second terminal from the project root and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173

Keep both the backend and frontend running while testing the application.

## API Endpoints

The following table documents the intended access levels. Verify these against the actual route definitions in the source code.

| Method | Endpoint                     | Access        | Purpose                    |
| ------ | ---------------------------- | ------------- | -------------------------- |
| POST   | `/api/auth/register`         | Public        | Register a customer        |
| POST   | `/api/auth/login`            | Public        | Log in and receive a JWT   |
| GET    | `/api/health`                | Public        | Check API status           |
| GET    | `/api/vehicles`              | Authenticated | List vehicles              |
| GET    | `/api/vehicles/search`       | Authenticated | Search and filter vehicles |
| POST   | `/api/vehicles`              | Admin         | Add a vehicle              |
| PUT    | `/api/vehicles/:id`          | Admin         | Update vehicle details     |
| DELETE | `/api/vehicles/:id`          | Admin         | Delete a vehicle           |
| POST   | `/api/vehicles/:id/purchase` | Authenticated | Purchase a vehicle         |
| POST   | `/api/vehicles/:id/restock`  | Admin         | Restock a vehicle          |

### Example authenticated request

After logging in successfully, the API returns a JWT token. Use that token when accessing protected endpoints.

GET /api/vehicles
Authorization: Bearer CarDealership_Incubyte_2026_SecureKey_9xK7mP2vL8qR

Replace CarDealership_Incubyte_2026_SecureKey_9xK7mP2vL8qR with the token returned by the login endpoint. Do not publish real tokens or secret keys in the README.
```



## Running Tests

From the backend directory, run:

```bash
npm test
```

To generate a test coverage report, run:

```bash
npm run test:coverage
```

During development, the backend test suite completed with **14 passing tests across 2 test suites**. Run the tests again before submission and report the results of that run.

### Test-Driven Development

The project uses Jest and Supertest for automated backend testing.

The expected TDD workflow is:

1. Write a test for the intended behavior.
2. Run the test and confirm that it fails.
3. Implement the minimum code required to pass the test.
4. Run the test again and confirm that it passes.
5. Refactor while keeping the tests green.

The Git history should accurately demonstrate the Red-Green-Refactor process for features developed using TDD.

## Application Screenshots

### Login Page

![AutoHub Login](screenshots/login.png)

### Vehicle Inventory

![Vehicle Inventory](screenshots/inventory.png)

### Search and Filter

![Vehicle Search](screenshots/search.png)

### Admin Dashboard

![Admin Dashboard](screenshots/admin.png)

### Backend Test Results

![Backend Test Results](screenshots/test.png)

## My AI Usage

### AI Tools Used

**ChatGPT** was used as an AI development assistant during the development of AutoHub.


### How I Used AI

**Backend API Development**

* Received guidance on organizing the Express application into routes, services, middleware, and database configuration.
* Used assistance to understand registration, login, password hashing, JWT authentication, and role-based authorization.
* Investigated API errors and vehicle inventory behavior.

**Database Management**

* Received assistance with SQLite database operations and vehicle inventory management.
* Investigated administrator-role issues and database records.

**Frontend Development**

* Received assistance implementing and troubleshooting React components for authentication, vehicle listings, searching, filtering, and inventory management.
* Worked through administrator controls for adding, editing, deleting, and restocking vehicles.

**Testing and Debugging**

* Used AI assistance to develop and troubleshoot automated tests.
* Examined test output and manually checked application behavior.

**Documentation**

* Used AI assistance to organize setup instructions, API documentation, project screenshots, and testing information.

### Reflection on AI Usage

AI assistance helped me investigate errors, understand unfamiliar implementation details, and explore possible solutions more efficiently.

Debugging administrator authentication helped me understand how database roles, JWT claims, backend authorization, and frontend session state interact.

AI-generated suggestions required review and testing rather than blind acceptance. I remain responsible for understanding the code, verifying functionality, and ensuring that the final implementation meets the project requirements.

## AI Conversation Records

The root-level `PROMPTS.md` contains the AI interaction records required for this assessment.



## Future Improvements

* Pagination for large inventories.
* Vehicle image upload.
* Purchase history and transaction records.
* More comprehensive automated testing.
* Improved deployment configuration.
