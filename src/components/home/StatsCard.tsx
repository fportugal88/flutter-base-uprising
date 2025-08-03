import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export function StatsCard({ title, value, change, changeType, icon: Icon }: StatsCardProps) {
  const changeColor = {
    positive: 'text-uber-green',
    negative: 'text-red-500',
    neutral: 'text-gray-500'
  }[changeType];

  return (
    <Card className="bg-white border-gray-200 hover:shadow-base transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-body-small text-gray-600 mb-1">{title}</p>
            <p className="text-headline-medium font-semibold text-gray-900 mb-2">{value}</p>
            <p className={`text-caption font-medium ${changeColor}`}>{change}</p>
          </div>
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-uber-blue" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}