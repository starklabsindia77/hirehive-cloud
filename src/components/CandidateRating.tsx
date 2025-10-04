import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRatings } from '@/hooks/useRatings';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CandidateRatingProps {
  candidateId: string;
}

export function CandidateRating({ candidateId }: CandidateRatingProps) {
  const { ratings, loading, createRating, refetch } = useRatings(candidateId);
  const { members: teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !category) {
      toast({
        title: 'Validation Error',
        description: 'Please select a rating and category',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await createRating(rating, category, feedback);
      
      // Log activity
      if (user) {
        await supabase.rpc('log_org_activity', {
          _user_id: user.id,
          _activity_type: 'rating_added',
          _description: `Rated candidate ${rating}/5 for ${category}`,
          _candidate_id: candidateId,
          _job_id: null,
          _metadata: { rating, category }
        });
      }
      
      toast({
        title: 'Success',
        description: 'Rating submitted successfully',
      });
      setRating(0);
      setCategory('');
      setFeedback('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getReviewerName = (reviewerId: string) => {
    const member = teamMembers.find((m) => m.user_id === reviewerId);
    return member?.display_name || member?.email || 'Unknown';
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings & Feedback</CardTitle>
        {ratings.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({ratings.length} ratings)
            </span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Rating Form */}
        <div className="space-y-4 border-b pb-6">
          <h4 className="font-semibold">Add Your Rating</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 cursor-pointer transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical Skills</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="culture">Culture Fit</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="overall">Overall Impression</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback (Optional)</label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the candidate..."
              rows={3}
            />
          </div>

          <Button onClick={handleSubmit} disabled={submitting}>
            Submit Rating
          </Button>
        </div>

        {/* Ratings List */}
        <div className="space-y-4">
          <h4 className="font-semibold">Team Ratings</h4>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading ratings...</p>
          ) : ratings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No ratings yet</p>
          ) : (
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{getReviewerName(r.reviewer_id)}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {r.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= r.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.feedback && (
                    <p className="text-sm text-muted-foreground">{r.feedback}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
