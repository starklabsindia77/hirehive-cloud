import { LayoutDashboard, Briefcase, Users, Settings, LogOut, Calendar, UserCog, Mail, CalendarDays, Video, BarChart3, CreditCard, Activity, FileText, ClipboardCheck, Shield, ShieldCheck, Zap, BookOpen, MessageSquare, HelpCircle, Code, Building2, Database, DollarSign, Lock, TrendingUp, Server, Key, Package } from 'lucide-react';
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
  { title: 'Calendar', url: '/interview-calendar', icon: CalendarDays },
  { title: 'Offers', url: '/offers', icon: FileText },
  { title: 'Onboarding', url: '/onboarding', icon: ClipboardCheck },
  { title: 'Analytics', url: '/analytics', icon: BarChart3 },
  { title: 'Team', url: '/team', icon: UserCog },
  { title: 'Billing', url: '/billing', icon: CreditCard },
  { title: 'Usage', url: '/usage', icon: Activity },
  { title: 'Email Templates', url: '/email-templates', icon: Mail },
  { title: 'Workflows', url: '/workflows', icon: Zap },
  { title: 'Email Sequences', url: '/email-sequences', icon: Mail },
  { title: 'Permissions', url: '/permissions', icon: ShieldCheck },
  { title: 'SSO', url: '/sso-configuration', icon: Shield },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const supportItems = [
  { title: 'Help Center', url: '/help', icon: BookOpen },
  { title: 'Video Tutorials', url: '/videos', icon: Video },
  { title: 'Community', url: '/community', icon: MessageSquare },
  { title: 'Support', url: '/support', icon: HelpCircle },
  { title: 'API Docs', url: '/api-docs', icon: Code },
];

const superAdminItems = [
  { title: 'Platform Overview', url: '/super-admin', icon: LayoutDashboard },
  { title: 'Platform Settings', url: '/platform-settings', icon: Settings },
  { title: 'Subscriptions', url: '/subscription-management', icon: CreditCard },
  { title: 'Plans', url: '/plan-management', icon: Package },
  { title: 'Analytics', url: '/platform-analytics', icon: TrendingUp },
  { title: 'Organizations', url: '/super-admin', icon: Building2 },
  { title: 'Secrets', url: '/platform-secrets', icon: Key },
  { title: 'Documents', url: '/platform-document', icon: FileText },
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
    <Sidebar className={collapsed ? 'w-14' : 'w-64' }  collapsible="icon">
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
        {isSuperAdmin ? (
          <>
            {/* Super Admin Menu */}
            <SidebarGroup>
              <SidebarGroupLabel>Platform Administration</SidebarGroupLabel>
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

            <SidebarGroup>
              <SidebarGroupLabel>Resources</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {supportItems.map((item) => (
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
          </>
        ) : (
          <>
            {/* Regular User Menu */}
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

            <SidebarGroup>
              <SidebarGroupLabel>Support & Docs</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {supportItems.map((item) => (
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
          </>
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
