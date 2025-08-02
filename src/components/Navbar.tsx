
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Car, ShoppingCart, User, Trophy, History } from "lucide-react";

const Navbar = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Trophy },
    { id: "garage", label: "Garage", icon: Car },
    { id: "shop", label: "Boutique", icon: ShoppingCart },
    { id: "history", label: "Historique", icon: History },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="bg-black/80 backdrop-blur-sm border-b border-yellow-500/30 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-yellow-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent">
              Caisse Race
            </span>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${
                    activeTab === item.id 
                      ? "bg-gradient-to-r from-yellow-500 to-blue-500 text-black" 
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* User Account */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-300">Pilote #1247</p>
              <p className="text-xs text-yellow-400">Niveau Gold</p>
            </div>
            <Button variant="outline" size="icon" className="border-yellow-500/50">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
