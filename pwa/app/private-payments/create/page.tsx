"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { buildPaymentLinkUrl, generateLinkId } from "@/lib/paymentLink";
import { Plus, Copy, Check, Lock, X, Info, Share2, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatePage() {
  const { publicKey } = useWallet();
  const [requestedAmount, setRequestedAmount] = useState<string>("0.1");
  const [linkId, setLinkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeMode, setActiveMode] = useState<'plink' | 'blink'>('plink');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    if (!link) return;

    const shareData: ShareData = {
      title: `${activeMode === 'plink' ? 'P-Link' : 'Blink'} Payment Request`,
      text: `Payment request for ${requestedAmount} SOL`,
      url: link,
    };

    // Add image if selected and supported
    if (selectedImage && navigator.canShare) {
      const filesArray = [selectedImage];
      if (navigator.canShare({ files: filesArray })) {
        shareData.files = filesArray;
      }
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy if share not supported
        await handleCopy();
      }
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white"
    >
      {/* Header */}
      <div className="flex items-center py-8 px-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-neon-green">$</span>
          <h1 className="text-3xl font-bold text-black dark:text-white">Create Payment</h1>
        </div>
      </div>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col px-6 pb-36">
        {/* Mode Toggle */}
        <div className="flex flex-col gap-1 pt-2 border-b border-gray-200 dark:border-gray-700 pb-4">
          <p className="text-neon-green font-mono tracking-widest uppercase mb-2 text-xs">
            Payment Type
          </p>
          <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setActiveMode('plink')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                activeMode === 'plink'
                  ? 'bg-neon-green text-black shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Lock size={16} />
                <span>P-Link</span>
              </div>
            </button>
            <button
              onClick={() => setActiveMode('blink')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                activeMode === 'blink'
                  ? 'bg-neon-green text-black shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Share2 size={16} />
                <span>Blink</span>
              </div>
            </button>
          </div>
          <button
            onClick={() => setShowHowItWorks(true)}
            className="mt-2 text-xs text-gray-500 dark:text-gray-400 hover:text-neon-green transition-colors flex items-center justify-center gap-1"
          >
            <Info size={12} />
            <span>How {activeMode === 'plink' ? 'P-Links' : 'Blinks'} work</span>
          </button>
        </div>

        {/* Amount Input Section */}
        <div className="flex flex-col items-center gap-6 py-6 mb-6 border rounded-2xl shadow-sm dark:shadow-gray-900 p-6 mt-6 border-gray-200 dark:border-gray-700">
          <div className="text-center w-full">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">I want to Request</p>
            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 w-52 mx-auto p-4 gap-3 rounded-2xl">
              <input
                type="text"
                inputMode="decimal"
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(e.target.value)}
                className="text-4xl font-bold tracking-tight text-black dark:text-white bg-transparent border-none outline-none w-32 text-center"
                placeholder="0.1"
              />
              <span className="text-2xl font-bold text-gray-400">SOL</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">≈ ${(parseFloat(requestedAmount || '0') * 150).toFixed(2)} USD</p>
          </div>

          {/* Info Cards */}
          <div className="flex justify-center gap-3 items-center text-center w-full pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <div className="text-xs items-center flex font-medium text-gray-500 dark:text-gray-400">
                {activeMode === 'plink' ? <p className="text-green-400">Privacy</p> : <p className="text-green-400">Platform</p>}
              </div>
              <div className="text-sm font-bold text-black dark:text-white">
                {activeMode === 'plink' ? <p>Zero-Knowledge</p> : <p>Social Media</p>}
              </div>
            </div>
            <p>|</p>
            <div className="flex gap-2">
              <p className="text-xs items-center flex font-medium text-gray-500 dark:text-purple-400">Network</p>
              <p className="text-sm font-bold text-black dark:text-white">Solana</p>
            </div>
          </div>
        </div>

        {/* Connected Wallet */}
        {publicKey && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Connected Wallet</p>
            <p className="text-xs font-mono text-black dark:text-white break-all">{publicKey.toBase58()}</p>
          </div>
        )}

        <div className="h-10"></div>

        {/* Generate Button - Fixed at bottom */}
        <div className="flex gap-3 fixed z-10 bottom-20 left-0 right-0 max-w-lg mx-auto px-6">
          <button
            onClick={() => setLinkId(generateLinkId())}
            className="w-full bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold text-lg py-4 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Generate {activeMode === 'plink' ? 'P-Link' : 'Blink'}</span>
            <span className="text-xl">→</span>
          </button>
        </div>
      </main>

      {/* Success Dialog */}
      <AnimatePresence>
        {link && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLinkId(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-15 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-3xl z-50 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-black dark:text-white">{activeMode === 'plink' ? 'P-Link' : 'Blink'} Generated!</h3>
                <button
                  onClick={() => setLinkId(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Amount Summary */}
                  <div className="bg-linear-to-br from-neon-green/10 to-transparent border-2 border-neon-green/30 p-6 rounded-xl text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Requesting</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-bold text-black dark:text-white">{requestedAmount}</span>
                      <span className="text-xl text-gray-500 dark:text-gray-400">SOL</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">≈ ${(parseFloat(requestedAmount || '0') * 150).toFixed(2)} USD</p>
                  </div>

                  {/* Link Display */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Link</p>
                    <p className="text-xs font-mono text-black dark:text-white break-all bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                      {link}
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900">
                    <p className="text-xs font-semibold text-purple-900 dark:text-purple-200 mb-2 flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      {activeMode === 'plink' ? 'How to use' : 'Share on social media'}
                    </p>
                    <p className="text-xs text-purple-800 dark:text-purple-300">
                      {activeMode === 'plink' 
                        ? 'Share this link with the payer. They will generate a secret during deposit and share it with you privately for claiming.'
                        : 'Post this link on Twitter, Discord, or any platform. Users can pay directly from the post if they have a Solana wallet extension.'}
                    </p>
                  </div>

                  {/* Image Upload Section */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Add Image (Optional)</p>
                    <div className="flex gap-3">
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                          <button
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-neon-green transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <Image size={24} className="text-gray-400" />
                        </label>
                      )}
                      <div className="flex-1 flex items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {imagePreview ? 'Image attached for sharing' : 'Add an image to share with your payment link'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setLinkId(null)}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-black dark:text-white font-semibold py-3 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        onClick={handleShare}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Share2 size={20} />
                        Share
                      </button>
                    )}
                    <button
                      onClick={handleCopy}
                      className="flex-1 bg-neon-green hover:bg-green-400 active:bg-green-500 text-black font-bold py-3 rounded-xl shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check size={20} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={20} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* How it works dialog */}
      <AnimatePresence>
        {showHowItWorks && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHowItWorks(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Dialog */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto hide-scrollbar"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none"
              }}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg text-black dark:text-white">How {activeMode === 'plink' ? 'P-Links' : 'Blinks'} Work</h3>
                <button
                  onClick={() => setShowHowItWorks(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 pb-20">
                {activeMode === 'plink' ? (
                  // P-Link content
                  <>
                    <div className="bg-neon-green/10 dark:bg-neon-green/20 border border-neon-green/30 rounded-2xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock size={16} className="text-neon-green" />
                        <span className="text-sm font-bold text-black dark:text-white">Zero-Knowledge Privacy</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        P-Links use zero-knowledge proofs to keep your transactions completely private. Your wallet address is never exposed to the other party.
                      </p>
                    </div>

                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">1</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Recipient Creates Request</strong>
                          <span className="text-xs">The recipient creates a payment request specifying the amount needed and generates a shareable link.</span>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">2</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Payer Deposits Funds</strong>
                          <span className="text-xs">The payer uses the link to deposit funds using zero-knowledge proofs. They receive a unique secret after deposit.</span>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">3</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Secret Shared Privately</strong>
                          <span className="text-xs">The payer shares the secret privately with the recipient through any secure channel (encrypted message, in person, etc.).</span>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">4</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Recipient Claims Payment</strong>
                          <span className="text-xs">The recipient uses the secret to claim the funds to any wallet address. The payer's identity remains completely private.</span>
                        </div>
                      </li>
                    </ul>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-lg">🔒</span>
                        <span className="leading-relaxed">
                          <strong className="text-black dark:text-white">Privacy Guaranteed:</strong> Zero-knowledge proofs ensure that no one can trace the payment back to your wallet. Your financial privacy is protected at every step.
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  // Blink content
                  <>
                    <div className="bg-neon-green/10 dark:bg-neon-green/20 border border-neon-green/30 rounded-2xl p-5 mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Share2 size={16} className="text-neon-green" />
                        <span className="text-sm font-bold text-black dark:text-white">Social Media Payments</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        Blinks allow users to pay directly from social media platforms. Share your payment link on Twitter, Discord, or any platform and receive payments seamlessly.
                      </p>
                    </div>

                    <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">1</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Create Blink</strong>
                          <span className="text-xs">Create a payment link (Blink) with the requested amount and copy it to share.</span>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">2</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Share on Social Media</strong>
                          <span className="text-xs">Post the link on Twitter, Discord, Telegram, or any social platform where you want to receive payments.</span>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">3</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Payer Clicks Link</strong>
                          <span className="text-xs">If the payer has a Solana browser extension installed, an interactive payment card appears directly in the social media post. Otherwise, they see a preview image with a redirect button.</span>
                        </div>
                      </li>
                      
                      <li className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center">
                          <span className="text-neon-green font-bold text-sm">4</span>
                        </div>
                        <div>
                          <strong className="text-black dark:text-white block mb-1">Payment Completed</strong>
                          <span className="text-xs">The payer completes the payment directly from the social media platform using their wallet extension, or gets redirected to complete the payment.</span>
                        </div>
                      </li>
                    </ul>

                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="text-lg">⚡</span>
                        <span className="leading-relaxed">
                          <strong className="text-black dark:text-white">Instant & Seamless:</strong> Blinks make crypto payments as easy as clicking a link. No need to leave your favorite social platform to send or receive payments.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
