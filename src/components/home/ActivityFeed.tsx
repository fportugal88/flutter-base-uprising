import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const activities = [
  {
    id: 1,
    user: { name: 'Maria Santos', role: 'Product Manager', avatar: '/placeholder.svg' },
    time: '2h',
    content: 'Acabamos de lançar a nova feature de analytics! 🚀 Parabéns a toda a equipe de desenvolvimento pelo trabalho incrível.',
    likes: 12,
    comments: 5,
    shares: 2
  },
  {
    id: 2,
    user: { name: 'Carlos Lima', role: 'UX Designer', avatar: '/placeholder.svg' },
    time: '4h',
    content: 'Compartilhando alguns insights do workshop de design thinking que participei ontem. Quem mais tem interesse em discutir metodologias ágeis?',
    likes: 8,
    comments: 3,
    shares: 1
  },
  {
    id: 3,
    user: { name: 'Ana Costa', role: 'HR Business Partner', avatar: '/placeholder.svg' },
    time: '6h',
    content: 'Lembrete: as inscrições para o programa de mentoria estão abertas até sexta-feira! Não percam essa oportunidade de crescimento.',
    likes: 15,
    comments: 7,
    shares: 4
  }
];

export function ActivityFeed() {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-headline-small text-gray-900">Feed da Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback>{activity.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-body-medium font-semibold text-gray-900">{activity.user.name}</h4>
                    <p className="text-caption text-gray-500">{activity.user.role} • {activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-body-medium text-gray-700 mb-4 leading-relaxed">{activity.content}</p>
                
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-uber-blue flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    <span className="text-caption">{activity.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-uber-blue flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-caption">{activity.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-uber-blue flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span className="text-caption">{activity.shares}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}