const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const githubService = require('../services/githubService');
const { autoCategorize } = require('../utils/classifier');

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { id: 'desc' } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "获取数据失败", message: error.message });
  }
};

const scanUserRepos = async (req, res) => {
  const { url } = req.body;
  
  try {
    // 💡 直接调用 Service，它内部会处理循环入库
    const result = await githubService.syncStudentRepos(url);
    res.json(result); 
  } catch (error) {
    console.error("❌ 后端崩溃详情:", error);
    res.status(500).json({ error: "同步失败", details: error.message });
  }
};

const clearProjects = async (req, res) => {
  try {
    const result = await prisma.project.deleteMany({});
    res.json({ message: "数据库已清空", count: result.count });
  } catch (error) {
    res.status(500).json({ error: "清空失败" });
  }
};

module.exports = { getProjects, scanUserRepos, clearProjects };