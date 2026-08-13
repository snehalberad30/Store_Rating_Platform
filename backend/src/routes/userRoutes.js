const express = require("express");

const router = express.Router();

const {
    getUserProfile,
    getStores,
    submitRating,
    updatePassword
} = require("../controllers/userController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");


// USER PROFILE

router.get(
    "/profile",
    authenticateToken,
    authorizeRoles("USER"),
    getUserProfile
);


// GET STORES

router.get(
    "/stores",
    authenticateToken,
    authorizeRoles("USER"),
    getStores
);


// SUBMIT / MODIFY RATING

router.post(
    "/ratings",
    authenticateToken,
    authorizeRoles("USER"),
    submitRating
);


// CHANGE PASSWORD

router.put(
    "/password",
    authenticateToken,
    authorizeRoles("USER", "STORE_OWNER"),
    updatePassword
);


module.exports = router;