'use client';

import { useAppStore } from '@/lib/store';
import { PhantomCard } from '@/components/PhantomCard';
import { Ban, CreditCardIcon, Eye, EyeOff, Key, Tag } from 'lucide-react';
import Link from 'next/link';

export default function CardHome() {
  const { isCardFrozen, toggleCardFreeze, rotateCardId, balance, transactions, showCardDetails, toggleCardDetails } = useAppStore();

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
    <div className="min-h-screen bg-white text-black pb-24">
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

        {/* Recent Activity */}
        <div className="px-6 flex-1 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-xs font-bold font-mono uppercase tracking-widest">
              Recent Activity
            </h3>
            <span className="text-neon-green/40 text-[10px] cursor-pointer hover:text-neon-green transition-colors">
              VIEW ALL
            </span>
          </div>

          <div className="flex flex-col">
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                className={`flex items-center justify-between py-4 ${index !== transactions.length - 1 ? 'border-b border-white/5' : ''
                  } hover:bg-gray-50 transition-colors -mx-2 px-2 rounded-lg border-l-2 ${getStatusColor(tx.status)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center ${tx.status === 'blocked' ? 'text-red-400' :
                      tx.status === 'secure' ? 'text-neon-green' :
                        'text-gray-600'
                    }`}>
                    <span className="text-lg">{
                      tx.icon === 'local_cafe' ? <Tag className="w-5 h-5 text-blue-500" /> :
                        tx.icon === 'vpn_key' ? <Key className="w-5 h-5 text-neutral-600" /> :
                          tx.icon === 'block' ? <Ban className="w-5 h-5 text-red-400" /> : <CreditCardIcon className="w-5 h-5" />
                    }</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-black text-sm font-medium">{tx.merchant}</span>
                    <span className="text-gray-500 text-[10px] font-mono">
                      {tx.message || (tx.txHash ? `TX: ${tx.txHash}` : '')}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {tx.amount ? (
                    <span className="text-black text-xs font-mono font-bold">{tx.amount}</span>
                  ) : (
                    getStatusBadge(tx.status)
                  )}
                  <span className="text-gray-500 text-[10px]">{tx.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
