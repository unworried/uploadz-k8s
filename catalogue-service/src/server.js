import express from 'express';
import cors from 'cors';
import routes from './routes.js';

function main() {
    const app = express();
    const PORT = process.env.PORT || 3002;

    app.use(cors());
    app.use(express.json());

    /* Health Check Endpoint */
    app.get("/health", (_req, res) => {
        res.json({ status: "OK", service: "image-service" });
    });

    app.use("/api/catalogue", routes);

    app.listen(PORT, () => {
        console.log(`catalogue-service: port ${PORT}`);
    });
}

main();