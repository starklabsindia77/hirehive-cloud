import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Loader2 } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useApplications } from '@/hooks/useApplications';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

export default function InterviewCalendar() {
  const { interviews, loading } = useInterviews();
  const { candidates } = useCandidates();
  const { jobs } = useJobs();
  const { applications } = useApplications();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((interview) =>
      isSameDay(parseISO(interview.scheduled_at), date)
    ).sort((a, b) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );
  };

  const getCandidateName = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return 'Unknown';
    const candidate = candidates.find((c) => c.id === app.candidate_id);
    return candidate?.full_name || 'Unknown';
  };

  const getJobTitle = (applicationId: string) => {
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return 'Unknown';
    const job = jobs.find((j) => j.id === app.job_id);
    return job?.title || 'Unknown';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Interview Calendar</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all scheduled interviews
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))
              }
            >
              Previous Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))
              }
            >
              Next Week
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {daysOfWeek.map((day) => {
            const dayInterviews = getInterviewsForDate(day);
            const isToday = isSameDay(day, new Date());

            return (
              <Card
                key={day.toISOString()}
                className={`min-h-[200px] ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      {format(day, 'EEE')}
                    </span>
                    <span className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2">
                  {dayInterviews.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No interviews</p>
                  ) : (
                    dayInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="border rounded p-2 space-y-1 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          {format(parseISO(interview.scheduled_at), 'h:mm a')}
                        </div>
                        <p className="text-xs font-medium truncate">
                          {getCandidateName(interview.application_id)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {getJobTitle(interview.application_id)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {interview.interview_type}
                        </Badge>
                        {interview.meeting_link && (
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Video className="h-3 w-3" />
                            <span>Virtual</span>
                          </div>
                        )}
                        {interview.location && (
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{interview.location}</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Upcoming Interviews List */}
        <Card>
          <CardHeader>
            <CardTitle>All Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {interviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interviews scheduled</p>
            ) : (
              <div className="space-y-3">
                {interviews
                  .filter((i) => new Date(i.scheduled_at) >= new Date())
                  .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {getCandidateName(interview.application_id)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getJobTitle(interview.application_id)}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(interview.scheduled_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(parseISO(interview.scheduled_at), 'h:mm a')}
                          </div>
                          <Badge>{interview.interview_type}</Badge>
                        </div>
                      </div>
                      {interview.meeting_link && (
                        <Button size="sm" asChild>
                          <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-2" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
