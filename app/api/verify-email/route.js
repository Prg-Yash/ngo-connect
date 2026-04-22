import { Resend } from "resend";
import { NextResponse } from "next/server";
import { OtpVerification } from "@/components/email/OtpVerification";

const resend = new Resend(process.env.RESEND_API_KEY);

// Server-side in-memory OTP store: { email -> { otp, expiresAt } }
// This lives in the Next.js server process — safe, never sent to client.
const otpStore = new Map();

export async function POST(request) {
  try {
    const { email, ngoName, action, code } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // ── VERIFY action ──────────────────────────────────────────────
    if (action === "verify") {
      const record = otpStore.get(email);
      if (!record) {
        return NextResponse.json({ error: "No OTP sent for this email. Please request a new one." }, { status: 400 });
      }
      if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
      }
      if (String(record.otp) !== String(code)) {
        return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
      }
      // Valid — clear it and confirm
      otpStore.delete(email);
      return NextResponse.json({ success: true });
    }

    // ── SEND action (default) ──────────────────────────────────────
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email, { otp, expiresAt });

    const { error } = await resend.emails.send({
      from: "NGO Connect <yash@devally.in>",
      to: [email],
      subject: `${otp} is your NGO-Connect verification code`,
      react: OtpVerification({ otp, ngoName }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("verify-email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
