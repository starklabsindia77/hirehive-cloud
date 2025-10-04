import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Briefcase, Loader2 } from 'lucide-react';
import { useCandidates } from '@/hooks/useCandidates';
import { CreateCandidateDialog } from '@/components/CreateCandidateDialog';

const stages = [
  { name: 'new', label: 'New Applications', color: 'border-primary' },
  { name: 'screening', label: 'Phone Screen', color: 'border-accent' },
  { name: 'interview', label: 'Interview', color: 'border-success' },
  { name: 'offer', label: 'Offer', color: 'border-warning' },
];

export default function Candidates() {
  const navigate = useNavigate();
  const { candidates, loading, refetch } = useCandidates();

  const getCandidatesByStage = (stage: string) => {
    return candidates.filter(c => c.stage === stage);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Candidate Pipeline</h1>
          <p className="text-muted-foreground">Track candidates through your hiring process</p>
        </div>
        <CreateCandidateDialog onSuccess={refetch} />
      </div>

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
            <p className="text-muted-foreground">Candidates will appear here once they apply to your job postings</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {stages.map((stage) => {
            const stageCandidates = getCandidatesByStage(stage.name);
            return (
              <div key={stage.name} className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${stage.color} bg-card`}>
                  <h3 className="font-semibold text-foreground">{stage.label}</h3>
                  <Badge variant="secondary">{stageCandidates.length}</Badge>
                </div>
                
                <div className="space-y-3">
                  {stageCandidates.map((candidate) => (
                    <Card 
                      key={candidate.id} 
                      className="transition-all hover:shadow-md cursor-pointer"
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                              {getInitials(candidate.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-sm mb-1 truncate">
                              {candidate.full_name}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Briefcase className="w-3 h-3" />
                              <span className="truncate">{candidate.current_position || 'No position'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{candidate.email}</span>
                            </div>
                            {candidate.phone && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                                <Phone className="w-3 h-3" />
                                <span>{candidate.phone}</span>
                              </div>
                            )}
                            {candidate.skills && candidate.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {candidate.skills.slice(0, 3).map((skill) => (
                                  <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
