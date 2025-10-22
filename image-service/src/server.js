import express from 'express';
import cors from 'cors';
import routes from './routes.js';

function main() {
    const app = express();
    const PORT = process.env.PORT || 3001;

    app.use(cors());
    app.use(express.json());

    /* Health Check Endpoint */
    app.get("/health", (_req, res) => {
        res.json({ status: "OK", service: "image" });
    });

    app.use("/api/images", routes);

    app.listen(PORT, () => {
        console.log(`image-service: port ${PORT}`);
    });
}

main();