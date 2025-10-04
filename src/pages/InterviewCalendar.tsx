import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { useInterviews } from '@/hooks/useInterviews';
import { useCandidates } from '@/hooks/useCandidates';
import { useApplications } from '@/hooks/useApplications';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function InterviewCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { interviews } = useInterviews();
  const { candidates } = useCandidates();
  const { applications } = useApplications();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getInterviewsForDay = (day: Date) => {
    return interviews.filter(interview => 
      isSameDay(new Date(interview.scheduled_at), day)
    );
  };

  const getInterviewDetails = (interview: any) => {
    const application = applications.find(a => a.id === interview.application_id);
    const candidate = application ? candidates.find(c => c.id === application.candidate_id) : null;
    return { application, candidate };
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Interview Calendar</h1>
          <p className="text-muted-foreground">View and manage all scheduled interviews</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {calendarDays.map((day, idx) => {
              const dayInterviews = getInterviewsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    !isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : 'bg-card'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayInterviews.map(interview => {
                      const { candidate } = getInterviewDetails(interview);
                      const isPanel = interview.interview_type === 'panel';
                      
                      return (
                        <div
                          key={interview.id}
                          className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">
                              {format(new Date(interview.scheduled_at), 'HH:mm')}
                            </span>
                            {isPanel && <Users className="h-3 w-3 ml-auto" />}
                          </div>
                          <div className="truncate font-medium">
                            {candidate?.full_name || 'Unknown'}
                          </div>
                          <Badge variant="outline" className="text-[10px] h-4 px-1 mt-0.5">
                            {interview.interview_type}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {interviews
              .filter(i => new Date(i.scheduled_at) >= new Date())
              .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
              .slice(0, 5)
              .map(interview => {
                const { candidate } = getInterviewDetails(interview);
                const isPanel = interview.interview_type === 'panel';
                
                return (
                  <div key={interview.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{candidate?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(interview.scheduled_at), 'PPp')}
                        {isPanel && (
                          <>
                            <Users className="h-3 w-3 ml-2" />
                            <span>Panel Interview</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge>{interview.interview_type}</Badge>
                  </div>
                );
              })}
            {interviews.filter(i => new Date(i.scheduled_at) >= new Date()).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No upcoming interviews
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}