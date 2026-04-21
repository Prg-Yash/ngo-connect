import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req) {
    try {
        const { subscription_id, payment_id, signature, plan, userId } = await req.json();

        // Reference to the NGO document
        const ngoRef = doc(db, "ngo", userId);

        // Get the current NGO data
        const ngoDoc = await getDoc(ngoRef);
        if (!ngoDoc.exists()) {
            return new Response(
                JSON.stringify({ error: "NGO not found" }),
                {
                    status: 404,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        // Update only specific fields in the NGO document
        await updateDoc(ngoRef, {
            plan, // Update the current plan (standard or premium)
            "subscription": {
                id: subscription_id,
                paymentId: payment_id,
                signature: signature,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            },
            subscriptionId: subscription_id, // For easier access
            subscriptionStatus: "active",
            updatedAt: serverTimestamp()
        });

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error saving subscription:", error);
        return new Response(
            JSON.stringify({ error: "Failed to save subscription" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
} 