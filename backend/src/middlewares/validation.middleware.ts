import Send from "#utils/response.utils.js";
import { NextFunction, Request, Response } from "express";
import { ZodType} from "zod";

interface ValidationRequest extends Request {
    body: unknown;
    file?: Express.Multer.File;
}

const ValidationMiddleware = {
    validateBody: (schema: ZodType) => {
        return (req: ValidationRequest, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next(); // safe return
            } catch (err: unknown) {
                console.log("Error: ", err)
                return Send.validationErrors(res, { body: ["Invalid request data"] });
            }
        };
    },

    validateFile: (schema: ZodType) => {
        return (req: ValidationRequest, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.file);
                next(); // safe return
            } catch (err: unknown) {
                console.log("Error: ", err);
                return Send.validationErrors(res, { file: ["Invalid file upload"] });
            }
        };
    }
};

export default ValidationMiddleware;
