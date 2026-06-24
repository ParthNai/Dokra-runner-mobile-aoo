import { Link, useLocation } from "wouter";
import { Home, Activity, Users, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Activity, label: "Activity", href: "/activity" },
    { icon: Users, label: "Community", href: "/community" },
    { icon: BarChart2, label: "Leaderboard", href: "/leaderboard" },
    { icon: User, label: "Profile", href: "/" },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-[390px] bg-background border-t border-border pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center w-16 h-full space-y-1">
              <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px]", isActive ? "text-primary font-medium" : "text-muted-foreground")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
