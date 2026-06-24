import { useUser } from "@/context/UserContext";
import { BottomNav } from "@/components/BottomNav";
import { Bell, Settings, MapPin, User, Trophy, Activity, HeadphonesIcon, LogOut, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfileScreen() {
  const { profile } = useUser();

  const menuItems = [
    { icon: User, label: "Edit Profile", href: "/edit-profile" },
    { icon: Trophy, label: "Achievements", href: "/achievements" },
    { icon: Activity, label: "My Activities", href: "/activity-share" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: HeadphonesIcon, label: "Help & Support", href: "/support" },
  ];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background text-foreground pb-20"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 pt-6">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-accent text-sm font-bold tracking-widest">DOKRA</h1>
            <p className="text-xs text-muted-foreground tracking-widest">RUNNING CLUB</p>
          </div>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </header>

        {/* Profile Hero */}
        <div className="flex flex-col items-center mt-6 mb-8 px-4">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full border-2 border-accent p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                {profile.profilePhoto && (
                  <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{profile.fullName}</h2>
          <div className="flex items-center space-x-1 text-muted-foreground mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{profile.city}, {profile.state}</span>
          </div>
          <p className="text-accent text-sm font-medium">{profile.clubName}</p>
        </div>

        {/* Stats Row */}
        <div className="px-4 mb-8">
          <div className="bg-card rounded-2xl p-4 flex justify-between divide-x divide-border border border-border">
            <div className="flex flex-col items-center flex-1">
              <span className="text-xl font-bold text-white mb-1">{profile.totalDistance}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">Total KM</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-xl font-bold text-white mb-1">{profile.totalActivities}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">Activities</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-xl font-bold text-white mb-1">{profile.totalSteps.toLocaleString()}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider text-center">Total Steps</span>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="px-4 space-y-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href} className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            );
          })}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-sm font-medium text-destructive">Logout</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90%] max-w-[350px] bg-card border-border rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to log out of DOKRA Running Club?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-row space-x-2 mt-4">
                <AlertDialogCancel className="flex-1 mt-0 bg-background border-border text-white hover:bg-muted hover:text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <BottomNav />
      </motion.div>
    </AnimatePresence>
  );
}
