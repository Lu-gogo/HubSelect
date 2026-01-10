"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface RadarStat {
  name: string;
  value: number;
}

export function ProjectRadar({ stats }: { stats: RadarStat[] }) {
  // 转换数据格式
  const data = stats.map(item => ({
    subject: item.name,
    A: Number(item.value),
    fullMark: 100
  }));

  return (
    <div className="w-full aspect-ratio min-h-[180px] bg-slate-50/50 dark:bg-slate-900/40 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid strokeOpacity={0.2} />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.6 }} 
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
        <span className="text-[10px] text-muted-foreground italic">暂无技术分析</span>
      )}
    </div>
  );
}