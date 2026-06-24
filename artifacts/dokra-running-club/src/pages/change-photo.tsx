import { useUser } from "@/context/UserContext";
import { ArrowLeft, Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

export default function ChangePhotoScreen() {
  const { profile, updateProfile } = useUser();
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateProfile({ profilePhoto: event.target.result as string });
          setLocation("/edit-profile");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updateProfile({ profilePhoto: null });
    setLocation("/edit-profile");
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background text-foreground flex flex-col"
      >
        <header className="flex items-center p-4 pt-6 border-b border-border/50">
          <Link href="/edit-profile" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1 flex flex-col items-center mr-8">
            <h1 className="text-lg font-bold text-white">Change Profile Photo</h1>
            <p className="text-xs text-muted-foreground">Choose your new profile picture</p>
          </div>
        </header>

        <div className="flex-1 p-4 flex flex-col items-center pt-12">
          <div className="relative mb-12">
            <div className="w-40 h-40 rounded-full border-2 border-border p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {profile.profilePhoto ? (
                  <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-20 h-20 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-background shadow-lg">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="w-full space-y-3">
            <button 
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center space-x-4 p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white">Take Photo</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={cameraInputRef}
              onChange={handleFileSelect}
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center space-x-4 p-4 bg-card rounded-xl border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-white">Choose from Gallery</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            <button 
              onClick={handleRemovePhoto}
              className="w-full flex items-center space-x-4 p-4 bg-card rounded-xl border border-destructive/20 hover:bg-destructive/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-sm font-medium text-destructive">Remove Photo</span>
            </button>
          </div>

          <div className="mt-auto w-full pt-8 pb-4">
            <Link href="/edit-profile">
              <button className="w-full bg-transparent border border-border text-white font-medium h-14 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Temporary import for the fallback icon
import { User } from "lucide-react";
