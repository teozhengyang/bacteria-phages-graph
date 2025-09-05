import { prisma } from "#db.js";

const authService = {
    createUser: async (email: string, hashedPassword: string, username: string) => {
        return prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username
            }
        });
    },

    findUserByEmail : async (email: string) => {
        return prisma.user.findUnique({ where: { email } });
    },

    findUserById: async (userId: number) => {
        return prisma.user.findUnique({ where: { id: userId } });
    },
    
    updateRefreshToken: async (userId: number, refreshToken: null | string) => {
        return prisma.user.update({
            data: { refreshToken },
            where: { id: userId }
        });
    }
};

export default authService;