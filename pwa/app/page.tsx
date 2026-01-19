'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Nfc } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const connectWallet = useAppStore((state) => state.connectWallet);
  const initializeAuth = useAppStore((state) => state.initializeAuth);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isHydrated = useAppStore((state) => state.isHydrated);
  const [isConnecting, setIsConnecting] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/card-home');
    }
  }, [isHydrated, isAuthenticated, router]);

  const handleConnectWallet = () => {
    setIsConnecting(true);
    connectWallet();
    
    // Simulate connection delay then redirect
    setTimeout(() => {
      setIsConnecting(false);
      router.push('/card-home');
    }, 1000);
  };

  // Show loading or nothing while checking auth
  if (!isHydrated) {
    return (
      <div className="bg-white text-black font-mono min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-neon-green animate-pulse"></div>
          <span className="text-neon-green">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render the landing page if authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white text-black font-mono antialiased selection:bg-neon-green selection:text-black min-h-screen flex flex-col">
      <div className="relative flex-1 flex flex-col w-full max-w-md mx-auto py-8">
        {/* Header */}
        <header className="flex px-4 items-center justify-between mb-16 opacity-0 animate-fade-in border-b border-neon-green/20 pb-4" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2">
            <span className="text-neon-green font-bold text-lg tracking-tight">PhantomCard</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-neon-green animate-pulse"></div>
            <p className='text-xs text-gray-600'>v1.0.0</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center text-center gap-10 px-6">
          {/* Terminal Prompt */}
          <div className="flex flex-col items-center text-xs sm:text-sm text-gray-600 gap-1 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex gap-2">
              <span className="text-neon-green">$</span>
              <span>whoami</span>
            </div>
            <div className="flex gap-2 text-gray-300">
              <span>&gt;</span>
              <span>privacy-first on-chain credit</span>
              <span className="w-2 h-4 bg-neon-green animate-blink inline-block align-middle"></span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="flex flex-col gap-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight text-neon-green">
              Spend crypto like a credit card.
              <span className="block text-white mt-2">Privately.</span>
              <span className='flex items-center gap-2 justify-center text-solana-purple/80 text-lg pt-4'>Powered by NFC <Nfc className='h-4 w-4'/></span>
            </h1>
            <p className="text-gray-700 text-sm leading-relaxed max-w-xs mx-auto">
              Establish credit without exposing your identity. The first ZK-powered payment rail on Solana.
            </p>
          </div>

          {/* Features List */}
          <div className="w-full max-w-70 space-y-3 text-left opacity-0 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 text-sm group">
              <span className="text-neon-green font-bold">&gt;</span>
              <span className="text-gray-300 group-hover:text-white transition-colors">On-chain Lending</span>
            </div>
            <div className="flex items-center gap-3 text-sm group">
              <span className="text-neon-green font-bold">&gt;</span>
              <span className="text-gray-300 group-hover:text-white transition-colors">NFC Payments</span>
            </div>
            <div className="flex items-center gap-3 text-sm group">
              <span className="text-neon-green font-bold">&gt;</span>
              <span className="text-gray-300 group-hover:text-white transition-colors">Zero Tracking</span>
            </div>
          </div>

          <div className="flex-1"></div>

          {/* CTA Buttons */}
          <div className="w-full flex flex-col gap-4 mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="w-full h-14 bg-neon-green text-black font-bold text-base tracking-wide uppercase hover:bg-white transition-colors duration-200 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
            <button className="w-full h-14 bg-white border-2 border-solana-purple/50 text-black font-bold text-base tracking-wide uppercase hover:bg-solana-purple hover:text-white hover:border-solana-purple transition-all duration-200 rounded-sm flex items-center justify-center gap-2 group">
              <span>Request NFC Card</span>
              <span className="text-[18px] text-solana-purple group-hover:text-white transition-colors">→</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-6 text-[10px] text-gray-600 uppercase tracking-widest opacity-0 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-solana-purple"></span>
              Solana
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-neon-green"></span>
              Online
            </span>
            <span>v1.0.0</span>
          </div>
        </main>
      </div>
    </div>
  );
}
