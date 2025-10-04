import { Loader2 } from 'lucide-react';
import { useActivities } from '@/hooks/useActivities';

interface ActivityFeedProps {
  candidateId?: string;
  jobId?: string;
}

export function ActivityFeed({ candidateId, jobId }: ActivityFeedProps) {
  const { activities, loading } = useActivities(candidateId, jobId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">No activity yet</p>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="flex-1">
            <p className="text-sm font-medium">{activity.description}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(activity.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
