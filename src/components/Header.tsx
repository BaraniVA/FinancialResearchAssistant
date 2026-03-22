import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Wifi, WifiOff, RefreshCw, BarChart3, Search, Bell } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function Header({ isOnline, onRefresh, isLoading }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 z-50 sticky top-0">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-surface-100 border border-surface-200 flex items-center justify-center shadow-sm">
            <BarChart3 className="w-4 h-4 text-surface-800" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-serif font-semibold text-surface-900 text-lg tracking-tight">Fin</span>
            <span className="font-serif font-semibold text-brand-700 text-lg tracking-tight">Sight</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-2">
          <span className="text-surface-300">|</span>
          <span className="text-xs text-surface-500 font-medium">AI Financial Research</span>
        </div>
      </div>

      {/* Center: Live indicator */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-50 border border-surface-200">
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-[10px] font-mono font-medium text-surface-600">{isOnline ? 'MARKETS LIVE' : 'OFFLINE MODE'}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-50 border border-surface-200">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          <span className="text-[10px] font-mono font-medium text-emerald-700">AI POWERED</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className="text-xs text-surface-500 hidden sm:block">{isOnline ? 'Connected' : 'Offline'}</span>
        </div>
        <div className="w-px h-4 bg-surface-200 mx-1" />
        <button className="btn-ghost">
          <Bell className="w-4 h-4 text-surface-600" />
        </button>
        {onRefresh && (
          <button onClick={onRefresh} disabled={isLoading} className="btn-ghost">
            <RefreshCw className={`w-4 h-4 text-surface-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-surface-100 border border-surface-200 flex items-center justify-center ml-1 cursor-pointer hover:bg-surface-200 transition-colors">
          <Search className="w-3.5 h-3.5 text-surface-700" />
        </div>
      </div>
    </header>
  );
}
