"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Github, BookOpen, Star, Code2, Loader2 } from "lucide-react";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface ProjectProps {
  project: {
    id: number;
    name: string;
    description: string | null;
    htmlUrl: string;
    topics: string[];
    language: string | null;
    stars: number;
    languageStats?: { name: string; value: number }[]; 
  };
}

export function ProjectCard({ project }: ProjectProps) {
  const [readme, setReadme] = useState("");
  const [loadingReadme, setLoadingReadme] = useState(false);
  const [languageData, setLanguageData] = useState<{ subject: string; A: number; fullMark: number }[]>([]);

  const category = project.topics && project.topics.length > 0 ? project.topics[0] : "其他资源";
  const otherTags = project.topics ? project.topics.slice(1) : [];

  // 1. 组件加载时自动初始化雷达图数据
  useEffect(() => {
    if (project.languageStats && project.languageStats.length > 0) {
      const stats = project.languageStats.map(l => ({
        subject: l.name,
        A: Number(l.value),
        fullMark: 100
      }));
      setLanguageData(stats);
    }
  }, [project.languageStats]);

  const getCategoryTheme = (cat: string) => {
    const themes: Record<string, string> = {
      "课程作业": "bg-blue-600 text-white border-none",
      "技术笔记": "bg-emerald-600 text-white border-none",
      "实用工具": "bg-amber-500 text-white border-none",
      "实战项目": "bg-violet-600 text-white border-none",
    };
    return themes[cat] || "bg-slate-500 text-white border-none";
  };

  const fetchReadme = async () => {
    if (readme) return;
    setLoadingReadme(true);
    try {
      const rawUrl = project.htmlUrl.replace("github.com", "raw.githubusercontent.com") + "/master/README.md";
      const res = await fetch(rawUrl);
      const text = await res.text();
      setReadme(res.ok ? text : "# 暂无文档\n未找到 README.md 文件。");
    } catch {
      setReadme("# 错误\n无法连接到 GitHub 获取文档。");
    } finally {
      setLoadingReadme(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && fetchReadme()}>
      <DialogTrigger asChild>
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col relative border-t-4 border-t-transparent hover:border-t-primary overflow-hidden">
          {/* 顶部分类标签 */}
          <div className="absolute top-0 right-0 z-10 p-2">
            <Badge className={`${getCategoryTheme(category)} shadow-sm text-[10px]`}>
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
            {/* 雷达图区域 - 直接在卡片展示 */}
            <div className="w-full h-[160px] bg-slate-50/50 dark:bg-slate-900/40 rounded-lg flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800">
              {languageData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={languageData}>
                    <PolarGrid strokeOpacity={0.5} />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.8 }} 
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar 
                      name="语言占比" 
                      dataKey="A" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.5} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-[10px] text-muted-foreground flex flex-col items-center">
                  <Code2 className="w-4 h-4 mb-1 opacity-20" />
                  分析中...
                </div>
              )}
            </div>

            {/* 技术标签 */}
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
            <span className="text-primary font-bold flex items-center gap-1">
               预览文档
            </span>
          </CardFooter>
        </Card>
      </DialogTrigger>

      {/* 弹窗现在只负责展示 README 内容 */}
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
          {loadingReadme ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}