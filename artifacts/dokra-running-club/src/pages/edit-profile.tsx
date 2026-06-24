import { useUser } from "@/context/UserContext";
import { ArrowLeft, Camera, User, Mail, Phone, Calendar, MapPin, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const stateCityMap: Record<string, string[]> = {
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Karnataka": ["Bengaluru", "Mysore", "Hubli"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"]
};

export default function EditProfileScreen() {
  const { profile, updateProfile } = useUser();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    mobileNumber: profile.mobileNumber,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    state: profile.state,
    city: profile.city,
  });

  const handleSave = () => {
    updateProfile(formData);
    setLocation("/profile-updated");
  };

  const cities = stateCityMap[formData.state] || [];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background text-foreground flex flex-col"
      >
        <header className="flex items-center p-4 pt-6 border-b border-border/50 bg-background/95 backdrop-blur z-10 sticky top-0">
          <Link href="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1 flex flex-col items-center mr-8">
            <h1 className="text-lg font-bold text-white">Edit Profile</h1>
            <p className="text-xs text-muted-foreground">Update your personal information</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 pb-24">
          <div className="flex justify-center mb-8 mt-4">
            <Link href="/change-photo" className="relative block">
              <div className="w-20 h-20 rounded-full border border-border p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                  {profile.profilePhoto && (
                    <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="pl-11 bg-card border-border text-white h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">Email (Read Only)</label>
              <div className="relative opacity-60">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={profile.email}
                  readOnly
                  className="pl-11 bg-card border-border text-muted-foreground h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={formData.mobileNumber}
                  onChange={e => setFormData({...formData, mobileNumber: e.target.value})}
                  className="pl-11 bg-card border-border text-white h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                  placeholder="DD/MM/YYYY"
                  className="pl-11 bg-card border-border text-white h-12 rounded-xl focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">Gender</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}>
                  <SelectTrigger className="pl-11 bg-card border-border text-white h-12 rounded-xl focus:ring-primary">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Male" className="text-white focus:bg-primary/20">Male</SelectItem>
                    <SelectItem value="Female" className="text-white focus:bg-primary/20">Female</SelectItem>
                    <SelectItem value="Other" className="text-white focus:bg-primary/20">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">State</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={formData.state} onValueChange={v => setFormData({...formData, state: v, city: stateCityMap[v]?.[0] || ""})}>
                  <SelectTrigger className="pl-11 bg-card border-border text-white h-12 rounded-xl focus:ring-primary">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {Object.keys(stateCityMap).map(state => (
                      <SelectItem key={state} value={state} className="text-white focus:bg-primary/20">{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">City</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                <Select value={formData.city} onValueChange={v => setFormData({...formData, city: v})}>
                  <SelectTrigger className="pl-11 bg-card border-border text-white h-12 rounded-xl focus:ring-primary">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {cities.map(city => (
                      <SelectItem key={city} value={city} className="text-white focus:bg-primary/20">{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground pl-1 uppercase tracking-wider font-semibold">Club (Auto-assigned)</label>
              <div className="relative opacity-80">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-accent" />
                <Input 
                  value={`DOKRA ${formData.city} Running Club`}
                  readOnly
                  className="pl-11 bg-card border-border text-accent font-medium h-12 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border/50 max-w-[390px] mx-auto">
          <button 
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-primary/20"
          >
            SAVE CHANGES
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
