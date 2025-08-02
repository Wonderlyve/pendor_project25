
import { Zap, Shield, RefreshCw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  onBoostPurchase: () => void;
}

const QuickActions = ({ onBoostPurchase }: QuickActionsProps) => {
  const quickActions = [
    {
      id: "boost",
      title: "Boost +30 CC",
      description: "Gain instantané",
      price: "1,50€",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
      action: onBoostPurchase,
    },
    {
      id: "shield",
      title: "Seconde Chance",
      description: "Évite la perte de CC",
      price: "2,00€",
      icon: Shield,
      color: "from-blue-500 to-purple-500",
      action: () => console.log("Shield purchased"),
    },
    {
      id: "refill",
      title: "Recharge CC",
      description: "Restaure 50 CC",
      price: "3,00€",
      icon: RefreshCw,
      color: "from-green-500 to-teal-500",
      action: () => console.log("Refill purchased"),
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-400">
          <ShoppingCart className="w-6 h-6" />
          Actions Rapides
        </CardTitle>
        <p className="text-sm text-gray-400">
          Boostez vos chances de victoire
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={action.action}
              className={`w-full h-auto p-4 bg-gradient-to-r ${action.color} hover:opacity-90 transition-all transform hover:scale-105`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-bold text-white">{action.title}</p>
                    <p className="text-xs text-white/80">{action.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{action.price}</p>
                  <p className="text-xs text-white/80">Achat</p>
                </div>
              </div>
            </Button>
          );
        })}
        
        {/* Daily Special */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-purple-400">🎁 Offre du jour</p>
              <p className="text-xs text-gray-300">Pack Boost x3 + Shield</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-pink-400 line-through">8,50€</p>
              <p className="text-lg font-bold text-green-400">5,99€</p>
            </div>
          </div>
          <Button className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
            Acheter le Pack
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
