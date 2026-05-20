import { PageWrapper } from '@/components/layout';

export function NotFoundPage() {
  return (
    <PageWrapper>
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-700 mb-4">404 - Not Found</h1>
          <p className="text-lg text-gray-500 mb-6">The page you are looking for does not exist.</p>
        </div>
      </div>
    </PageWrapper>
  );
}
