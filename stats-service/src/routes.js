import { Router } from 'express';
import { createHash } from 'crypto';

import pool from './db.js';

const router = Router();

const hashIp = (ip) => {
    return createHash("sha256").update(ip).digest("hex");
}

router.get("/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, commenter_name, content, created_at
             FROM comments
             WHERE image_id = $1
             ORDER BY created_at DESC`,
             [id]
        );

        res.json({
            success: true,
            comments: result.rows
        });
    } catch (err) {
        console.error("get comments error:", err);
        res.status(500).json({ error: "failed on get comments" })
    }
});

router.post("/:id/comments", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: "empty comment content" })
        }

        const result = await pool.query(
            `INSERT INTO comments (image_id, commenter_name, content)
            VALUES ($1, $2, $3)
            RETURNING id, commenter_name, content, created_at`,
            [id, name || "Anonymous", content.trim()]
        );

        res.status(201).json({
            success: true,
            comment: result.rows[0]
        });
    } catch (err) {
        console.error("add comment error:", err);
        res.status(500).json({ error: "failed on add comment" })
    }
});

router.get("/:id/likes", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT COUNT(*) as like_count FROM likes WHERE image_id = $1`,
            [id]
        );

        res.json({
            success: true,
            likeCount: parseInt(result.rows[0].likeCount)
        });
    } catch (err) {
        console.error("get likes error:", err);
        res.status(500).json({ error: "failed on get likes" })
    }
});

router.post("/:id/like", async (req, res) => {
    try {
        const { id } = req.params;

        const ip = req.ip;
        if (!ip) throw Error("invalid ip @ add like");
        const ipHash = hashIp(ip);

        const result = await pool.query(
            `INSERT INTO likes (image_id, ip_hash)
            VALUES ($1, $2)
            ON CONFLICT (image_id, ip_hash) DO NOTHING
            RETURNING id`,
            [id, ipHash]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "already liked"});
        }

        const countResult = await pool.query(
            `SELECT COUNT(*) as like_count FROM likes WHERE image_id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: "Image Liked",
            likeCount: parseInt(countResult.rows[0].like_count)
        });
    } catch (err) {
        console.error("add like error:", err);
        res.status(500).json({ error: "failed on add like" })
    }
});

router.delete("/:id/like", async (req, res) => {
    try {
        const { id } = req.params;

        const ip = req.ip;
        if (!ip) throw Error("invalid ip @ add like");
        const ipHash = hashIp(ip);

        const result = await pool.query(
            `DELETE FROM likes WHERE image_id = $1 AND ip_hash = $2
            RETURNING id`,
            [id, ipHash]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "not liked" });
        }

        const countResult = await pool.query(
            `SELECT COUNT(*) as like_count FROM likes WHERE image_id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: "Like Removed",
            likeCount: parseInt(countResult.rows[0].like_count)
        });
    } catch (err) {
        console.log("delete like error:", err);
        res.status(500).json({ error: "failed on delete like" })
    }
});


export default router;