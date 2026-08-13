const express = require("express");

const {
    getDashboard,
    getUsers,
    getUserDetails,
    createUser,
    getStores,
    createStore
} = require("../controllers/adminController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("ADMIN"));

router.get("/dashboard", getDashboard);

router.get("/users", getUsers);

router.get("/users/:id", getUserDetails);

router.post("/users", createUser);

router.get("/stores", getStores);

router.post("/stores", createStore);

module.exports = router;