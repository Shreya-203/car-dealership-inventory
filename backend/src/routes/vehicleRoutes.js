const express = require("express");

const {
  authenticateToken,
  requireAdmin
} = require("../middleware/auth");

const {
  getAllVehicles,
  searchVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle
} = require("../services/vehicleService");

const router = express.Router();

// All vehicle routes require authentication.
router.use(authenticateToken);

// GET /api/vehicles
router.get("/", (req, res, next) => {
  try {
    res.json(getAllVehicles());
  } catch (error) {
    next(error);
  }
});

// GET /api/vehicles/search
router.get("/search", (req, res, next) => {
  try {
    const vehicles = searchVehicles(req.query);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

// POST /api/vehicles
router.post("/", requireAdmin, (req, res, next) => {
  try {
    const vehicle = addVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

// PUT /api/vehicles/:id
router.put("/:id", requireAdmin, (req, res, next) => {
  try {
    const vehicle = updateVehicle(Number(req.params.id), req.body);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vehicles/:id
router.delete("/:id", requireAdmin, (req, res, next) => {
  try {
    const deleted = deleteVehicle(Number(req.params.id));

    if (!deleted) {
      return res.status(404).json({
        message: "Vehicle not found"
      });
    }

    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// POST /api/vehicles/:id/purchase
router.post("/:id/purchase", (req, res, next) => {
  try {
    const vehicle = purchaseVehicle(Number(req.params.id));
    res.json({
      message: "Purchase successful",
      vehicle
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/vehicles/:id/restock
router.post("/:id/restock", requireAdmin, (req, res, next) => {
  try {
    const vehicle = restockVehicle(
      Number(req.params.id),
      Number(req.body.amount)
    );

    res.json({
      message: "Vehicle restocked successfully",
      vehicle
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;