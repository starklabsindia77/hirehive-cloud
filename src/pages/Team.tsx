import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Users, MoreVertical, Shield, UserMinus, Loader2 } from 'lucide-react';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { InviteTeamMemberDialog } from '@/components/InviteTeamMemberDialog';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Team() {
  const { members, loading, assignRole, removeRole, removeMember, refetch } = useTeamMembers();
  const { user } = useAuth();
  const { toast } = useToast();
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: 'bg-purple-500',
      admin: 'bg-blue-500',
      hiring_manager: 'bg-orange-500',
      recruiter: 'bg-green-500',
      viewer: 'bg-gray-500',
      super_admin: 'bg-red-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  const handleToggleRole = async (memberId: string, role: string, hasRole: boolean) => {
    setActionLoading(true);
    try {
      if (hasRole) {
        await removeRole(memberId, role);
        toast({
          title: 'Role Removed',
          description: `Successfully removed ${role} role`,
        });
      } else {
        await assignRole(memberId, role);
        toast({
          title: 'Role Assigned',
          description: `Successfully assigned ${role} role`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setActionLoading(true);
    try {
      await removeMember(memberId);
      toast({
        title: 'Member Removed',
        description: 'Team member has been removed from the organization',
      });
      setRemovingMember(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove member',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const currentUserRoles = members.find(m => m.user_id === user?.id)?.roles || [];
  const canManageTeam = currentUserRoles.includes('owner') || currentUserRoles.includes('admin');

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Management</h1>
            <p className="text-muted-foreground">
              Manage your team members and their roles
            </p>
          </div>
          {canManageTeam && (
            <InviteTeamMemberDialog onInvite={refetch} />
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              View and manage all team members in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Team Members</h3>
                <p className="text-muted-foreground mb-4">
                  Start by inviting team members to your organization
                </p>
                {canManageTeam && <InviteTeamMemberDialog onInvite={refetch} />}
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => {
                  const isCurrentUser = member.user_id === user?.id;
                  const isOwner = member.roles.includes('owner');

                  return (
                    <Card key={member.user_id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                                {getInitials(member.display_name, member.email)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {member.display_name || member.email}
                                </h3>
                                {isCurrentUser && (
                                  <Badge variant="outline">You</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {member.email}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {member.roles.map((role) => (
                                  <Badge 
                                    key={role} 
                                    className={`${getRoleBadgeColor(role)} text-white`}
                                  >
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          {canManageTeam && !isCurrentUser && !isOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={actionLoading}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleToggleRole(
                                    member.user_id, 
                                    'admin', 
                                    member.roles.includes('admin')
                                  )}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  {member.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleRole(
                                    member.user_id, 
                                    'recruiter', 
                                    member.roles.includes('recruiter')
                                  )}
                                >
                                  <Users className="mr-2 h-4 w-4" />
                                  {member.roles.includes('recruiter') ? 'Remove Recruiter' : 'Make Recruiter'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleRole(
                                    member.user_id, 
                                    'hiring_manager', 
                                    member.roles.includes('hiring_manager')
                                  )}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  {member.roles.includes('hiring_manager') ? 'Remove Hiring Manager' : 'Make Hiring Manager'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setRemovingMember(member.user_id)}
                                  className="text-destructive"
                                >
                                  <UserMinus className="mr-2 h-4 w-4" />
                                  Remove from Team
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!removingMember} onOpenChange={(open) => !open && setRemovingMember(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this team member? They will lose access to the organization
                and all its resources.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removingMember && handleRemoveMember(removingMember)}
                disabled={actionLoading}
                className="bg-destructive hover:bg-destructive/90"
              >
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Remove Member
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
