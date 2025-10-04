import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotes } from '@/hooks/useNotes';

interface NotesSectionProps {
  candidateId: string;
}

export function NotesSection({ candidateId }: NotesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const { notes, loading, createNote } = useNotes(candidateId);
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSaving(true);
    try {
      await createNote(newNote.trim());
      toast({
        title: 'Success',
        description: 'Note added successfully',
      });
      setNewNote('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isAdding ? (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Textarea
              placeholder="Enter your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={4}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={saving || !newNote.trim()}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Note
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notes.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No notes yet</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {new Date(note.created_at).toLocaleString()}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
