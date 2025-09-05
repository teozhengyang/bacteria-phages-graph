import { prisma } from "#db.js";
import { ParsedExcelData } from "#types/excel.types.js";

const ExcelService = {
    getAllExcelFiles: async () => {
        return prisma.excelData.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },

    saveExcelData: async (parsedData: ParsedExcelData, fileName: string) => {
        return prisma.excelData.create({
            data: {
                bacteria: parsedData.bacteriaNames,
                fileName: fileName,
                interactions: parsedData.interactions,
                phages: parsedData.phageNames,
            }
        });
    },

    updateFileName: async (oldFileName: string, newFileName: string) => {
        return prisma.excelData.update({
            data: { fileName: newFileName },
            where: { fileName: oldFileName }
        });
    }
};

export default {
    ExcelService
};
