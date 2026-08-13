const express = require("express");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const {
    getOwnerDashboard
} = require("../controllers/ownerController");

const router = express.Router();

router.get(
    "/dashboard",
    authenticateToken,
    authorizeRoles("STORE_OWNER"),
    getOwnerDashboard
);

module.exports = router;