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
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
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
          
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Próximo Feriado</p>
                  <p className="text-sm text-muted-foreground">25 de Maio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ArrowUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-3xl font-bold">15</span>
                  <p className="text-sm text-muted-foreground">Dias de Férias</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ArrowUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <span className="text-3xl font-bold">5</span>
                  <p className="text-sm text-muted-foreground">Mensagens</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Rápido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Resumo do Dia</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tarefas Concluídas</span>
                <span className="font-semibold">8/12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Reuniões Hoje</span>
                <span className="font-semibold">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Horas Trabalhadas</span>
                <span className="font-semibold">6h 30m</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Próximas Atividades</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Reunião de equipe - 14:00</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Entrega do projeto - 16:00</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Review de código - 17:30</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
