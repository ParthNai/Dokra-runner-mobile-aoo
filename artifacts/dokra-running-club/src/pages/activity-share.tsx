import React, { useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { SiInstagram, SiWhatsapp, SiFacebook } from "react-icons/si";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import { ShareCard, ActivityData } from "@/components/ShareCard";
import { useToast } from "@/hooks/use-toast";

const mockActivity: ActivityData = {
  type: "Morning Run",
  date: "Nov 1, 2023, 7:15 PM",
  city: "Palanpur",
  state: "Gujarat",
  country: "India",
  temperature: "27°C",
  weatherCondition: "Clear Night",
  weatherIcon: "moon",
  distance: 8.53,
  duration: "1:06:29",
  avgPace: "9'09\"",
  avgSpeed: "6.5 km/h",
  calories: 568,
  steps: 10698,
  moveKcal: 636,
  moveGoal: 1200,
};

export default function ActivityShareScreen() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `dokra_run_${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
      toast({
        title: "Saved successfully",
        description: "Your activity card has been saved to your device.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error saving",
        description: "Failed to save the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "dokra_activity.png", { type: "image/png" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "DOKRA Running Club - Activity",
            text: "Check out my run! #DOKRARunningClub",
            files: [file],
          });
        } else {
          // Fallback: download
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "dokra_activity.png";
          a.click();
          toast({
            title: "Sharing not supported",
            description: "We saved the image instead since sharing is not supported on this browser.",
          });
        }
      }, "image/png");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error sharing",
        description: "Failed to share the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center p-4 pt-6 shrink-0">
        <Link href="/" className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="flex-1 text-center font-bold text-lg mr-8 text-white">Share Activity</h1>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pb-48 pt-4 px-4 flex justify-center">
        {/* We use a wrapper to scale the card down to fit most screens if needed, 
            but for html2canvas we want the actual dom element to be the correct size. 
            A common trick is to render it at full size but scale the container visually. */}
        <div className="origin-top scale-[0.85] sm:scale-100 flex justify-center w-full">
          <ShareCard ref={cardRef} activity={mockActivity} />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 w-full max-w-[390px] bg-zinc-950 border-t border-zinc-800 p-4 pb-safe flex flex-col gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between text-white/70 px-2">
          <span className="text-xs font-bold tracking-wider">SHARE TO</span>
          <div className="flex gap-4">
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <SiInstagram className="w-5 h-5 text-pink-500" />
            </button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <SiWhatsapp className="w-5 h-5 text-green-500" />
            </button>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
              <SiFacebook className="w-5 h-5 text-blue-500" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 bg-zinc-900 border border-zinc-700 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            SAVE
          </button>
          <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 bg-yellow-500 text-black rounded-xl py-4 flex items-center justify-center gap-2 font-black hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            SHARE
          </button>
        </div>
      </div>
    </motion.div>
  );
}