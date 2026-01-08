"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Github, BookOpen, Star, Code2, Loader2 } from "lucide-react";

interface ProjectProps {
  project: {
    id: number;
    name: string;
    description: string | null;
    htmlUrl: string;
    topics: string[];
    language: string | null;
    stars: number;
  };
}

export function ProjectCard({ project }: ProjectProps) {
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. 提取智能分类（后端存放在 topics 的第一项）
  const category = project.topics[0] || "其他资源";
  const otherTags = project.topics.slice(1);

  // 2. 根据分类获取醒目的颜色样式
  const getCategoryTheme = (cat: string) => {
    const themes: Record<string, string> = {
      "课程作业": "bg-blue-600 hover:bg-blue-700 text-white border-none",
      "技术笔记": "bg-emerald-600 hover:bg-emerald-700 text-white border-none",
      "实用工具": "bg-amber-500 hover:bg-amber-600 text-white border-none",
      "实战项目": "bg-violet-600 hover:bg-violet-700 text-white border-none",
    };
    return themes[cat] || "bg-slate-500 text-white border-none";
  };

  // 3. 抓取 README 内容逻辑
  const handleOpenPreview = async () => {
    if (readme) return; // 如果已经加载过则跳过
    setLoading(true);
    try {
      // 转换 github 链接为 raw 链接读取文本
      const rawUrl = project.htmlUrl.replace("github.com", "raw.githubusercontent.com") + "/master/README.md";
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error();
      const text = await res.text();
      setReadme(text);
    } catch {
      setReadme("# 暂无文档\n该项目未找到 master 分支下的 README.md 文件。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && handleOpenPreview()}>
      <DialogTrigger asChild>
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col relative border-t-4 border-t-transparent hover:border-t-primary">
          {/* 右上角醒目大标签 */}
          <div className="absolute top-0 right-0 z-10 p-2">
            <Badge className={`${getCategoryTheme(category)} px-3 py-1 shadow-md`}>
              {category}
            </Badge>
          </div>

          <CardHeader className="pt-8">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold truncate group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <Github className="w-5 h-5 text-muted-foreground group-hover:rotate-12 transition-transform" />
            </div>
            <CardDescription className="line-clamp-2 h-10 mt-2">
              {project.description || "该项目暂无详细描述"}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow">
            <div className="flex flex-wrap gap-1.5">
              {otherTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="text-sm text-muted-foreground flex justify-between border-t pt-4 bg-muted/30">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{project.stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <Code2 className="w-4 h-4" />
              <span>{project.language || "Plain Text"}</span>
            </div>
            <div className="flex items-center gap-1 text-primary text-xs font-bold">
              <BookOpen className="w-3 h-3" />
              预览文档
            </div>
          </CardFooter>
        </Card>
      </DialogTrigger>

      {/* 离线预览弹窗内容 */}
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Github className="w-6 h-6" />
            {project.name}
          </DialogTitle>
          <div className="flex gap-4 mt-2">
             <a href={project.htmlUrl} target="_blank" className="text-sm text-blue-500 hover:underline">去 GitHub 查看源码 ↗</a>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">正在从 GitHub 获取文档...</p>
            </div>
          ) : (
            <article className="prose prose-slate dark:prose-invert max-w-none prose-pre:bg-muted prose-img:rounded-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {readme}
              </ReactMarkdown>
            </article>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}