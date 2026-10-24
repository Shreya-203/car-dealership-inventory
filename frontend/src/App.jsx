import { useEffect, useState } from "react";
import { apiRequest } from "./services/api";

const emptyForm = {
make: "",
model: "",
category: "SUV",
price: "",
quantity: "",
image_url: "",
};

const categories = ["SUV", "Sedan", "Hatchback", "Luxury", "Electric"];

export default function App() {
const [user, setUser] = useState(() => {
try {
return JSON.parse(localStorage.getItem("user"));
} catch {
return null;
}
});

const [token, setToken] = useState(() => localStorage.getItem("token"));
const [page, setPage] = useState(
() => (localStorage.getItem("token") ? "dashboard" : "login")
);

const [authForm, setAuthForm] = useState({
name: "",
email: "",
password: "",
});

// Vehicle inventory and editing state.
const [vehicles, setVehicles] = useState([]);
const [vehicleForm, setVehicleForm] = useState({ ...emptyForm });
const [editingId, setEditingId] = useState(null);

const [search, setSearch] = useState({
make: "",
model: "",
category: "",
maxPrice: "",
});

const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const isAdmin = user?.role === "admin";

useEffect(() => {
if (token && user) {
loadVehicles({});
}
}, []);

async function loadVehicles(filters = {}) {
try {
setLoading(true);


  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  const query = params.toString();
  const endpoint = query
    ? `/vehicles/search?${query}`
    : "/vehicles";

  const data = await apiRequest(endpoint);

  setVehicles(Array.isArray(data) ? data : data.vehicles || []);
  setError("");
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}


}

function updateAuthForm(event) {
setAuthForm((previous) => ({
...previous,
[event.target.name]: event.target.value,
}));
}

async function submitAuth(event) {
event.preventDefault();
setError("");
setMessage("");


try {
  const registering = page === "register";
  const endpoint = registering ? "/auth/register" : "/auth/login";

  const payload = registering
    ? authForm
    : {
        email: authForm.email,
        password: authForm.password,
      };

  const data = await apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (registering) {
    setMessage("Registration successful. Please log in.");
    setPage("login");
    setAuthForm({
      name: "",
      email: authForm.email,
      password: "",
    });
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  setToken(data.token);
  setUser(data.user);
  setPage("dashboard");
  setSearch({
    make: "",
    model: "",
    category: "",
    maxPrice: "",
  });
  setMessage(`Welcome, ${data.user.name}!`);

  await loadVehicles({});
} catch (err) {
  setError(err.message);
}


}

function logout() {
localStorage.removeItem("token");
localStorage.removeItem("user");


setToken(null);
setUser(null);
setVehicles([]);
setVehicleForm({ ...emptyForm });
setEditingId(null);
setPage("login");
setMessage("");
setError("");


}

async function purchaseVehicle(id) {
if (!window.confirm("Do you want to purchase this vehicle?")) {
return;
}


setError("");
setMessage("");

try {
  const data = await apiRequest(`/vehicles/${id}/purchase`, {
    method: "POST",
  });

  setMessage(data.message || "Purchase successful!");
  await loadVehicles(search);
} catch (err) {
  setError(err.message);
}


}

function startEditing(vehicle) {
setEditingId(vehicle.id);


setVehicleForm({
  make: vehicle.make,
  model: vehicle.model,
  category: vehicle.category,
  price: String(vehicle.price),
  quantity: String(vehicle.quantity),
  image_url: vehicle.image_url || "",
});

setError("");
setMessage(`Editing ${vehicle.make} ${vehicle.model}`);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});


}

function cancelEditing() {
setEditingId(null);
setVehicleForm({ ...emptyForm });
setError("");
setMessage("");
}

