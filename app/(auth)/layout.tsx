import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Image src="/logo.png" alt="Set Thwal" width={64} height={64} priority />
        <span className="text-lg font-bold text-foreground">
          Set Thwal <span className="font-normal text-muted-foreground">| ဆက်သွယ်</span>
        </span>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
