'use client';

import { useAppStore, LendingPosition } from '@/lib/store';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ShieldCheck, X, TrendingUp, Lock } from 'lucide-react';

const LOCK_PERIODS = [
  { label: '7 Days', days: 7, apy: 5.0 },
  { label: '30 Days', days: 30, apy: 6.5 },
  { label: '60 Days', days: 60, apy: 7.5 },
  { label: '90 Days', days: 90, apy: 8.5 },
  { label: '120 Days', days: 120, apy: 9.0 },
  { label: '180 Days', days: 180, apy: 10.0 },
  { label: '210 Days', days: 210, apy: 10.5 },
  { label: '240 Days', days: 240, apy: 11.0 },
  { label: '270 Days', days: 270, apy: 11.5 },
  { label: '300 Days', days: 300, apy: 12.0 },
  { label: '1 Year', days: 365, apy: 12.5 },
];

export default function Lend() {
  const lendUsdc = useAppStore((state) => state.lendUsdc);
  const withdrawLending = useAppStore((state) => state.withdrawLending);
  const getActualUsdcBalance = useAppStore((state) => state.getActualUsdcBalance);
  const totalLentToPool = useAppStore((state) => state.totalLentToPool);
  const lendingPositions = useAppStore((state) => state.lendingPositions);

  const [lendAmount, setLendAmount] = useState(1000);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(3); // 90 days default
  const [privateMode, setPrivateMode] = useState(false);
  const [showApyInfo, setShowApyInfo] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showLendingInfo, setShowLendingInfo] = useState(false);
  const [selectedLending, setSelectedLending] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [selectedWithdrawPosition, setSelectedWithdrawPosition] = useState<string | null>(null);

  // Get available balance from wallet
  const availableBalance = getActualUsdcBalance();

  // Get selected period details
  const selectedPeriod = LOCK_PERIODS[selectedPeriodIndex];
  const currentApy = selectedPeriod.apy;

  // Calculate returns
  const dailyRate = currentApy / 365 / 100;
  const estimatedReturns = (lendAmount * dailyRate * selectedPeriod.days).toFixed(2);
  const totalReturn = (lendAmount + parseFloat(estimatedReturns)).toFixed(2);

  // Calculate pool utilization (mock)
  const poolUtilization = 68; // 68% utilized
  const poolLiquidity = 2500000; // $2.5M
  const totalValueLocked = poolLiquidity / (1 - poolUtilization / 100);

  const handleSliderChange = (index: number) => {
    setSelectedPeriodIndex(index);
  };

  const handleAmountChange = (value: number) => {
    if (value <= availableBalance) {
      setLendAmount(value);
    }
  };

  const handleMaxClick = () => {
    setLendAmount(Math.floor(availableBalance));
  };

  const handleConfirmLend = () => {
    if (lendAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (lendAmount > availableBalance) {
      alert('Insufficient balance');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleFinalConfirm = () => {
    const success = lendUsdc(lendAmount, selectedPeriod.days);
    setShowConfirmDialog(false);
    if (success) {
      setLendAmount(0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-black"
    >
      {/* Header */}
      <div className="flex items-center py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">Lend</h1>
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6 pb-36">
        {/* Current Lent */}
        <div className="flex flex-col gap-1 pt-2 pb-2 mb-4 border-b border-gray-200">
          <p className="text-neon-green font-mono tracking-widest uppercase mb-1 text-xs">
            Total Lent
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold text-black tracking-tight font-mono">
              ${totalLentToPool.toLocaleString()} USDC
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Currently earning {currentApy}% APY
          </p>
        </div>

        {/* Pool Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-2 text-center">
          <div className="p-4 shadow-sm border rounded-2xl">
            <div className="flex items-center gap-1 mb-1 justify-center">
              <Lock className="w-4 h-4 text-neon-green" />
              <p className="text-xs font-medium text-gray-600">Total Locked</p>
            </div>
            <p className="text-xl font-bold text-black">${(totalValueLocked / 1000000).toFixed(2)}M</p>
          </div>
          <div className="p-4 shadow-sm border rounded-2xl">
            <div className="flex items-center gap-1 mb-1 justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <p className="text-xs font-medium text-gray-600">Pool Utilized</p>
            </div>
            <p className="text-xl font-bold text-black">{poolUtilization}%</p>
          </div>
        </div>

        {/* Lend Amount Input */}
        <div className="flex flex-col items-center gap-6 py-4 mb-6 border rounded-2xl shadow-sm p-4">
          <div className="text-center w-full">
            <p className="text-sm font-medium text-gray-500 mb-2">I want to lend</p>
            <div className="flex items-center justify-center bg-gray-100 w-min mx-auto p-4 gap-3 rounded-lg">
              <input
                type="number"
                value={lendAmount}
                onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
                className="text-4xl font-bold tracking-tight text-black bg-transparent border-none outline-none w-24 text-center"
              />
              <span className="text-2xl font-bold text-gray-400">USDC</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">≈ ${lendAmount.toLocaleString()} USD</p>
            <div className="flex items-center justify-center gap-2 mt-2 border-b pb-4">
              <p className="text-xs text-gray-500">Available: {availableBalance.toFixed(2)} USDC</p>
              <button
                onClick={handleMaxClick}
                className="text-xs font-bold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded uppercase hover:bg-neon-green/20 transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          {/* Lock Period Slider */}
          <div className="w-full px-2">
            <p className="text-sm font-medium text-gray-500 text-center">Lock Period</p>
            <div className="relative w-full h-10 flex items-center">
              <input
                type="range"
                min="0"
                max={LOCK_PERIODS.length - 1}
                value={selectedPeriodIndex}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #14F195 0%, #14F195 ${(selectedPeriodIndex / (LOCK_PERIODS.length - 1)) * 100}%, #e5e7eb ${(selectedPeriodIndex / (LOCK_PERIODS.length - 1)) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium text-gray-400 mt-2">
              <span>7d</span>
              <span>90d</span>
              <span>180d</span>
              <span>1y</span>
            </div>
            <p className="text-center text-sm font-bold text-black mt-3">
              {selectedPeriod.label}
            </p>
          </div>
        </div>

        {/* Returns & Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Estimated Returns */}
          <div className="col-span-2 bg-linear-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-700">Estimated Returns</span>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <span className="text-xs font-semibold text-neon-green bg-neon-green/10 px-2 py-0.5 rounded">
                {selectedPeriod.days} days
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-black">+${estimatedReturns}</span>
              <span className="text-sm text-gray-500">USDC</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total: ${totalReturn} USDC
            </p>
          </div>

          {/* Current APY */}
          <div className="bg-white p-4 border rounded-2xl">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-medium text-gray-500">APY</p>
              <button
                onClick={() => setShowApyInfo(true)}
                className="text-gray-400 hover:text-black transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xl font-bold text-black">{currentApy}%</p>
            <p className="text-xs text-neon-green font-medium">Variable Rate</p>
          </div>

          {/* Risk Level */}
          <div className="bg-white p-4 border rounded-2xl">
            <p className="text-sm font-medium text-gray-500 mb-1">Risk Level</p>
            <p className="text-xl font-bold text-black">Low</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-neon-green text-xs">●</span>
              <span className="text-neon-green text-xs font-mono">INSURED</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 fixed z-10 bottom-20 left-0 right-0 max-w-lg mx-auto px-6">
          <button
            onClick={handleConfirmLend}
            className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Lend</span>
            <span className="text-xl">↑</span>
          </button>
          <button
            onClick={() => setShowWithdrawDialog(true)}
            className="flex-1 bg-solana-purple hover:bg-[#8532e8] active:bg-[#7B35CC] text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Withdraw</span>
            <span className="text-xl">↓</span>
          </button>
        </div>
        {/* Lending Activity Section */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-neon-green rounded-full"></div>
            Active Positions
          </h2>
          <LendingActivity 
            onShowInfo={(id: string) => {
              setSelectedLending(id);
              setShowLendingInfo(true);
            }}
          />
        </div> */}
      </main>

      {/* APY Info Dialog */}
      <AnimatePresence>
        {showApyInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowApyInfo(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">APY Breakdown</h3>
                <button
                  onClick={() => setShowApyInfo(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Base APY</span>
                    <span className="font-bold text-black">{selectedPeriod.apy}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Pool Utilization Bonus</span>
                    <span className="font-bold text-neon-green">+0.5%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-sm text-gray-600">Loyalty Rewards</span>
                    <span className="font-bold text-neon-green">+0.2%</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                    <span className="text-sm font-semibold text-gray-800">Total APY</span>
                    <span className="font-bold text-black text-lg">{(selectedPeriod.apy + 0.7).toFixed(1)}%</span>
                  </div>
                  <div className="bg-neon-green/10 rounded-xl p-4 mt-4">
                    <p className="text-xs text-gray-600 mb-2">Pool Information:</p>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Total Value Locked: ${(totalValueLocked / 1000000).toFixed(2)}M</li>
                      <li>• Pool Utilization: {poolUtilization}%</li>
                      <li>• Available Liquidity: ${(poolLiquidity / 1000000).toFixed(2)}M</li>
                      <li>• Risk Rating: Low (Insured)</li>
                      <li>• Lock Period: {selectedPeriod.label}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {showConfirmDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmDialog(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Confirm Lending</h3>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Amount Summary */}
                  <div className="bg-linear-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30 p-6 rounded-xl text-center">
                    <p className="text-sm text-gray-600 mb-2">You are lending</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-black">{lendAmount}</span>
                      <span className="text-xl text-gray-500">USDC</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">≈ ${lendAmount.toLocaleString()} USD</p>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Lock Period</span>
                      <span className="font-bold text-black">{selectedPeriod.label}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">APY Rate</span>
                      <span className="font-bold text-neon-green">{currentApy}%</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-sm text-gray-600">Estimated Returns</span>
                      <span className="font-bold text-black">+${estimatedReturns} USDC</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                      <span className="text-sm font-semibold text-gray-800">Total at Maturity</span>
                      <span className="font-bold text-black text-lg">${totalReturn} USDC</span>
                    </div>
                  </div>

                  {/* Privacy Mode Status */}
                  {privateMode && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-neon-green" />
                      <div>
                        <p className="text-sm font-semibold text-black">Private Mode Enabled</p>
                        <p className="text-xs text-gray-500">Transaction will use ZK proofs</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowConfirmDialog(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinalConfirm}
                      className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98]"
                    >
                      Confirm & Lend
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Withdraw Dialog */}
      <AnimatePresence>
        {showWithdrawDialog && selectedWithdrawPosition && (() => {
          const position = lendingPositions.find(p => p.id === selectedWithdrawPosition);
          if (!position) return null;
          
          const maxWithdraw = position.amount + position.earnedInterest;
          const actualWithdrawAmount = withdrawAmount || maxWithdraw;
          
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowWithdrawDialog(false);
                  setSelectedWithdrawPosition(null);
                  setWithdrawAmount(0);
                }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold">Withdraw Funds</h3>
                  <button
                    onClick={() => {
                      setShowWithdrawDialog(false);
                      setSelectedWithdrawPosition(null);
                      setWithdrawAmount(0);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Current Position */}
                    <div className="bg-linear-to-br from-solana-purple/10 to-transparent border-2 border-solana-purple/30 p-6 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">Your Position</p>
                      <div className="flex items-baseline justify-center gap-2 mb-3">
                        <span className="text-4xl font-bold text-black">${position.amount.toLocaleString()}</span>
                        <span className="text-xl text-gray-500">USDC</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600 pt-3 border-t border-gray-200">
                        <span>Lock Period: {position.lockPeriodDays} days</span>
                        <span className="text-neon-green font-semibold">APY: {position.apy}%</span>
                      </div>
                    </div>

                    {/* Withdrawal Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Principal</span>
                        <span className="font-bold text-black">${position.amount.toLocaleString()} USDC</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Interest Earned</span>
                        <span className="font-bold text-neon-green">+${position.earnedInterest.toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                        <span className="text-sm font-semibold text-gray-800">You Will Receive</span>
                        <span className="font-bold text-black text-lg">${maxWithdraw.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowWithdrawDialog(false);
                          setSelectedWithdrawPosition(null);
                          setWithdrawAmount(0);
                        }}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const success = withdrawLending(selectedWithdrawPosition);
                          if (success) {
                            setShowWithdrawDialog(false);
                            setSelectedWithdrawPosition(null);
                            setWithdrawAmount(0);
                          }
                        }}
                        className="flex-1 bg-solana-purple hover:bg-[#8532e8] active:bg-[#7B35CC] text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all transform active:scale-[0.98]"
                      >
                        Confirm Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* Lending Info Dialog */}
      <AnimatePresence>
        {showLendingInfo && selectedLending && (() => {
          const positions = useAppStore.getState().lendingPositions;
          const selectedLendingData = positions.find((l: LendingPosition) => l.id === selectedLending);
          if (!selectedLendingData) return null;

          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLendingInfo(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-15 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold">Lending Position Details</h3>
                  <button
                    onClick={() => setShowLendingInfo(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Amount Summary */}
                    <div className="bg-linear-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30 p-6 rounded-xl text-center">
                      <p className="text-sm text-gray-600 mb-2">Lending Amount</p>
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-neon-green">${selectedLendingData.amount}</span>
                        <span className="text-xl text-gray-500">USDC</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-neon-green/20">
                        <div className="flex items-center justify-center gap-2">
                          <Lock className="w-4 h-4 text-neon-green" />
                          <span className="text-sm text-gray-600">
                            Earning <span className="font-bold text-neon-green">{selectedLendingData.apy}% APY</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Position Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Position ID</span>
                        <span className="font-bold text-black">#{selectedLendingData.id}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Lock Date</span>
                        <span className="font-bold text-black">{selectedLendingData.startDate}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Unlock Date</span>
                        <span className="font-bold text-black">{selectedLendingData.endDate}</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Lock Period</span>
                        <span className="font-bold text-black">{selectedLendingData.lockPeriodDays} days</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                        <span className="text-sm text-gray-600">Interest Earned</span>
                        <span className="font-bold text-neon-green">${selectedLendingData.earnedInterest.toFixed(2)} USDC</span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b-2 border-gray-300">
                        <span className="text-sm font-semibold text-gray-800">Status</span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {selectedLendingData.status}
                        </span>
                      </div>
                    </div>

                    {/* Returns Info */}
                    <div className="bg-neon-green/10 rounded-xl p-4 border border-neon-green/20">
                      <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Returns Information
                      </p>
                      <p className="text-xs text-green-800">
                        You've earned ${selectedLendingData.earnedInterest.toFixed(2)} USDC so far. Your position will unlock on {selectedLendingData.endDate}, and you'll receive your principal plus all accrued interest.
                      </p>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Position Details</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Pool Type</span>
                          <span className="text-gray-700 font-medium">Variable Rate</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Compound Frequency</span>
                          <span className="text-gray-700 font-medium">Daily</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Early Withdrawal</span>
                          <span className="text-gray-700 font-medium">Penalty applies</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => setShowLendingInfo(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setShowLendingInfo(false);
                          setSelectedWithdrawPosition(selectedLending);
                          setShowWithdrawDialog(true);
                        }}
                        className="flex-1 bg-solana-purple hover:bg-[#8532e8] text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                      >
                        Withdraw
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}

// Lending Activity Component
function LendingActivity({ onShowInfo }: { onShowInfo: (id: string) => void }) {
  const lendingPositions = useAppStore((state) => state.lendingPositions);
  const activePositions = lendingPositions.filter((pos: LendingPosition) => pos.status === 'active');

  if (activePositions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 text-sm">No active lending positions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activePositions.map((position: LendingPosition) => (
        <div key={position.id}>
          <div
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xl font-bold text-black">${position.amount} USDC</p>
                <p className="text-xs text-gray-500">Locked on {position.startDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-widest">Unlocks</p>
                <p className="text-sm font-bold text-neon-green">{position.endDate}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {position.status}
              </span>
              <button
                onClick={() => onShowInfo(position.id)}
                className="text-xs font-bold text-neon-green bg-neon-green/10 px-3 py-1.5 rounded-lg uppercase hover:bg-neon-green/20 transition-colors flex items-center gap-1"
              >
                <Info className="w-3 h-3" />
                More Info
              </button>
            </div>
          </div>
          <div className='border-b border-black/30'></div>
        </div>
      ))}
    </div>
  );
}
