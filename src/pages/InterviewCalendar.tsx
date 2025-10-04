import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Loader2, CalendarDays } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { useCandidates } from '@/hooks/useCandidates';
import { useJobs } from '@/hooks/useJobs';
import { useApplications } from '@/hooks/useApplications';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, eachWeekOfInterval, addDays } from 'date-fns';
import { EditInterviewDialog } from '@/components/EditInterviewDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InterviewCalendar() {
  const { interviews, loading, refetch } = useInterviews();
  const { candidates } = useCandidates();
  const { jobs } = useJobs();
  const { applications } = useApplications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const monthDays = viewMode === 'month' 
    ? eachDayOfInterval({ 
        start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
        end: endOfWeek(monthEnd, { weekStartsOn: 1 }) 
      })
    : [];

  const filteredInterviews = interviews.filter((interview) => {
    const matchesType = typeFilter === 'all' || interview.interview_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || interview.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const getInterviewsForDate = (date: Date) => {
    return filteredInterviews.filter((interview) =>
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

        {/* Filters and View Mode */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(value: 'week' | 'month') => setViewMode(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="month">Month View</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="onsite">On-site</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <h2 className="text-xl font-semibold">
            {viewMode === 'week' 
              ? `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              : format(selectedDate, 'MMMM yyyy')}
          </h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() - (viewMode === 'week' ? 7 : 30));
                setSelectedDate(newDate);
              }}
            >
              Previous {viewMode === 'week' ? 'Week' : 'Month'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(selectedDate.getDate() + (viewMode === 'week' ? 7 : 30));
                setSelectedDate(newDate);
              }}
            >
              Next {viewMode === 'week' ? 'Week' : 'Month'}
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'week' ? (
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
                        <EditInterviewDialog key={interview.id} interview={interview} onSuccess={refetch}>
                          <div className="border rounded p-2 space-y-1 hover:bg-muted/50 cursor-pointer transition-colors">
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
                            <Badge 
                              variant={interview.status === 'completed' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {interview.status}
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
                        </EditInterviewDialog>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm p-2">
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const dayInterviews = getInterviewsForDate(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();

              return (
                <Card
                  key={day.toISOString()}
                  className={`min-h-[100px] ${isToday ? 'ring-2 ring-primary' : ''} ${!isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <CardContent className="p-2">
                    <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1">
                      {dayInterviews.slice(0, 2).map((interview) => (
                        <EditInterviewDialog key={interview.id} interview={interview} onSuccess={refetch}>
                          <div className="text-xs p-1 bg-primary/10 rounded cursor-pointer hover:bg-primary/20 transition-colors truncate">
                            {format(parseISO(interview.scheduled_at), 'h:mm a')}
                          </div>
                        </EditInterviewDialog>
                      ))}
                      {dayInterviews.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayInterviews.length - 2} more
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Upcoming Interviews List */}
        <Card>
          <CardHeader>
            <CardTitle>All Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredInterviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No interviews scheduled</p>
            ) : (
              <div className="space-y-3">
                {filteredInterviews
                  .filter((i) => new Date(i.scheduled_at) >= new Date())
                  .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                  .map((interview) => (
                    <div
                      key={interview.id}
                      className="flex items-center justify-between border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">
                          {getCandidateName(interview.application_id)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getJobTitle(interview.application_id)}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(interview.scheduled_at), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {format(parseISO(interview.scheduled_at), 'h:mm a')}
                          </div>
                          <Badge>{interview.interview_type}</Badge>
                          <Badge 
                            variant={interview.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {interview.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {interview.meeting_link && (
                          <Button size="sm" asChild>
                            <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4 mr-2" />
                              Join Meeting
                            </a>
                          </Button>
                        )}
                        <EditInterviewDialog interview={interview} onSuccess={refetch}>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </EditInterviewDialog>
                      </div>
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
