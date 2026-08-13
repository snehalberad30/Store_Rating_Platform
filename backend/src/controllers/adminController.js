const bcrypt = require("bcryptjs");
const pool = require("../db");

// ADMIN DASHBOARD
const getDashboard = async (req, res) => {
    try {
        const [[users]] = await pool.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [[stores]] = await pool.query(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );

        const [[ratings]] = await pool.query(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        res.json({
            success: true,
            data: {
                totalUsers: users.totalUsers,
                totalStores: stores.totalStores,
                totalRatings: ratings.totalRatings
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load dashboard."
        });
    }
};


// GET USERS
const getUsers = async (req, res) => {
    try {
        const {
            name = "",
            email = "",
            address = "",
            role = "",
            sortBy = "name",
            order = "ASC"
        } = req.query;

        const allowedSortColumns = {
            name: "u.name",
            email: "u.email",
            address: "u.address",
            role: "u.role"
        };

        const sortColumn =
            allowedSortColumns[sortBy] || allowedSortColumns.name;

        const sortOrder =
            order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        let sql = `
            SELECT id, name, email, address, role, created_at
            FROM users u
            WHERE name LIKE ?
            AND email LIKE ?
            AND address LIKE ?
        `;

        const params = [
            `%${name}%`,
            `%${email}%`,
            `%${address}%`
        ];

        if (role) {
            sql += " AND role = ?";
            params.push(role);
        }

        sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

        const [users] = await pool.query(sql, params);

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users."
        });
    }
};


// GET USER DETAILS
const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await pool.query(
            `SELECT id, name, email, address, role, created_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const user = users[0];

        if (user.role === "STORE_OWNER") {
            const [stores] = await pool.query(
                `SELECT
                    s.id,
                    s.name,
                    s.email,
                    s.address,
                    COALESCE(AVG(r.rating), 0) AS averageRating
                 FROM stores s
                 LEFT JOIN ratings r ON r.store_id = s.id
                 WHERE s.owner_id = ?
                 GROUP BY s.id`,
                [id]
            );

            user.stores = stores;
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error("User details error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user details."
        });
    }
};


// ADD USER / ADMIN / STORE OWNER
const createUser = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            password,
            role = "USER"
        } = req.body;

        if (!name || name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters."
            });
        }

        if (!address || address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters."
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });
        }

        if (
            !password ||
            password.length < 8 ||
            password.length > 16 ||
            !/[A-Z]/.test(password) ||
            !/[^A-Za-z0-9]/.test(password)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character."
            });
        }

        if (!["ADMIN", "USER", "STORE_OWNER"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role."
            });
        }

        const [existing] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name.trim(),
                email.trim(),
                hashedPassword,
                address.trim(),
                role
            ]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully.",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user."
        });
    }
};


// GET STORES
const getStores = async (req, res) => {
    try {
        const {
            name = "",
            email = "",
            address = "",
            sortBy = "name",
            order = "ASC"
        } = req.query;

        const allowedSortColumns = {
            name: "s.name",
            email: "s.email",
            address: "s.address"
        };

        const sortColumn =
            allowedSortColumns[sortBy] || allowedSortColumns.name;

        const sortOrder =
            order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        const [stores] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                COALESCE(AVG(r.rating), 0) AS rating
             FROM stores s
             LEFT JOIN ratings r ON r.store_id = s.id
             WHERE s.name LIKE ?
             AND s.email LIKE ?
             AND s.address LIKE ?
             GROUP BY s.id
             ORDER BY ${sortColumn} ${sortOrder}`,
            [
                `%${name}%`,
                `%${email}%`,
                `%${address}%`
            ]
        );

        res.json({
            success: true,
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores."
        });
    }
};


// ADD STORE
const createStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            ownerId
        } = req.body;

        if (!name || name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Store name must be between 20 and 60 characters."
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address."
            });
        }

        if (!address || address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address must not exceed 400 characters."
            });
        }

        if (ownerId) {
            const [owners] = await pool.query(
                `SELECT id FROM users
                 WHERE id = ?
                 AND role = 'STORE_OWNER'`,
                [ownerId]
            );

            if (owners.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid store owner."
                });
            }
        }

        const [result] = await pool.query(
            `INSERT INTO stores
            (name, email, address, owner_id)
            VALUES (?, ?, ?, ?)`,
            [
                name.trim(),
                email.trim(),
                address.trim(),
                ownerId || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Store created successfully.",
            storeId: result.insertId
        });

    } catch (error) {
        console.error("Create store error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create store."
        });
    }
};

module.exports = {
    getDashboard,
    getUsers,
    getUserDetails,
    createUser,
    getStores,
    createStore
};