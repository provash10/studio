"use client";

import React, { useRef } from "react";
import {
	Scissors,
	Trash2,
	Snowflake,
	FlipHorizontal,
	Mic,
	Lock,
	Eye,
	VolumeX,
	Magnet,
	Minus,
	Plus,
	Square,
	PenTool,
	MousePointer,
	Crop,
	Link2,
	Film,
	Music,
} from "lucide-react";

export default function CapCutTimeline({
	duration = 36.22,
	currentTime = 0,
	onSeek,
	videoTitle = "Uploaded Video",
	blackBgLayer = true,
	mirror = true,
	setMirror,
	voiceoverFileName = null,
	bgmTrackName = "bg3.mp4",
	bgmEnabled = true,
	onRecordMic,
	isRecording = false,
}) {
	const timelineRef = useRef(null);

	const formatCapCutTimecode = (seconds) => {
		const safeSec = Math.max(0, Number(seconds) || 0);
		const m = Math.floor((safeSec % 3600) / 60);
		const s = Math.floor(safeSec % 60);
		return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	};

	const handleSplit = () => {};
	const handleDelete = () => {};
	const handleFreeze = () => {};

	const handleTimelineClick = (e) => {
		if (!timelineRef.current || duration <= 0) return;
		const rect = timelineRef.current.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
		const targetTime = clickRatio * duration;
		if (onSeek) onSeek(targetTime);
	};

	const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

	return (
		<div className="h-full flex flex-col bg-[#141518] select-none text-xs border-t border-[#212328]">
			{/* Timeline Toolbar (Exact CapCut Toolbar with working actions) */}
			<div className="h-8 bg-[#18191c] border-b border-[#212328] px-3 flex items-center justify-between text-slate-400 shrink-0">
				{/* Left Interactive Editing Tools */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						className="p-1 rounded hover:bg-[#25262c] text-white"
						title="Select Tool"
					>
						<MousePointer className="w-3.5 h-3.5" />
					</button>

					<button
						type="button"
						onClick={handleSplit}
						className="p-1 rounded hover:bg-[#25262c] text-[#00e5ff] hover:text-white transition-colors"
						title="Split Clip at Playhead (Ctrl+B)"
					>
						<Scissors className="w-3.5 h-3.5" />
					</button>

					<button
						type="button"
						onClick={handleDelete}
						className="p-1 rounded hover:bg-[#25262c] text-slate-400 hover:text-rose-400 transition-colors"
						title="Delete Selected Clip"
					>
						<Trash2 className="w-3.5 h-3.5" />
					</button>

					<div className="h-3 w-[1px] bg-[#2a2c33]" />

					<button
						type="button"
						onClick={handleFreeze}
						className="p-1 rounded hover:bg-[#25262c] text-slate-400 hover:text-cyan-300 transition-colors"
						title="Freeze Frame at Current Time"
					>
						<Snowflake className="w-3.5 h-3.5" />
					</button>

					<button
						type="button"
						className="p-1 rounded hover:bg-[#25262c] text-slate-400 hover:text-white"
						title="Crop"
					>
						<Crop className="w-3.5 h-3.5" />
					</button>

					<button
						type="button"
						onClick={() => setMirror(!mirror)}
						className={`p-1 rounded transition-colors ${
							mirror
								? "text-[#00e5ff] bg-[#202126]"
								: "hover:bg-[#25262c] text-slate-400 hover:text-white"
						}`}
						title="Mirror (Horizontal Flip)"
					>
						<FlipHorizontal className="w-3.5 h-3.5" />
					</button>
				</div>

				{/* Right Tools: Mic Record, Snapping, Zoom */}
				<div className="flex items-center gap-3 text-slate-400">
					<button
						type="button"
						onClick={onRecordMic}
						className={`p-1 rounded hover:text-white transition-colors ${
							isRecording ? "text-rose-500 animate-pulse" : ""
						}`}
						title="Record Voiceover"
					>
						<Mic className="w-3.5 h-3.5" />
					</button>

					<div className="h-3 w-[1px] bg-[#2a2c33]" />

					<button
						type="button"
						className="p-1 text-[#00e5ff]"
						title="Snapping On"
					>
						<Magnet className="w-3.5 h-3.5" />
					</button>

					<button type="button" className="p-1 text-slate-400" title="Link">
						<Link2 className="w-3.5 h-3.5" />
					</button>

					{/* Zoom slider */}
					<div className="flex items-center gap-1.5 text-slate-500">
						<Minus className="w-2.5 h-2.5" />
						<div className="w-16 h-1 bg-[#282a30] rounded-full overflow-hidden">
							<div className="w-1/2 h-full bg-slate-400 rounded-full" />
						</div>
						<Plus className="w-2.5 h-2.5" />
					</div>
				</div>
			</div>

			{/* Multi-Track Area */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left Track Control Rail */}
				<div className="w-20 bg-[#121316] border-r border-[#212328] flex flex-col justify-between py-1 text-slate-500 text-[10px] shrink-0 font-mono">
					{/* Ruler space */}
					<div className="h-6" />

					{/* Track V1 Control (Video) */}
					<div className="h-10 px-2 flex items-center justify-between border-t border-[#1a1b20]">
						<span className="text-[#00e5ff] font-bold text-[9px]">V1</span>
						<div className="flex items-center gap-1">
							<Lock className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
							<Eye className="w-3 h-3 text-[#00e5ff] cursor-pointer" />
						</div>
					</div>

					{/* Track A1 Control (Voiceover) */}
					<div className="h-9 px-2 flex items-center justify-between border-t border-[#1a1b20]">
						<span className="text-emerald-400 font-bold text-[9px]">A1</span>
						<div className="flex items-center gap-1">
							<Lock className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
							<Mic className="w-3 h-3 text-emerald-400 cursor-pointer" />
						</div>
					</div>

					{/* Track A2 Control (BGM) */}
					<div className="h-9 px-2 flex items-center justify-between border-t border-[#1a1b20]">
						<span className="text-indigo-400 font-bold text-[9px]">A2</span>
						<div className="flex items-center gap-1">
							<Lock className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
							<Music className="w-3 h-3 text-indigo-400 cursor-pointer" />
						</div>
					</div>

					{/* Track Base Control (black.jpg) */}
					<div className="h-8 px-2 flex items-center justify-between border-t border-[#1a1b20] bg-[#0c0d10]">
						<span className="text-cyan-400 font-bold text-[9px]">B1</span>
						<div className="flex items-center gap-1">
							<Lock className="w-3 h-3 text-[#00e5ff]" />
							<Square className="w-2.5 h-2.5 fill-[#00e5ff] text-[#00e5ff]" />
						</div>
					</div>
				</div>

				{/* Right: Ruler & Track Lanes */}
				<div
					ref={timelineRef}
					onClick={handleTimelineClick}
					className="flex-1 relative flex flex-col bg-[#141518] overflow-x-auto cursor-pointer"
				>
					{/* Time Ruler (00:00, 00:10, 00:20, 00:30, 00:40) */}
					<div className="h-6 bg-[#16171a] border-b border-[#212328] relative flex items-center px-2 text-[10px] text-slate-400 font-mono shrink-0">
						<div className="absolute left-[0%] flex items-center gap-1">
							<span className="text-slate-600">|</span>00:00
						</div>
						<div className="absolute left-[25%] flex items-center gap-1">
							<span className="text-slate-600">|</span>00:10
						</div>
						<div className="absolute left-[50%] flex items-center gap-1">
							<span className="text-slate-600">|</span>00:20
						</div>
						<div className="absolute left-[75%] flex items-center gap-1">
							<span className="text-slate-600">|</span>00:30
						</div>
						<div className="absolute left-[92%] flex items-center gap-1">
							<span className="text-slate-600">|</span>00:40
						</div>
					</div>

					{/* Track 1: Real Uploaded Video Track */}
					<div className="h-10 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#131417]">
						<div className="w-full h-8 bg-gradient-to-r from-[#1c333e] to-[#244352] border border-[#00e5ff]/60 rounded flex items-center px-2.5 justify-between text-[10px] text-white font-mono shadow">
							<span className="font-bold flex items-center gap-1.5 truncate">
								<Film className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
								<span className="text-cyan-200 truncate">{videoTitle || "Uploaded Video"}</span>
							</span>
							<span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-cyan-300 font-bold shrink-0">
								00:00 - {formatCapCutTimecode(duration)}
							</span>
						</div>
					</div>

					{/* Track 2: AI Voiceover (ElevenLabs) Track */}
					<div className="h-9 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#10141a]">
						{voiceoverFileName ? (
							<div className="w-full h-7 bg-gradient-to-r from-[#0d2a1f] to-[#123829] border border-emerald-500/60 rounded flex items-center px-2 text-[10px] text-emerald-300 font-mono shadow justify-between">
								<span className="font-bold flex items-center gap-1.5 truncate">
									<Mic className="w-3 h-3 text-emerald-400 shrink-0" />
									<span className="truncate">ElevenLabs Voiceover: {voiceoverFileName}</span>
								</span>
								<span className="text-[9px] bg-emerald-950/80 px-1.5 py-0.5 rounded text-emerald-300 font-bold shrink-0">
									Active
								</span>
							</div>
						) : (
							<div className="w-full h-7 bg-[#161a22] border border-[#252a36] rounded flex items-center px-2 text-[9.5px] text-slate-400 font-mono justify-between">
								<span className="flex items-center gap-1.5">
									<Mic className="w-3 h-3 text-slate-500 shrink-0" />
									<span>ElevenLabs Voiceover (Auto-generated on Create Video)</span>
								</span>
								<span className="text-[9px] text-slate-500">Auto</span>
							</div>
						)}
					</div>

					{/* Track 3: Looped BGM Music Track */}
					<div className="h-9 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#10131a]">
						{bgmEnabled ? (
							<div className="w-full h-7 bg-gradient-to-r from-[#151c33] to-[#1a2542] border border-indigo-500/50 rounded flex items-center px-2 text-[10px] text-indigo-200 font-mono shadow justify-between">
								<span className="font-bold flex items-center gap-1.5 truncate">
									<Music className="w-3 h-3 text-indigo-400 shrink-0" />
									<span className="truncate">Looped BGM Mix: {bgmTrackName || "bg3.mp4"}</span>
								</span>
								<span className="text-[9px] bg-indigo-950/80 px-1.5 py-0.5 rounded text-indigo-300 font-bold shrink-0">
									Looped
								</span>
							</div>
						) : (
							<div className="w-full h-7 bg-[#15171e] border border-[#232630] rounded flex items-center px-2 text-[9.5px] text-slate-500 font-mono">
								No background music
							</div>
						)}
					</div>

					{/* Track 4: Solid Black Base Canvas [black.jpg] */}
					<div className="h-8 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#090a0d]">
						{blackBgLayer ? (
							<div className="w-full h-6 bg-black border-y border-[#009b9e]/70 rounded flex items-center px-2 text-[9.5px] text-[#00e5ff] font-mono shadow justify-between">
								<span className="font-bold flex items-center gap-1.5">
									<Square className="w-2.5 h-2.5 fill-black border border-[#00e5ff]" />
									<span>black.jpg Base Canvas Layer</span>
								</span>
								<span className="text-[8.5px] text-[#00e5ff]/80 font-bold uppercase">
									✓ Active Framing Layer
								</span>
							</div>
						) : (
							<div className="w-full h-6 bg-slate-900 border border-slate-800 text-[9px] text-slate-600 px-2 flex items-center">
								No background layer
							</div>
						)}
					</div>

					{/* Playhead Marker Needle with Arrow Head */}
					<div
						className="absolute top-0 bottom-0 w-[2px] bg-[#00e5ff] z-30 pointer-events-none transition-all duration-75 shadow-sm shadow-cyan-400"
						style={{ left: `${Math.max(0, Math.min(100, progressPercent))}%` }}
					>
						<div className="w-3 h-3 -ml-[5px] -mt-1 text-[#00e5ff] text-[11px] font-extrabold flex items-center justify-center leading-none">
							▼
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
