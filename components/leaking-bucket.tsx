
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Droplets, Ban } from "lucide-react";

interface LeakingBucketProps {
    state: 'idle' | 'scanning' | 'results' | 'paid';
    monthlyWaste: number;
}

export function LeakingBucket({ state, monthlyWaste }: LeakingBucketProps) {
    if (state === 'idle') return null;

    return (
        <Card className="w-full max-w-md mx-auto border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all">
            <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl font-black uppercase tracking-tighter">
                    {state === 'scanning' ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Scanning...
                        </>
                    ) : state === 'paid' ? (
                        <>
                            Vibe Secure
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">SEALED</Badge>
                        </>
                    ) : (
                        <>
                            Vibe Leak Detected
                            <Badge variant="destructive" className="animate-pulse">LEAKING</Badge>
                        </>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Visualizer */}
                <div className="relative h-48 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 flex items-center justify-center">
                    {state === 'scanning' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                            <p className="text-sm text-slate-500 font-mono animate-pulse">Analyzing codebase...</p>
                        </div>
                    )}

                    {state === 'results' && (
                        <div className="flex flex-col items-center">
                            <Droplets className="h-16 w-16 text-blue-500 animate-bounce" />
                            <div className="mt-4 text-center">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Estimated Waste</p>
                                <p className="text-4xl font-black text-red-600 drop-shadow-sm">
                                    ~${monthlyWaste.toFixed(2)}
                                    <span className="text-sm text-slate-400 font-normal ml-1">/mo</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {state === 'paid' && (
                        <div className="flex flex-col items-center text-green-600">
                            <Ban className="h-16 w-16" />
                            <p className="mt-2 font-bold uppercase">Leak Plugged</p>
                        </div>
                    )}
                </div>

                {/* Status Text */}
                <div className="text-center">
                    {state === 'results' && (
                        <p className="text-sm text-slate-600">
                            Your code is inefficient. This leak adds up over time.<br />
                            <strong>Unlock to see the fix.</strong>
                        </p>
                    )}
                    {state === 'paid' && (
                        <p className="text-sm text-slate-600">
                            Optimizations applied. You are saving money.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
