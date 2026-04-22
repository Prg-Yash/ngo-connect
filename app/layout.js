import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Toaster } from "react-hot-toast";
// import { ThemeProvider } from "@/components/theme-provider"
import FloatingNavbar from "@/components/floating-navbar";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import WebProvider from "@/providers/WebProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { Epilogue } from "next/font/google";

const font = Epilogue({ subsets: ["latin"] });

export const metadata = {
  title: "NGO-Connect",
  description: "NGO-Connect is a platform for NGOs to manage their activities and events.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NGO-Connect",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "NGO-Connect",
    description: "A platform for NGOs to manage their activities, events, campaigns and donations.",
  },
};

export const viewport = {
  themeColor: "#1CAC78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NGO-Connect" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={cn("min-h-screen bg-background antialiased", font.className)}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <WebProvider>
          <AuthProvider>
            <LanguageProvider>
              <div className="relative flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
              </div>
            </LanguageProvider>
          </AuthProvider>
        </WebProvider>
        {/* </ThemeProvider> */}
        <Toaster />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

// TODO: Contract Addresses:

// A1 NGO Coin - 0xAbFb2AeF4aAC335Cda2CeD2ddd8A6521047e8ddF
// A1 Super Admin - 0xBe1cC0D67244B29B903848EF52530538830bD6d7
// A2 NGO - 0x2F02F62cE98E094cD14b87EE94C2c9B631913b24

// Wallet Address:
// Account 1 - 0x9b7628C6890D8b154A2aCe32A3e11B54a87Dd78B
// Account 2 - 0xD3Fd4576CEa31D113657b279CfE72e0f25D803BC
