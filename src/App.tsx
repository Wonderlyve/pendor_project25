
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import useScrollToTop from "@/hooks/useScrollToTop";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import MyBriefings from "./pages/MyBriefings";
import LiveStreams from "./pages/LiveStreams";
import LiveStream from "./pages/LiveStream";
import Brief from "./pages/Brief";
import BriefPlayer from "./pages/BriefPlayer";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Channels from "./pages/Channels";
import ChannelSubscription from "./pages/ChannelSubscription";
import JoinChannel from "./pages/JoinChannel";
import Notifications from "./pages/Notifications";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import HelpSupport from "./pages/HelpSupport";
import BulkPost from "./pages/BulkPost";
import Update from "./pages/Update";
import UpdateChecker from "./components/UpdateChecker";
import NotFound from "./pages/NotFound";
import Story from "./pages/Story";

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
          <UpdateChecker />
          <BrowserRouter>
            <ScrollToTopProvider />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-briefings" element={<MyBriefings />} />
              <Route path="/channels" element={<Channels />} />
              <Route path="/channel-subscription/:channelId" element={<ChannelSubscription />} />
              <Route path="/join-channel/:shareCode" element={<JoinChannel />} />
              <Route path="/lives" element={<LiveStreams />} />
              <Route path="/live/:id" element={<LiveStream />} />
              <Route path="/brief" element={<Brief />} />
              <Route path="/brief/:id" element={<BriefPlayer />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/help" element={<HelpSupport />} />
              <Route path="/bulk-post" element={<BulkPost />} />
              <Route path="/update" element={<Update />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about" element={<About />} />
              <Route path="/story" element={<Story />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Component to handle scroll to top on route change
const ScrollToTopProvider = () => {
  useScrollToTop();
  return null;
};

export default App;