async function saveVehicle(event) {
event.preventDefault();
setError("");
setMessage("");


const price = Number(vehicleForm.price);
const quantity = Number(vehicleForm.quantity);

if (!Number.isFinite(price) || price < 0) {
  setError("Price must be a valid non-negative number.");
  return;
}

if (!Number.isInteger(quantity) || quantity < 0) {
  setError("Stock quantity must be a non-negative whole number.");
  return;
}

const payload = {
  ...vehicleForm,
  make: vehicleForm.make.trim(),
  model: vehicleForm.model.trim(),
  category: vehicleForm.category.trim(),
  price,
  quantity,
  image_url: vehicleForm.image_url.trim(),
};

if (!payload.make || !payload.model || !payload.category) {
  setError("Make, model and category are required.");
  return;
}

try {
  if (editingId !== null) {
    await apiRequest(`/vehicles/${editingId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    setMessage("Vehicle updated successfully.");
  } else {
    await apiRequest("/vehicles", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    setMessage("Vehicle added successfully.");
  }

  setEditingId(null);
  setVehicleForm({ ...emptyForm });

  await loadVehicles(search);
} catch (err) {
  setError(err.message);
}


}

async function restockVehicle(id) {
const amount = window.prompt(
"Enter the number of vehicles to add to stock:"
);


if (amount === null) {
  return;
}

if (!/^[1-9]\d*$/.test(amount.trim())) {
  setError("Enter a positive whole number for the restock quantity.");
  return;
}

setError("");
setMessage("");

try {
  await apiRequest(`/vehicles/${id}/restock`, {
    method: "POST",
    body: JSON.stringify({
      amount: Number(amount),
    }),
  });

  setMessage("Vehicle stock updated successfully.");
  await loadVehicles(search);
} catch (err) {
  setError(err.message);
}


}

async function deleteVehicle(id) {
if (!window.confirm("Are you sure you want to delete this vehicle?")) {
return;
}


setError("");
setMessage("");

try {
  await apiRequest(`/vehicles/${id}`, {
    method: "DELETE",
  });

  if (editingId === id) {
    cancelEditing();
  }

  setMessage("Vehicle deleted successfully.");
  await loadVehicles(search);
} catch (err) {
  setError(err.message);
}


}

async function searchVehicles(event) {
event.preventDefault();
await loadVehicles(search);
}

function clearSearch() {
const emptySearch = {
make: "",
model: "",
category: "",
maxPrice: "",
};


setSearch(emptySearch);
loadVehicles({});


}

function updateVehicleForm(event) {
const { name, value } = event.target;

setVehicleForm((previous) => ({
  ...previous,
  [name]: value,
}));


}

// Login and registration page.
if (!token || !user || page !== "dashboard") {
const registering = page === "register";


return (
  <main className="flex min-h-screen items-center justify-center bg-slate-100 p-5">
    <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
      <div className="mb-7 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl text-white">
          🚘
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">
          AutoHub
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Car Dealership Inventory System
        </p>
      </div>

      <h2 className="mb-5 text-xl font-bold text-slate-800">
        {registering ? "Create your account" : "Welcome back"}
      </h2>

      {message && (
        <p
          role="status"
          className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <form onSubmit={submitAuth} className="space-y-4">
        {registering && (
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              required
              name="name"
              value={authForm.name}
              onChange={updateAuthForm}
              className="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
              placeholder="Enter your name"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          Email address
          <input
            required
            type="email"
            name="email"
            value={authForm.email}
            onChange={updateAuthForm}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            placeholder="you@example.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            required
            type="password"
            name="password"
            value={authForm.password}
            onChange={updateAuthForm}
            className="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            placeholder="Enter your password"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700"
        >
          {registering ? "Register" : "Log in"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        {registering
          ? "Already have an account?"
          : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setPage(registering ? "login" : "register");
            setError("");
            setMessage("");
          }}
          className="font-semibold text-blue-600 hover:underline"
        >
          {registering ? "Log in" : "Register"}
        </button>
      </p>
    </section>
  </main>
);


}

// Authenticated inventory dashboard.
return ( <div className="min-h-screen bg-slate-50"> <header className="bg-slate-950 text-white"> <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5"> <div> <h1 className="text-2xl font-extrabold">🚘 AutoHub</h1> <p className="text-sm text-slate-300">
Car Dealership Inventory System </p> </div>


      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs uppercase tracking-wider text-blue-300">
            {user.role}
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Logout
        </button>
      </div>
    </div>
  </header>

  <main className="mx-auto max-w-7xl space-y-7 px-5 py-8">
    {message && (
      <div
        role="status"
        className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
      >
        {message}
      </div>
    )}

    {error && (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
      >
        {error}
      </div>
    )}

    {/* Search and filter */}
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold">Find your next car</h2>
        <p className="mt-1 text-sm text-slate-500">
          Search vehicles by make, model, category, or budget.
        </p>
      </div>

      <form
        onSubmit={searchVehicles}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          value={search.make}
          onChange={(event) =>
            setSearch({ ...search, make: event.target.value })
          }
          placeholder="Make (e.g. Toyota)"
          aria-label="Search by make"
          className="rounded-xl border border-slate-300 p-3"
        />

        <input
          value={search.model}
          onChange={(event) =>
            setSearch({ ...search, model: event.target.value })
          }
          placeholder="Model (e.g. Corolla)"
          aria-label="Search by model"
          className="rounded-xl border border-slate-300 p-3"
        />

        <select
          value={search.category}
          onChange={(event) =>
            setSearch({ ...search, category: event.target.value })
          }
          aria-label="Filter by category"
          className="rounded-xl border border-slate-300 p-3"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          value={search.maxPrice}
          onChange={(event) =>
            setSearch({ ...search, maxPrice: event.target.value })
          }
          placeholder="Maximum price"
          aria-label="Maximum price"
          className="rounded-xl border border-slate-300 p-3"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Search
          </button>

          <button
            type="button"
            onClick={clearSearch}
            className="rounded-xl border border-slate-300 px-3 py-3"
          >
            Clear
          </button>
        </div>
      </form>
    </section>

    {/* Admin add/edit form */}
    {isAdmin && (
      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
        <h2 className="mb-1 text-xl font-bold text-slate-900">
          {editingId !== null ? "Edit Vehicle" : "Admin Dashboard"}
        </h2>

        <p className="mb-5 text-sm text-slate-600">
          {editingId !== null
            ? "Update the vehicle details and save your changes."
            : "Add vehicles and manage the dealership inventory."}
        </p>

        <form
          onSubmit={saveVehicle}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <input
            required
            name="make"
            value={vehicleForm.make}
            onChange={updateVehicleForm}
            placeholder="Vehicle make"
            aria-label="Vehicle make"
            className="rounded-xl border border-slate-300 bg-white p-3"
          />

          <input
            required
            name="model"
            value={vehicleForm.model}
            onChange={updateVehicleForm}
            placeholder="Vehicle model"
            aria-label="Vehicle model"
            className="rounded-xl border border-slate-300 bg-white p-3"
          />

          <select
            required
            name="category"
            value={vehicleForm.category}
            onChange={updateVehicleForm}
            aria-label="Vehicle category"
            className="rounded-xl border border-slate-300 bg-white p-3"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            required
            type="number"
            min="0"
            step="0.01"
            name="price"
            value={vehicleForm.price}
            onChange={updateVehicleForm}
            placeholder="Price"
            aria-label="Vehicle price"
            className="rounded-xl border border-slate-300 bg-white p-3"
          />

          <input
            required
            type="number"
            min="0"
            step="1"
            name="quantity"
            value={vehicleForm.quantity}
            onChange={updateVehicleForm}
            placeholder="Stock quantity"
            aria-label="Stock quantity"
            className="rounded-xl border border-slate-300 bg-white p-3"
          />

          <input
            type="url"
            name="image_url"
            value={vehicleForm.image_url}
            onChange={updateVehicleForm}
            placeholder="Image URL (optional)"
            aria-label="Vehicle image URL"
            className="rounded-xl border border-slate-300 bg-white p-3"
          />

          <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
            >
              {editingId !== null ? "Save Changes" : "+ Add Vehicle"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEditing}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    )}

    {/* Inventory list */}
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Available Vehicles
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {vehicles.length} vehicle
            {vehicles.length === 1 ? "" : "s"} found
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadVehicles(search)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-100"
        >
          Refresh Inventory
        </button>
      </div>

      {loading ? (
        <p className="rounded-xl bg-white p-8 text-center text-slate-500">
          Loading vehicles...
        </p>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mb-3 text-5xl">🚗</div>
          <h3 className="text-lg font-bold">No vehicles found</h3>
          <p className="mt-2 text-sm text-slate-500">
            {isAdmin
              ? "Use the admin form above to add your first vehicle."
              : "Try changing your search filters or check back later."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <article
              key={vehicle.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {vehicle.image_url ? (
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="h-48 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-7xl">
                  🚘
                </div>
              )}

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {vehicle.category}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      vehicle.quantity > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {vehicle.quantity > 0 ? "In Stock" : "Sold Out"}
                  </span>
                </div>

                <p className="text-2xl font-extrabold text-blue-700">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(vehicle.price)}
                </p>

                <p className="text-sm text-slate-500">
                  Available quantity: {vehicle.quantity}
                </p>

                <button
                  type="button"
                  disabled={vehicle.quantity <= 0}
                  onClick={() => purchaseVehicle(vehicle.id)}
                  className="w-full rounded-xl bg-slate-900 p-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
                >
                  Purchase Vehicle
                </button>

                {isAdmin && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(vehicle)}
                      className="rounded-xl border border-slate-300 p-2 text-sm font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => restockVehicle(vehicle.id)}
                      className="rounded-xl border border-blue-200 p-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Restock
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteVehicle(vehicle.id)}
                      className="rounded-xl border border-red-200 p-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>

    <footer className="border-t border-slate-200 py-5 text-center text-sm text-slate-500">
      AutoHub · Car Dealership Inventory System
    </footer>
  </main>
</div>


);
}
