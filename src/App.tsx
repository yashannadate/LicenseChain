import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import your pages
import Index from "./pages/Index";
import Apply from "./pages/Apply";
import Verify from "./pages/Verify";
import UserDashboard from "./pages/UserDashboard"; // Make sure this file exists!
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 1. Home Page */}
          <Route path="/" element={<Index />} />
          
          {/* 2. Apply Page */}
          <Route path="/apply" element={<Apply />} />
          
          {/* 3. Verify Page */}
          <Route path="/verify" element={<Verify />} />
          
          {/* 4. User Dashboard (The one that was 404ing) */}
          <Route path="/user-dashboard" element={<UserDashboard />} />
          
          {/* 5. Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* 6. Catch-all for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;