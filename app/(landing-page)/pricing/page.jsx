"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const pricingTiers = [
  {
    name: "Basic",
    id: "basic",
    price: {
      monthly: 0,
      yearly: 0,
    },
    description: "For small events",
    features: [
      "Basic features",
      "Access to limited templates",
      "Email support",
      "Event scheduling",
      "Basic analytics",
      "Custom Form Builder",
    ],
    cta: {
      text: "Get Started",
      action: () => {},
    },
  },
  {
    planId: "plan_Q9BMwK7d5LHdz4",
    name: "Standard",
    id: "standard",
    price: {
      monthly: 199,
      yearly: 1990,
    },
    description: "For growing organizations",
    features: [
      "All basic features",
      "Access to advanced templates",
      "Priority email support",
      "Custom branding",
      "Team collaboration tools",
      "Event reporting and analytics",
    ],
    cta: {
      text: "Buy Plan",
      action: () => {},
    },
    highlight: true,
  },
  {
    planId: "plan_Q9BNiiCij1eUhl",
    name: "Premium",
    id: "premium",
    price: {
      monthly: 299,
      yearly: 2990,
    },
    description: "For large institutions",
    features: [
      "All Standard features",
      "Dedicated account manager",
      "Custom integrations",
      "Priority support (24/7)",
      "Advanced event insights",
      "API access for automation",
    ],
    cta: {
      text: "Buy Plan",
      action: () => {},
    },
  },
];

function Feature({ children }) {
  return (
    <li className="flex gap-x-3">
      <Check className="h-6 w-5 flex-none text-emerald-500" />
      {children}
    </li>
  );
}

