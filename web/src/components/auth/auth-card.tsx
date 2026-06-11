import { PageWrapper } from "@/components/layout";
import type {AuthCardProps} from "@/types/auth";

export function AuthCard({ children, centered = false }: AuthCardProps) {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 relative z-10">
          <div className={`p-8 sm:p-12 ${centered ? 'text-center' : ''}`}>
            {children}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
