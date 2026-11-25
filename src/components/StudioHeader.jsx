"use client";

import React from "react";
import { Film, Smartphone, Monitor, Sparkles, Loader2 } from "lucide-react";

export default function StudioHeader({
	aspectRatio,
	setAspectRatio,
	resolution,
	setResolution,
	onProcess,
	isProcessing,
	hasVideo,
}) {
	return (
		<header className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
			{/* Brand / Logo */}
			<div className="flex items-center gap-3">
				<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
					<Film className="w-5 h-5 text-black" />
				</div>
				<div>
					<div className="flex items-center gap-2">
						<h1 className="text-lg font-black tracking-tight text-white">
							Studio <span className="text-emerald-400">VideoForge</span>
						</h1>
						<span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
							100% Copyright-Free AI
						</span>
					</div>
					<p className="text-[11px] text-slate-400">
						Arman Raj Secret Method • Black BG Layer • ElevenLabs & AI Voice
					</p>
				</div>
			</div>

			{/* Format & Preset Switchers */}
			<div className="flex items-center gap-3 flex-wrap">
				{/* Aspect Ratio Switcher */}
				<div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
					<button
						type="button"
						onClick={() => setAspectRatio("16:9")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
							aspectRatio === "16:9"
								? "bg-emerald-500 text-black shadow"
								: "text-slate-400 hover:text-white"
						}`}
					>
						<Monitor className="w-3.5 h-3.5" />
						16:9 Long Video
					</button>

					<button
						type="button"
						onClick={() => setAspectRatio("9:16")}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
							aspectRatio === "9:16"
								? "bg-emerald-500 text-black shadow"
								: "text-slate-400 hover:text-white"
						}`}
					>
						<Smartphone className="w-3.5 h-3.5" />
						9:16 Shorts
					</button>
				</div>

				{/* Resolution Switcher */}
				<select
					value={resolution}
					onChange={(e) => setResolution(e.target.value)}
					className="bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium rounded-xl px-3 py-2 focus:border-emerald-500 focus:outline-none"
				>
					<option value="1080p">1080p (Full HD)</option>
					<option value="4K">4K (Ultra HD)</option>
					<option value="720p">720p (Fast)</option>
				</select>

				{/* Primary Export / Process Action Button */}
				<button
					type="button"
					onClick={onProcess}
					disabled={isProcessing || !hasVideo}
					className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
				>
					{isProcessing ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin text-black" />
							<span>Rendering 100% Unique Video...</span>
						</>
					) : (
						<>
							<Sparkles className="w-4 h-4 fill-black" />
							<span>Export 100% Copyright-Free Video</span>
						</>
					)}
				</button>
			</div>
		</header>
	);
}
