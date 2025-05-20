import type { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ActivityInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export const ActivityInput: FC<ActivityInputProps> = ({ value, onChange, disabled, placeholder = "Над чем вы работаете?" }) => {
  return (
    <div className="w-full">
      <Label htmlFor="activity-name" className="sr-only">Activity Name</Label>
      <Input
        id="activity-name"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="text-lg p-6 rounded-md shadow-sm"
      />
    </div>
  );
};
