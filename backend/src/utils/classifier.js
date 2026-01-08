// backend/src/utils/classifier.js
const CATEGORY_MAP = {
  "课程作业": ["lab", "homework", "course", "assignment", "project", "实验", "作业"],
  "技术笔记": ["notes", "learning", "study", "awesome", "interview", "笔记", "面试"],
  "实用工具": ["tool", "script", "plugin", "util", "auto", "工具", "脚本"],
  "实战项目": ["app", "web", "system", "management", "platform", "系统", "平台"]
};

export const autoCategorize = (name, description) => {
  const text = `${name} ${description || ""}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => text.includes(kw))) return category;
  }
  return "其他资源";
};