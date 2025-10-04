import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, ArrowRight, Trash2, UserPlus, Tag } from "lucide-react";
import { BulkEmailDialog } from "./BulkEmailDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface BulkActionsBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSuccess: () => void;
}

export function BulkActionsBar({
  selectedIds,
  onClearSelection,
  onSuccess,
}: BulkActionsBarProps) {
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { members: teamMembers } = useTeamMembers();

  const handleBulkStageUpdate = async () => {
    if (!selectedStage || selectedIds.length === 0 || !user) return;

    setLoading(true);
    try {
      for (const candidateId of selectedIds) {
        const { error } = await supabase.rpc("update_org_candidate_stage", {
          _user_id: user.id,
          _candidate_id: candidateId,
          _new_stage: selectedStage,
        });
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Updated ${selectedIds.length} candidate(s) to ${selectedStage} stage`,
      });
      onSuccess();
      onClearSelection();
      setSelectedStage("");
    } catch (error: any) {
      console.error("Bulk update error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedAssignee || selectedIds.length === 0 || !user) return;

    setLoading(true);
    try {
      const { data: orgSchema } = await supabase.rpc("get_user_org_schema", {
        _user_id: user.id,
      });

      if (!orgSchema) throw new Error("Organization not found");

      for (const candidateId of selectedIds) {
        const { error } = await supabase
          .from(`${orgSchema}.candidates` as any)
          .update({ assigned_to: selectedAssignee })
          .eq("id", candidateId);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Assigned ${selectedIds.length} candidate(s)`,
      });
      onSuccess();
      onClearSelection();
      setSelectedAssignee("");
    } catch (error: any) {
      console.error("Bulk assign error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !user) return;

    setLoading(true);
    try {
      const { data: orgSchema } = await supabase.rpc("get_user_org_schema", {
        _user_id: user.id,
      });

      if (!orgSchema) throw new Error("Organization not found");

      for (const candidateId of selectedIds) {
        const { error } = await supabase
          .from(`${orgSchema}.candidates` as any)
          .delete()
          .eq("id", candidateId);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Deleted ${selectedIds.length} candidate(s)`,
      });
      onSuccess();
      onClearSelection();
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 max-w-[95vw] bg-background border rounded-lg shadow-lg p-3 sm:p-4 flex flex-wrap items-center gap-2 z-50">
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedIds.length} selected
        </span>
        
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Change stage..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleBulkStageUpdate}
          disabled={!selectedStage || loading}
          size="sm"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Update
        </Button>

        <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Assign to..." />
          </SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member.user_id} value={member.user_id}>
                {member.display_name || member.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleBulkAssign}
          disabled={!selectedAssignee || loading}
          size="sm"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Assign
        </Button>
        
        <BulkEmailDialog selectedIds={selectedIds} />
        
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => setShowDeleteDialog(true)}
          disabled={loading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
        
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Candidates?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.length} candidate(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
