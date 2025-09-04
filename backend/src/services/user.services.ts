import { prisma } from "#db.js";

const UserService = {
    getUserById: async (userId: number) => {
        return prisma.user.findUnique({
            select: {
                email: true,
                id: true,
                username: true
            },
            where: { id: userId }
        });
    }
}

export default {
    UserService
};  