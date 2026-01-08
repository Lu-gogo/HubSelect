const express = require('express');
const cors = require('cors');
const { Octokit } = require("octokit");
const { PrismaClient } = require('@prisma/client');
BigInt.prototype.toJSON = function () {
  return this.toString();
};

require('dotenv').config();
console.log("检查数据库地址:", process.env.DATABASE_URL); // 添加这一行

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;

// 初始化 GitHub 客户端 (建议在 .env 配置 GITHUB_TOKEN)
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

app.use(cors());
app.use(express.json());

/**
 * 接口 1: 获取数据库中所有的项目卡片
 */
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { id: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    // 关键：在后台打印出具体的错误堆栈
    console.error("❌ 数据库查询报错:", error);
    res.status(500).json({ 
      error: "获取数据失败", 
      message: error.message, // 把具体原因传给前端
      code: error.code 
    });
  }
});

/**
 * 接口 2: 核心功能 - 扫描 GitHub 并入库
 */
app.post('/api/scan', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.includes('github.com')) {
    return res.status(400).json({ error: "请输入有效的 GitHub 地址" });
  }

  try {
    // 1. 提取用户名 (处理结尾斜杠)
    const username = url.replace(/\/$/, '').split('/').pop();

    // 2. 调用 GitHub API 获取仓库列表
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: 'updated',
      per_page: 50
    });

    // 3. 处理数据并存入数据库 (使用 upsert 避免重复)
    const savedProjects = [];
    for (const repo of repos) {
      if (repo.fork) continue; // 只收集原创项目

      // 提取关键词：组合语言和标签
      const keywords = repo.topics || [];
      if (repo.language) keywords.push(repo.language);

      const project = await prisma.project.upsert({
        where: { githubId: repo.id },
        update: {
          stars: repo.stargazers_count,
          description: repo.description,
          topics: keywords
        },
        create: {
          githubId: repo.id,
          name: repo.name,
          description: repo.description,
          htmlUrl: repo.html_url,
          language: repo.language,
          topics: keywords,
          stars: repo.stargazers_count,
          studentName: username // 记录所属学生
        }
      });
      savedProjects.push(project);
    }

    res.json({ message: "同步完成", count: savedProjects.length });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "抓取数据时出错", details: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 后端服务已启动: http://localhost:${port}`);
});