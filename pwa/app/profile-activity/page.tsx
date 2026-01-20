'use client';

import { BorrowingPosition, useAppStore } from '@/lib/store';
import { ArrowDown, CreditCardIcon, Download, Handshake, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCreditCard, IconCurrencyDollar } from '@tabler/icons-react';

export default function ProfileActivity() {
  const router = useRouter();
  const disconnectWallet = useAppStore((state) => state.disconnectWallet);
  const walletAddress = useAppStore((state) => state.walletAddress);
  const getProfileStats = useAppStore((state) => state.getProfileStats);
  const isCardFrozen = useAppStore((state) => state.isCardFrozen);
  const toggleCardFreeze = useAppStore((state) => state.toggleCardFreeze);
  const borrowingPositions = useAppStore((state) => state.borrowingPositions);
  const activeLoans = borrowingPositions.filter((loan: BorrowingPosition) => loan.status === 'active');

  const [balanceView, setBalanceView] = useState<'wallet' | 'borrowed' | 'lent'>('wallet');
  const [showStats, setShowStats] = useState(false);

  // Get profile stats
  const profileStats = getProfileStats();

  const handleDisconnect = () => {
    disconnectWallet();
    router.push('/');
  };

  const creditUtilization = profileStats.creditLimit > 0
    ? Math.round((profileStats.creditUsed / profileStats.creditLimit) * 100)
    : 0;

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
            <div className="relative rounded-2xl bg-white p-6 flex flex-col justify-between border border-solana-purple/30">
              <div className="flex justify-between items-start">
                <h2 className="text-solana-purple text-xs font-mono tracking-widest uppercase">
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Balance Card with Toggles - Always Visible */}
            <div className="relative bg-white rounded-xl p-5 border-2 border-neon-green/60">
              <div className="flex flex-col gap-4">
                {/* Toggle Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setBalanceView('wallet')}
                    className={`flex-1 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${balanceView === 'wallet'
                      ? 'bg-neon-green/5 text-neon-green border border-neon-green'
                      : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-600'
                      }`}
                  >
                    WALLET
                  </button>
                  <button
                    onClick={() => setBalanceView('borrowed')}
                    className={`flex-1 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${balanceView === 'borrowed'
                      ? 'bg-solana-purple/10 border border-solana-purple'
                      : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-600'
                      }`}
                  >
                    BORROWED
                  </button>
                  <button
                    onClick={() => setBalanceView('lent')}
                    className={`flex-1 px-3 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider transition-all ${balanceView === 'lent'
                      ? 'bg-blue-500/5 text-blue-500 border border-blue-500'
                      : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-600'
                      }`}
                  >
                    LENT
                  </button>
                </div>

                {/* Balance Display */}
                <div className="flex flex-col items-center justify-center">
                  <p className={`text-solana-purple/80 text-xs font-mono tracking-widest uppercase mb-2`}>
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
            {/* View Stats Button */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="w-full px-6 py-3 font-mono text-sm tracking-wider hover:bg-solana-purple/5 transition-all active:scale-95 flex items-center justify-between group"
            >
              <span className="text-solana-purple">VIEW DETAILED STATS</span>
              <div className='border w-[calc(100%-220px)]'></div>
              <motion.span
                animate={{ rotate: showStats ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-neon-green"
              >
                <ArrowDown className="w-4 h-4" />
              </motion.span>
            </button>

            {/* Collapsible 4-Card Grid */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >            {/* Second Row - Grid of 4 */}
                  <div className="grid grid-cols-4 gap-2">
                    {/* Credit Score */}
                    <div className="relative bg-white rounded-xl p-5 border-2 border-solana-purple/30">

                      <div className="flex flex-col h-full justify-between">
                        <p className="text-solana-purple/80 text-xs font-mono tracking-widest uppercase mb-1">
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
                    <div className="relative bg-white rounded-xl p-5 border-2 border-red-400/30">

                      <div className="flex flex-col h-full justify-between">
                        <p className="text-red-400/80 text-xs font-mono tracking-widest uppercase mb-1">
                          LOANS
                        </p>
                        <div>
                          <div className="text-2xl font-mono text-black font-medium tracking-tight">
                            {activeLoans.length}
                          </div>
                          <div className="text-gray-500 text-[10px] font-mono mt-1">ACTIVE</div>
                        </div>
                        <div className="flex items-center gap-1 mt-auto">
                          <span className="text-solana-purple text-xs">●</span>
                          <span className="text-solana-purple text-xs font-mono">LIVE</span>
                        </div>
                      </div>
                    </div>

                    {/* APY */}
                    <div className="relative bg-white rounded-xl p-5 border-2 border-neon-green/30">

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
                    <div className="relative bg-white rounded-xl p-5 border-2 border-blue-400/30">

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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card Status Section */}
          <div className="flex items-center gap-3 px-4 border-l-2 border-neon-green rounded">
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
        </main>
      </div>
    </motion.div>
  );
}
