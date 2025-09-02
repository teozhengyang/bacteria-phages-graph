import Send from "#utils/response.utils.js";
import { NextFunction, Request, Response } from "express";
import { ZodType} from "zod";

interface ValidationRequest extends Request {
    body: unknown;
}

const ValidationMiddleware = {
    validateBody: (schema: ZodType) => {
        return (req: ValidationRequest, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next(); // safe return
            } catch (err: unknown) {
                console.log("Error: ", err)
                return Send.error(res, "Invalid request data");
            }
        };
    }
};

export default ValidationMiddleware;
