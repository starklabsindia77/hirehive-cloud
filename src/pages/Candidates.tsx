import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Briefcase, Loader2 } from 'lucide-react';
import { useCandidates, Candidate } from '@/hooks/useCandidates';
import { CreateCandidateDialog } from '@/components/CreateCandidateDialog';
import { CandidateSearch } from '@/components/CandidateSearch';
import { BulkActionsBar } from '@/components/BulkActionsBar';
import { EnhancedCandidateSearch } from '@/components/EnhancedCandidateSearch';

const stages = [
  { name: 'new', label: 'New Applications', color: 'border-primary' },
  { name: 'screening', label: 'Phone Screen', color: 'border-accent' },
  { name: 'interview', label: 'Interview', color: 'border-success' },
  { name: 'offer', label: 'Offer', color: 'border-warning' },
];

export default function Candidates() {
  const navigate = useNavigate();
  const { candidates, loading, refetch } = useCandidates();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filteredFromAdvanced, setFilteredFromAdvanced] = useState<Candidate[] | null>(null);

  const baseFilteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      searchTerm === '' ||
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.current_company &&
        candidate.current_company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || candidate.status === statusFilter;

    const matchesStage =
      stageFilter === 'all' || candidate.stage === stageFilter;

    return matchesSearch && matchesStatus && matchesStage;
  });

  const filteredCandidates = filteredFromAdvanced || baseFilteredCandidates;

  const getCandidatesByStage = (stage: string) => {
    return filteredCandidates.filter((c) => c.stage === stage);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, candidateId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== candidateId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
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

      <CandidateSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
      />

      <div className="mb-6">
        <EnhancedCandidateSearch 
          candidates={candidates} 
          onFilteredResults={setFilteredFromAdvanced}
        />
      </div>

      {filteredCandidates.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Checkbox
            checked={selectedIds.length === filteredCandidates.length && filteredCandidates.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <span>Select all ({filteredCandidates.length} candidates)</span>
        </div>
      )}

      {candidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates yet</h3>
            <p className="text-muted-foreground">Candidates will appear here once they apply to your job postings</p>
          </CardContent>
        </Card>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No candidates match your filters</p>
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
                    <Card key={candidate.id} className="transition-all hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedIds.includes(candidate.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCandidate(candidate.id, checked as boolean)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div
                            className="flex items-start gap-3 flex-1 cursor-pointer"
                            onClick={() => navigate(`/candidates/${candidate.id}`)}
                          >
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                {getInitials(candidate.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">
                                {candidate.full_name}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {candidate.current_position || 'No position'}
                                {candidate.current_company &&
                                  ` at ${candidate.current_company}`}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {candidate.email}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant={
                                    candidate.status === 'active'
                                      ? 'default'
                                      : candidate.status === 'hired'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {candidate.status}
                                </Badge>
                                {candidate.skills && candidate.skills.length > 0 && (
                                  <Badge variant="outline">
                                    {candidate.skills.length} skills
                                  </Badge>
                                )}
                              </div>
                            </div>
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

      <BulkActionsBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
        onSuccess={refetch}
      />
    </DashboardLayout>
  );
}
