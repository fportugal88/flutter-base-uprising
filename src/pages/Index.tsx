import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUp, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';

const Index = () => {
  const { user, signOut } = useAuth();

  const getUserName = () => {
    if (user?.user_metadata?.display_name) {
      return user.user_metadata.display_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário';
  };

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Bom dia, {getUserName()}
            </h1>
            <p className="text-muted-foreground">Bem-vindo ao painel da empresa</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-3xl font-bold">2</span>
                  <p className="text-sm text-muted-foreground">Aprovações Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