export default function PricingPage({
  title = "Simple, transparent pricing",
  subtitle = "Choose the plan that's right for you",
}) {
  const [isMonthly, setIsMonthly] = useState(true);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is signed in", user);
        const userId = user.uid;
        const userDocRef = doc(db, "ngo", userId);

        const unsubscribeSnapshot = onSnapshot(
          userDocRef,
          (userDoc) => {
            if (userDoc.exists()) {
              const data = userDoc.data();
              setCurrentPlan(data.plan || "basic");
              setUserData(data);
            } else {
              console.log("NGO document does not exist");
              setCurrentPlan("basic");
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
          }
        );

        return () => unsubscribeSnapshot();
      } else {
        console.log("No NGO is signed in.");
        setCurrentPlan(null);
        setUserData(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No NGO is signed in.");
        router.push("/login");
        return false;
      }

      const userId = user.uid;
      const userDocRef = doc(db, "ngo", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return true;
      } else {
        toast.error("NGO not found");
        return false;
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      return false;
    }
  };

  const handleSubscription = async (selectedPlan, planId) => {
    try {
      const isNgoUser = await checkUser();

      if (!isNgoUser) {
        toast.error(
          "You need to be registered as an NGO to subscribe to a plan"
        );
        return;
      }

      if (
        currentPlan !== "basic" &&
        userData?.subscriptionStatus === "active"
      ) {
        toast.error(
          "You are already subscribed to a plan. Please cancel your current plan first."
        );
        return;
      }

      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          userId: auth.currentUser.uid,
        }),
      });

      const subscription = await response.json();
      console.log("SUBSCRIPTION", subscription);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "NGO Connect",
        description: "Get all the paid plan features in your subscription.",
        handler: async function (response) {
          // Handle successful payment
          const paymentData = {
            subscription_id: response.razorpay_subscription_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          };

          await fetch("/api/save-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...paymentData,
              plan: selectedPlan,
              userId: auth.currentUser.uid,
            }),
          });
          toast.success("Subscription successful!");
        },
        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
          contact: userData?.phone || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      // Ensure Razorpay is loaded
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Subscription Error:", error);
      toast.error("Failed to create subscription. Please try again.");
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!subscriptionId) {
      toast.error("No active subscription found");
      return;
    }

    const confirm = window.confirm(
      "Are you sure you want to cancel your subscription?"
    );
    if (!confirm) {
      toast("Your subscription has not been cancelled");
      return;
    }

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          userId: auth.currentUser.uid,
        }),
      });

      if (response.ok) {
        toast.success("Subscription successfully cancelled");
      } else {
        toast.error("Failed to cancel subscription. Please try again.");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("An error occurred while cancelling your subscription");
    }
  };

  // Updated pricing tiers with subscription handling
  const updatedPricingTiers = pricingTiers.map((tier) => ({
    ...tier,
    cta: {
      ...tier.cta,
      action: () => {
        if (!auth.currentUser) {
          toast.error("Please log in to subscribe to a plan");
          router.push("/login");
          return;
        }

        if (tier.id === "basic") {
          if (
            currentPlan !== "basic" &&
            userData?.subscriptionStatus === "active"
          ) {
            toast(
              "You are already subscribed to a paid plan. Cancel your current plan to switch to the free plan."
            );
          } else {
            // Set basic plan in the database
            const ngoRef = doc(db, "ngo", auth.currentUser.uid);
            updateDoc(ngoRef, {
              plan: "basic",
              subscriptionStatus: "none",
              updatedAt: new Date(),
            })
              .then(() => {
                toast.success("You are now on the Basic plan");
              })
              .catch((error) => {
                console.error("Error updating to basic plan:", error);
                toast.error("Failed to update to basic plan");
              });
          }
        } else {
          handleSubscription(tier.id, tier.planId);
        }
      },
    },
  }));

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <button className="relative inline-flex h-9 w-48 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] opacity-100" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Simple Pricing
            </span>
          </button>
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">{subtitle}</p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <div className="flex items-center gap-4 rounded-full p-1 bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <button
                onClick={() => setIsMonthly(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  isMonthly ? "bg-emerald-500 text-white" : "text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsMonthly(false)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                  !isMonthly ? "bg-emerald-500 text-white" : "text-gray-400"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center mt-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-300">Loading plans...</p>
          </div>
        ) : (
          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {updatedPricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl p-8 ring-1 ${
                  tier.highlight
                    ? "ring-2 ring-emerald-500 bg-black/40 backdrop-blur-sm relative"
                    : "ring-white/10 bg-black/40 backdrop-blur-sm"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                      Popular
                    </div>
                  </div>
                )}
                <h3 className="text-emerald-300 text-lg font-semibold leading-8">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm leading-6 text-gray-300">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-white">
                    ₹{isMonthly ? tier.price.monthly : tier.price.yearly}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-300">
                    /{isMonthly ? "month" : "year"}
                  </span>
                </p>
                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                  {tier.features.map((feature, featureIndex) => (
                    <Feature key={featureIndex}>{feature}</Feature>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    onClick={tier.cta.action}
                    className={`w-full ${
                      tier.highlight
                        ? "bg-gradient-to-r from-emerald-500 to-blue-500 hover:opacity-90"
                        : "bg-emerald-500/10 text-white border-emerald-500/20 hover:bg-emerald-500/20"
                    }`}
                    variant={tier.highlight ? "default" : "outline"}
                    disabled={
                      currentPlan === tier.id &&
                      userData?.subscriptionStatus === "active"
                    }
                  >
                    {currentPlan === tier.id &&
                    userData?.subscriptionStatus === "active"
                      ? "Current Plan"
                      : tier.cta.text}
                  </Button>

                  {currentPlan === tier.id &&
                    userData?.subscriptionStatus === "active" &&
                    tier.id !== "basic" && (
                      <Button
                        onClick={() =>
                          handleCancelSubscription(userData.subscriptionId)
                        }
                        className="mt-2 w-full bg-red-500/80 hover:bg-red-600 text-white"
                      >
                        Cancel Subscription
                      </Button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 flex items-center justify-center gap-2 text-gray-400">
          <CreditCard className="h-5 w-5 text-emerald-500" />
          <span className="text-sm">No credit card required</span>
        </div>
      </div>
    </div>
  );
}
