"use client";

import React from "react";
import { Scissors, FastForward, Play, Pause } from "lucide-react";

export default function CapCutTrimmer({
	duration = 0,
	currentTime = 0,
	trim = { enabled: false, start: 0, end: 0 },
	onTrimChange,
	onSeek,
}) {
	const effectiveEnd = trim.end > 0 ? trim.end : duration;

	const formatTime = (secs) => {
		const m = Math.floor(secs / 60);
		const s = Math.floor(secs % 60);
		const ms = Math.floor((secs % 1) * 10);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
	};

	const handleStartChange = (e) => {
		const newStart = Math.min(Number.parseFloat(e.target.value), effectiveEnd - 1);
		onTrimChange({
			...trim,
			enabled: true,
			start: Math.max(0, newStart),
			end: effectiveEnd,
		});
		if (onSeek) onSeek(newStart);
	};

	const handleEndChange = (e) => {
		const newEnd = Math.max(Number.parseFloat(e.target.value), trim.start + 1);
		onTrimChange({
			...trim,
			enabled: true,
			start: trim.start,
			end: Math.min(duration, newEnd),
		});
		if (onSeek) onSeek(newEnd);
	};

	const setPreset40Sec = () => {
		const start = 0;
		const end = Math.min(duration, 40);
		onTrimChange({
			enabled: true,
			start,
			end,
		});
	};

	const resetTrim = () => {
		onTrimChange({
			enabled: false,
			start: 0,
			end: duration,
		});
	};

	if (!duration || duration <= 0) {
		return null;
	}

	const startPercent = (trim.start / duration) * 100;
	const endPercent = (effectiveEnd / duration) * 100;
	const currentPercent = (currentTime / duration) * 100;

	return (
		<div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<Scissors className="w-4 h-4 text-emerald-400" />
					<span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
						CapCut Dual-Handle Trimmer
					</span>
					{trim.enabled && (
						<span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-medium">
							Active ({(effectiveEnd - trim.start).toFixed(1)}s)
						</span>
					)}
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={setPreset40Sec}
						className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
					>
						⚡ 40s Highlight Preset
					</button>
					{trim.enabled && (
						<button
							type="button"
							onClick={resetTrim}
							className="px-2.5 py-1 text-xs bg-red-950/40 text-red-400 hover:bg-red-900/60 rounded-lg transition-colors border border-red-900/50"
						>
							Reset
						</button>
					)}
				</div>
			</div>

			{/* Visual Timeline Track */}
			<div className="relative w-full h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden flex items-center select-none">
				{/* Dimmed unselected regions */}
				<div
					className="absolute top-0 bottom-0 left-0 bg-black/60 pointer-events-none"
					style={{ width: `${startPercent}%` }}
				/>
				<div
					className="absolute top-0 bottom-0 right-0 bg-black/60 pointer-events-none"
					style={{ width: `${100 - endPercent}%` }}
				/>

				{/* Active Trim Window */}
				<div
					className="absolute top-0 bottom-0 border-y-2 border-emerald-500/80 bg-emerald-500/10 pointer-events-none"
					style={{
						left: `${startPercent}%`,
						width: `${Math.max(0, endPercent - startPercent)}%`,
					}}
				>
					{/* Handles indicators */}
					<div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500 flex items-center justify-center">
						<div className="w-0.5 h-4 bg-black rounded" />
					</div>
					<div className="absolute right-0 top-0 bottom-0 w-2 bg-emerald-500 flex items-center justify-center">
						<div className="w-0.5 h-4 bg-black rounded" />
					</div>
				</div>

				{/* Playhead Marker */}
				<div
					className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none transition-all duration-75"
					style={{ left: `${Math.min(100, Math.max(0, currentPercent))}%` }}
				>
					<div className="w-2.5 h-2.5 -ml-1 bg-rose-500 rounded-full shadow" />
				</div>

				{/* Hidden dual sliders for dragging */}
				<input
					type="range"
					min={0}
					max={duration}
					step={0.1}
					value={trim.start}
					onChange={handleStartChange}
					className="absolute inset-0 w-full opacity-0 cursor-ew-resize pointer-events-auto h-full z-20"
					title="Drag to adjust Start"
				/>
			</div>

			{/* Timecode Indicators */}
			<div className="flex items-center justify-between text-xs text-slate-400 mt-2 font-mono">
				<div className="flex items-center gap-1">
					<span className="text-slate-500">Start:</span>
					<span className="text-emerald-400 font-medium">
						{formatTime(trim.start)}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-slate-500">Playhead:</span>
					<span className="text-rose-400 font-medium">
						{formatTime(currentTime)}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<span className="text-slate-500">End:</span>
					<span className="text-emerald-400 font-medium">
						{formatTime(effectiveEnd)}
					</span>
				</div>
			</div>
		</div>
	);
}
