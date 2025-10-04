import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useOrganization } from '@/contexts/OrganizationContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { organization } = useOrganization();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header 
            className="h-14 border-b flex items-center px-4 sticky top-0 z-10"
            style={{
              backgroundColor: `${organization?.primary_color}10` || 'transparent'
            }}
          >
            <SidebarTrigger />
            <div className="ml-4 flex-1">
              <h1 className="text-lg font-semibold">
                {organization?.brand_name || organization?.name || 'NexHire'}
              </h1>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
