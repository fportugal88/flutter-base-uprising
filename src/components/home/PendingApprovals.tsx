import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const approvals = [
  {
    id: 1,
    title: 'Solicitação de Férias - Maria Santos',
    type: 'Férias',
    priority: 'Alta',
    daysAgo: 2,
    description: '15 dias em dezembro'
  },
  {
    id: 2,
    title: 'Reembolso - Carlos Lima',
    type: 'Financeiro',
    priority: 'Média',
    daysAgo: 1,
    description: 'Equipamentos de trabalho - R$ 1.200'
  },
  {
    id: 3,
    title: 'Promoção - Ana Costa',
    type: 'RH',
    priority: 'Alta',
    daysAgo: 5,
    description: 'Senior Developer para Tech Lead'
  }
];

export function PendingApprovals() {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-headline-small text-gray-900">Aprovações Pendentes</CardTitle>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {approvals.length} pendentes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.map((approval) => (
          <div key={approval.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-body-medium font-semibold text-gray-900 mb-1">{approval.title}</h4>
                <p className="text-caption text-gray-600">{approval.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(approval.priority)} variant="secondary">
                  {approval.priority}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-caption text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{approval.daysAgo} dias atrás</span>
                <span>•</span>
                <span>{approval.type}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-3 h-3 mr-1" />
                  Rejeitar
                </Button>
                <Button size="sm" className="bg-uber-green hover:bg-uber-green/90 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aprovar
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full mt-4 border-gray-200 text-gray-700 hover:bg-gray-50">
          Ver todas as aprovações
        </Button>
      </CardContent>
    </Card>
  );
}