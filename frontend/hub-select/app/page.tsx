"use client";

import { useState, useMemo, useEffect } from "react";
import { ProjectCard, type Project } from "@/components/ProjectCard";
import { ProjectScanner } from "@/components/ProjectScanner";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // ✅ 修复：指定状态类型为 Project 数组
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchExistingData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProjects(data as Project[]);
      }
    } catch (error) {
      console.error("加载初始数据失败:", error);
    }
  };

  useEffect(() => {
    fetchExistingData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(proj => 
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      proj.topics.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proj.language?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, projects]);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/projects/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        await fetchExistingData(); // 同步后刷新列表
        setUrl(""); 
      }
    } catch (error) {
      alert("同步失败，请检查后端服务");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("确定要清空所有数据吗？")) return;
    try {
      const res = await fetch('http://localhost:5000/api/projects/clear', { method: 'DELETE' });
      if (res.ok) {
        setProjects([]);
      }
    } catch (error) {
      console.error("清空失败:", error);
    }
  };

  return (
    <main className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Hub Select
        </h1>
        <p className="text-muted-foreground">智能学生开源作品采集与画像系统</p>
      </div>

      <ProjectScanner 
        url={url} 
        setUrl={setUrl}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onScan={handleScan}
        onClear={handleClear}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProjects.map((proj) => (
          <ProjectCard key={proj.id} project={proj} />
        ))}
      </div>

      {filteredProjects.length === 0 && !loading && (
        <div className="text-center py-20 text-muted-foreground border rounded-xl border-dashed">
          未找到相关项目，尝试采集更多 GitHub 仓库吧！
        </div>
      )}
    </main>
  );
}