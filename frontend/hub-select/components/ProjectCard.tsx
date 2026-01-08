import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github } from "lucide-react"; // 图标库

// 定义项目的类型结构
interface ProjectProps {
  project: {
    name: string;
    description: string | null;
    htmlUrl: string;
    topics: string[];
    language: string | null;
    stars: number;
  };
}

export function ProjectCard({ project }: ProjectProps) {
  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer h-full flex flex-col" 
      onClick={() => window.open(project.htmlUrl, '_blank')}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold truncate">{project.name}</CardTitle>
          <Github className="w-5 h-5 text-gray-500" />
        </div>
        <CardDescription className="line-clamp-2 h-10">
          {project.description || "暂无描述"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {/* 这里的 tag 会自动推断为 string 类型 */}
          {project.topics.slice(0, 4).map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-gray-500 flex justify-between">
        <span>⭐ {project.stars}</span>
        <span>{project.language}</span>
      </CardFooter>
    </Card>
  );
}