import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useNavigate } from 'react-router-dom';

export function Back() {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      className="mt-1 h-8 w-8 p-0 flex items-center justify-center rounded-xl cursor-pointer border border-neutral-200/40 bg-white shadow-sm hover:bg-neutral-50"
    >
      <ArrowLeft size={16} className="text-neutral-700" />
    </Button>
  );
}
