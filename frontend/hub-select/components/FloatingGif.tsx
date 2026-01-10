// components/FloatingGif.tsx
import Image from "next/image";

interface FloatingGifProps {
  src: string;
  size?: number;
  // 将位置提取为输入，给定一个默认值 'top-4 left-4'
  positionClassName?: string; 
  className?: string;
}

export function FloatingGif({ 
  src, 
  size = 80, 
  positionClassName = "top-4 left-4", // 默认位置
  className = "" 
}: FloatingGifProps) {
  return (
    <div 
      className={`fixed z-[9999] pointer-events-none ${positionClassName} ${className}`}
    >
      <Image
        src={src}
        alt="Floating Animation"
        width={size}
        height={size}
        unoptimized 
        className="drop-shadow-md object-contain"
      />
    </div>
  );
}