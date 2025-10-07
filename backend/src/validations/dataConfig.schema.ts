import { z } from "zod";

const createConfig = z.object({
    config: z.record(z.string(), z.any()).refine((val) => typeof val === "object" && !Array.isArray(val), {
        message: "Config must be a valid JSON object"
    }),
    excelDataId: z.string().min(1, "Excel Data ID is required"),
    name: z.string().min(1, "Config name is required"),
    userId: z.string().min(1, "User ID is required")
});

const updateConfig = z.object({
    config: z.record(z.string(), z.any()).refine((val) => typeof val === "object" && !Array.isArray(val), {
        message: "Config must be a valid JSON object"
    }),
    name: z.string().min(1, "Config name is required"),
});

const DataConfigSchema = {
    createConfig,
    updateConfig
};

export default DataConfigSchema;
