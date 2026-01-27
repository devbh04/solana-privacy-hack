'use client';

import { useAppStore } from '@/lib/store';
import { Shield, Copy, Check, Activity, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PhantomCard } from '@/components/PhantomCard';
import { IconSend } from '@tabler/icons-react';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  mint?: string;
}

interface WalletActivity {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'stake';
  amount: number;
  token: string;
  timestamp: string;
  signature: string;
}

export default function Wallet() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const showCardDetails = useAppStore((state) => state.showCardDetails);
  const toggleCardDetails = useAppStore((state) => state.toggleCardDetails);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'assets' | 'activity'>('assets');
  const [solBalance, setSolBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState<WalletActivity[]>([]);

  // Fetch SOL balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (publicKey && connected) {
        setLoading(true);
        try {
          const balance = await connection.getBalance(publicKey);
          setSolBalance(balance / LAMPORTS_PER_SOL);

          // Fetch recent transactions
          const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
          const activities: WalletActivity[] = signatures.map((sig, index) => ({
            id: sig.signature,
            type: index % 2 === 0 ? 'receive' : 'send',
            amount: Math.random() * 0.5,
            token: 'SOL',
            timestamp: new Date(sig.blockTime! * 1000).toLocaleDateString(),
            signature: sig.signature.slice(0, 8) + '...' + sig.signature.slice(-8),
          }));
          setRecentActivity(activities);
        } catch (error) {
          console.error('Error fetching balance:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBalance();
  }, [publicKey, connected, connection]);

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mock SOL price - in production, fetch from an API
  const solPrice = 142.27;
  const totalValue = solBalance * solPrice;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white text-black pb-28"
    >
      {/* Header */}
      <div className="flex items-center justify-between py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">Wallet</h1>
        </div>
        <WalletMultiButton style={{ fontSize: '12px', padding: '8px 16px', height: 'auto' }} />
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6">
        {/* Card Section */}
        <div className="mb-6">
          <div className="flex justify-between mb-3 items-center">
            <h2 className="text-xs text-gray-500 uppercase tracking-wide font-bold px-2">Your Card</h2>
            <button
              onClick={toggleCardDetails}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-green bg-neon-green transition-all active:scale-95"
            >
              {showCardDetails ? (
                <>
                  <EyeOff className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold text-black">Hide</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold text-black">Show</span>
                </>
              )}
            </button>
          </div>
          <PhantomCard showDetails={showCardDetails} />
        </div>

        {/* Total Balance Card */}
        <div className="mb-6">
          <div className="bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Total Portfolio Value</div>
            <div className="text-4xl font-bold text-black mb-1">
              {loading ? (
                <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              )}
            </div>
            {/* Solana Wallet Connection Status */}
            {connected && publicKey && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-neon-green" />
                  <span className="text-xs font-bold text-black">Solana Wallet Connected</span>
                </div>
                <div className="flex items-center gap-2 px-2">
                  <div
                    className="text-xs font-mono text-black bg-neutral-200 py-0.5 px-2 rounded-xl overflow-x-auto w-64 hide-scrollbar"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none"
                    }}
                  >

                    {publicKey.toBase58()}
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} className="text-neon-green" /> : <Copy size={16} className="text-gray-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('assets')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'assets'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
                }`}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'activity'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-black'
                }`}
            >
              Activity
            </button>
          </div>
        </div>

        {/* Assets View */}
        {activeTab === 'assets' && (
          <div className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3 px-2">Your Assets</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                          <div>
                            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mb-1"></div>
                            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-1"></div>
                          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* SOL Balance */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-neon-green hover:bg-neon-green/5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src="https://cryptologos.cc/logos/solana-sol-logo.svg?v=040" alt="" className='h-8 w-8' />
                        <div>
                          <div className="font-bold text-black">SOL</div>
                          <div className="text-xs text-gray-500">Solana</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-black">{solBalance.toFixed(4)}</div>
                        <div className="text-xs text-gray-500">${(solBalance * solPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  </div>

                  {/* Empty state for other tokens */}
                  {solBalance > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <div className="text-xs text-gray-500">No other tokens found</div>
                    </div>
                  )}

                  {solBalance === 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                      <div className="text-xs text-gray-500">No assets found in this wallet</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Activity View */}
        {activeTab === 'activity' && (
          <div className="mb-6">
            <h2 className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3 px-2">Recent Activity</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-2"></div>
                      <div className="h-3 w-48 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-neon-green hover:bg-neon-green/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'receive' ? '' : ''
                          }`}>
                          {/* <Activity size={16} className={activity.type === 'receive' ? 'text-green-600' : 'text-gray-600'} /> */}
                          {activity.type === 'receive' ? (
                            <IconSend size={24} className="text-slate-400 rotate-180" />
                          ) :
                            <IconSend size={24} className="text-green-600" />
                          }
                        </div>
                        <div>
                          <div className="font-bold text-black text-sm capitalize">{activity.type}</div>
                          <div className="text-xs text-gray-500">{activity.timestamp}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${activity.type === 'receive' ? 'text-green-600' : 'text-black'}`}>
                          {activity.type === 'receive' ? '+' : '-'}{activity.amount.toFixed(4)} {activity.token}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{activity.signature}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <div className="text-xs text-gray-500">No recent activity</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-neon-green/10 border border-neon-green/30 rounded-2xl p-5">
          <div className="text-sm font-bold text-black mb-2">Privacy Payments</div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your wallet is ready for private payments. Visit the P-Links section to create payment requests, deposit funds privately, or claim payments using secrets.
          </p>
        </div>
      </main>
    </motion.div>
  );
}
