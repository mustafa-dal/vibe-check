
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, CheckCircle2, ChevronRight, Copy, AlertTriangle, DollarSign } from "lucide-react";

interface AnalysisData {
    security_issues: { severity: string; title: string; description: string; file?: string; line?: number }[];
    cost_issues: { severity: string; title: string; description: string; file?: string; line?: number }[];
    fixer_prompts: string[];
    error?: string;
}

interface LockedStepperProps {
    isUnlocked: boolean;
    onPay: () => void;
    analysis?: AnalysisData | null;
}

export function LockedStepper({ isUnlocked: isUnlockedProp, onPay, analysis }: LockedStepperProps) {
    // DEBUG MODE: Set to true to bypass payment wall for testing
    const DEBUG_MODE = true;
    const isUnlocked = DEBUG_MODE || isUnlockedProp;

    const [step1Confirmed, setStep1Confirmed] = useState(false);

    // Format security issues for display
    const formatSecurityContent = () => {
        if (!analysis || analysis.security_issues.length === 0) {
            return <span className="text-green-400"># No security issues found! ✓</span>;
        }
        return (
            <>
                <span className="text-green-400"># Security Issues Found</span><br />
                {analysis.security_issues.map((issue, i) => (
                    <div key={i} className="mt-2">
                        <span className="text-red-400">[{issue.severity.toUpperCase()}]</span> {issue.title}<br />
                        <span className="text-slate-400">→ {issue.description}</span>
                        {issue.file && <><br /><span className="text-yellow-400">File: {issue.file}{issue.line ? `:${issue.line}` : ''}</span></>}
                    </div>
                ))}
            </>
        );
    };

    // Format cost issues and fixer prompts for display
    const formatCostContent = () => {
        if (!analysis) {
            return <span className="text-slate-400">No analysis data available.</span>;
        }
        return (
            <>
                <span className="text-blue-400"># Cost Optimization Tips</span><br />
                {analysis.cost_issues.length === 0 ? (
                    <span className="text-green-400">No cost issues detected! ✓</span>
                ) : (
                    analysis.cost_issues.map((issue, i) => (
                        <div key={i} className="mt-2">
                            <span className="text-orange-400">[{issue.severity.toUpperCase()}]</span> {issue.title}<br />
                            <span className="text-slate-400">→ {issue.description}</span>
                            {issue.file && <><br /><span className="text-yellow-400">File: {issue.file}{issue.line ? `:${issue.line}` : ''}</span></>}
                        </div>
                    ))
                )}
                {analysis.fixer_prompts.length > 0 && (
                    <>
                        <br /><br />
                        <span className="text-purple-400"># Fixer Prompts</span><br />
                        {analysis.fixer_prompts.map((prompt, i) => (
                            <div key={i} className="mt-1 text-slate-300">• {prompt}</div>
                        ))}
                    </>
                )}
            </>
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">

            {/* Error Display */}
            {analysis?.error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {analysis.error}
                </div>
            )}

            {/* Step 1: Security */}
            <div className={`relative transition-all duration-300 ${step1Confirmed ? 'opacity-50' : 'opacity-100'}`}>
                <div className="absolute -left-12 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                    1
                </div>
                <Card className="border-2 border-slate-200">
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Security Recommendations
                            {analysis && analysis.security_issues.length > 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                    {analysis.security_issues.length} issues
                                </span>
                            )}
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Review the security risks found in your codebase.
                        </p>

                        <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-xs mb-4 overflow-x-auto max-h-60 overflow-y-auto">
                            {formatSecurityContent()}
                        </div>

                        {!step1Confirmed ? (
                            <Button onClick={() => setStep1Confirmed(true)} className="w-full gap-2">
                                <Copy className="h-4 w-4" />
                                I've Reviewed This
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-2 rounded justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                                Step 1 Complete
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Step 2: Cost Logic */}
            <div className="relative">
                <div className="absolute -left-12 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold">
                    2
                </div>

                {/* Connector Line */}
                <div className="absolute -left-[30px] -top-8 h-12 w-0.5 bg-slate-300"></div>

                <Card className={`border-2 transition-all ${isUnlocked ? 'border-green-500 bg-green-50/50' : 'border-slate-200 bg-slate-50'}`}>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                {isUnlocked ? <Unlock className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-slate-400" />}
                                <DollarSign className="h-4 w-4 text-green-600" />
                                Cost Optimization
                                {analysis && analysis.cost_issues.length > 0 && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                        {analysis.cost_issues.length} issues
                                    </span>
                                )}
                            </h3>
                            {!isUnlocked && <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">PREMIUM</span>}
                        </div>

                        {isUnlocked ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <p className="text-sm text-slate-600 mb-4">
                                    Apply these changes to save money on cloud costs.
                                </p>
                                <div className="bg-slate-950 text-slate-50 p-4 rounded-md font-mono text-xs overflow-x-auto max-h-80 overflow-y-auto">
                                    {formatCostContent()}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 relative overflow-hidden">
                                {/* Blur effect */}
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                    <Button size="lg" onClick={onPay} disabled={!step1Confirmed} className="shadow-lg animate-pulse hover:animate-none">
                                        Unlock for $1.00 <ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                    {!step1Confirmed && <p className="text-xs text-slate-500 mt-2">Complete Step 1 first</p>}
                                </div>
                                <div className="blur-sm select-none opacity-50">
                                    <p className="text-sm text-slate-600 mb-4">
                                        Hidden Content Hidden Content Hidden Content
                                    </p>
                                    <div className="bg-slate-200 h-24 rounded-md"></div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
