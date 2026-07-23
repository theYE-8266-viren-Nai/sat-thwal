import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/logo.png" alt="Set Thwal" width={40} height={40} priority />
      <span className="text-lg font-bold text-foreground">
        Set Thwal <span className="font-normal text-muted-foreground">| ဆက်သွယ်</span>
      </span>
    </div>
  );
}
