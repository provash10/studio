"use client";

import React, { useRef, useState, useEffect } from "react";
import {
	Play,
	Pause,
	RotateCcw,
	Volume2,
	VolumeX,
	Maximize2,
	ShieldCheck,
	Film,
} from "lucide-react";

export default function VideoPlayerPreview({
	videoUrl,
	aspectRatio = "16:9",
	mirror = true,
	blackBgLayer = true,
	applyZoom = false,
	colorFilter = "cinematic",
	brightness = 0.03,
	contrast = 1.05,
	saturation = 1.08,
	onTimeUpdate,
	onDurationChange,
	seekTime = null,
}) {
	const videoRef = useRef(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	useEffect(() => {
		if (videoRef.current && seekTime !== null) {
			videoRef.current.currentTime = seekTime;
			setCurrentTime(seekTime);
		}
	}, [seekTime]);

	const togglePlay = () => {
		if (!videoRef.current) return;
		if (videoRef.current.paused) {
			videoRef.current.play();
			setIsPlaying(true);
		} else {
			videoRef.current.pause();
			setIsPlaying(false);
		}
	};

	const handleTimeUpdate = () => {
		if (videoRef.current) {
			const ct = videoRef.current.currentTime;
			setCurrentTime(ct);
			if (onTimeUpdate) onTimeUpdate(ct);
		}
	};

	const handleLoadedMetadata = () => {
		if (videoRef.current) {
			const d = videoRef.current.duration || 0;
			setDuration(d);
			if (onDurationChange) onDurationChange(d);
		}
	};

	const toggleMute = () => {
		if (!videoRef.current) return;
		videoRef.current.muted = !videoRef.current.muted;
		setIsMuted(videoRef.current.muted);
	};

	const formatTime = (secs) => {
		const m = Math.floor(secs / 60);
		const s = Math.floor(secs % 60);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	// CSS filter string for live preview
	let liveFilter = `brightness(${1 + brightness}) contrast(${contrast}) saturate(${saturation})`;
	if (colorFilter === "cinematic") {
		liveFilter += " sepia(0.12) hue-rotate(-5deg)";
	} else if (colorFilter === "vivid") {
		liveFilter += " saturate(1.25) contrast(1.1)";
	} else if (colorFilter === "warm") {
		liveFilter += " sepia(0.2) saturate(1.15)";
	}

	return (
		<div className="flex flex-col items-center w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
			{/* Canvas Aspect Ratio Container */}
			<div
				className={`relative flex items-center justify-center bg-black rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
					aspectRatio === "9:16"
						? "w-[280px] sm:w-[320px] aspect-[9/16]"
						: "w-full max-w-[680px] aspect-[16/9]"
				}`}
			>
				{/* Black Background Layer (Arman Raj Method) */}
				{blackBgLayer && (
					<div className="absolute inset-0 bg-black pointer-events-none z-0 border border-slate-800/80" />
				)}

				{videoUrl ? (
					<video
						ref={videoRef}
						src={videoUrl}
						className="relative z-10 w-full h-full object-contain transition-all duration-150"
						style={{
							transform: `${mirror ? "scaleX(-1)" : ""} ${
								blackBgLayer ? "scale(0.94)" : ""
							} ${applyZoom ? "scale(1.02)" : ""}`,
							transformOrigin: "center top", // Top anchor protection
							filter: liveFilter,
						}}
						onTimeUpdate={handleTimeUpdate}
						onLoadedMetadata={handleLoadedMetadata}
						onEnded={() => setIsPlaying(false)}
						playsInline
					/>
				) : (
					<div className="flex flex-col items-center justify-center text-slate-500 gap-3 z-10 p-6 text-center">
						<div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
							<Film className="w-8 h-8" />
						</div>
						<p className="text-sm font-medium">No video uploaded yet</p>
						<p className="text-xs text-slate-600 max-w-xs">
							Upload a 16:9 Long Video or 9:16 Shorts above to preview and edit.
						</p>
					</div>
				)}

				{/* Active Live Anti-Copyright Badges */}
				{videoUrl && (
					<div className="absolute top-3 left-3 z-20 flex flex-wrap gap-1.5 pointer-events-none">
						{mirror && (
							<span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full backdrop-blur font-medium">
								⇄ Mirrored
							</span>
						)}
						{blackBgLayer && (
							<span className="bg-blue-950/80 border border-blue-500/40 text-blue-400 text-[10px] px-2 py-0.5 rounded-full backdrop-blur font-medium">
								◼ Black BG
							</span>
						)}
						{applyZoom && (
							<span className="bg-purple-950/80 border border-purple-500/40 text-purple-400 text-[10px] px-2 py-0.5 rounded-full backdrop-blur font-medium">
								🔍 1.02x Safe Zoom
							</span>
						)}
					</div>
				)}
			</div>

			{/* Playback Controls Bar */}
			{videoUrl && (
				<div className="w-full max-w-[680px] mt-4 flex items-center gap-3">
					<button
						type="button"
						onClick={togglePlay}
						className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-colors shadow"
					>
						{isPlaying ? (
							<Pause className="w-4 h-4 fill-current" />
						) : (
							<Play className="w-4 h-4 fill-current ml-0.5" />
						)}
					</button>

					<button
						type="button"
						onClick={toggleMute}
						className="p-2 text-slate-400 hover:text-white transition-colors"
					>
						{isMuted ? (
							<VolumeX className="w-4 h-4 text-rose-400" />
						) : (
							<Volume2 className="w-4 h-4" />
						)}
					</button>

					{/* Seek bar */}
					<input
						type="range"
						min={0}
						max={duration || 100}
						step={0.1}
						value={currentTime}
						onChange={(e) => {
							const val = Number.parseFloat(e.target.value);
							if (videoRef.current) videoRef.current.currentTime = val;
							setCurrentTime(val);
						}}
						className="flex-1 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
					/>

					<div className="text-xs font-mono text-slate-400 whitespace-nowrap">
						{formatTime(currentTime)} / {formatTime(duration)}
					</div>
				</div>
			)}
		</div>
	);
}
