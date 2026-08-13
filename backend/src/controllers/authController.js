const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { validateRegistration } = require("../validators/authValidator");

// REGISTER USER
const registerUser = async (req, res) => {
    try {
        const { name, email, address, password } = req.body;

        // Validate input
        const validation = validateRegistration({
            name,
            email,
            address,
            password
        });

        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                errors: validation.errors
            });
        }

        // Check existing email
        const [existingUser] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email.trim()]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await pool.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, 'USER')`,
            [
                name.trim(),
                email.trim(),
                hashedPassword,
                address.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            userId: result.insertId
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
};


// LOGIN USER
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user
        const [users] = await pool.query(
            `SELECT id, name, email, password, address, role
             FROM users
             WHERE email = ?`,
            [email.trim()]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = users[0];

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Create JWT
        const token = jwt.sign(
    {
        id: user.id,
        role: user.role
    },
    process.env.JWT_SECRET || "store_rating_secret_2026",
    {
        expiresIn: "1d"
    }
);

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
    console.error("========== LOGIN ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL Message:", error.sqlMessage);
    console.error("=================================");

    res.status(500).json({
        success: false,
        message: "Internal server error."
    });
}
};


// EXPORT FUNCTIONS
module.exports = {
    registerUser,
    loginUser
};