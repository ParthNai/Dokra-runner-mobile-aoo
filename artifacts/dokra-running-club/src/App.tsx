import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { UserProvider } from "@/context/UserContext";

import ProfileScreen from "@/pages/profile";
import EditProfileScreen from "@/pages/edit-profile";
import ChangePhotoScreen from "@/pages/change-photo";
import ProfileUpdatedScreen from "@/pages/profile-updated";
import ActivityShareScreen from "@/pages/activity-share";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={ProfileScreen} />
      <Route path="/edit-profile" component={EditProfileScreen} />
      <Route path="/change-photo" component={ChangePhotoScreen} />
      <Route path="/profile-updated" component={ProfileUpdatedScreen} />
      <Route path="/activity-share" component={ActivityShareScreen} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            {/* Desktop wrapper for mobile app feel */}
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-0 sm:p-4 md:p-8">
              <div className="w-full max-w-[390px] h-[100dvh] sm:h-[844px] bg-background relative sm:rounded-[40px] sm:overflow-hidden sm:shadow-[0_0_0_12px_rgba(30,30,30,1),0_0_0_14px_rgba(60,60,60,1),0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute inset-0 overflow-y-auto scrollbar-hide bg-background">
                  <Router />
                </div>
              </div>
            </div>
          </WouterRouter>
        </UserProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
