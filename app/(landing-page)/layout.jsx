"use client"

import FloatingNavbar from "@/components/floating-navbar";
import { Footer } from "@/components/footer";
import React from "react";
import { usePathname } from "next/navigation";
// import { ThemeProvider } from "@/components/theme-provider";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isNgoDirectoryPage = pathname === "/ngo";

  return (
    <div>
      {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
      {!isLandingPage && !isNgoDirectoryPage && <FloatingNavbar />}
      {children}
      {!isLandingPage && <Footer />}
      {/* </ThemeProvider> */}
    </div>
  );
};

export default Layout;
