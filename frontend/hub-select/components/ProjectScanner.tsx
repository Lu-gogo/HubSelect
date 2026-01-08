import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Trash2 } from "lucide-react";

interface ScannerProps {
  url: string;
  setUrl: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  onScan: () => void;
  onClear: () => void;
  loading: boolean;
}

export function ProjectScanner({ url, setUrl, searchQuery, setSearchQuery, onScan, onClear, loading }: ScannerProps) {
  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto gap-4 mb-12">
      <div className="flex gap-2">
        <Input 
          placeholder="输入 GitHub URL (例如: https://github.com/shadcn)..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={onScan} disabled={loading} className="min-w-[100px]">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "分析中" : "智能采集"}
        </Button>
        <Button variant="outline" onClick={onClear} className="text-destructive border-destructive/20 hover:bg-destructive/10">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="搜索项目名称、语言或标签..." 
          className="pl-10 border-primary/30 focus:border-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}