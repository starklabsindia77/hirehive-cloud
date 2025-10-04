import { LayoutDashboard, Briefcase, Users, Settings, LogOut, Calendar, UserCog, Mail, CalendarDays, Video, BarChart3, CreditCard, Activity, FileText, ClipboardCheck, Shield, ShieldCheck } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from './ui/button';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Jobs', url: '/jobs', icon: Briefcase },
  { title: 'Candidates', url: '/candidates', icon: Users },
  { title: 'Interviews', url: '/interviews', icon: Video },
  { title: 'Calendar', url: '/calendar', icon: CalendarDays },
  { title: 'Offers', url: '/offers', icon: FileText },
  { title: 'Onboarding', url: '/onboarding', icon: ClipboardCheck },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Team', url: '/team', icon: UserCog },
  { title: 'Billing', url: '/billing', icon: CreditCard },
  { title: 'Usage', url: '/usage', icon: Activity },
  { title: 'Email Templates', url: '/email-templates', icon: Mail },
  { title: 'Permissions', url: '/permissions', icon: ShieldCheck },
  { title: 'SSO', url: '/sso', icon: Shield },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const superAdminItems = [
  { title: 'Super Admin', url: '/super-admin', icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { organization } = useOrganization();
  const { isSuperAdmin } = useUserRole();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getNavClass = (path: string) => {
    return location.pathname === path
      ? 'bg-primary text-primary-foreground font-medium'
      : 'hover:bg-accent hover:text-accent-foreground';
  };

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          {organization?.logo_url ? (
            <img 
              src={organization.logo_url} 
              alt={organization.brand_name || organization.name}
              className={collapsed ? 'h-8 w-8' : 'h-10 w-10'}
            />
          ) : (
            <div 
              className={`${collapsed ? 'h-8 w-8' : 'h-10 w-10'} rounded-lg flex items-center justify-center font-bold text-white`}
              style={{ backgroundColor: organization?.primary_color || '#0ea5e9' }}
            >
              {(organization?.brand_name || organization?.name || 'N')?.[0]}
            </div>
          )}
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm">
                {organization?.brand_name || organization?.name || 'NexHire'}
              </span>
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
