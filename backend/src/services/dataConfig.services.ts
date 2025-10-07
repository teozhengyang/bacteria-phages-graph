import { prisma } from '#db.js';

const DataConfigService = {

    deleteConfig: async (id: string) => {
        return prisma.dataConfig.delete({
            where: { id: Number(id) }
        });
    },

    getAllConfigs: async () => {
        return prisma.dataConfig.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },

    getConfigById: async (id: string) => {
        return prisma.dataConfig.findUnique({
            where: { id: Number(id) }
        });
    },

saveConfig: async (name: string, config: object, userId: string, excelDataId: string) => {
    return prisma.dataConfig.create({
        data: {
            bacteriaClusters: config,
            configName: name,
            excelData: { connect: { id: Number(excelDataId) } },
            user: { connect: { id: Number(userId) } },
        },
    });
},

updateConfig: async (id: string, name: string, config: object) => {
    return prisma.dataConfig.update({
        data: {
            bacteriaClusters: config,
            configName: name,
        },
        where: { id: Number(id) },
    });
}

}

export default DataConfigService