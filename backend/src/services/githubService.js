import { Octokit } from "octokit";
import { prisma } from "../db.js";
import { autoCategorize } from "../utils/classifier.js";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// 辅助函数：抓取语言
async function getRepoLanguageStats(owner, repo) {
  try {
    const { data: languages } = await octokit.rest.repos.listLanguages({ owner, repo });
    const totalBytes = Object.values(languages).reduce((sum, b) => sum + Number(b), 0);
    if (totalBytes === 0) return [];
    return Object.entries(languages)
      .map(([name, bytes]) => ({
        name,
        value: Math.round((Number(bytes) / totalBytes) * 100),
      }))
      .sort((a, b) => b.value - a.value).slice(0, 5);
  } catch (e) { return []; }
}

export const syncStudentRepos = async (githubUrl) => {
  const username = githubUrl.replace(/\/$/, '').split('/').pop();

  // 1. 获取 GitHub 数据
  const { data: repos } = await octokit.rest.repos.listForUser({
    username,
    sort: "updated",
    per_page: 50,
  });

  // 校验：如果 repos 不是数组，直接抛错
  if (!Array.isArray(repos)) throw new Error("无法从 GitHub 获取仓库列表");

  let count = 0;
  for (const repo of repos) {
    if (repo.fork) continue;

    const languageStats = await getRepoLanguageStats(username, repo.name);
    const category = autoCategorize(repo.name, repo.description);
    const topics = repo.topics || [];
    if (!topics.includes(category)) topics.unshift(category);
    if (repo.language && !topics.includes(repo.language)) topics.push(repo.language);

    await prisma.project.upsert({
      where: { githubId: repo.id },
      update: {
        stars: repo.stargazers_count,
        description: repo.description,
        topics: topics,
        languageStats: languageStats,
      },
      create: {
        githubId: repo.id,
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        language: repo.language,
        topics: topics,
        stars: repo.stargazers_count,
        studentName: username, // 匹配你的 Schema
        languageStats: languageStats,
      }
    });
    count++;
  }

  return { message: "同步成功", count };
};