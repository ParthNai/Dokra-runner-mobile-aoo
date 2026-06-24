import { useUser } from "@/context/UserContext";
import { Check, MapPin } from "lucide-react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileUpdatedScreen() {
  const { profile } = useUser();

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 pb-20 relative"
      >
        <div className="flex flex-col items-center flex-1 justify-center w-full max-w-sm mx-auto pt-10">
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
          >
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
              <Check className="w-8 h-8 text-white" strokeWidth={3} />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Profile Updated!
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground text-center mb-10"
          >
            Your profile has been updated successfully.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full flex flex-col items-center bg-card border border-border rounded-2xl p-6 mb-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
            
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full border-2 border-accent p-1 bg-background z-10 relative">
                <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                  {profile.profilePhoto && (
                    <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-1 z-10 relative">{profile.fullName}</h2>
            <div className="flex items-center space-x-1 text-muted-foreground mb-3 z-10 relative">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">{profile.city}, {profile.state}</span>
            </div>
            <p className="text-accent text-sm font-medium z-10 relative text-center px-4">{profile.clubName}</p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full bg-card rounded-2xl p-4 flex justify-between divide-x divide-border border border-border mb-auto"
          >
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
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-3 mt-8"
        >
          <Link href="/">
            <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-primary/20 mb-3">
              VIEW PROFILE
            </button>
          </Link>
          <Link href="/">
            <button className="w-full bg-transparent border border-border text-white font-medium h-14 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors">
              BACK TO HOME
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
