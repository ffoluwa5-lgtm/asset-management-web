import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AssetFlow — Asset Management System",
  description: "Enterprise Asset Management for Financial Institutions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0f1117" }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}