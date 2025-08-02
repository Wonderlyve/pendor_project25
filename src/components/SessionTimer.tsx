
import { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SessionTimerProps {
  timeRemaining: number; // en secondes
}

const SessionTimer = ({ timeRemaining }: SessionTimerProps) => {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(time / (24 * 60 * 60));
  const hours = Math.floor((time % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((time % (60 * 60)) / 60);
  const seconds = time % 60;

  const progress = ((timeRemaining - time) / timeRemaining) * 100;

  return (
    <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <Clock className="w-6 h-6" />
          Temps Restant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Countdown Display */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-black/50 rounded-lg p-2">
            <div className="text-2xl font-bold text-red-400">{days}</div>
            <div className="text-xs text-gray-400">JOURS</div>
          </div>
          <div className="bg-black/50 rounded-lg p-2">
            <div className="text-2xl font-bold text-orange-400">{hours}</div>
            <div className="text-xs text-gray-400">HEURES</div>
          </div>
          <div className="bg-black/50 rounded-lg p-2">
            <div className="text-xl font-bold text-yellow-400">{minutes}</div>
            <div className="text-xs text-gray-400">MIN</div>
          </div>
          <div className="bg-black/50 rounded-lg p-2">
            <div className="text-xl font-bold text-green-400">{seconds}</div>
            <div className="text-xs text-gray-400">SEC</div>
          </div>
        </div>

        {/* Session Info */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-300">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Session #3 - Décembre 2024</span>
          </div>
          
          {/* Urgency Indicator */}
          {days <= 2 && (
            <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-2">
              <p className="text-red-400 font-bold text-sm">⚠️ TEMPS CRITIQUE !</p>
              <p className="text-xs text-gray-300">Achetez des boosts maintenant</p>
            </div>
          )}
          
          {days <= 5 && days > 2 && (
            <div className="bg-yellow-900/50 border border-yellow-500/50 rounded-lg p-2">
              <p className="text-yellow-400 font-bold text-sm">⏰ Plus que {days} jours</p>
              <p className="text-xs text-gray-300">Restez concentré sur l'objectif</p>
            </div>
          )}
        </div>

        {/* Next Session Preview */}
        <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-700">
          <p>Prochaine session : 15 janvier 2025</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTimer;
