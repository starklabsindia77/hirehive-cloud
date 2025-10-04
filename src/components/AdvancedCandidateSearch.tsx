import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';
import { Candidate } from '@/hooks/useCandidates';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFilters {
  name: string;
  skills: string[];
  minExperience: number;
  maxExperience: number;
  currentCompany: string;
  stage: string;
  status: string;
}

interface AdvancedCandidateSearchProps {
  candidates: Candidate[];
  onFilteredResults: (filtered: Candidate[]) => void;
}

export function AdvancedCandidateSearch({ candidates, onFilteredResults }: AdvancedCandidateSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    skills: [],
    minExperience: 0,
    maxExperience: 100,
    currentCompany: '',
    stage: 'all',
    status: 'all',
  });
  const [skillInput, setSkillInput] = useState('');

  const handleSearch = () => {
    let filtered = candidates;

    // Name filter
    if (filters.name) {
      filtered = filtered.filter(c =>
        c.full_name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(c =>
        filters.skills.some(skill =>
          c.skills?.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
        )
      );
    }

    // Experience filter
    filtered = filtered.filter(c =>
      c.experience_years === null ||
      (c.experience_years >= filters.minExperience &&
       c.experience_years <= filters.maxExperience)
    );

    // Company filter
    if (filters.currentCompany) {
      filtered = filtered.filter(c =>
        c.current_company?.toLowerCase().includes(filters.currentCompany.toLowerCase())
      );
    }

    // Stage filter
    if (filters.stage !== 'all') {
      filtered = filtered.filter(c => c.stage === filters.stage);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status);
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
      minExperience: 0,
      maxExperience: 100,
      currentCompany: '',
      stage: 'all',
      status: 'all',
    });
    setSkillInput('');
    onFilteredResults(candidates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="skills">Skills (Press Enter to add)</Label>
            <Input
              id="skills"
              placeholder="e.g., React, TypeScript..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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
