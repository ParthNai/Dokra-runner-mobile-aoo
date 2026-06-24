import React, { forwardRef } from "react";
import { useUser } from "@/context/UserContext";
import { MapPin, Moon, Timer, Flame, Footprints, PersonStanding, Flag } from "lucide-react";

export interface ActivityData {
  type: string;
  date: string;
  city: string;
  state: string;
  country: string;
  temperature: string;
  weatherCondition: string;
  weatherIcon: string;
  distance: number;
  duration: string;
  avgPace: string;
  avgSpeed: string;
  calories: number;
  steps: number;
  moveKcal: number;
  moveGoal: number;
}

interface ShareCardProps {
  activity: ActivityData;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ activity }, ref) => {
    const { profile } = useUser();

    const moveRadius = 36;
    const moveCircumference = 2 * Math.PI * moveRadius;
    const moveOffset = moveCircumference - (activity.moveKcal / activity.moveGoal) * moveCircumference;

    return (
      <div
        ref={ref}
        className="relative w-[390px] h-[693px] overflow-hidden rounded-xl"
        style={{
          background: "radial-gradient(ellipse at 60% 50%, #1a1a0a 0%, #0a0a0a 100%)",
        }}
      >
        {/* Background texture/noise could go here */}

        {/* Route Map (SVG) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg width="280" height="320" viewBox="0 0 280 320" className="opacity-90">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* The Path */}
            <path
              d="M 140,280 C 80,250 40,200 60,150 C 80,100 130,80 160,100 C 200,120 230,100 240,140 C 260,180 240,230 220,260 C 200,290 170,300 140,280 Z"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="6"
              filter="url(#neonGlow)"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Start Marker */}
            <circle cx="140" cy="280" r="6" fill="#ef4444" stroke="#000" strokeWidth="2" />
            
            {/* KM Markers */}
            <g transform="translate(60, 150)">
              <circle cx="0" cy="0" r="10" fill="#111" stroke="#fff" strokeWidth="1.5" />
              <text x="0" y="3" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">1km</text>
            </g>
            <g transform="translate(160, 100)">
              <circle cx="0" cy="0" r="10" fill="#111" stroke="#fff" strokeWidth="1.5" />
              <text x="0" y="3" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">3km</text>
            </g>
            <g transform="translate(240, 140)">
              <circle cx="0" cy="0" r="10" fill="#111" stroke="#fff" strokeWidth="1.5" />
              <text x="0" y="3" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">5km</text>
            </g>
            <g transform="translate(220, 260)">
              <circle cx="0" cy="0" r="10" fill="#111" stroke="#fff" strokeWidth="1.5" />
              <text x="0" y="3" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="bold">7km</text>
            </g>

            {/* Finish Marker */}
            <g transform="translate(130, 285)">
              <circle cx="0" cy="0" r="8" fill="#fff" />
              <text x="0" y="3" fontSize="10" textAnchor="middle">🏁</text>
            </g>
          </svg>
        </div>

        {/* Header Row */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-6 flex justify-between items-start">
          <div className="flex flex-col space-y-1 w-1/3">
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span className="text-white text-xs font-bold leading-none">{activity.city}, {activity.country}</span>
            </div>
            <span className="text-gray-400 text-[10px] leading-tight">{activity.date}</span>
            <div className="flex items-center space-x-1">
              <span className="text-gray-400 text-[10px]">{activity.temperature}, {activity.weatherCondition}</span>
              <Moon className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="flex flex-col items-center justify-start w-1/3">
            <PersonStanding className="w-6 h-6 text-red-500 mb-1" />
            <span className="text-yellow-500 font-black text-sm tracking-wider leading-none">DOKRA</span>
            <span className="text-white text-[8px] font-bold tracking-widest mt-0.5">RUNNING CLUB</span>
          </div>

          <div className="flex flex-col items-end w-1/3 text-right">
            <span className="text-white text-lg font-black italic leading-none tracking-tight">RUN</span>
            <span className="text-yellow-500 text-lg font-black italic leading-none tracking-tight">ACHIEVE</span>
            <span className="text-red-500 text-lg font-black italic leading-none tracking-tight">INSPIRE</span>
          </div>
        </div>

        {/* User Profile Bubble */}
        <div className="absolute top-[18%] left-[30%] flex flex-col items-center">
          <div className="relative">
            <div className="bg-white text-black text-[10px] font-bold px-2 py-0.5 rounded-full absolute -top-5 left-1/2 -translate-x-1/2">
              Me
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-zinc-800">
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs">Me</div>
              )}
            </div>
          </div>
        </div>

        {/* Left Stats Column */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-3">
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 w-28 border border-white/5">
            <div className="text-white font-black text-xl flex items-center gap-1">
              <Timer className="w-4 h-4 text-gray-400" />
              {activity.avgPace}
            </div>
            <div className="text-gray-400 text-xs font-medium">Avg. Pace</div>
          </div>
          
          <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 w-28 border border-white/5">
            <div className="text-white font-black text-xl flex items-center gap-1">
              <Timer className="w-4 h-4 text-gray-400" />
              {activity.duration}
            </div>
            <div className="text-gray-400 text-xs font-medium">Time</div>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-2 w-28 border border-white/5">
            <div className="text-white font-black text-xl flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              {activity.calories}
            </div>
            <div className="text-gray-400 text-xs font-medium">Calories</div>
          </div>
        </div>

        {/* Right Stats Column */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-end space-y-6">
          {/* Move Ring */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg width="80" height="80" viewBox="0 0 80 80" className="transform -rotate-90">
              <circle cx="40" cy="40" r={moveRadius} fill="none" stroke="#222" strokeWidth="6" />
              <circle 
                cx="40" cy="40" r={moveRadius} 
                fill="none" 
                stroke="#ef4444" 
                strokeWidth="6"
                strokeDasharray={moveCircumference}
                strokeDashoffset={moveOffset}
                strokeLinecap="round"
                filter="url(#neonGlow)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-white text-[9px] font-medium leading-tight">Move</span>
              <span className="text-red-500 font-bold text-xs leading-tight">{activity.moveKcal}/{activity.moveGoal}</span>
              <span className="text-gray-400 text-[8px] leading-tight">KCAL</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end space-x-1 mb-0.5">
              <span className="text-gray-400 text-xs font-medium">Steps</span>
              <Footprints className="w-3 h-3 text-yellow-500" />
            </div>
            <div className="text-white font-black text-2xl leading-none">{activity.steps.toLocaleString()}</div>
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end space-x-1 mb-0.5">
              <span className="text-gray-400 text-xs font-medium">Distance</span>
              <MapPin className="w-3 h-3 text-yellow-500" />
            </div>
            <div className="text-white font-black text-2xl leading-none">{activity.distance} <span className="text-sm">KM</span></div>
          </div>
        </div>

        {/* Activity Label */}
        <div className="absolute bottom-16 left-4 z-10">
          <div className="flex items-center space-x-1 mb-1">
            <PersonStanding className="w-4 h-4 text-red-500" />
            <span className="text-gray-400 text-sm font-medium tracking-wide uppercase">Activity</span>
          </div>
          <div className="text-yellow-500 font-black text-3xl italic tracking-tight uppercase leading-none">
            {activity.type}
          </div>
          <div className="w-12 h-1 bg-red-500 mt-2"></div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/80 backdrop-blur-md px-4 py-2 flex items-center justify-between border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-gray-400 text-[10px] font-medium">#DOKRARunningClub</span>
            <span className="text-gray-500 text-[8px]">www.dokrarunningclub.com</span>
          </div>
          <div className="text-white text-[10px] font-bold italic">
            Stay Strong, <span className="text-red-500">Keep Running.</span>
          </div>
        </div>
      </div>
    );
  }
);
ShareCard.displayName = "ShareCard";
