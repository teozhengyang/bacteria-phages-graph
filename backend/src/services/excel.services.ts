import { prisma } from "#db.js";
import { ParsedExcelData } from "#types/excel.types.js";

const ExcelService = {
    saveExcelData: async (parsedData: ParsedExcelData, fileName: string) => {
        return prisma.excelData.create({
            data: {
                bacteria: parsedData.bacteriaNames,
                fileName: fileName,
                interactions: parsedData.interactions,
                phages: parsedData.phageNames,
            }
        });
    }
};

export default {
    ExcelService
};
