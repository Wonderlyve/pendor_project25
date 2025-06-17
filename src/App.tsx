
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import LiveStreams from "./pages/LiveStreams";
import LiveStream from "./pages/LiveStream";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Channels from "./pages/Channels";
import Notifications from "./pages/Notifications";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";

// Create QueryClient with proper configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/lives" element={<LiveStreams />} />
              <Route path="/live/:id" element={<LiveStream />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
