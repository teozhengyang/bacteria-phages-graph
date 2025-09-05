import { prisma } from "#db.js";
import { ParsedExcelData } from "#types/excel.types.js";

const ExcelService = {
    
    deleteFile: async (id: string) => {
        return prisma.excelData.delete({
            where: { id: Number(id) }
        });
    },

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

    updateFileName: async (id: string, newFileName: string) => {
        return prisma.excelData.update({
            data: { fileName: newFileName },
            where: { id: Number(id) }
        });
    }
};

export default ExcelService;
