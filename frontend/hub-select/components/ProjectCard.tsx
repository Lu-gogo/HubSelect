"use client";

import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Github, Star, Code2, Loader2 } from "lucide-react";
import { ProjectRadar } from "./ProjectRadar";

// 1. 统一接口定义，导出供 Page 使用
export interface Project {
  id: number;
  githubId: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  topics: string[];
  language: string | null;
  stars: number;
  studentName: string | null;
  languageStats: { name: string; value: number }[] | null;
}

const THEMES: Record<string, string> = {
  "课程作业": "bg-blue-600 text-white border-none",
  "技术笔记": "bg-emerald-600 text-white border-none",
  "实用工具": "bg-amber-500 text-white border-none",
  "实战项目": "bg-violet-600 text-white border-none",
};

export function ProjectCard({ project }: { project: Project }) {
  const [readme, setReadme] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const category = project.topics?.[0] || "其他资源";
  const otherTags = project.topics?.slice(1) || [];

  const fetchReadme = async () => {
    if (readme) return;
    setLoading(true);
    try {
      const rawUrl = project.htmlUrl.replace("github.com", "raw.githubusercontent.com") + "/master/README.md";
      const res = await fetch(rawUrl);
      const text = await res.text();
      setReadme(res.ok ? text : "# 暂无文档\n未找到 README.md 文件。");
    } catch {
      setReadme("# 错误\n无法连接到 GitHub 获取文档。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchReadme()}>
      <DialogTrigger asChild>
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col relative border-t-4 border-t-transparent hover:border-t-primary overflow-hidden">
          <div className="absolute top-0 right-0 z-10 p-2">
            <Badge className={`${THEMES[category] || "bg-slate-500"} shadow-sm text-[10px]`}>
              {category}
            </Badge>
          </div>

          <CardHeader className="pt-6 pb-2">
            <CardTitle className="text-lg font-bold truncate group-hover:text-primary">
              {project.name}
            </CardTitle>
            <CardDescription className="line-clamp-1 text-xs">
              {project.description || "暂无描述"}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-grow flex flex-col gap-2">
            {/* 传递语言统计数据给雷达图组件 */}
            <ProjectRadar stats={project.languageStats || []} />
            
            <div className="flex flex-wrap gap-1 mt-1">
              {otherTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="text-[11px] text-muted-foreground flex justify-between border-t pt-3 bg-muted/10 px-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>{project.stars}</span>
              </div>
              <div className="flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                <span>{project.language || "N/A"}</span>
              </div>
            </div>
            <span className="text-primary font-bold">预览文档</span>
          </CardFooter>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Github className="w-6 h-6" /> {project.name}
          </DialogTitle>
          <DialogDescription>
            README 文档预览 - <a href={project.htmlUrl} target="_blank" className="text-blue-500 underline">在 GitHub 中打开</a>
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}