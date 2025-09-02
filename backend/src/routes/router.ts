import { RequestHandler, Router } from "express";

export interface RouteConfig {
    handler: RequestHandler;
    method: RouteMethod;
    middlewares?: RequestHandler[];
    path: string;
}

type RouteMethod = "delete" | "get" | "patch" | "post" | "put";

export default abstract class BaseRouter {
    public router: Router;

    constructor() {
        this.router = Router()
        this.registerRoutes();
    }

    protected abstract routes(): RouteConfig[];

    // register all routes
    private registerRoutes(): void {
        this.routes().forEach(({ handler, method, middlewares = [], path }) => {
            this.router[method](path, ...middlewares, handler);
        });
    }
}