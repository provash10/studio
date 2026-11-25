"use client";

import React, { useState, useRef } from "react";
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
} from "lucide-react";

export default function CapCutTimeline({
	duration = 36.22,
	currentTime = 0,
	onSeek,
	videoTitle = "Rustic wooden...",
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

	// Interactive Timeline Clips State (Main Track V2)
	const [clips, setClips] = useState([
		{ id: 1, name: "Rustic wooden", widthPct: 15, isFreeze: false },
		{ id: 2, name: "Freeze 00:00:05:18", widthPct: 20, isFreeze: true },
		{ id: 3, name: "Rustic wood", widthPct: 15, isFreeze: false },
		{ id: 4, name: "Freeze 00:00:05:26", widthPct: 20, isFreeze: true },
		{ id: 5, name: "Freeze 00:00:05:27", widthPct: 15, isFreeze: true },
		{ id: 6, name: "Freeze 00:00:06:29", widthPct: 15, isFreeze: true },
	]);
	const [selectedClipId, setSelectedClipId] = useState(5); // Default selected clip like in user screenshot

	// Interactive Actions
	const handleSplit = () => {
		if (clips.length === 0) return;
		const targetIndex = clips.findIndex((c) => c.id === selectedClipId);
		if (targetIndex === -1) return;
		const current = clips[targetIndex];
		const halfWidth = Math.max(5, current.widthPct / 2);

		const firstHalf = {
			...current,
			id: Date.now(),
			widthPct: halfWidth,
			name: `${current.name.split(" ")[0]} Split`,
		};
		const secondHalf = {
			...current,
			id: Date.now() + 1,
			widthPct: halfWidth,
			name: `${current.name.split(" ")[0]} Part 2`,
		};

		const updated = [...clips];
		updated.splice(targetIndex, 1, firstHalf, secondHalf);
		setClips(updated);
		setSelectedClipId(firstHalf.id);
	};

	const handleDelete = () => {
		if (clips.length <= 1) return;
		const updated = clips.filter((c) => c.id !== selectedClipId);
		setClips(updated);
		if (updated.length > 0) setSelectedClipId(updated[0].id);
	};

	const handleFreeze = () => {
		setClips(
			clips.map((c) =>
				c.id === selectedClipId
					? { ...c, isFreeze: true, name: `Freeze 00:00:${Math.floor(currentTime)}` }
					: c,
			),
		);
	};

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
				<div className="w-20 bg-[#121316] border-r border-[#212328] flex flex-col justify-between py-1 text-slate-500 text-[10px] shrink-0">
					{/* Ruler space */}
					<div className="h-6" />

					{/* Track 3 Control */}
					<div className="h-10 px-2 flex items-center justify-end gap-1.5 border-t border-[#1a1b20]">
						<Lock className="w-3 h-3 hover:text-white cursor-pointer" />
						<Eye className="w-3 h-3 hover:text-white cursor-pointer" />
					</div>

					{/* Track 2 Control */}
					<div className="h-11 px-2 flex items-center justify-end gap-1.5 border-t border-[#1a1b20]">
						<Lock className="w-3 h-3 hover:text-white cursor-pointer" />
						<Eye className="w-3 h-3 hover:text-white cursor-pointer" />
						<VolumeX className="w-3 h-3 text-rose-400" title="Audio Muted" />
					</div>

					{/* Track 1 Control (The black.jpg Layer) */}
					<div className="h-9 px-2 flex items-center justify-end gap-1.5 border-t border-[#1a1b20] bg-[#0c0d10]">
						<Lock className="w-3 h-3 text-[#00e5ff]" />
						<Eye className="w-3 h-3 text-[#00e5ff]" />
						<PenTool className="w-3 h-3 text-slate-400" />
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

					{/* Track 3: Green clips (Exact replica of user screenshot: 3.mp4, 2.mp4, 7.mp4, 5.mp4) */}
					<div className="h-10 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#141518]">
						<div className="absolute left-[12%] w-[18%] h-7 bg-[#0f7a2d] border border-[#169a3b] rounded flex items-center px-1.5 text-[9px] text-white font-mono shadow truncate">
							3.mp4 00:00:05:18
						</div>
						<div className="absolute left-[34%] w-[19%] h-7 bg-[#0f7a2d] border border-[#169a3b] rounded flex items-center px-1.5 text-[9px] text-white font-mono shadow truncate">
							2.mp4 00:00:05:26
						</div>
						<div className="absolute left-[58%] w-[19%] h-7 bg-[#0f7a2d] border border-[#169a3b] rounded flex items-center px-1.5 text-[9px] text-white font-mono shadow truncate">
							7.mp4 00:00:05:25
						</div>
						<div className="absolute left-[80%] w-[18%] h-7 bg-[#0f7a2d] border border-[#169a3b] rounded flex items-center px-1.5 text-[9px] text-white font-mono shadow truncate">
							5.mp4 00:00:06:29
						</div>
					</div>

					{/* Track 2: Main Video Track with thumbnail filmstrip and clickable Freeze blocks */}
					<div className="h-11 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#131417]">
						<div className="flex w-full h-8 rounded overflow-hidden">
							{clips.map((clip) => {
								const isSelected = clip.id === selectedClipId;
								return (
									<div
										key={clip.id}
										onClick={(e) => {
											e.stopPropagation();
											setSelectedClipId(clip.id);
										}}
										style={{ width: `${clip.widthPct}%` }}
										className={`h-full border-r border-black/40 flex items-center px-1 text-[9px] truncate cursor-pointer transition-all ${
											isSelected
												? "bg-[#486e7a] border-2 border-white rounded shadow-md text-white font-bold z-10"
												: clip.isFreeze
													? "bg-[#3a5863] text-cyan-200"
													: "bg-[#2e4752] text-slate-200"
										}`}
									>
										{clip.name}
									</div>
								);
							})}
						</div>
					</div>

					{/* Track 1: The RED MARKED CapCut Layer: black.jpg */}
					<div className="h-9 relative flex items-center border-b border-[#1c1d22] px-1 bg-[#090a0d]">
						{blackBgLayer ? (
							<div className="w-full h-7 bg-black border-y-2 border-[#009b9e] rounded flex items-center px-2 text-[10px] text-[#00e5ff] font-mono shadow justify-between">
								<span className="font-bold flex items-center gap-1.5">
									<Square className="w-2.5 h-2.5 fill-black border border-[#00e5ff]" />
									black.jpg 00:00:36:22
								</span>
								<span className="text-[9px] text-[#00e5ff]/80 font-semibold uppercase">
									✓ Active Solid Black Base Layer
								</span>
							</div>
						) : (
							<div className="w-full h-6 bg-slate-900 border border-slate-800 text-[10px] text-slate-600 px-2 flex items-center">
								No background layer
							</div>
						)}
					</div>

					{/* Playhead Marker Needle (White needle with top rounded flag) */}
					<div
						className="absolute top-0 bottom-0 w-[1.5px] bg-white z-30 pointer-events-none transition-all duration-75"
						style={{ left: `${Math.max(0, Math.min(100, progressPercent))}%` }}
					>
						<div className="w-3 h-3.5 -ml-[5.5px] bg-white rounded-t-sm shadow-md" />
					</div>
				</div>
			</div>
		</div>
	);
}
