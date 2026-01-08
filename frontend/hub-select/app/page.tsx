"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard"; // 确保路径正确

// 1. 定义项目数据的 TypeScript 接口
interface Project {
  id: number;
  name: string;
  description: string | null;
  htmlUrl: string;
  topics: string[];
  language: string | null;
  stars: number;
}


export default function Home() {
  const [url, setUrl] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // 1. 新增：搜索框的状态

  // 2. 核心：计算属性 - 实时过滤项目
  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];
    return projects.filter(proj => 
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      proj.topics.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.language?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, projects]);
  // --- 新增：页面加载时初始化数据 ---
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProjects(data);
        }
      } catch (error) {
        console.error("加载初始数据失败:", error);
      }
    };
    fetchExistingData();
  }, []); // 空数组表示仅在组件挂载时运行一次

  const handleClear = async () => {     // 清空数据库按钮的处理函数
    // 1. 增加确认提示，防止演示时手抖
    if (!confirm("确定要清空已收集的所有项目数据吗？此操作不可撤销。")) {
      return;
    }

    try {
      // 2. 发送 DELETE 请求到后端
      const res = await fetch('http://localhost:5000/api/projects/clear', {
        method: 'DELETE',
      });

      if (res.ok) {
        // 3. 成功后，将本地状态也清空，UI 会自动更新
        setProjects([]);
        alert("数据库已成功清空！");
      }
    } catch (error) {
      console.error("清空操作失败:", error);
      alert("服务连接失败，请检查后端。");
    }
  };

  // ... handleScan 函数保持不变 ...
  const handleScan = async () => {
  if (!url) return;
  setLoading(true);
  try {
    // 1. 请求后端抓取数据
    await fetch('http://localhost:5000/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    // 2. 抓取成功后，重新获取列表更新 UI
    const res = await fetch('http://localhost:5000/api/projects');
    const data = await res.json();
    setProjects(data); 
    
    setUrl(""); // 清空输入框
  } catch (error) {
    alert("同步失败，请检查后端服务");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="container mx-auto py-10 px-4">
      {/* 标题部分省略... */}

      <div className="flex flex-col w-full max-w-2xl mx-auto gap-4 mb-12">
        {/* 录入区 */}
        <div className="flex gap-2">
          <Input 
            placeholder="输入 GitHub URL 采集资源..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button onClick={handleScan} disabled={loading}>
            {loading ? "分析中..." : "智能采集"}
          </Button>
          <Button variant="destructive" onClick={handleClear}>
           清空数据
         </Button>
        </div>

        {/* 3. 新增：检索区 */}
        <div className="relative">
          <Input 
            placeholder="🔍 搜索项目名称、语言或技术标签 (如: React, Python)..." 
            className="border-primary/50 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2 ml-1">
              找到 {filteredProjects.length} 个相关资源
            </p>
          )}
        </div>
      </div>

      {/* 4. 修改：使用 filteredProjects 渲染 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>
      
      {/* 如果搜索结果为空的占位图 */}
      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-400">
          未找到相关项目，尝试采集更多同学的 GitHub 吧！
        </div>
      )}
    </main>
  );
}