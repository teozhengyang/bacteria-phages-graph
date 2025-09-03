import { Response } from "express";

const Send = {
    badRequest(res: Response, data: unknown, message = "bad request") {
        // 400 for general bad request errors
        return res.status(400).json({ data, message, ok: false });
    },

    error(res: Response, data: unknown, message = "error") {
        // A generic 500 Internal Server Error is returned for unforeseen issues
        return res.status(500).json({ data, message, ok: false });
    },

    forbidden(res: Response, data: unknown, message = "forbidden") {
        // 403 for forbidden access (when the user does not have the rights to access)
        return res.status(403).json({ data, message, ok: false });
    },

    notFound(res: Response, data: unknown, message = "not found") {
        // 404 is for resources that don't exist
        return res.status(404).json({ data, message, ok: false });
    },

    success(res: Response, data: unknown, message = "success") {
        return res.status(200).json({ data, message, ok: true });
    },

    unauthorized(res: Response, data: unknown, message = "unauthorized") {
        // 401 for unauthorized access (e.g., invalid token)
        return res.status(401).json({ data, message, ok: false });
    },

    validationErrors(res: Response, errors: Record<string, string[]>) {
        // 422 for unprocessable entity (validation issues)
        return res.status(422).json({ errors, message: "Validation error", ok: false });
    }
};

export default Send;
