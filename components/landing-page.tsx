
'use client';

import React, { useState } from 'react';
import { LeakingBucket } from './leaking-bucket';
import { LockedStepper } from './locked-stepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Github, ShieldAlert } from 'lucide-react';
import { fetchGithubRepo } from '@/app/actions/fetch-repo';
import { analyzeCode } from '@/app/actions/analyze-code';
import { createPaymentSession, verifyPaymentSession } from '@/app/actions/payment';

export function LandingPage() {

    const [url, setURL] = useState('');
    const [status, setStatus] = useState<'idle' | 'scanning' | 'results' | 'paid'>('idle');
    const [monthlyWaste, setMonthlyWaste] = useState(0);
    const [error, setError] = useState('');

    // State for analysis results
    const [analysis, setAnalysis] = useState<any>(null);

    const handleScan = async () => {
        if (!url) return;
        setStatus('scanning');
        setError('');

        try {
            // 1. Fetch Files
            const repoResult = await fetchGithubRepo(url);
            if (repoResult.error) {
                setError(repoResult.error);
                setStatus('idle');
                return;
            }

            // 2. Prepare content for AI
            // Concatenate top 10 files to keep context window small for MVP speed
            const combinedCode = repoResult.files.slice(0, 10).map(f =>
                `--- FILE: ${f.path} ---\n${f.content}\n`
            ).join('\n');

            // 3. Analyze with Claude
            const analysisResult = await analyzeCode(combinedCode);

            setAnalysis(analysisResult);
            setMonthlyWaste(analysisResult.estimated_monthly_waste_usd);
            setStatus('results');

        } catch (err) {
            console.error(err);
            setError("An unexpected error occurred during analysis.");
            setStatus('idle');
        }
    };


    const handleUnlock = async () => {
        if (!url) {
            setError("No URL to unlock.");
            return;
        }

        // 1. Create Payment Session
        // Use the current Git URL as the fingerprint
        const result = await createPaymentSession(url);

        if (result.error) {
            setError(result.error);
            return;
        }

        // 2. Redirect to Stripe
        if (result.url) {
            window.location.href = result.url;
        }
    };

    // Check for payment success param on mount
    React.useEffect(() => {
        const checkPayment = async () => {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get('session_id');
            const paymentStatus = params.get('payment');

            if (paymentStatus === 'success' && sessionId) {
                // Verify with server
                const result = await verifyPaymentSession(sessionId);
                if (result.success) {
                    setStatus('paid');
                    // Optional: remove params from URL to clean up
                    window.history.replaceState({}, '', window.location.pathname);
                } else {
                    setError('Payment verification failed.');
                }
            } else if (paymentStatus === 'cancelled') {
                setError('Payment cancelled.');
            }
        };

        checkPayment();
    }, []);

    return (
        <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-purple-100">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-4 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center z-10 relative">
                    <div className="inline-flex items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-full mb-8 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">VibeCheck Results are Live</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-slate-900">
                        Is your code <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">leaking money?</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        The "Sanity Sandbox" for non-technical building with AI. <br />
                        Audit your GitHub repo for hidden costs and security risks before you launch.
                    </p>

                    {/* Input Module */}
                    <div className="max-w-lg mx-auto relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                        <div className="relative flex p-2 bg-white rounded-lg border border-slate-200 shadow-xl">
                            <Input
                                placeholder="Paste public GitHub URL..."
                                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base py-6 pl-4"
                                value={url}
                                onChange={(e) => setURL(e.target.value)}
                                disabled={status === 'scanning'}
                            />
                            <Button
                                size="lg"
                                onClick={handleScan}
                                disabled={!url || status === 'scanning'}
                                className="ml-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8"
                            >
                                {status === 'scanning' ? '...' : 'Scan'}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                            <Github className="h-3 w-3" /> Public repositories only. No login required.
                        </p>
                    </div>
                </div>

                {/* Background Grids */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10 bg-top"></div>
            </section>

            {/* Results Section */}
            {(status !== 'idle') && (
                <section className="py-20 bg-slate-50 border-t border-slate-200 min-h-[600px] transition-all">
                    <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">
                        {/* Left: The Visualizer */}
                        <div className="sticky top-10">
                            <LeakingBucket state={status} monthlyWaste={monthlyWaste} />
                        </div>

                        {/* Right: The Fixer */}
                        <div>
                            {status === 'scanning' ? (
                                <div className="space-y-4">
                                    <div className="h-24 w-full bg-slate-200 rounded-lg animate-pulse"></div>
                                    <div className="h-24 w-full bg-slate-200 rounded-lg animate-pulse delay-75"></div>
                                    <div className="h-24 w-full bg-slate-200 rounded-lg animate-pulse delay-150"></div>
                                </div>
                            ) : (
                                <LockedStepper
                                    isUnlocked={status === 'paid'}
                                    onPay={handleUnlock}
                                    analysis={analysis}
                                />
                            )}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
}
