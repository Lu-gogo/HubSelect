// backend/src/db.js
import { PrismaClient } from '@prisma/client';

// 全局单例模式初始化 Prisma
export const prisma = new PrismaClient();