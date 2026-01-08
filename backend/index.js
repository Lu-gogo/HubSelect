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

// 定义分类关键词库
const CATEGORY_MAP = {
  "课程作业": ["lab", "homework", "course", "assignment", "project", "实验", "作业"],
  "技术笔记": ["notes", "learning", "study", "awesome", "interview", "笔记", "面试"],
  "实用工具": ["tool", "script", "plugin", "util", "auto", "工具", "脚本"],
  "实战项目": ["app", "web", "system", "management", "platform", "系统", "平台"]
};

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
      // 自动打标签函数
      function autoCategorize(name, description) {
        const text = (name + " " + (description || "")).toLowerCase();
        for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
          if (keywords.some(kw => text.includes(kw))) return category;
        }
        return "其他资源";
      }

      // --- 新增：抓取语言统计 ---
      let repoLanguageStats = [];
      try {
        const { data: languages } = await octokit.rest.repos.listLanguages({
          owner: username,
          repo: repo.name,
        });

        // 1. 获取所有的字节数值
        const values = Object.values(languages);

        // 2. 计算总字节数 (使用 Number 强制转换确保安全)
        const totalBytes = values.reduce((sum, bytes) => {
          return Number(sum) + Number(bytes);
        }, 0);

        // 3. 防止除以零的情况
        if (totalBytes > 0) {
          repoLanguageStats = Object.entries(languages)
            .map(([lang, bytes]) => ({
              name: lang,
              value: Math.round((Number(bytes) / totalBytes) * 100), // 使用 Number() 代替 as number
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
        }
      } catch (langError) {
        console.warn(`获取 ${repo.name} 语言统计失败:`, langError.message);
      }

      // 在 upsert 逻辑中应用
      const category = autoCategorize(repo.name, repo.description);
      const keywords = repo.topics || [];
      keywords.unshift(category); // 将自动分类结果排在标签第一位
      // 提取关键词：组合语言和标签
      if (repo.language) keywords.push(repo.language);


      const project = await prisma.project.upsert({
        where: { githubId: repo.id },
        update: {
          stars: repo.stargazers_count,
          description: repo.description,
          topics: keywords,
          languageStats: repoLanguageStats, // 保存语言统计
        },
        create: {
          githubId: repo.id,
          name: repo.name,
          description: repo.description,
          htmlUrl: repo.html_url,
          language: repo.language,
          topics: keywords,
          stars: repo.stargazers_count,
          studentName: username, // 记录所属学生
          languageStats: repoLanguageStats, // 保存语言统计
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

/**
 * 接口 3: 清空数据库中所有的项目记录
 */
app.delete('/api/projects/clear', async (req, res) => {
  try {
    // 关键操作：删除 Project 表中的所有数据
    const deleteResult = await prisma.project.deleteMany({});
    
    res.json({ 
      message: "数据库已清空", 
      count: deleteResult.count 
    });
  } catch (error) {
    console.error("清空失败:", error);
    res.status(500).json({ error: "清空数据库失败" });
  }
});


app.listen(port, () => {
  console.log(`🚀 后端服务已启动: http://localhost:${port}`);
});