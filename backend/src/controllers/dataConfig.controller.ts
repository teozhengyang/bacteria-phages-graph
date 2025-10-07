import DataConfigService from "#services/dataconfig.services.js";
import Send from "#utils/response.utils.js";
import dataConfigSchema from "#validations/dataconfig.schema.js";
import { Request, Response } from "express";
import { z } from "zod";

const DataConfigController = {

    createConfig: async (req: Request, res: Response) => {
        try {
            // get name and config (JSON) from body
            const { config, excelDataId, name, userId } = req.body as z.infer<typeof dataConfigSchema.createConfig>;
            
            if (!name || typeof name !== "string" || name.trim() === "") {
                return Send.badRequest(res, null, "Config name is required and must be a non-empty string. Received: " + (name || "undefined"));
            }

            // Validate config is a valid JSON object
            if (typeof config !== "object" || Array.isArray(config)) {
                return Send.badRequest(res, null, "Config must be a valid JSON object. Received: " + (typeof config));
            }

            if (!userId || typeof userId !== "string" || userId.trim() === "") {
                return Send.badRequest(res, null, "User ID is required and must be a non-empty string. Received: " + (userId || "undefined"));
            }

            if (!excelDataId || typeof excelDataId !== "string" || excelDataId.trim() === "") {
                return Send.badRequest(res, null, "Excel Data ID is required and must be a non-empty string. Received: " + (excelDataId || "undefined"));
            }

            // Create config
            await DataConfigService.saveConfig(name.trim(), config, userId.trim(), excelDataId.trim());

            // return success response with config
            return Send.success(res, {
                config: { config: config, excelDataId: excelDataId.trim(), name: name.trim(), userId: userId.trim() }
            }, "Config created successfully.");
        } catch (error) {
            console.error('Error creating config:', error);

            if (error instanceof Error) {
                // check for database connection errors
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return Send.error(res, null, 'Database connection error. Please try again later.');
                }
                if (error.message.includes('foreign key') || error.message.includes('constraint')) {
                    return Send.badRequest(res, null, 'Invalid User ID or Excel Data ID: referenced record does not exist.');
                }
            }

            return Send.error(res, null, 'Failed to create config. Please try again later.');
        }
    },

    deleteConfig:  async (req: Request, res: Response) => {
        try {
            // get id from params
            const id = req.params.id;

            if (!id || typeof id !== "string" || id.trim() === "") {
                return Send.badRequest(res, null, "Config ID is required and must be a non-empty string. Received: " + (id || "undefined"));
            }

            // Check if ID is numeric
            if (!/^\d+$/.test(id.trim())) {
                return Send.badRequest(res, null, `Config ID must be a numeric value. Received: "${id}"`);
            }
                
            // Delete config
            await DataConfigService.deleteConfig(id);

            return Send.success(res, null, "Config deleted successfully.");
        } catch (error) {
            console.error('Error deleting file:', error);
            
            if (error instanceof Error) {
                // Check for common database errors
                if (error.message.includes('not found') || error.message.includes('does not exist')) {
                    return Send.notFound(res, null, `Config with ID "${req.params.id}" was not found.`);
                }
                if (error.message.includes('foreign key') || error.message.includes('constraint')) {
                    return Send.badRequest(res, null, 'Cannot delete config: it may be referenced by other data.');
                }
            }

            return Send.error(res, null, `Failed to delete config with ID "${req.params.id}". Please try again later.`);
        }
    },

    getAllConfigs: async (req: Request, res: Response) => {
        try {
            // get all configs
            const configs = await DataConfigService.getAllConfigs();

            if (configs.length === 0) {
                return Send.success(res, { configs: [] }, "No configs found.");
            }

            return Send.success(res, { configs }, `Successfully retrieved ${String(configs.length)} configuration(s).`);
        } catch (error) {
            console.error('Error retrieving configs:', error);
            if (error instanceof Error) {
                // check for database connection errors
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return Send.error(res, null, 'Database connection error. Please try again later.');
                }
            }
            return Send.error(res, null, 'Failed to retrieve configs. Please try again later.');
        }
    },

    getConfigById:  async (req: Request, res: Response) => {
        try {
            // get id from params
            const id = req.params.id;

            if (!id || typeof id !== "string" || id.trim() === "") {
                return Send.badRequest(res, null, "Config ID is required and must be a non-empty string. Received: " + (id || "undefined"));
            }

            // Check if ID is numeric
            if (!/^\d+$/.test(id.trim())) {
                return Send.badRequest(res, null, `Config ID must be a numeric value. Received: "${id}"`);
            }

            // get config by id
            const config = await DataConfigService.getConfigById(id);

            if (!config) {
                return Send.notFound(res, null, `Config with ID "${id}" was not found.`);
            }

            return Send.success(res, { config }, "Config retrieved successfully.");
        } catch (error) {
            console.error('Error retrieving config:', error);
            if (error instanceof Error) {
                // check for database connection errors
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return Send.error(res, null, 'Database connection error. Please try again later.');
                }
            }

            return Send.error(res, null, 'Failed to retrieve config. Please try again later.');
        }
    },

    updateConfig:  async (req: Request, res: Response) => {
        try {
            // get id from params
            const id = req.params.id;
            const { config, name } = req.body as z.infer<typeof dataConfigSchema.updateConfig>;

            // validate id
            if (!id || typeof id !== "string" || id.trim() === "") {
                return Send.badRequest(res, null, "Config ID is required and must be a non-empty string. Received: " + (id || "undefined"));
            }

            // Check if ID is numeric
            if (!/^\d+$/.test(id.trim())) {
                return Send.badRequest(res, null, `Config ID must be a numeric value. Received: "${id}"`);
            }

            // update config
            const updatedConfig = await DataConfigService.updateConfig(id, name, config);

            return Send.success(res, { config: updatedConfig }, "Config updated successfully.");
        } catch (error) {
            console.error('Error updating config:', error);
            if (error instanceof Error) {
                // check for database connection errors
                if (error.message.includes('connection') || error.message.includes('timeout')) {
                    return Send.error(res, null, 'Database connection error. Please try again later.');
                }
            }

            return Send.error(res, null, 'Failed to update config. Please try again later.');
        }
    },
};

export default DataConfigController;