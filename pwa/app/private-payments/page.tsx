"use client";

import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Lock, Plus, Download, Coins } from "lucide-react";

export default function PrivatePaymentsPage() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-mono pb-20">
      {/* <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <Lock size={18} className="text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-bold text-black dark:text-white">Private Payments</div>
                <div className="text-[10px] text-gray-500">Zero-Knowledge Proofs</div>
              </div>
            </div>
            <WalletMultiButton style={{ fontSize: '11px', padding: '6px 12px', height: 'auto' }} />
          </div>
        </div>
      </header> */}
      {/* Header */}
      <div className="flex justify-between items-center py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black">P-Links</h1>
        </div>
        <WalletMultiButton style={{ fontSize: '11px', padding: '6px 12px', height: 'auto' }} />
      </div>

      <main className="max-w-md mx-auto px-4 pb-6">
        <div className="bg-linear-to-br from-purple-50 to-green-50 dark:from-purple-950/20 dark:to-green-950/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900">
          <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">Privacy Payments</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Powered by Light Protocol</p>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Request payments privately <span className="font-semibold text-purple-600 dark:text-purple-400">without exposing your wallet</span>. Create a payment request, share the link, and the payer generates a secret that only they can share with you.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="/private-payments/create"
            className="block bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-4 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Plus size={24} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-black dark:text-white">Create Payment Request</div>
                <div className="text-xs text-gray-500 mt-0.5">Request funds without revealing your wallet</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/private-payments/deposit"
            className="block bg-white dark:bg-gray-900 border-2 border-green-200 dark:border-green-900 rounded-2xl p-4 hover:border-green-400 dark:hover:border-green-600 transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Download size={24} className="text-green-500" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-black dark:text-white">Deposit / Manage Secret</div>
                <div className="text-xs text-gray-500 mt-0.5">Add funds or check balance with secret</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link
            href="/private-payments/claim"
            className="block bg-white dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-4 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Coins size={24} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-black dark:text-white">Claim Funds</div>
                <div className="text-xs text-gray-500 mt-0.5">Withdraw using payment secret</div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <h3 className="font-bold text-sm text-black dark:text-white">How it works</h3>
          <ul className="mt-3 space-y-3 text-xs text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span className="text-purple-500 font-bold">1.</span>
              <span><strong className="text-black dark:text-white">Recipient</strong> creates a payment request specifying the amount needed</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-500 font-bold">2.</span>
              <span><strong className="text-black dark:text-white">Payer</strong> deposits funds using zero-knowledge proofs and receives a secret</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-500 font-bold">3.</span>
              <span><strong className="text-black dark:text-white">Payer</strong> shares the secret privately with the recipient</span>
            </li>
            <li className="flex gap-2">
              <span className="text-purple-500 font-bold">4.</span>
              <span><strong className="text-black dark:text-white">Recipient</strong> claims funds to any wallet using the secret</span>
            </li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-2xl p-4">
          <h3 className="font-bold text-sm text-yellow-900 dark:text-yellow-200">Security Notice</h3>
          <ul className="mt-2 space-y-1.5 text-xs text-yellow-800 dark:text-yellow-300">
            <li className="flex gap-2">
              <span>•</span>
              <span>Anyone with the secret can claim the funds</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Share secrets only through secure channels</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>On-chain observers cannot link deposits to withdrawals</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
