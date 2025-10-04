import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Candidate } from '@/hooks/useCandidates';

interface CandidateMatch {
  candidate_id: string;
  score: number;
  strengths: string[];
  weaknesses?: string[];
  recommendation: string;
}

interface CandidateMatchScoreProps {
  jobId: string;
  jobRequirements: string;
  candidates: Candidate[];
}

export function CandidateMatchScore({ jobId, jobRequirements, candidates }: CandidateMatchScoreProps) {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<CandidateMatch[]>([]);
  const { toast } = useToast();

  const handleMatchCandidates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('match-candidates', {
        body: {
          jobRequirements,
          candidates: candidates.map(c => ({
            id: c.id,
            full_name: c.full_name,
            experience_years: c.experience_years,
            skills: c.skills,
            current_position: c.current_position,
            current_company: c.current_company
          }))
        }
      });

      if (error) throw error;

      if (data?.success && data?.matches) {
        setMatches(data.matches.sort((a: CandidateMatch, b: CandidateMatch) => b.score - a.score));
        toast({
          title: 'Success!',
          description: 'Candidates matched successfully',
        });
      } else {
        throw new Error('Failed to match candidates');
      }
    } catch (error: any) {
      console.error('Error matching candidates:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to match candidates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Candidate Matching</span>
          <Button onClick={handleMatchCandidates} disabled={loading || candidates.length === 0}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Match Candidates
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Click "Match Candidates" to find the best fits for this position using AI</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const candidate = candidates.find(c => c.id === match.candidate_id);
              if (!candidate) return null;

              return (
                <div key={match.candidate_id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{candidate.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {candidate.current_position} {candidate.current_company && `at ${candidate.current_company}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(match.score)}`}>
                        {match.score}
                      </div>
                      <Badge variant={getScoreBadge(match.score)} className="mt-1">
                        {match.score >= 80 ? 'Excellent' : match.score >= 60 ? 'Good' : 'Fair'} Match
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {match.strengths.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium">Strengths</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {match.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="outline" className="bg-success/10">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {match.weaknesses && match.weaknesses.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4 text-warning" />
                          <span className="text-sm font-medium">Areas for Growth</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {match.weaknesses.map((weakness, idx) => (
                            <Badge key={idx} variant="outline" className="bg-warning/10">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                        <p className="text-sm text-muted-foreground">{match.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
