import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "Studio",
	description: "Studio built with Next.js, React 19, and Tailwind CSS",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
