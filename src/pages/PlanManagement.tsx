import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Package, Plus, Edit, Trash2, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface PlanFormData {
  name: string;
  price_monthly: number;
  price_yearly: number;
  ai_tokens_monthly: number;
  email_credits_monthly: number;
  storage_gb: number;
  team_members_limit: number;
  jobs_limit: number;
  candidates_limit: number;
  features: string[];
  is_active: boolean;
}

export default function PlanManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    price_monthly: 0,
    price_yearly: 0,
    ai_tokens_monthly: 0,
    email_credits_monthly: 0,
    storage_gb: 0,
    team_members_limit: 0,
    jobs_limit: 0,
    candidates_limit: 0,
    features: [],
    is_active: true
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const createPlan = useMutation({
    mutationFn: async (planData: PlanFormData) => {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([planData]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create plan');
      console.error(error);
    }
  });

  const updatePlan = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PlanFormData> }) => {
      const { error } = await supabase
        .from('subscription_plans')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to update plan');
      console.error(error);
    }
  });

  const deletePlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete plan');
      console.error(error);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price_monthly: 0,
      price_yearly: 0,
      ai_tokens_monthly: 0,
      email_credits_monthly: 0,
      storage_gb: 0,
      team_members_limit: 0,
      jobs_limit: 0,
      candidates_limit: 0,
      features: [],
      is_active: true
    });
    setEditingPlan(null);
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      ai_tokens_monthly: plan.ai_tokens_monthly,
      email_credits_monthly: plan.email_credits_monthly,
      storage_gb: plan.storage_gb,
      team_members_limit: plan.team_members_limit,
      jobs_limit: plan.jobs_limit,
      candidates_limit: plan.candidates_limit,
      features: plan.features || [],
      is_active: plan.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPlan) {
      updatePlan.mutate({ id: editingPlan.id, data: formData });
    } else {
      createPlan.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading plans...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Plan Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage subscription plans
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
                <DialogDescription>
                  Configure plan details and limits
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Professional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_monthly">Monthly Price ($)</Label>
                    <Input
                      id="price_monthly"
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_yearly">Yearly Price ($)</Label>
                    <Input
                      id="price_yearly"
                      type="number"
                      value={formData.price_yearly}
                      onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai_tokens_monthly">AI Tokens/Month</Label>
                    <Input
                      id="ai_tokens_monthly"
                      type="number"
                      value={formData.ai_tokens_monthly}
                      onChange={(e) => setFormData({ ...formData, ai_tokens_monthly: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email_credits_monthly">Email Credits/Month</Label>
                    <Input
                      id="email_credits_monthly"
                      type="number"
                      value={formData.email_credits_monthly}
                      onChange={(e) => setFormData({ ...formData, email_credits_monthly: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storage_gb">Storage (GB)</Label>
                    <Input
                      id="storage_gb"
                      type="number"
                      value={formData.storage_gb}
                      onChange={(e) => setFormData({ ...formData, storage_gb: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="team_members_limit">Team Members</Label>
                    <Input
                      id="team_members_limit"
                      type="number"
                      value={formData.team_members_limit}
                      onChange={(e) => setFormData({ ...formData, team_members_limit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobs_limit">Jobs Limit</Label>
                    <Input
                      id="jobs_limit"
                      type="number"
                      value={formData.jobs_limit}
                      onChange={(e) => setFormData({ ...formData, jobs_limit: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="candidates_limit">Candidates Limit</Label>
                    <Input
                      id="candidates_limit"
                      type="number"
                      value={formData.candidates_limit}
                      onChange={(e) => setFormData({ ...formData, candidates_limit: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active Plan</Label>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans && plans.length > 0 ? (
            plans.map((plan) => (
              <Card key={plan.id} className={!plan.is_active ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {plan.name}
                        {!plan.is_active && <Badge variant="secondary">Inactive</Badge>}
                      </CardTitle>
                      <CardDescription className="text-2xl font-bold mt-2">
                        ${plan.price_monthly}/mo
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(plan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this plan?')) {
                            deletePlan.mutate(plan.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{plan.ai_tokens_monthly.toLocaleString()} AI tokens/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{plan.email_credits_monthly.toLocaleString()} email credits/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{plan.storage_gb} GB storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>Up to {plan.team_members_limit} team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{plan.jobs_limit} active jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span>{plan.candidates_limit.toLocaleString()} candidates</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No plans found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first subscription plan to get started
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
