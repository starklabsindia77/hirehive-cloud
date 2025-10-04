import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Clock, Play, Search, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tutorials = [
  {
    id: 1,
    title: 'Getting Started with HireHive',
    description: 'Learn the basics and set up your account in under 10 minutes',
    duration: '8:45',
    category: 'getting-started',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 2,
    title: 'Creating Your First Job Posting',
    description: 'Step-by-step guide to creating and publishing job postings',
    duration: '6:20',
    category: 'getting-started',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 3,
    title: 'Managing Candidate Pipeline',
    description: 'Master the drag-and-drop candidate pipeline and stages',
    duration: '12:15',
    category: 'candidates',
    difficulty: 'Intermediate',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 4,
    title: 'AI Resume Parsing Deep Dive',
    description: 'Understand how AI extracts and structures candidate data',
    duration: '10:30',
    category: 'candidates',
    difficulty: 'Intermediate',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 5,
    title: 'Setting Up Workflow Automation',
    description: 'Automate repetitive tasks with powerful workflows',
    duration: '15:45',
    category: 'automation',
    difficulty: 'Advanced',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 6,
    title: 'Email Sequences and Drip Campaigns',
    description: 'Create automated email sequences for candidate engagement',
    duration: '11:25',
    category: 'automation',
    difficulty: 'Intermediate',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 7,
    title: 'Scheduling and Managing Interviews',
    description: 'Efficiently schedule and coordinate interviews',
    duration: '9:15',
    category: 'interviews',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 8,
    title: 'Team Collaboration Best Practices',
    description: 'Work effectively with your hiring team',
    duration: '13:40',
    category: 'advanced',
    difficulty: 'Intermediate',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 9,
    title: 'Customizing Your Career Page',
    description: 'Brand your public-facing career site',
    duration: '7:55',
    category: 'advanced',
    difficulty: 'Beginner',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
  {
    id: 10,
    title: 'Analytics and Reporting',
    description: 'Track metrics and generate insightful reports',
    duration: '14:20',
    category: 'advanced',
    difficulty: 'Advanced',
    thumbnail: '/placeholder.svg',
    videoUrl: '#',
  },
];

const categories = [
  { id: 'all', label: 'All Videos' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'candidates', label: 'Candidates' },
  { id: 'automation', label: 'Automation' },
  { id: 'interviews', label: 'Interviews' },
  { id: 'advanced', label: 'Advanced' },
];

export default function VideoTutorials() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'default';
      case 'Intermediate': return 'secondary';
      case 'Advanced': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Video Tutorials</h1>
          <p className="text-muted-foreground mt-1">
            Learn HireHive with step-by-step video guides
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tutorials..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {filteredTutorials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tutorials found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search or category filter
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video bg-muted">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6 mr-2" />
                      Watch Now
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tutorial.duration}
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{tutorial.title}</CardTitle>
                    <Badge variant={getDifficultyColor(tutorial.difficulty)}>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {tutorial.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div className="flex items-center gap-4">
              <BookOpen className="h-10 w-10" />
              <div>
                <h3 className="text-xl font-semibold mb-1">Need more help?</h3>
                <p className="opacity-90">
                  Check out our comprehensive documentation
                </p>
              </div>
            </div>
            <Button variant="secondary" size="lg">
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
