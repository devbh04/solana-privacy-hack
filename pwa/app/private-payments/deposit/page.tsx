"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, VersionedTransaction } from "@solana/web3.js";
import { deposit, getUtxos, getBalanceFromUtxos } from "privacycash/utils";
import { encryptionServiceFromSecretBytes, getLightWasm } from "@/lib/privacycashClient";
import { newPaymentLinkSecret, encodeSecretBase58, decodeSecretBase58 } from "@/lib/paymentLink";
import { Download, Key, Copy, Check } from "lucide-react";

export default function DepositPage() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const [secret58, setSecret58] = useState<string>("");
  const [amountSol, setAmountSol] = useState<string>("0.1");
  const [status, setStatus] = useState<string>("");
  const [tx, setTx] = useState<string | null>(null);
  const [balanceLamports, setBalanceLamports] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const secretBytes = useMemo(() => {
    if (!secret58) return null;
    try {
      return decodeSecretBase58(secret58);
    } catch {
      return null;
    }
  }, [secret58]);

  const canPay = !!secretBytes && !!publicKey && !!signTransaction;

  async function checkBalance() {
    if (!publicKey) return;
    if (!secretBytes) return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.includes("tradeHistory") || key.includes("fetch_offset") || key.includes("encrypted_outputs"))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => window.localStorage.removeItem(key));
    
    setStatus("Scanning pool for balance…");
    setTx(null);

    const encryptionService = encryptionServiceFromSecretBytes(secretBytes);
    const utxos = await getUtxos({
      publicKey,
      connection,
      encryptionService,
      storage: window.localStorage,
    });

    const bal = getBalanceFromUtxos(utxos);
    setBalanceLamports(bal.lamports);
    setStatus("");
  }

  async function onDeposit() {
    if (!publicKey) return;
    if (!signTransaction) return;
    if (!secretBytes) return;

    setTx(null);
    setStatus("Preparing deposit…");
    
    const encryptionService = encryptionServiceFromSecretBytes(secretBytes);
    const lightWasm = await getLightWasm();

    const lamports = Math.floor(Number(amountSol) * LAMPORTS_PER_SOL);
    if (!Number.isFinite(lamports) || lamports <= 0) {
      setStatus("Invalid amount");
      return;
    }

    setStatus("Generating proof + submitting deposit…");
    const res = await deposit({
      lightWasm,
      connection,
      amount_in_lamports: lamports,
      keyBasePath: "/circuit2/transaction2",
      publicKey,
      transactionSigner: async (t: VersionedTransaction) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const signed = await (signTransaction as any)(t);
        return signed as VersionedTransaction;
      },
      storage: window.localStorage,
      encryptionService,
    });

    setTx(res.tx);
    setStatus("Deposit successful!");
    // Refresh balance
    await checkBalance();
  }

  async function generateNewSecret() {
    const secretBytes = newPaymentLinkSecret();
    const secret58 = encodeSecretBase58(secretBytes);
    setSecret58(secret58);
    setBalanceLamports(null);
    setTx(null);
  }

  const handleCopy = async () => {
    if (secret58) {
      await navigator.clipboard.writeText(secret58);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-mono pb-20">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-neon-green">$</span>
              <h1 className="text-xl font-bold text-black dark:text-white">P-Links</h1>
            </div>
            <WalletMultiButton style={{ fontSize: '11px', padding: '6px 12px', height: 'auto' }} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <Download size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">Manage Payment Secret</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Check balance or add funds</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
          <label className="text-sm font-bold text-black dark:text-white">Payment Secret</label>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white font-mono outline-none focus:border-purple-500 transition-colors"
              value={secret58}
              onChange={(e) => setSecret58(e.target.value.trim())}
              placeholder="Paste your payment secret here"
            />
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-colors"
              onClick={() => generateNewSecret()}
            >
              Generate New
            </button>
          </div>
          {!secret58 ? null : secretBytes ? (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Check size={14} />
              <span>Valid secret format</span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-red-500">Invalid secret format</div>
          )}
        </div>

        {secretBytes && (
          <button
            className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!publicKey}
            onClick={() => checkBalance().catch((e) => setStatus(String(e?.message ?? e)))}
          >
            {publicKey ? "Check Balance" : "Connect Wallet to Check Balance"}
          </button>
        )}

        {balanceLamports !== null && (
          <div className="mt-6 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-900 rounded-2xl p-5">
            <div className="text-xs font-bold text-blue-900 dark:text-blue-200">Current Balance</div>
            <div className="mt-2 text-3xl font-bold text-black dark:text-white">
              {(balanceLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL
            </div>
            {balanceLamports === 0 && (
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                No funds in this payment secret yet
              </div>
            )}
          </div>
        )}

        {secretBytes && balanceLamports !== null && (
          <div className="mt-6 space-y-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <label className="text-sm font-bold text-black dark:text-white">Amount to Deposit (SOL)</label>
              <input
                type="text"
                inputMode="decimal"
                className="mt-3 w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-black dark:text-white outline-none focus:border-green-500 transition-colors"
                value={amountSol}
                onChange={(e) => setAmountSol(e.target.value)}
                placeholder="0.1"
              />
            </div>

            <button
              className="w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canPay}
              onClick={() => onDeposit().catch((e) => setStatus(String(e?.message ?? e)))}
            >
              {canPay ? "Add Funds to Secret" : "Connect Wallet to Continue"}
            </button>
          </div>
        )}

        {status && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 text-sm text-blue-900 dark:text-blue-200">
            {status}
          </div>
        )}

        {secret58 && secretBytes && (
          <div className="mt-6 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Key size={20} className="text-purple-600 dark:text-purple-400" />
              <div className="font-bold text-purple-900 dark:text-purple-200">Your Payment Secret</div>
            </div>
            <div className="rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-black p-3">
              <code className="break-all text-xs font-mono text-black dark:text-white">{secret58}</code>
            </div>
            <button
              className="mt-3 w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Secret to Clipboard
                </>
              )}
            </button>
            <div className="mt-3 flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 rounded-lg p-3">
              <span className="text-lg">⚠️</span>
              <span>Anyone with this secret can claim the funds. Share it only with the intended recipient.</span>
            </div>
          </div>
        )}
        
        {tx && (
          <div className="mt-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900 rounded-2xl p-4">
            <div className="text-xs font-bold text-green-900 dark:text-green-200 mb-2">Transaction</div>
            <a
              className="text-sm text-green-600 dark:text-green-400 underline break-all hover:text-green-700 dark:hover:text-green-300"
              href={`https://solscan.io/tx/${tx}`}
              target="_blank"
              rel="noreferrer"
            >
              View on Solscan
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
