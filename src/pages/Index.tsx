import React from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, ArrowUp, Calendar, Plus, FileText, CalendarClock, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Good morning, Lucas
            </h1>
          </div>
          <Avatar className="w-10 h-10">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
        </div>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search" 
            className="pl-10 h-12 bg-muted/50 border-none"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-2xl font-bold">2</span>
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
              <div className="text-sm text-muted-foreground">Approvals</div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="text-lg font-semibold mb-1">Next</div>
              <div className="text-lg font-semibold">Holiday</div>
              <div className="text-sm text-muted-foreground">May 25</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start h-12 text-left">
            <Plus className="w-4 h-4 mr-3" />
            New Post
          </Button>
          <Button variant="outline" className="w-full justify-start h-12 text-left">
            <FileText className="w-4 h-4 mr-3" />
            Request
          </Button>
          <Button variant="outline" className="w-full justify-start h-12 text-left">
            <CalendarClock className="w-4 h-4 mr-3" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Social Feed */}
      <div className="px-6">
        <h2 className="text-lg font-semibold mb-4">Social Feed</h2>
        <div className="space-y-4">
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Annette Black</h4>
                      <p className="text-sm text-muted-foreground">3h ago</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Post Image Placeholder */}
              <div className="w-full h-32 bg-muted rounded-lg mb-3"></div>
              
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="p-0">
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-sm">12</span>
                </Button>
                <Button variant="ghost" size="sm" className="p-0">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">8</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>AB</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Annette Black</h4>
                      <p className="text-sm text-muted-foreground">3h ago</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
