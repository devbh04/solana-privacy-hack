'use client';

import { useAppStore } from '@/lib/store';
import { IconWallet } from '@tabler/icons-react';
import { TrendingUp, TrendingDown, Wallet2, Activity, ArrowUpRight, ArrowDownRight, Shield, RefreshCw, X, Copy, Check, Scan } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

export default function Wallet() {
  const walletAddress = useAppStore((state) => state.walletAddress);
  const profileStats = useAppStore((state) => state.profileStats);
  const swapState = useAppStore((state) => state.swapState);
  const allActivities = useAppStore((state) => state.allActivities);
  
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [sendAddress, setSendAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState<'SOL' | 'USDC'>('USDC');
  const [copied, setCopied] = useState(false);
  
  // Calculate wallet values
  const totalValue = parseFloat(profileStats.balances.total.replace(/[$,]/g, ''));
  const actualBalance = parseFloat(profileStats.balances.wallet.replace(/[$,]/g, ''));
  const borrowedAmount = parseFloat(profileStats.balances.borrowed.replace(/[$,]/g, ''));
  
  // Calculate asset values
  const solValue = swapState.fromToken.balance * swapState.fromToken.price;
  const usdcValue = swapState.toToken.balance * swapState.toToken.price;
  const totalAssetValue = solValue + usdcValue;
  
  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return '💳';
      case 'lend':
        return '📤';
      case 'borrow':
        return '📥';
      case 'repay':
        return '💰';
      case 'swap':
        return '🔄';
      case 'transfer':
        return '➡️';
      default:
        return '📊';
    }
  };
  
  const handleCopyAddress = () => {
    const address = walletAddress || '0x742d...f44e';
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSend = () => {
    // TODO: Implement actual send logic
    alert(`Sending ${sendAmount} ${selectedToken} to ${sendAddress}`);
    setShowSendDialog(false);
    setSendAddress('');
    setSendAmount('');
  };
  
  const getMaxBalance = () => {
    if (selectedToken === 'SOL') {
      return swapState.fromToken.balance;
    }
    return swapState.toToken.balance;
  };
  
  return (
    <div className="min-h-screen bg-white text-black pb-28">
      {/* Header */}
      <div className="flex items-center py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">Wallet</h1>
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6">
        {/* Wallet Overview Card */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Total Portfolio</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '0x742d...f44e'}
                </p>
              </div>
            </div>
            <IconWallet className="w-5 h-5 text-neon-green" />
          </div>
          
          <div className="mb-4">
            <h2 className="text-4xl font-bold text-black mb-1">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-gray-500">Total Value (USD)</p>
          </div>

          {/* Breakdown */}
          <div className="flex justify-center items-center text-center gap-12 pt-4 border-t border-gray-300">
            <div className="bg-white/60 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingUp className="w-3 h-3 text-neon-green" />
                <p className="text-xs text-gray-600">Actual Balance</p>
              </div>
              <p className="text-lg font-bold text-neon-green">
                ${actualBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/60 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <p className="text-xs text-gray-600">Borrowed</p>
              </div>
              <p className="text-lg font-bold text-red-500">
                ${borrowedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Send and Receive */}
        <div className="flex justify-between mb-6">
          <button 
            onClick={() => setShowSendDialog(true)}
            className="flex-1 bg-neon-green text-black py-3 mr-2 rounded-2xl hover:bg-neon-green/80 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowUpRight className="w-4 h-4" />
            Send
          </button>
          <button 
            onClick={() => setShowReceiveDialog(true)}
            className="flex-1 bg-solana-purple text-white py-3 ml-2 rounded-2xl hover:bg-solana-purple/80 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownRight className="w-4 h-4" />
            Receive
          </button>
        </div>

        {/* Assets Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="w-1 h-6 bg-neon-green rounded-full"></div>
              Assets
            </h2>
          </div>
          
          <div className="space-y-3">
            {/* SOL */}
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana Logo" className='w-8 h-8'/>
                  <div>
                    <p className="font-bold text-lg">{swapState.fromToken.symbol}</p>
                    <p className="text-xs text-gray-500">{swapState.fromToken.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{swapState.fromToken.balance.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    ${solValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* USDC */}
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC Logo" className='w-8 h-8'/>
                  <div>
                    <p className="font-bold text-lg">{swapState.toToken.symbol}</p>
                    <p className="text-xs text-gray-500">{swapState.toToken.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{swapState.toToken.balance.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    ${usdcValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <div className="w-1 h-6 bg-solana-purple rounded-full"></div>
              Recent Activity
            </h2>
          </div>
          
          <div className="space-y-2">
            {allActivities.slice(0, 8).map((activity) => (
              <div key={activity.id}>
                <div className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xl">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{activity.merchant}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        {activity.message && (
                          <p className="text-xs text-gray-400 mt-0.5">{activity.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {activity.amount && (
                        <p className={`font-bold text-sm ${
                          activity.amount.startsWith('-') 
                            ? 'text-red-500' 
                            : activity.amount.startsWith('+')
                            ? 'text-neon-green'
                            : 'text-black'
                        }`}>
                          {activity.amount}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {activity.status === 'completed' && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ✓
                          </span>
                        )}
                        {activity.status === 'pending' && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-0.5">
                            <RefreshCw className="w-2 h-2" />
                          </span>
                        )}
                        {activity.status === 'blocked' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            ✕
                          </span>
                        )}
                        {activity.status === 'secure' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            🔒
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Send Dialog */}
      <AnimatePresence>
        {showSendDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSendDialog(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-19 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Send Crypto</h3>
                <button
                  onClick={() => setShowSendDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Token Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Select Token</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedToken('SOL')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedToken === 'SOL'
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="SOL" className="w-6 h-6" />
                          <div className="text-left">
                            <p className="font-bold text-sm">SOL</p>
                            <p className="text-xs text-gray-500">{swapState.fromToken.balance.toFixed(2)}</p>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedToken('USDC')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedToken === 'USDC'
                            ? 'border-neon-green bg-neon-green/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="w-6 h-6" />
                          <div className="text-left">
                            <p className="font-bold text-sm">USDC</p>
                            <p className="text-xs text-gray-500">{swapState.toToken.balance.toFixed(2)}</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Recipient Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={sendAddress}
                        onChange={(e) => setSendAddress(e.target.value)}
                        placeholder="Enter wallet address or ENS"
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-neon-green outline-none transition-colors"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Scan className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Amount</label>
                    <div className="bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="number"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          placeholder="0.00"
                          className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                        />
                        <span className="text-lg font-bold text-gray-500">{selectedToken}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Available: {getMaxBalance().toFixed(2)} {selectedToken}
                        </span>
                        <button
                          onClick={() => setSendAmount(getMaxBalance().toString())}
                          className="font-bold text-neon-green bg-neon-green/10 px-2 py-1 rounded uppercase hover:bg-neon-green/20 transition-colors"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Network Fee */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Network Fee</span>
                      <span className="font-bold text-black">~0.000005 SOL</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">≈ $0.0007 USD</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setShowSendDialog(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!sendAddress || !sendAmount || parseFloat(sendAmount) <= 0}
                      className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send {selectedToken}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receive Dialog */}
      <AnimatePresence>
        {showReceiveDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceiveDialog(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-19 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold">Receive Crypto</h3>
                <button
                  onClick={() => setShowReceiveDialog(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-6 rounded-2xl border-4 border-gray-200 shadow-lg mb-4">
                      <QRCodeSVG
                        value={walletAddress || '0x742d35a4b9473EdBfBd16b0bDd18e23A4f44e'}
                        size={200}
                        level="H"
                        includeMargin={true}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center mb-2">
                      Scan this QR code to get the wallet address
                    </p>
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Your Wallet Address</label>
                    <div className="flex gap-2 items-center p-2">
                      <p className="text-sm font-mono text-black break-all text-center">
                        {walletAddress || '0x742d35a4b9473EdBfBd16b0bDd18e23A4f44e'}
                      </p>
                      <button
                        onClick={handleCopyAddress}
                        className="w-5 bg-white text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-neon-green" />
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={() => setShowReceiveDialog(false)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-black font-semibold py-3 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
