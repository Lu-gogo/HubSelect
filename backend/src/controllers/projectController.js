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
  
  if (!url) {
    return res.status(400).json({ error: "请输入 GitHub URL" });
  }
  
  try {
    const result = await githubService.syncStudentRepos(url);
    res.json(result); 
  } catch (error) {
    // 将 Error 对象中的 message 返回给前端
    console.error("💡 捕获到预期内错误:", error.message);
    res.status(400).json({ 
      error: "采集失败", 
      details: error.message 
    });
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