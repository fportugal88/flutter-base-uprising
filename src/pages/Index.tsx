import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/home/StatsCard';
import { QuickActions } from '@/components/home/QuickActions';
import { ActivityFeed } from '@/components/home/ActivityFeed';
import { PendingApprovals } from '@/components/home/PendingApprovals';
import { Users, CheckSquare, MessageCircle, TrendingUp } from 'lucide-react';

const Index = () => {
  return (
    <AppLayout>
      <div className="p-6 bg-gray-50 min-h-full">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-display-medium font-bold text-gray-900 mb-2">
            Bom dia, João! 👋
          </h1>
          <p className="text-body-large text-gray-600">
            Aqui está um resumo da sua atividade profissional hoje.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Aprovações Pendentes"
            value="12"
            change="+3 desde ontem"
            changeType="positive"
            icon={CheckSquare}
          />
          <StatsCard
            title="Mensagens Não Lidas"
            value="8"
            change="-2 desde ontem"
            changeType="negative"
            icon={MessageCircle}
          />
          <StatsCard
            title="Conexões Ativas"
            value="147"
            change="+12 esta semana"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Progresso da Carreira"
            value="68%"
            change="+5% este mês"
            changeType="positive"
            icon={TrendingUp}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
          
          {/* Pending Approvals */}
          <div className="lg:col-span-1">
            <PendingApprovals />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
