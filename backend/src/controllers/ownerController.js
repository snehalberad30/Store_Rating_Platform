const pool = require("../db");

const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        // Stores owned by this store owner
        const [stores] = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(AVG(r.rating), 0) AS averageRating,
                COUNT(r.id) AS totalRatings
             FROM stores s
             LEFT JOIN ratings r
                ON r.store_id = s.id
             WHERE s.owner_id = ?
             GROUP BY s.id, s.name, s.email, s.address`,
            [ownerId]
        );

        // Users who submitted ratings
        const [ratingUsers] = await pool.query(
            `SELECT
                s.id AS store_id,
                s.name AS store_name,
                u.id AS user_id,
                u.name,
                u.email,
                r.rating,
                r.created_at
             FROM ratings r
             INNER JOIN stores s
                ON s.id = r.store_id
             INNER JOIN users u
                ON u.id = r.user_id
             WHERE s.owner_id = ?
             ORDER BY r.created_at DESC`,
            [ownerId]
        );

        res.json({
            success: true,
            stores,
            ratingUsers
        });

    } catch (error) {
        console.error("Owner dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load owner dashboard."
        });
    }
};

module.exports = {
    getOwnerDashboard
};