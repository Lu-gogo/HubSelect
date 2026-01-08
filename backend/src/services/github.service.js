// backend/src/services/github.service.js
require('dotenv').config(); // 必须在 Octokit 实例化之前调用
import { Octokit } from "octokit";
import { prisma } from "../db"; // 假设你初始化了 prisma

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export const syncStudentRepos = async (githubUrl) => {
  // 1. 从 URL 提取用户名 (例如 https://github.com/shadcn -> shadcn)
  const username = githubUrl.split('/').pop();

  // 2. 获取用户信息
  const { data: user } = await octokit.rest.users.getByUsername({ username });

  // 3. 创建或更新学生信息
  const student = await prisma.student.upsert({
    where: { username },
    update: {},
    create: { username, avatarUrl: user.avatar_url },
  });

  // 4. 获取用户仓库
  const { data: repos } = await octokit.rest.repos.listForUser({
    username,
    sort: "updated",
    per_page: 100, // 限制数量
  });

  // 5. 数据清洗与入库 (实现你的“关键词识别”和“智能分类”)
  for (const repo of repos) {
    if (repo.fork) continue; // 过滤掉 Fork 的项目，只保留原创

    // 这里就是你所谓的“智能分类”的基础：利用 topics 和 language
    const keywords = repo.topics || [];
    if (repo.language) keywords.push(repo.language);

    await prisma.project.upsert({
      where: { githubId: repo.id },
      update: {
        stars: repo.stargazers_count,
        description: repo.description,
      },
      create: {
        githubId: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        language: repo.language,
        topics: keywords, // 这里存入标签
        studentId: student.id,
        stars: repo.stargazers_count
      }
    });
  }
  return { message: `同步了 ${repos.length} 个项目` };
};