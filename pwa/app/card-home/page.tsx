'use client';

import { useAppStore } from '@/lib/store';
import { PhantomCard } from '@/components/PhantomCard';
import { Ban, CreditCardIcon, Eye, EyeOff, Key, Tag, DollarSign, Upload, Download, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function CardHome() {
  const { isCardFrozen, toggleCardFreeze, rotateCardId, balance, transactions, showCardDetails, toggleCardDetails, allActivities } = useAppStore();

  // Merge transactions and allActivities
  const combinedActivities = useMemo(() => {
    return [...transactions, ...allActivities].sort((a, b) => {
      // Sort by timestamp (most recent first)
      const timeA = a.timestamp;
      const timeB = b.timestamp;
      if (timeA.includes('Just now')) return -1;
      if (timeB.includes('Just now')) return 1;
      if (timeA.includes('hour')) return -1;
      if (timeB.includes('hour')) return 1;
      return 0;
    });
  }, [transactions, allActivities]);

  const getActivityIcon = (activity: any) => {
    // Handle transaction icons
    if (activity.icon) {
      const iconMap: { [key: string]: any } = {
        'local_cafe': <Tag className="w-5 h-5 text-blue-500" />,
        'vpn_key': <Key className="w-5 h-5 text-neutral-600" />,
        'block': <Ban className="w-5 h-5 text-red-400" />,
        'upload': <Upload className="w-5 h-5 text-solana-purple" />,
        'download': <Download className="w-5 h-5 text-red-400" />,
        'payments': <DollarSign className="w-5 h-5 text-neon-green" />,
        'swap_horiz': <ArrowLeftRight className="w-5 h-5 text-neutral-600" />,
      };
      return iconMap[activity.icon] || <CreditCardIcon className="w-5 h-5" />;
    }
    
    // Handle activity type icons
    const typeMap: { [key: string]: string } = {
      'payment': '💳',
      'lend': '📤',
      'borrow': '📥',
      'repay': '💰',
      'swap': '🔄',
      'transfer': '➡️',
    };
    return <span className="text-lg">{typeMap[activity.type] || '📊'}</span>;
  };

  const getActivityColor = (activity: any) => {
    if (activity.type) {
      switch (activity.type) {
        case 'lend':
        case 'repay':
          return 'text-neon-green';
        case 'borrow':
          return 'text-solana-purple';
        case 'swap':
          return 'text-blue-400';
        default:
          return 'text-black';
      }
    }
    return 'text-black';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-neon-green';
      case 'secure':
        return 'border-neon-green/50';
      case 'blocked':
        return 'border-red-500/50';
      default:
        return 'border-transparent';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'secure':
        return (
          <span className="text-neon-green text-[10px] font-mono border border-neon-green/20 px-1.5 py-0.5 rounded uppercase">
            Secure
          </span>
        );
      case 'blocked':
        return (
          <span className="text-red-400 text-[10px] font-mono border border-red-500/20 px-1.5 py-0.5 rounded uppercase">
            Blocked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-black pb-24"
    >
      {/* Background Grid Pattern */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(#14F195 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between py-8 px-6 pb-2">
          <div className="">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-neon-green">$</span>
              <h1 className="text-3xl font-bold text-black">Card</h1>
            </div>
          </div>
        </div>

        {/* Balance Section */}
        <div className="px-6 py-4 mb-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex flex-col gap-1">
            <p className="text-gray-600 text-[10px] font-mono tracking-widest uppercase mb-1">
              Total Lent
            </p>
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold text-black tracking-tight font-mono">
                ${balance.usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h1>
            </div>
          </div>
          <Link href="/lend" className='bg-neon-green text-black px-4 py-1 rounded-4xl hover:bg-neon-green/80 transition-colors'>
            + Lend
          </Link>
        </div>

        {/* Card */}
        <div className="px-6 py-2">
          {/* Show Details Toggle */}
          <div className="flex justify-between mb-3 items-center">
            <h1>Your Card:</h1>
            <button
              onClick={toggleCardDetails}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-neon-green bg-neon-green transition-all active:scale-95"
            >
              {showCardDetails ? (
                <>
                  <EyeOff className="w-4 h-4 text-black" />
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </div>
          
          <div className="relative">
            <PhantomCard showDetails={showCardDetails} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={toggleCardFreeze}
              className={`group flex items-center justify-center gap-2 rounded-full border ${isCardFrozen
                  ? 'border-blue-400 bg-blue-500'
                  : 'border-neon-green bg-neon-green'
                } h-12 px-4 transition-all duration-300 active:scale-95`}
            >
              <span className={`font-mono font-bold tracking-wider transition-colors ${isCardFrozen ? 'text-white' : 'text-black'}`}>
                {isCardFrozen ? 'Unfreeze' : 'Freeze'}
              </span>
            </button>

            <button
              onClick={rotateCardId}
              className="group flex items-center justify-center gap-2 rounded-full bg-solana-purple border border-solana-purple h-12 px-4 transition-all duration-300 active:scale-95"
            >
              <span className="text-white font-mono font-bold tracking-wider transition-colors">
                Rotate ID
              </span>
            </button>
          </div>
        </div>

        {/* Combined Activity */}
        <div className="px-6 flex-1 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-xs font-bold font-mono uppercase tracking-widest">
              All Activity
            </h3>
            <span className="text-neon-green/40 text-[10px] cursor-pointer hover:text-neon-green transition-colors">
              VIEW ALL
            </span>
          </div>

          <div className="flex flex-col">
            {combinedActivities.slice(0, 10).map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-center justify-between py-4 ${
                  index !== combinedActivities.slice(0, 10).length - 1 ? 'border-b border-white/5' : ''
                } hover:bg-gray-50 transition-colors -mx-2 px-2 rounded-lg border-l-2 ${getStatusColor(activity.status)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center ${
                    activity.status === 'blocked' ? 'text-red-400' :
                    activity.status === 'secure' ? 'text-neon-green' :
                    'text-gray-600'
                  }`}>
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black text-sm font-medium">{activity.merchant}</span>
                    <span className="text-gray-500 text-[10px] font-mono">
                      {activity.message || (activity.txHash ? `TX: ${activity.txHash}` : '')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {activity.amount ? (
                    <span className={`text-xs font-mono font-bold ${getActivityColor(activity)}`}>
                      {activity.amount}
                    </span>
                  ) : (
                    getStatusBadge(activity.status)
                  )}
                  <span className="text-gray-500 text-[10px]">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
