import { ReactNode } from "react";
import StoreHeader from "@/components/storefront/StoreHeader";
import StoreFooter from "@/components/storefront/StoreFooter";

interface StoreLayoutProps {
  children: ReactNode;
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        {children}
      </main>
      <StoreFooter />
    </div>
  );
}