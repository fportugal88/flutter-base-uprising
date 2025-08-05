import React from 'react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, BarChart3, Bell, Search, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { UserDropdown } from './UserDropdown';
import { BottomNavigation } from './BottomNavigation';

const sidebarItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Descobrir', url: '/data-assistant', icon: BarChart3 },
  { title: 'Minhas Solicitações', url: '/my-requests', icon: FileText },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  
  const getUserInitials = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    return user?.user_metadata?.display_name || user?.email || 'Usuário';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-gray-200 hidden md:flex">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">F</span>
              </div>
              <span className="text-sm sm:text-base font-semibold text-gray-900 hidden sm:block">Fusion Data Bridge</span>
            </div>
          </div>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          className={({ isActive }) => 
                            `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-3 rounded-lg transition-colors min-h-[48px] ${
                              isActive 
                                ? 'bg-uber-blue text-white' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`
                          }
                        >
                          <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          <span className="text-sm sm:text-base hidden sm:block">{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-14 sm:h-16 border-b border-gray-200 bg-white px-3 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <SidebarTrigger className="md:hidden p-2" />
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-10 w-60 lg:w-80 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <NotificationDropdown />
              <UserDropdown />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
        
        {/* Bottom Navigation for Mobile */}
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
}