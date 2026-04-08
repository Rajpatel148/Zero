export const dependecyList: readonly string[] = [
     "express", "dotenv", "@prisma/client", "cors", "compression"
] as const;

export const devDependecyList: readonly string[] = [
     "typescript",
     "prisma",
     "ts-node",
     "@types/node",
     "@types/express",
     "@types/cors",
     "@types/compression",
] as const;