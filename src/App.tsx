import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DataAssistantWithSidebar from "./pages/DataAssistantWithSidebar";
import MyRequests from "./pages/MyRequests";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import RequestDetails from "./pages/RequestDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
          <Routes>
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/data-assistant" 
                element={
                  <ProtectedRoute>
                    <DataAssistantWithSidebar />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute>
                    <MyRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route 
                path="/my-requests/:id"
                element={
                  <ProtectedRoute>
                    <RequestDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ChatProvider>
        </AuthProvider>
        </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
