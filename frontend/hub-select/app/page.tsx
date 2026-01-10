"use client";

import { useState, useMemo, useEffect } from "react";
import { ProjectCard, type Project } from "@/components/ProjectCard";
import { ProjectScanner } from "@/components/ProjectScanner";
import { ProjectTabs } from "@/components/ProjectTab";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // ✅ 修复：指定状态类型为 Project 数组
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ 定义分类常量
  const categories = ["全部", "课程作业", "技术笔记", "开发项目"];
  const [currentTab, setCurrentTab] = useState<string>("全部");

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

  // ✅ 联合过滤逻辑
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesSearch = 
        proj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        proj.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))||
        proj.language?.toLowerCase().includes(searchQuery.toLowerCase())  ;
      
      const matchesTab = currentTab === "全部" || proj.topics[0] === currentTab;
      
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, projects, currentTab]);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/projects/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ 这里会弹出后端 throw 的具体错误信息（如“用户不存在”）
        alert(`提示: ${data.details || "采集异常"}`);
        return;
      }

      await fetchExistingData();
      alert(`成功同步 ${data.count} 个仓库`);
      
    } catch (error) {
      alert("网络请求失败，请检查后端服务是否启动");
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

      <ProjectTabs 
        categories={categories}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
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