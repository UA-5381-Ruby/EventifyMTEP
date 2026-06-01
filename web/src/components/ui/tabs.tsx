import { Button } from '@/components/ui';

export interface TabItem {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeValue: string;
  onChange: (value: string) => void;
}

export function Tabs({ tabs, activeValue, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-1 bg-neutral-50 p-1 rounded-xl w-fit" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeValue === tab.value;
        return (
          <Button
            key={tab.value}
            size="sm"
            variant={isActive ? 'outline' : 'ghost'}
            onClick={() => onChange(tab.value)}
            className={`text-xs px-4 py-1.5 h-auto font-medium rounded-lg transition-all duration-200 ${
              !isActive ? 'text-neutral-400 hover:text-neutral-600 hover:bg-transparent' : ''
            }`}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
