import type { FC } from 'react';
import type { Activity } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListChecks, PlayCircle } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
  onSelectActivity?: (activityName: string) => void;
}

export const ActivityList: FC<ActivityListProps> = ({ activities, onSelectActivity }) => {
  if (activities.length === 0) {
    return (
      <Card className="mt-8 shadow-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center text-xl font-semibold">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Завершенные активности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Пока нет активностей.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Завершнные задачи
        </CardTitle>
        <CardDescription>Список завершенных активностей. Нажмите на активнось, чтобы снова начать ее.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-3">
            {activities.map((activity) => ( // Already shows newest first due to prepending in page.tsx
              <li 
                key={activity.id} 
                className={`p-4 border rounded-lg bg-card transition-all duration-200 group ${onSelectActivity ? 'cursor-pointer hover:shadow-md hover:bg-muted' : ''}`}
                onClick={onSelectActivity ? () => onSelectActivity(activity.name) : undefined}
                onKeyDown={onSelectActivity ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSelectActivity(activity.name); } : undefined}
                role={onSelectActivity ? "button" : undefined}
                tabIndex={onSelectActivity ? 0 : undefined}
                aria-label={onSelectActivity ? `Start new timer for ${activity.name}` : undefined}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-card-foreground">{activity.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{formatDuration(activity.duration)}</span>
                    {onSelectActivity && (
                      <PlayCircle className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
