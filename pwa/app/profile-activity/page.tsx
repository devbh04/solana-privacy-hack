'use client';

import { useAppStore } from '@/lib/store';
import { ArrowDown, ArrowLeftRight, CreditCard, CreditCardIcon, DollarSign, Download, Handshake, Tag, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCreditCard, IconCurrencyDollar } from '@tabler/icons-react';

export default function ProfileActivity() {
  const router = useRouter();
  const disconnectWallet = useAppStore((state) => state.disconnectWallet);
  const walletAddress = useAppStore((state) => state.walletAddress);
  const profileStats = useAppStore((state) => state.profileStats);
  const allActivities = useAppStore((state) => state.allActivities);
  const isCardFrozen = useAppStore((state) => state.isCardFrozen);
  const toggleCardFreeze = useAppStore((state) => state.toggleCardFreeze);
  
  const [balanceView, setBalanceView] = useState<'wallet' | 'borrowed' | 'lent'>('wallet');
  const [showStats, setShowStats] = useState(false);

  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
  };

  const getActivityIcon = (icon: string) => {
    const iconMap: { [key: string]: JSX.Element | string } = {
      'local_cafe': <Tag className="w-4 h-4 text-blue-500" />,
      'upload': <Upload className="w-4 h-4 text-solana-purple" />,
      'download': <Download className="w-4 h-4 text-red-400" />,
      'payments': <DollarSign className="w-4 h-4 text-neon-green" />,
      'swap_horiz': <ArrowLeftRight className="w-4 h-4 text-neutral-600" />,
    };
    return iconMap[icon] || '💳';
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lend':
        return 'text-neon-green';
      case 'borrow':
        return 'bg-solana-purple';
      case 'repay':
        return 'text-neon-green';
      case 'payment':
        return 'text-black';
      case 'swap':
        return 'text-blue-400';
      default:
        return 'text-black';
    }
  };

  const creditUtilization = Math.round((profileStats.creditUsed / profileStats.creditLimit) * 100);

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
              <h1 className="text-3xl font-bold text-black">Profile</h1>
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 py-4 flex flex-col gap-6">
          {/* Available Credit Card */}
          <section className="relative group">
            <div className="relative rounded-2xl bg-white p-6 flex flex-col justify-between">
              <div className="flex gap-2 items-center justify-center">
                <h2 className="text-black text-xs font-mono tracking-widest uppercase">
                  TOTAL AVAILABLE CREDIT
                </h2>
                <IconCreditCard className="text-neon-green" />
              </div>
              
              <div className="mt-4">
                <div className="text-5xl text-center flex justify-center font-mono text-black font-medium tracking-tighter tabular-nums">
                  <IconCurrencyDollar size={48} className="" /> <p>{(profileStats.creditLimit - profileStats.creditUsed).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Credit Utilization Card */}
          <section className="relative">
            <div className="relative rounded-2xl bg-white p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <h2 className="bg-solana-purple text-xs font-mono tracking-widest uppercase">
                  UTILIZATION
                </h2>
                <span className="text-xs font-mono text-gray-500">
                  {profileStats.creditUsed.toLocaleString()} / {profileStats.creditLimit.toLocaleString()} SOL
                </span>
              </div>
              
              <div className="mt-2">
                <div className="text-3xl font-mono text-black font-medium tracking-tighter tabular-nums">
                  {creditUtilization}%
                </div>
                <div className="text-gray-500 text-xs font-mono mt-1">OF CREDIT ALLOTTED</div>
              </div>
              
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-solana-purple shadow-[0_0_10px_#9945FF] transition-all duration-500" 
                    style={{ width: `${creditUtilization}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* View Stats Button */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="w-full px-6 py-3 font-mono text-sm tracking-wider hover:bg-solana-purple/5 transition-all active:scale-95 flex items-center justify-between group"
          >
            <span className="bg-solana-purple">VIEW STATS</span>
            <div className='border w-[calc(100%-150px)]'></div>
            <motion.span
              animate={{ rotate: showStats ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-neon-green"
            >
              <ArrowDown className="w-4 h-4" />
            </motion.span>
          </button>

          {/* Stats Grid */}
          <AnimatePresence>
          {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
          <div className="grid grid-cols-1 gap-4">
            {/* Balance Card with Toggles */}
            <div className="relative bg-white rounded-xl p-5">
              {/* <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#9945FF]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#9945FF]"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#9945FF]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#9945FF]"></div> */}
              
              <div className="flex flex-col gap-4">
                {/* Toggle Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setBalanceView('wallet')}
                    className={`flex-1 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                      balanceView === 'wallet'
                        ? 'bg-neon-green/5 text-neon-green border border-neon-green'
                        : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    WALLET
                  </button>
                  <button
                    onClick={() => setBalanceView('borrowed')}
                    className={`flex-1 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                      balanceView === 'borrowed'
                        ? 'bg-solana-purple/10 border border-solana-purple'
                        : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    BORROWED
                  </button>
                  <button
                    onClick={() => setBalanceView('lent')}
                    className={`flex-1 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${
                      balanceView === 'lent'
                        ? 'bg-blue-500/5 text-blue-500 border border-blue-500'
                        : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    LENT
                  </button>
                </div>

                {/* Balance Display */}
                <div className="flex flex-col items-center justify-center">
                  <p className={`bg-solana-purple/80 text-xs font-mono tracking-widest uppercase mb-2`}>
                    BALANCE
                  </p>
                  <div className="text-3xl font-mono text-black font-medium tracking-tight">
                    {balanceView === 'wallet' && profileStats.balances.wallet}
                    {balanceView === 'borrowed' && profileStats.balances.borrowed}
                    {balanceView === 'lent' && profileStats.balances.total}
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono mt-1 uppercase">
                    {balanceView === 'wallet' && 'Wallet Balance'}
                    {balanceView === 'borrowed' && 'Total Borrowed'}
                    {balanceView === 'lent' && 'Total Lent'}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Grid of 4 */}
            <div className="grid grid-cols-4 gap-4">
            {/* Credit Score */}
            <div className="relative bg-white rounded-xl p-5">
              {/* <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#9945FF]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#9945FF]"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#9945FF]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#9945FF]"></div> */}
              
              <div className="flex flex-col h-full justify-between">
                <p className="bg-solana-purple/80 text-xs font-mono tracking-widest uppercase mb-1">
                  SCORE
                </p>
                <div>
                  <div className="text-2xl font-mono text-black font-medium tracking-tight">
                    {profileStats.creditScore}
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono mt-1">CREDIT</div>
                </div>
                <div className="mt-auto">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-neon-green/10 text-neon-green border border-neon-green/20">
                    GOOD
                  </span>
                </div>
              </div>
            </div>

            {/* Active Loans */}
            <div className="relative bg-white rounded-xl p-5">
              {/* <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#9945FF]"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#9945FF]"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#9945FF]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#9945FF]"></div> */}
              
              <div className="flex flex-col h-full justify-between">
                <p className="text-red-400/80 text-xs font-mono tracking-widest uppercase mb-1">
                  LOANS
                </p>
                <div>
                  <div className="text-2xl font-mono text-black font-medium tracking-tight">
                    {profileStats.activeLoans}
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono mt-1">ACTIVE</div>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <span className="bg-solana-purple text-xs">●</span>
                  <span className="bg-solana-purple text-xs font-mono">LIVE</span>
                </div>
              </div>
            </div>

            {/* APY */}
            <div className="relative bg-white rounded-xl p-5">
              {/* <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-neon-green"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-neon-green"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-neon-green"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-neon-green"></div> */}
              
              <div className="flex flex-col h-full justify-between">
                <p className="text-neon-green/80 text-xs font-mono tracking-widest uppercase mb-1">
                  APY
                </p>
                <div>
                  <div className="text-2xl font-mono text-black font-medium tracking-tight">
                    8.5%
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono mt-1">EARNING</div>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <span className="text-neon-green text-xs">↑</span>
                  <span className="text-neon-green text-xs font-mono">YIELD</span>
                </div>
              </div>
            </div>

            {/* Health Factor */}
            <div className="relative bg-white rounded-xl p-5">
              {/* <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-blue-400"></div> */}
              
              <div className="flex flex-col h-full justify-between">
                <p className="text-blue-400/80 text-xs font-mono tracking-widest uppercase mb-1">
                  HEALTH
                </p>
                <div>
                  <div className="text-2xl font-mono text-black font-medium tracking-tight">
                    2.4
                  </div>
                  <div className="text-gray-500 text-[10px] font-mono mt-1">FACTOR</div>
                </div>
                <div className="flex items-center gap-1 mt-auto">
                  <span className="text-blue-400 text-xs">●</span>
                  <span className="text-blue-400 text-xs font-mono">SAFE</span>
                </div>
              </div>
            </div>
          </div>
          </div>
          </motion.div>
          )}
          </AnimatePresence>

          {/* Card Status Section */}
          <div className="flex items-center gap-3 px-4 py-3 border-l-2 border-neon-green rounded">
            <span className="text-neon-green animate-pulse text-[10px]">●</span>
            <p className="text-black text-sm font-mono tracking-wide">
              CARD STATUS: <span className={`font-bold ${isCardFrozen ? 'text-blue-400' : 'text-neon-green'}`}>
                {isCardFrozen ? 'FROZEN' : 'ACTIVE'}
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <section className="mt-2">
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => router.push('/card-home')}
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-b-2 border-blue-400/40 transition-all active:scale-95 shadow shadow-blue-400/25"
              >
                <CreditCardIcon className="w-6 h-6 text-black mb-2" />
                <span className="text-xs font-mono tracking-wider text-black">Pay</span>
              </button>

              <button 
                onClick={() => router.push('/borrow')}
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-b-2 border-red-400/40 transition-all active:scale-95 shadow shadow-red-400/25"
              >
                <Download className="w-6 h-6 text-black mb-2" />
                <span className="text-xs font-mono tracking-wider text-black">Borrow</span>
              </button>
              
              <button 
                onClick={() => router.push('/lend')}
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-b-2 border-neon-green transition-all active:scale-95 shadow shadow-neon-green/25"
              >
                <Handshake className="w-6 h-6 text-black mb-2" />
                <span className="text-xs font-mono tracking-wider text-black">Lend</span>
              </button>
              
              <button 
                onClick={() => router.push('/repay')}
                className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border-b-2 border-solana-purple transition-all active:scale-95 shadow shadow-solana-purple/25"
              >
                <Upload className="w-6 h-6 text-black mb-2" />
                <span className="text-xs font-mono tracking-wider text-black">Repay</span>
              </button>
            </div>
          </section>

          {/* Latest Transactions */}
          <section className="mt-2">
            <h3 className="text-gray-500 text-xs font-mono mb-3 px-1">LATEST_TXS</h3>
            <div className="flex flex-col gap-2">
              {allActivities.slice(0, 5).map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white border-b border-black/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded">
                      <span className="text-sm">{getActivityIcon(activity.icon)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{activity.merchant}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{activity.timestamp}</span>
                    </div>
                  </div>
                  <span className={`font-mono text-sm ${getActivityColor(activity.type)}`}>
                    {activity.amount}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
