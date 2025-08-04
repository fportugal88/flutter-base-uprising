import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova solicitação',
    message: 'Você tem uma nova solicitação pendente de aprovação',
    timestamp: '2 min atrás',
    read: false,
    type: 'info'
  },
  {
    id: '2', 
    title: 'Aprovação concluída',
    message: 'Sua solicitação de férias foi aprovada',
    timestamp: '1 hora atrás',
    read: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Reunião amanhã',
    message: 'Lembrete: Reunião de equipe às 09:00',
    timestamp: '3 horas atrás',
    read: true,
    type: 'warning'
  }
];

export function NotificationDropdown() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'error':
        return <X className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <Bell className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs">
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {mockNotifications.length > 0 ? (
            mockNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border-b hover:bg-accent/50 cursor-pointer ${
                  !notification.read ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{notification.title}</p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          )}
        </div>
        {mockNotifications.length > 0 && (
          <div className="p-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              Ver todas as notificações
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}