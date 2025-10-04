import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useComments } from '@/hooks/useComments';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { format } from 'date-fns';

interface CommentsSectionProps {
  candidateId: string;
}

export function CommentsSection({ candidateId }: CommentsSectionProps) {
  const { comments, loading, createComment } = useComments(candidateId);
  const { members: teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await createComment(content, isInternal);
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
      setContent('');
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

  const getAuthorName = (authorId: string) => {
    const member = teamMembers.find((m) => m.user_id === authorId);
    return member?.display_name || member?.email || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments & Collaboration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <div className="space-y-4 border-b pb-6">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment about this candidate..."
            rows={4}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="internal"
                checked={isInternal}
                onCheckedChange={setIsInternal}
              />
              <Label htmlFor="internal" className="text-sm">
                Internal only (not visible to candidate)
              </Label>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to add one!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`border rounded-lg p-4 space-y-2 ${
                    comment.is_internal ? 'bg-muted/30' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {getAuthorName(comment.author_id)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    {comment.is_internal && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Internal
                      </span>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
