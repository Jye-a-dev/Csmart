import type { ReactNode } from "react";
import PublicSetup from "@/components/layouts/(public)/PublicSetup";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] bg-[#FAFAFA]">
      <PublicSetup>{children}</PublicSetup>
    </div>
  );
}
