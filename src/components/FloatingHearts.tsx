import { Heart } from "lucide-react";

const FloatingHearts = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating Hearts */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`absolute floating-hearts`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 1}s`,
            animationDuration: `${6 + i}s`,
          }}
        >
          <Heart 
            className="text-love-accent opacity-30 love-glow" 
            size={20 + Math.random() * 15}
            fill="currentColor"
          />
        </div>
      ))}
      
      {/* Additional smaller hearts */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`small-${i}`}
          className={`absolute floating-hearts`}
          style={{
            right: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 100}%`,
            animationDelay: `${(i + 3) * 1.5}s`,
            animationDuration: `${8 + i}s`,
          }}
        >
          <Heart 
            className="text-love-primary opacity-20" 
            size={12 + Math.random() * 8}
            fill="currentColor"
          />
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;