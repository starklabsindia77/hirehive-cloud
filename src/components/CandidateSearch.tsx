import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CandidateSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  stageFilter: string;
  onStageFilterChange: (value: string) => void;
}

export function CandidateSearch({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stageFilter,
  onStageFilterChange,
}: CandidateSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search candidates by name, email, or company..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="hired">Hired</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
      <Select value={stageFilter} onValueChange={onStageFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Stages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stages</SelectItem>
          <SelectItem value="applied">Applied</SelectItem>
          <SelectItem value="screening">Screening</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
          <SelectItem value="offer">Offer</SelectItem>
          <SelectItem value="hired">Hired</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
