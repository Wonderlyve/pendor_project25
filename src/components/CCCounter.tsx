
import { Coins, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CCCounterProps {
  currentCC: number;
  targetCC: number;
}

const CCCounter = ({ currentCC, targetCC }: CCCounterProps) => {
  const progress = (currentCC / targetCC) * 100;
  const remaining = targetCC - currentCC;

  return (
    <Card className="bg-gradient-to-r from-yellow-900/30 to-blue-900/30 border-yellow-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-400">
          <Coins className="w-6 h-6" />
          Caisse Coins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current CC Display */}
        <div className="text-center">
          <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent">
            {currentCC}
          </div>
          <p className="text-gray-400">CC collectés</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Progression</span>
            <span className="text-yellow-400">{progress.toFixed(1)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-3 bg-gray-800"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0 CC</span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {targetCC} CC
            </span>
          </div>
        </div>

        {/* Remaining Counter */}
        <div className="text-center p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <p className="text-sm text-blue-300">Il vous reste</p>
          <p className="text-2xl font-bold text-blue-400">{remaining} CC</p>
          <p className="text-xs text-gray-400">pour gagner une moto</p>
        </div>

        {/* Achievement Status */}
        {progress >= 100 ? (
          <div className="text-center p-3 bg-green-900/30 rounded-lg border border-green-500/30">
            <p className="text-green-400 font-bold">🏆 OBJECTIF ATTEINT !</p>
            <p className="text-xs text-gray-400">Vous pouvez acheter une moto</p>
          </div>
        ) : progress >= 80 ? (
          <div className="text-center p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 font-bold">🔥 Presque là !</p>
            <p className="text-xs text-gray-400">Plus que {remaining} CC</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default CCCounter;
