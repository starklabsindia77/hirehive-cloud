import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Save, Download, Loader2 } from 'lucide-react';
import { Candidate } from '@/hooks/useCandidates';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSavedSearches } from '@/hooks/useSavedSearches';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useJobs } from '@/hooks/useJobs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface SearchFilters {
  name: string;
  skills: string[];
  skillsMatchAll: boolean;
  minExperience: number;
  maxExperience: number;
  currentCompany: string;
  location: string;
  stage: string;
  status: string;
  assignedTo: string;
  jobId: string;
  appliedFrom: Date | undefined;
  appliedTo: Date | undefined;
  updatedFrom: Date | undefined;
  updatedTo: Date | undefined;
}

interface EnhancedCandidateSearchProps {
  candidates: Candidate[];
  onFilteredResults: (filtered: Candidate[]) => void;
}

export function EnhancedCandidateSearch({ candidates, onFilteredResults }: EnhancedCandidateSearchProps) {
  const { savedSearches, createSavedSearch, deleteSavedSearch } = useSavedSearches('candidate');
  const { members: teamMembers } = useTeamMembers();
  const { jobs } = useJobs();
  
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    skills: [],
    skillsMatchAll: false,
    minExperience: 0,
    maxExperience: 100,
    currentCompany: '',
    location: '',
    stage: 'all',
    status: 'all',
    assignedTo: 'all',
    jobId: 'all',
    appliedFrom: undefined,
    appliedTo: undefined,
    updatedFrom: undefined,
    updatedTo: undefined,
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [saveSearchOpen, setSaveSearchOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleSearch = () => {
    let filtered = candidates;

    if (filters.name) {
      filtered = filtered.filter(c =>
        c.full_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.skills.length > 0) {
      if (filters.skillsMatchAll) {
        filtered = filtered.filter(c =>
          filters.skills.every(skill =>
            c.skills?.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
          )
        );
      } else {
        filtered = filtered.filter(c =>
          filters.skills.some(skill =>
            c.skills?.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
          )
        );
      }
    }

    filtered = filtered.filter(c =>
      c.experience_years === null ||
      (c.experience_years >= filters.minExperience && c.experience_years <= filters.maxExperience)
    );

    if (filters.currentCompany) {
      filtered = filtered.filter(c =>
        c.current_company?.toLowerCase().includes(filters.currentCompany.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(c =>
        c.current_company?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.stage !== 'all') {
      filtered = filtered.filter(c => c.stage === filters.stage);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.assignedTo !== 'all') {
      filtered = filtered.filter(c => c.assigned_to === filters.assignedTo);
    }

    if (filters.appliedFrom) {
      filtered = filtered.filter(c => new Date(c.created_at) >= filters.appliedFrom!);
    }

    if (filters.appliedTo) {
      filtered = filtered.filter(c => new Date(c.created_at) <= filters.appliedTo!);
    }

    if (filters.updatedFrom) {
      filtered = filtered.filter(c => new Date(c.updated_at) >= filters.updatedFrom!);
    }

    if (filters.updatedTo) {
      filtered = filtered.filter(c => new Date(c.updated_at) <= filters.updatedTo!);
    }

    onFilteredResults(filtered);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!filters.skills.includes(skillInput.trim())) {
        setFilters({ ...filters, skills: [...filters.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFilters({ ...filters, skills: filters.skills.filter(s => s !== skill) });
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      skills: [],
      skillsMatchAll: false,
      minExperience: 0,
      maxExperience: 100,
      currentCompany: '',
      location: '',
      stage: 'all',
      status: 'all',
      assignedTo: 'all',
      jobId: 'all',
      appliedFrom: undefined,
      appliedTo: undefined,
      updatedFrom: undefined,
      updatedTo: undefined,
    });
    setSkillInput('');
    onFilteredResults(candidates);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast.error('Please enter a search name');
      return;
    }

    try {
      await createSavedSearch(searchName, filters);
      toast.success('Search saved successfully');
      setSaveSearchOpen(false);
      setSearchName('');
    } catch (error) {
      console.error('Error saving search:', error);
      toast.error('Failed to save search');
    }
  };

  const handleLoadSearch = (search: any) => {
    setFilters(search.filters);
    handleSearch();
    toast.success(`Loaded search: ${search.name}`);
  };

  const handleExportResults = async () => {
    setExporting(true);
    try {
      const filtered = candidates.filter(() => true); // Use current filtered results
      handleSearch(); // Get current filter state
      
      const csvContent = [
        ['Name', 'Email', 'Phone', 'Company', 'Position', 'Experience', 'Skills', 'Stage', 'Status'].join(','),
        ...filtered.map(c => [
          c.full_name,
          c.email,
          c.phone || '',
          c.current_company || '',
          c.current_position || '',
          c.experience_years || '',
          (c.skills || []).join('; '),
          c.stage,
          c.status
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates-search-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      
      toast.success('Search results exported successfully');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export results');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Search
          </div>
          <div className="flex gap-2">
            <Dialog open={saveSearchOpen} onOpenChange={setSaveSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Search</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-name">Search Name</Label>
                    <Input
                      id="search-name"
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      placeholder="e.g., Senior React Developers"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSaveSearch}>Save Search</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" onClick={handleExportResults} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Label className="w-full">Saved Searches:</Label>
            {savedSearches.map((search) => (
              <Badge
                key={search.id}
                variant="secondary"
                className="cursor-pointer flex items-center gap-1"
              >
                <span onClick={() => handleLoadSearch(search)}>{search.name}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                  onClick={() => deleteSavedSearch(search.id)}
                />
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Candidate Name</Label>
            <Input
              id="name"
              placeholder="Search by name..."
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Current Company</Label>
            <Input
              id="company"
              placeholder="Filter by company..."
              value={filters.currentCompany}
              onChange={(e) => setFilters({ ...filters, currentCompany: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (Press Enter to add)</Label>
            <Input
              id="skills"
              placeholder="e.g., React, TypeScript..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            {filters.skills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={filters.skillsMatchAll}
                    onCheckedChange={(checked) => setFilters({ ...filters, skillsMatchAll: checked })}
                  />
                  <Label className="text-sm">Match all skills (AND logic)</Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minExperience}
                onChange={(e) => setFilters({ ...filters, minExperience: parseInt(e.target.value) || 0 })}
                className="w-24"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxExperience}
                onChange={(e) => setFilters({ ...filters, maxExperience: parseInt(e.target.value) || 100 })}
                className="w-24"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned">Assigned To</Label>
            <Select value={filters.assignedTo} onValueChange={(value) => setFilters({ ...filters, assignedTo: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select recruiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Recruiters</SelectItem>
                {teamMembers.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.display_name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Pipeline Stage</Label>
            <Select value={filters.stage} onValueChange={(value) => setFilters({ ...filters, stage: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="phone_screen">Phone Screen</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Applied Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !filters.appliedFrom && "text-muted-foreground")}
                  >
                    {filters.appliedFrom ? format(filters.appliedFrom, "PP") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.appliedFrom}
                    onSelect={(date) => setFilters({ ...filters, appliedFrom: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !filters.appliedTo && "text-muted-foreground")}
                  >
                    {filters.appliedTo ? format(filters.appliedTo, "PP") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.appliedTo}
                    onSelect={(date) => setFilters({ ...filters, appliedTo: date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button onClick={handleClearFilters} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}