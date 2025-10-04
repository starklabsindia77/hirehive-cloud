import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, ThumbsUp, Eye, Search, TrendingUp, Plus, Users } from 'lucide-react';

const forumPosts = [
  {
    id: 1,
    title: 'Best practices for candidate screening?',
    author: 'Sarah Johnson',
    avatar: '/placeholder.svg',
    category: 'Best Practices',
    replies: 24,
    views: 156,
    likes: 12,
    timestamp: '2 hours ago',
    excerpt: 'What are your top tips for efficiently screening candidates? Looking for ways to improve our process...',
    tags: ['screening', 'tips', 'workflow'],
  },
  {
    id: 2,
    title: 'How to integrate with external calendar apps?',
    author: 'Mike Chen',
    avatar: '/placeholder.svg',
    category: 'Technical',
    replies: 18,
    views: 203,
    likes: 15,
    timestamp: '5 hours ago',
    excerpt: 'Has anyone successfully integrated interview scheduling with Google Calendar or Outlook?',
    tags: ['integration', 'calendar', 'technical'],
  },
  {
    id: 3,
    title: 'Remote hiring success stories',
    author: 'Emma Davis',
    avatar: '/placeholder.svg',
    category: 'Discussion',
    replies: 42,
    views: 387,
    likes: 28,
    timestamp: '1 day ago',
    excerpt: 'Share your experiences with building remote teams. What worked well for you?',
    tags: ['remote', 'hiring', 'stories'],
  },
  {
    id: 4,
    title: 'Customizing email templates - need help!',
    author: 'James Wilson',
    avatar: '/placeholder.svg',
    category: 'Support',
    replies: 8,
    views: 94,
    likes: 5,
    timestamp: '1 day ago',
    excerpt: 'Trying to add custom variables to email templates but running into issues...',
    tags: ['email', 'templates', 'help'],
  },
  {
    id: 5,
    title: 'AI candidate scoring accuracy',
    author: 'Lisa Anderson',
    avatar: '/placeholder.svg',
    category: 'Features',
    replies: 31,
    views: 445,
    likes: 22,
    timestamp: '2 days ago',
    excerpt: 'How accurate have you found the AI scoring? Curious about others\' experiences.',
    tags: ['ai', 'scoring', 'feedback'],
  },
];

const categories = [
  { id: 'all', label: 'All Posts', count: 1247 },
  { id: 'best-practices', label: 'Best Practices', count: 356 },
  { id: 'technical', label: 'Technical', count: 218 },
  { id: 'features', label: 'Features', count: 189 },
  { id: 'discussion', label: 'Discussion', count: 284 },
  { id: 'support', label: 'Support', count: 200 },
];

export default function Community() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = forumPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Community Forum</h1>
            <p className="text-muted-foreground mt-1">
              Connect with other HireHive users and share knowledge
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8,549</div>
              <p className="text-xs text-muted-foreground">+180 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">+24 today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">432</div>
              <p className="text-xs text-muted-foreground">5% above average</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm">
                {cat.label} ({cat.count})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{post.author}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                            <Badge variant="outline">{post.category}</Badge>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground">{post.excerpt}</p>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 ml-auto text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.replies}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.likes}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="flex flex-col md:flex-row items-center justify-between p-6 gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Join the conversation</h3>
              <p className="opacity-90">
                Share your insights and learn from the community
              </p>
            </div>
            <Button variant="secondary" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
