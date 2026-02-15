// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { UserProvider } from "@/lib/user-context";
// import Navbar from "@/components/navbar";
// import BottomNav from "@/components/bottom-nav";
// import UsernameModal from "@/components/username-modal";
// import FloatingHearts from "@/components/floating-hearts";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "GreenMason — AI-Powered Campus Sustainability Hub",
//   description:
//     "Fall in Love with a Greener Campus 💚 Snap & Sort waste, chat with AI, earn Green Score points, and make Love Pledges to the planet. HackFax × PatriotHacks 2026.",
//   keywords: [
//     "sustainability",
//     "GMU",
//     "George Mason University",
//     "recycling",
//     "AI",
//     "hackathon",
//   ],
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <UserProvider>
//           <FloatingHearts />
//           <Navbar />
//           <main className="relative z-10 min-h-[calc(100vh-4rem)] pb-20 md:pb-4">
//             {children}
//           </main>
//           <BottomNav />
//           <UsernameModal />
//         </UserProvider>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/user-context";
import Navbar from "@/components/navbar";
import BottomNav from "@/components/bottom-nav";
import UsernameModal from "@/components/username-modal";
import FloatingHearts from "@/components/floating-hearts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GreenMason — AI-Powered Campus Sustainability Hub",
  description:
    "Fall in Love with a Greener Campus 💚 Snap & Sort waste, chat with AI, earn Green Score points, and make Love Pledges to the planet. HackFax × PatriotHacks 2026.",
  keywords: [
    "sustainability",
    "GMU",
    "George Mason University",
    "recycling",
    "AI",
    "hackathon",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <FloatingHearts />
          <Navbar />
          <main className="relative z-10 min-h-[calc(100vh-4rem)] pb-20 md:pb-4">
            {children}
          </main>
          <BottomNav />
          <UsernameModal />
        </UserProvider>
      </body>
    </html>
  );
}
