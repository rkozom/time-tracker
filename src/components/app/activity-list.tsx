import type { FC } from 'react';
import type { Activity } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListChecks } from 'lucide-react';

interface ActivityListProps {
  activities: Activity[];
}

export const ActivityList: FC<ActivityListProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
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
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-semibold">
          <ListChecks className="mr-2 h-6 w-6 text-primary" />
          Завершнные задачи
        </CardTitle>
        <CardDescription>Список завершенных задач.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-3">
            {activities.slice().reverse().map((activity) => ( // Show newest first
              <li key={activity.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-card-foreground">{activity.name}</span>
                  <span className="text-sm text-muted-foreground">{formatDuration(activity.duration)}</span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
