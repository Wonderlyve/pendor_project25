import { Button } from '@/components/ui/button';

interface ReactionDisplayProps {
  groupedReactions: Record<string, { emoji: string; count: number; users: string[]; hasUserReacted: boolean }>;
  onReactionClick: (emoji: string) => void;
}

export const ReactionDisplay = ({ groupedReactions, onReactionClick }: ReactionDisplayProps) => {
  const reactionEntries = Object.entries(groupedReactions);

  if (reactionEntries.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactionEntries.map(([emoji, data]) => (
        <Button
          key={emoji}
          variant="ghost"
          size="sm"
          className={`h-6 px-2 text-xs rounded-full border ${
            data.hasUserReacted 
              ? 'bg-blue-100 border-blue-300 text-blue-700' 
              : 'bg-gray-100 border-gray-200 hover:bg-gray-200'
          }`}
          onClick={() => onReactionClick(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{data.count}</span>
        </Button>
      ))}
    </div>
  );
};