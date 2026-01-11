
// backend/src/db.js
const { PrismaClient } = require('@prisma/client');

// 全局单例模式初始化 Prisma
const prisma = new PrismaClient();

module.exports = {
  prisma
};