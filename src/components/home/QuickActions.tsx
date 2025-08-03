import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Users, MessageSquare, Calendar } from 'lucide-react';

const actions = [
  { title: 'Nova Publicação', icon: Plus, color: 'bg-uber-blue' },
  { title: 'Solicitar Aprovação', icon: FileText, color: 'bg-uber-green' },
  { title: 'Convidar Colega', icon: Users, color: 'bg-purple-500' },
  { title: 'Iniciar Chat', icon: MessageSquare, color: 'bg-orange-500' },
  { title: 'Agendar Reunião', icon: Calendar, color: 'bg-pink-500' },
];

export function QuickActions() {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-headline-small text-gray-900">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto flex flex-col items-center p-4 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-2`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-caption text-gray-700 text-center">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}