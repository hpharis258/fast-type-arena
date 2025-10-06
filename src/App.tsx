import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import Stats from "./pages/Stats";
import Friends from "./pages/Friends";
import DuelResults from "./pages/DuelResults";
import Shop from "./pages/Shop";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import DuelNotification from "@/components/DuelNotification";

const queryClient = new QueryClient();

function AppContent() {
  const navigate = useNavigate();

  const handleAcceptDuel = (duelId: string) => {
    navigate(`/friends?duel=${duelId}`);
  };

  return (
    <>
      <DuelNotification onAcceptDuel={handleAcceptDuel} />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/duel-results" element={<DuelResults />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
