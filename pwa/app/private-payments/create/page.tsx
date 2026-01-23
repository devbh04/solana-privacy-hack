"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { buildPaymentLinkUrl, generateLinkId } from "@/lib/paymentLink";
import { Plus, Copy, ArrowLeft, Check } from "lucide-react";
import Link from "next/link";

export default function CreatePage() {
  const { publicKey } = useWallet();
  const [requestedAmount, setRequestedAmount] = useState<string>("0.1");
  const [linkId, setLinkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    if (!linkId) return null;
    if (typeof window === "undefined") return null;
    return buildPaymentLinkUrl(window.location.origin, { 
      requestedAmount, 
      linkId 
    });
  }, [linkId, requestedAmount]);

  const handleCopy = async () => {
    if (link) {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-mono pb-20">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/private-payments" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
              <ArrowLeft size={18} />
              <span className="text-sm">Back</span>
            </Link>
            <WalletMultiButton style={{ fontSize: '11px', padding: '6px 12px', height: 'auto' }} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
              <Plus size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">Create Payment Link</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Request private payment</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <div className="text-xs font-semibold text-gray-500 mb-2">Connected Wallet</div>
          <div className="text-sm text-black dark:text-white break-all font-mono">
            {publicKey ? publicKey.toBase58() : (
              <span className="text-gray-400">Not connected</span>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <label className="text-sm font-bold text-black dark:text-white">Requested Amount (SOL)</label>
          <input
            type="text"
            inputMode="decimal"
            className="mt-3 w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-purple-500 transition-colors"
            value={requestedAmount}
            onChange={(e) => setRequestedAmount(e.target.value)}
            placeholder="0.1"
          />
        </div>

        <button
          className="mt-6 w-full bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setLinkId(generateLinkId())}
        >
          Generate Payment Link
        </button>

        {link && (
          <>
            <button
              className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Link to Clipboard
                </>
              )}
            </button>

            <div className="mt-6 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-5">
              <div className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-2">
                Payment Link (Requesting {requestedAmount} SOL)
              </div>
              <a 
                href={link}
                className="text-sm text-purple-600 dark:text-purple-400 underline break-all hover:text-purple-700 dark:hover:text-purple-300"
              >
                {link}
              </a>
              <div className="mt-4 flex items-start gap-2 text-xs text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
                <span className="text-lg">ℹ️</span>
                <span>Share this link with the payer. They will generate a secret during deposit and share it with you privately.</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
