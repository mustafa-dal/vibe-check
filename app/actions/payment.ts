
'use server';

import { supabase } from '@/lib/supabase';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-11-17.clover',
});

export async function createPaymentSession(fingerprint: string) {
    console.log("Creating payment session for:", fingerprint);

    try {
        // 1. Create a record in Supabase first
        const { data: scan, error: dbError } = await supabase
            .from('scans')
            .insert({
                fingerprint: fingerprint,
                is_paid: false
            })
            .select()
            .single();

        if (dbError || !scan) {
            console.error("Database Error:", dbError);
            throw new Error("Failed to initialize scan record.");
        }

        const scanId = scan.id;

        // 2. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'VibeCheck Full Report',
                            description: `Unlock detailed analysis for ${fingerprint}`,
                        },
                        unit_amount: 100, // $1.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Use an environment variable for origin in production, headers() in Next.js/Server Actions is tricky sometimes
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?payment=cancelled`,
            metadata: {
                scanId: scanId,
            },
        });

        return { url: session.url };
    } catch (err: any) {
        console.error("Payment Session Error:", err);
        return { error: err.message };
    }
}

export async function verifyPaymentSession(sessionId: string) {
    console.log("Verifying payment session:", sessionId);

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const scanId = session.metadata?.scanId;

            if (scanId) {
                // Update Supabase
                const { error } = await supabase
                    .from('scans')
                    .update({ is_paid: true })
                    .eq('id', scanId);

                if (error) {
                    console.error("Supabase Update Error:", error);
                    return { success: false, error: "Failed to record payment" };
                }

                return { success: true, scanId };
            }
        }
        return { success: false, error: "Payment not completed" };
    } catch (err: any) {
        console.error("Verification Error:", err);
        return { success: false, error: err.message };
    }
}
