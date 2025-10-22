import { Router } from 'express';
import pool from './db.js';

const router = Router();

router.get("/", async (req, res) => {

    const sortOptions = {
        newest: "uploaded_at DESC",
        oldest: "uploaded_at ASC",
        popular: "views DESC",
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const sortBy = req.query.sort || "popular";
        const orderBy = sortOptions[sortBy] || sortOptions;

        const result = await pool.query(
            `SELECT id, title, description, thumbnail_data, mime_type, views, uploaded_at,
                (SELECT COUNT(*) FROM likes WHERE image_id = images.id) as like_count,
                (SELECT COUNT(*) FROM comments WHERE image_id = images.id) as comment_count
            FROM images
            ORDER BY ${orderBy}
            LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const count = await pool.query(`SELECT COUNT(*) FROM images`);
        const totalImages = parseInt(count.rows[0].count);
        const totalPages = Math.ceil(totalImages / limit);

        res.json({
            success: true,
            images: result.rows,
            pagination: {
                page,
                limit,
                totalImages,
                totalPages
            }
        });
    } catch (err) {
        console.error("get catalogue error:", err);
        res.status(500).json({ error: "failed on get catalogue" })
    }
});

router.get("/search", async (req, res) => {
    try {
        const query = req.query.q || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT id, title, description, thumbnail_data, mime_type, views, uploaded_at,
                (SELECT COUNT(*) FROM likes WHERE image_id = images.id) as like_count,
                (SELECT COUNT(*) FROM comments WHERE image_id = images.id) as comment_count
            FROM images
            WHERE title ILIKE $1 OR description ILIKE $1
            ORDER BY uploaded_at DESC
            LIMIT $2 OFFSET $3`,
            [`%${query}%`, limit, offset]
        );

        res.json({
            success: true,
            images: result.rows,
            query
        });
    } catch (err) {
        console.error("search catalogue error:", err);
        res.status(500).json({ error: "failed on search catalogue" })
    }
})

export default router;