import Razorpay from "razorpay";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
    try {
        const { subscriptionId, userId } = await req.json();
        console.log("SUBSCRIPTIONID", subscriptionId);

        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const cancellation = await razorpay.subscriptions.cancel(subscriptionId);
        console.log("CANCELLING SUBSCRIPTION", cancellation);

        // Update the NGO document if userId is provided
        if (userId) {
            const ngoRef = doc(db, "ngo", userId);

            // Get the current NGO data to ensure it exists
            const ngoDoc = await getDoc(ngoRef);
            if (ngoDoc.exists()) {
                // Update subscription status only, preserve other fields
                await updateDoc(ngoRef, {
                    subscriptionStatus: "cancelled",
                    "subscription.status": "cancelled",
                    "subscription.cancelledAt": serverTimestamp(),
                    "subscription.updatedAt": serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
        }

        return new Response(JSON.stringify(cancellation), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Subscription cancellation failed." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
