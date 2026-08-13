const bcrypt = require("bcryptjs");
const pool = require("../db");

// =====================================================
// GET LOGGED-IN USER PROFILE
// =====================================================

const getUserProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id, name, email, address, role, created_at
             FROM users
             WHERE id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Profile error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch profile."
        });
    }
};


// =====================================================
// GET ALL STORES FOR NORMAL USER
// =====================================================

const getStores = async (req, res) => {
    try {
        const {
            name = "",
            address = "",
            sortBy = "name",
            order = "ASC"
        } = req.query;

        const allowedColumns = {
            name: "s.name",
            address: "s.address",
            rating: "average_rating"
        };

        const sortColumn =
            allowedColumns[sortBy] ||
            allowedColumns.name;

        const sortOrder =
            order.toUpperCase() === "DESC"
                ? "DESC"
                : "ASC";

        const [stores] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,

                ROUND(
                    COALESCE(AVG(r.rating), 0),
                    2
                ) AS average_rating,

                (
                    SELECT r2.rating
                    FROM ratings r2
                    WHERE r2.store_id = s.id
                    AND r2.user_id = ?
                    LIMIT 1
                ) AS user_rating

             FROM stores s

             LEFT JOIN ratings r
                ON r.store_id = s.id

             WHERE s.name LIKE ?
             AND s.address LIKE ?

             GROUP BY s.id

             ORDER BY ${sortColumn} ${sortOrder}`,
            [
                req.user.id,
                `%${name}%`,
                `%${address}%`
            ]
        );

        res.json({
            success: true,
            stores
        });

    } catch (error) {
        console.error(
            "Get stores error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores."
        });
    }
};


// =====================================================
// SUBMIT OR MODIFY RATING
// =====================================================

const submitRating = async (req, res) => {
    try {
        const {
            storeId,
            rating
        } = req.body;

        const numericRating =
            Number(rating);

        if (
            !storeId ||
            !Number.isInteger(numericRating)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Store ID and rating are required."
            });
        }

        if (
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Rating must be between 1 and 5."
            });
        }

        // Check whether store exists
        const [stores] = await pool.query(
            "SELECT id FROM stores WHERE id = ?",
            [storeId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store not found."
            });
        }

        // Check existing rating
        const [existingRating] =
            await pool.query(
                `SELECT id
                 FROM ratings
                 WHERE user_id = ?
                 AND store_id = ?`,
                [
                    req.user.id,
                    storeId
                ]
            );

        // MODIFY EXISTING RATING
        if (existingRating.length > 0) {

            await pool.query(
                `UPDATE ratings
                 SET rating = ?,
                     updated_at =
                         CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [
                    numericRating,
                    existingRating[0].id
                ]
            );

            return res.json({
                success: true,
                message:
                    "Rating updated successfully."
            });
        }

        // SUBMIT NEW RATING
        await pool.query(
            `INSERT INTO ratings
            (user_id, store_id, rating)
            VALUES (?, ?, ?)`,
            [
                req.user.id,
                storeId,
                numericRating
            ]
        );

        res.status(201).json({
            success: true,
            message:
                "Rating submitted successfully."
        });

    } catch (error) {
        console.error(
            "Rating error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to submit rating."
        });
    }
};


// =====================================================
// UPDATE PASSWORD
// =====================================================

const updatePassword = async (req, res) => {
    try {

        const {
            currentPassword,
            newPassword
        } = req.body;

        // Check required fields
        if (
            !currentPassword ||
            !newPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required."
            });
        }

        // Password validation
        if (
            newPassword.length < 8 ||
            newPassword.length > 16 ||
            !/[A-Z]/.test(newPassword) ||
            !/[^A-Za-z0-9]/.test(newPassword)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character."
            });
        }

        // Get current user
        const [users] =
            await pool.query(
                `SELECT id, password
                 FROM users
                 WHERE id = ?`,
                [req.user.id]
            );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        const user = users[0];

        // Verify old password
        const validPassword =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message:
                    "Current password is incorrect."
            });
        }

        // Hash new password
        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        // Update password
        await pool.query(
            `UPDATE users
             SET password = ?
             WHERE id = ?`,
            [
                hashedPassword,
                req.user.id
            ]
        );

        res.json({
            success: true,
            message:
                "Password updated successfully."
        });

    } catch (error) {

        console.error(
            "Password update error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to update password."
        });
    }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    getUserProfile,
    getStores,
    submitRating,
    updatePassword
};