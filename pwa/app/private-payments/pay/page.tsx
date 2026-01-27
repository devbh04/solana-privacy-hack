"use client";

import { useMemo, useState, Suspense } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL, VersionedTransaction } from "@solana/web3.js";
import { deposit } from "privacycash/utils";
import { encryptionServiceFromSecretBytes, getLightWasm } from "@/lib/privacycashClient";
import { newPaymentLinkSecret, encodeSecretBase58 } from "@/lib/paymentLink";
import { Send, Copy, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

function PayPageContent() {
  const searchParams = useSearchParams();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  const requestedAmount = searchParams.get("amount");
  const linkId = searchParams.get("id");

  const payload = useMemo(() => {
    if (!requestedAmount || !linkId) return null;
    return { requestedAmount, linkId };
  }, [requestedAmount, linkId]);

  const [amountSol, setAmountSol] = useState<string>(requestedAmount ?? "0.1");
  const [status, setStatus] = useState<string>("");
  const [tx, setTx] = useState<string | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canPay = !!payload && !!publicKey && !!signTransaction;

  async function onDeposit() {
    if (!payload) throw new Error("Missing link payload");
    if (!publicKey) throw new Error("Connect a wallet");
    if (!signTransaction) throw new Error("Wallet does not support signTransaction");

    setTx(null);
    setGeneratedSecret(null);
    setStatus("Generating secret for this payment…");

    const secretBytes = newPaymentLinkSecret();
    const secret58 = encodeSecretBase58(secretBytes);
    const encryptionService = encryptionServiceFromSecretBytes(secretBytes);

    const lightWasm = await getLightWasm();

    const lamports = Math.floor(Number(amountSol) * LAMPORTS_PER_SOL);
    if (!Number.isFinite(lamports) || lamports <= 0) {
      throw new Error("Invalid amount");
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
    setGeneratedSecret(secret58);
    setStatus("Deposit successful! Share the secret below with the recipient.");
  }

  const handleCopy = async () => {
    if (generatedSecret) {
      await navigator.clipboard.writeText(generatedSecret);
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
              <Send size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-black dark:text-white">Pay Request</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Send private payment</p>
            </div>
          </div>
        </div>

        {payload ? (
          <>
            <div className="mt-6 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-5">
              <div className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-2">Payment Request</div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-black dark:text-white">{payload.requestedAmount} SOL</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">ID: {payload.linkId.slice(0, 8)}...</span>
              </div>
            </div>

            <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
              <label className="text-sm font-bold text-black dark:text-white">Amount to Pay (SOL)</label>
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
              className="mt-6 w-full bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canPay}
              onClick={() => onDeposit().catch((e) => setStatus(String(e?.message ?? e)))}
            >
              {canPay ? "Make Private Payment" : "Connect Wallet to Continue"}
            </button>
          </>
        ) : (
          <div className="mt-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900 rounded-2xl p-5">
            <div className="text-sm font-bold text-red-900 dark:text-red-200">Invalid Payment Link</div>
            <p className="mt-2 text-xs text-red-700 dark:text-red-300">
              This payment link is missing required parameters. Please check the link and try again.
            </p>
          </div>
        )}

        {status && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 text-sm text-blue-900 dark:text-blue-200">
            {status}
          </div>
        )}

        {generatedSecret && (
          <div className="mt-6 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-900 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🔑</span>
              <div className="font-bold text-purple-900 dark:text-purple-200">Payment Secret Generated</div>
            </div>
            <div className="rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-black p-3">
              <code className="break-all text-xs font-mono text-black dark:text-white">{generatedSecret}</code>
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
            <div className="mt-3 flex items-start gap-2 text-xs text-purple-800 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3">
              <span className="text-lg">💡</span>
              <span>Share this secret privately with the recipient (via encrypted messaging or in person). They will use it to claim the funds.</span>
            </div>
          </div>
        )}

        {tx && (
          <div className="mt-4 bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-900 rounded-2xl p-4">
            <div className="text-xs font-bold text-green-900 dark:text-green-200 mb-2">Transaction Signature</div>
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

        <div className="mt-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-2xl p-4">
          <h3 className="font-bold text-sm text-yellow-900 dark:text-yellow-200">What happens next?</h3>
          <ol className="mt-2 space-y-1.5 text-xs text-yellow-800 dark:text-yellow-300 list-decimal list-inside">
            <li>Your funds are deposited into a private pool using zero-knowledge proofs</li>
            <li>A unique secret is generated for this payment</li>
            <li>Share the secret with the recipient through a secure channel</li>
            <li>The recipient uses the secret to claim funds to their wallet</li>
          </ol>
        </div>
      </main>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-gray-950 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PayPageContent />
    </Suspense>
  );
}
