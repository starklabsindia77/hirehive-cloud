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
import { Mail, ArrowRight } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>
      <Select value={selectedStage} onValueChange={setSelectedStage}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Change stage to..." />
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
        Update Stage
      </Button>
      <Button variant="outline" size="sm" onClick={onClearSelection}>
        Clear
      </Button>
    </div>
  );
}
