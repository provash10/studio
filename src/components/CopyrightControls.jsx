"use client";

import React from "react";
import {
	Shield,
	FlipHorizontal,
	Square,
	ZoomIn,
	Activity,
	Palette,
	Zap,
	Sparkles,
} from "lucide-react";

export default function CopyrightControls({
	mirror = true,
	setMirror,
	blackBgLayer = true,
	setBlackBgLayer,
	applyZoom = false,
	setApplyZoom,
	applyWavyMotion = false,
	setApplyWavyMotion,
	colorFilter = "cinematic",
	setColorFilter,
	brightness = 0.03,
	setBrightness,
	contrast = 1.05,
	setContrast,
	saturation = 1.08,
	setSaturation,
	speedShift = true,
	setSpeedShift,
}) {
	return (
		<div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
			<div className="flex items-center justify-between pb-3 border-b border-slate-800">
				<div className="flex items-center gap-2">
					<Shield className="w-5 h-5 text-emerald-400" />
					<h3 className="text-sm font-bold uppercase tracking-wider text-white">
						Anti-Copyright Engine
					</h3>
				</div>
				<span className="text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
					Arman Raj Secret Method
				</span>
			</div>

			{/* Core Visual Toggles */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{/* 1. Black BG Layer (The Red-Mark CapCut Method) */}
				<button
					type="button"
					onClick={() => setBlackBgLayer(!blackBgLayer)}
					className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
						blackBgLayer
							? "bg-blue-950/30 border-blue-500/50 text-white"
							: "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600"
					}`}
				>
					<Square
						className={`w-5 h-5 mt-0.5 shrink-0 ${
							blackBgLayer ? "text-blue-400" : "text-slate-500"
						}`}
					/>
					<div>
						<div className="text-xs font-semibold flex items-center gap-1.5">
							Black BG Layer (CapCut Style)
							{blackBgLayer && (
								<span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
							)}
						</div>
						<p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
							Solid black base + 94% scaled video overlay.
						</p>
					</div>
				</button>

				{/* 2. Mirror Flip */}
				<button
					type="button"
					onClick={() => setMirror(!mirror)}
					className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
						mirror
							? "bg-emerald-950/30 border-emerald-500/50 text-white"
							: "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600"
					}`}
				>
					<FlipHorizontal
						className={`w-5 h-5 mt-0.5 shrink-0 ${
							mirror ? "text-emerald-400" : "text-slate-500"
						}`}
					/>
					<div>
						<div className="text-xs font-semibold flex items-center gap-1.5">
							Horizontal Flip (Mirror)
							{mirror && (
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
							)}
						</div>
						<p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
							Flips video to defeat YouTube automated frame scanning.
						</p>
					</div>
				</button>

				{/* 3. Safe 2% Zoom with Top Headroom Protection */}
				<button
					type="button"
					onClick={() => setApplyZoom(!applyZoom)}
					className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
						applyZoom
							? "bg-purple-950/30 border-purple-500/50 text-white"
							: "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600"
					}`}
				>
					<ZoomIn
						className={`w-5 h-5 mt-0.5 shrink-0 ${
							applyZoom ? "text-purple-400" : "text-slate-500"
						}`}
					/>
					<div>
						<div className="text-xs font-semibold flex items-center gap-1.5">
							2% Safe Zoom (Top Anchor)
							{applyZoom && (
								<span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
							)}
						</div>
						<p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
							Subtle 1.02x zoom that protects heads, hats, and titles.
						</p>
					</div>
				</button>

				{/* 4. Soft Motion & Speed Shift */}
				<button
					type="button"
					onClick={() => setApplyWavyMotion(!applyWavyMotion)}
					className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
						applyWavyMotion
							? "bg-amber-950/30 border-amber-500/50 text-white"
							: "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600"
					}`}
				>
					<Activity
						className={`w-5 h-5 mt-0.5 shrink-0 ${
							applyWavyMotion ? "text-amber-400" : "text-slate-500"
						}`}
					/>
					<div>
						<div className="text-xs font-semibold flex items-center gap-1.5">
							Gentle 3% Motion
							{applyWavyMotion && (
								<span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
							)}
						</div>
						<p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
							Soft bounded motion with zero jerky motion.
						</p>
					</div>
				</button>
			</div>

			{/* Color Filter Presets */}
			<div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
				<div className="flex items-center justify-between text-xs font-semibold text-slate-300">
					<div className="flex items-center gap-1.5">
						<Palette className="w-4 h-4 text-cyan-400" />
						<span>Color Filter Style</span>
					</div>
					<span className="text-[11px] text-slate-500 uppercase">
						{colorFilter}
					</span>
				</div>
				<div className="grid grid-cols-4 gap-2">
					{[
						{ id: "cinematic", label: "Cinematic" },
						{ id: "vivid", label: "Vivid" },
						{ id: "warm", label: "Warm" },
						{ id: "none", label: "Normal" },
					].map((filter) => (
						<button
							key={filter.id}
							type="button"
							onClick={() => setColorFilter(filter.id)}
							className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
								colorFilter === filter.id
									? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
									: "bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white"
							}`}
						>
							{filter.label}
						</button>
					))}
				</div>
			</div>

			{/* Micro Color Adjustments Sliders */}
			<div className="grid grid-cols-3 gap-3 pt-2 text-xs">
				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-[11px] text-slate-400">
						<span>Brightness</span>
						<span>{(brightness * 100).toFixed(0)}%</span>
					</div>
					<input
						type="range"
						min={-0.1}
						max={0.1}
						step={0.01}
						value={brightness}
						onChange={(e) => setBrightness(Number.parseFloat(e.target.value))}
						className="accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-[11px] text-slate-400">
						<span>Contrast</span>
						<span>{contrast.toFixed(2)}x</span>
					</div>
					<input
						type="range"
						min={0.9}
						max={1.15}
						step={0.01}
						value={contrast}
						onChange={(e) => setContrast(Number.parseFloat(e.target.value))}
						className="accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
					/>
				</div>

				<div className="flex flex-col gap-1">
					<div className="flex justify-between text-[11px] text-slate-400">
						<span>Saturation</span>
						<span>{saturation.toFixed(2)}x</span>
					</div>
					<input
						type="range"
						min={0.9}
						max={1.2}
						step={0.01}
						value={saturation}
						onChange={(e) => setSaturation(Number.parseFloat(e.target.value))}
						className="accent-cyan-500 h-1 bg-slate-800 rounded cursor-pointer"
					/>
				</div>
			</div>

			{/* Extra Safeguard info */}
			<div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
				<div className="flex items-center gap-2">
					<Zap className="w-3.5 h-3.5 text-amber-400" />
					<span>Auto Hash Breaking (1.01x PTS + 0ms Stereo Shift)</span>
				</div>
				<span className="text-emerald-400 font-medium">✓ Enabled</span>
			</div>
		</div>
	);
}
