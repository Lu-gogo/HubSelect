"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectTabsProps {
  currentTab: string;
  onTabChange: (value: string) => void;
  categories: string[];
}

export function ProjectTabs({ currentTab, onTabChange, categories }: ProjectTabsProps) {
  return (
    <div className="flex justify-center mb-10 px-4">
      {/* 这里的 max-w-4xl 让 Tab 栏在 PC 端更宽，占满感更强 */}
      <Tabs 
        value={currentTab} 
        onValueChange={onTabChange} 
        className="w-full max-w-4xl" 
      >
        {/* 1. h-14: 增加高度，让 Tab 看起来更大
           2. p-1.5: 增加内边距，让滑块与边框有更多呼吸感
           3. flex w-full: 确保容器占满宽度
        */}
        <TabsList className="flex w-full h-14 bg-slate-100/80 dark:bg-slate-800/50 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
          {categories.map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab}
              /* 1. flex-1: 核心代码，让每个 Tab 自动撑开平分宽度
                 2. text-base: 调大字号
                 3. py-3: 增加垂直高度
              */
              className="
                flex-1 flex items-center justify-center
                text-base font-medium transition-all duration-300 rounded-xl
                text-slate-500 hover:text-slate-700
                data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md
                dark:text-slate-400 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-white
              "
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}