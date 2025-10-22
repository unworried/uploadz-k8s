import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';

import pool from './db.js';

const MAX_IMAGE_SIZE = 5242880; /* 5MB */

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE }
});

router.post("/upload", upload.single("image"), async (req, res) => {
    try {
        const { title, description } = req.body;
        const imageFile = req.file;

        if (!imageFile) {
            return res.status(400).json({ error: "invalid image file" });
        }

        const thumbnailBuffer = await sharp(imageFile.buffer)
            .resize(200, 200, { fit: "inside" })
            .toBuffer();

        const orgBase64 = imageFile.buffer.toString("base64");
        const thumbBase64 = thumbnailBuffer.toString("base64");

        const result = await pool.query(
            `INSERT INTO images (title, description, image_data, thumbnail_data, mime_type, file_size)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, title, description, mime_type, uploaded_at`,
             [title, description, orgBase64, thumbBase64, imageFile.mimetype, imageFile.size]
        );

        res.status(201).json({
            success: true,
            image: result.rows[0]
        });
    } catch (err) {
        console.error("upload image error:", err);
        res.status(500).json({ error: "failed on upload image"});
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, title, description, image_data, mime_type, views, uploaded_at,
                (SELECT COUNT(*) FROM likes WHERE image_id = $1) as like_count,
                (SELECT COUNT(*) FROM comments WHERE image_id = $1) as comment_count
            FROM images WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "image not found" });
        }

        await pool.query(`UPDATE images SET views = views + 1 WHERE id = $1`, [id])

        res.json({
            success: true,
            image: result.rows[0]
        });
    } catch (err) {
        console.error("get image error:", err);
        res.status(500).json({ error: "failed on get image" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`DELETE FROM images WHERE id = $1 RETURNING id`, [ id ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "image not found" });
        }

        res.json({ success: true, message: "image deleted" });
    } catch (err) {
        console.error("delete image error:", err);
        res.status(500).json({ error: "failed on delete image" })
    }
})

export default router;