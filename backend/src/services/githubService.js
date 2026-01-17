const { Octokit } = require("octokit");
const { prisma } = require("../db.js");
const { autoCategorize } = require("../utils/classifier.js");

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

const syncStudentRepos = async (githubUrl) => {
  // 1. 增加基础合法性校验：提取用户名并验证 URL 格式
  const username = githubUrl.replace(/\/$/, '').split('/').pop();

  // 简单的正则验证，确保不是空的或者纯符号，且包含 github.com
  if (!username || !githubUrl.includes('github.com')) {
    throw new Error("无效的 GitHub 链接，请输入正确的用户主页地址");
  }

  try {
    // 2. 获取 GitHub 数据
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      sort: "updated",
      per_page: 50,
    });

    // 校验：如果 repos 不是数组，说明获取失败
    if (!Array.isArray(repos)) {
      throw new Error("无法从 GitHub 获取有效的仓库列表");
    }

    if (repos.length === 0) {
      return { message: `用户 "${username}" 没有任何公开仓库`, count: 0 };
    }

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
          studentName: username,
          languageStats: languageStats,
        }
      });
      count++;
    }

    return { message: "同步成功", count };

  } catch (error) {
    // ✅ 核心修复：捕获 GitHub API 返回的 404 错误并抛出中文提示
    if (error.status === 404) {
      throw new Error(`GitHub 用户 "${username}" 不存在，请检查地址是否正确`);
    }

    // 捕获 API 频率限制（Rate Limit）
    if (error.status === 403) {
      throw new Error("访问过于频繁，GitHub 暂时拒绝了请求，请稍后再试");
    }

    // 重新抛出其他未预料的错误，交给 Controller 处理
    throw error;
  }
};

// 导出模块
module.exports = {
  syncStudentRepos
};