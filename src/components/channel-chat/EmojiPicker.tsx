import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  trigger: React.ReactNode;
}

const COMMON_EMOJIS = [
  '👍', '👎', '❤️', '💔', '😂', '🤣', '😭', '😢', '😡', '🤬', 
  '😮', '😱', '🤯', '😍', '🥰', '😘', '🤔', '🙄', '😴', '🤐',
  '🔥', '💯', '⭐', '✨', '💎', '👏', '🙌', '🎉', '🎊', '🎁',
  '🚀', '💪', '🏆', '🥇', '👑', '🎯', '⚡', '🌟', '💫', '🔮'
];

export const EmojiPicker = ({ isOpen, onClose, onEmojiSelect, trigger }: EmojiPickerProps) => {
  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <Popover open={isOpen} onOpenChange={onClose}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" side="top" align="center">
        <div className="grid grid-cols-8 gap-1">
          {COMMON_EMOJIS.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              className="w-8 h-8 p-0 text-lg hover:bg-gray-100 transition-colors"
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};