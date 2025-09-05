import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Clock } from 'lucide-react';

interface FeedSelectorProps {
  currentFeed: 'personalized' | 'community' | 'new';
  onFeedChange: (feed: 'personalized' | 'community' | 'new') => void;
  isAuthenticated?: boolean;
}

export const FeedSelector = ({ currentFeed, onFeedChange, isAuthenticated }: FeedSelectorProps) => {
  const feeds = [
    {
      id: 'personalized' as const,
      label: 'Pour Toi',
      icon: TrendingUp,
      description: 'Feed personnalisé basé sur vos préférences',
      requiresAuth: true
    },
    {
      id: 'community' as const,
      label: 'Communauté',
      icon: Users,
      description: 'Les posts les plus engageants',
      requiresAuth: false
    },
    {
      id: 'new' as const,
      label: 'Nouveaux',
      icon: Clock,
      description: 'Derniers pronostics publiés',
      requiresAuth: false
    }
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-background/50 backdrop-blur-sm border-b">
      <div className="flex gap-2 overflow-x-auto">
        {feeds.map((feed) => {
          const Icon = feed.icon;
          const isDisabled = feed.requiresAuth && !isAuthenticated;
          const isActive = currentFeed === feed.id;

          return (
            <Button
              key={feed.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => !isDisabled && onFeedChange(feed.id)}
              disabled={isDisabled}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Icon className="w-4 h-4" />
              {feed.label}
              {isDisabled && (
                <Badge variant="secondary" className="text-xs">
                  Connexion requise
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
      
      <div className="text-sm text-muted-foreground">
        {feeds.find(f => f.id === currentFeed)?.description}
      </div>
    </div>
  );
};