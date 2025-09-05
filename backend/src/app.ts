import appConfig from "#configs/app.config.js";
import authRoutes from "#routes/auth.routes.js";
import excelDataRoutes from "#routes/excel.routes.js";
import userRoutes from "#routes/user.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";

class App {
    private app: Express;

    constructor() {
        this.app = express()

        this.initMiddlewares();
        this.initRoutes();
    }

    public start() {
        const { host, port } = appConfig;

        this.app.listen(port, host, () => {
            console.log(`server is running on http://${host}:${port.toString()}`);

        })
    }

    private initMiddlewares() {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(cors({
            credentials: true,
            methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
            origin: [
                'http://localhost:3000',
            ]
        }))
    }

    private initRoutes() {
        // /api/auth/*
        this.app.use("/api/auth", authRoutes);
        // /api/user/*
        this.app.use("/api/user", userRoutes);
        // /api/excel/*
        this.app.use("/api/excel", excelDataRoutes);
    }
}

export default App;