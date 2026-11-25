"use client";

import React, { useState } from "react";
import {
	Folder,
	Music,
	Type,
	Star,
	Sparkles,
	SlidersHorizontal,
	Plus,
	Grid,
	Film,
	Square,
	Scissors,
	CheckSquare,
	Layers,
	ChevronDown,
	ChevronRight,
	Upload,
	Check,
} from "lucide-react";

export default function CapCutMediaLibrary({
	onFileUpload,
	onLoadSample,
	uploadedVideo,
	videoTitle,
	duration,
	isUploading = false,
	// Left Side Editing Checklist props
	blackBgLayer,
	setBlackBgLayer,
	videoScale = 94,
	setVideoScale,
	overlayChroma = true,
	setOverlayChroma,
	autoTrim40s = false,
	setAutoTrim40s,
	trimStart = 0,
	setTrimStart,
	trimEnd = 40,
	setTrimEnd,
}) {
	const [activeTopTab, setActiveTopTab] = useState("media");
	const [activeSubTab, setActiveSubTab] = useState("media"); // default to 'media' so user sees CapCut media first

	const topTools = [
		{ id: "media", label: "Media", icon: Folder },
		{ id: "audio", label: "Audio", icon: Music },
		{ id: "text", label: "Text", icon: Type },
		{ id: "stickers", label: "Stickers", icon: Star },
		{ id: "effects", label: "Effects", icon: Sparkles },
		{
			id: "transitions",
			label: "Transitions",
			icon: () => (
				<span className="text-[11px] font-bold tracking-tighter">⧖</span>
			),
		},
		{
			id: "filters",
			label: "Filters",
			icon: () => (
				<span className="text-[11px] font-bold tracking-tighter">◯◯</span>
			),
		},
		{ id: "adjustment", label: "Adjustment", icon: SlidersHorizontal },
	];

	return (
		<div className="h-full flex flex-col bg-[#141518] border-r border-[#212328] select-none text-xs overflow-hidden">
			{/* Top Tool Shelf (Pixel-perfect CapCut horizontal bar - perfectly fits without scrollbar) */}
			<div className="h-11 bg-[#141518] border-b border-[#212328] px-1 flex items-center justify-between no-scrollbar shrink-0">
				{topTools.map((tool) => {
					const Icon = tool.icon;
					const isActive = activeTopTab === tool.id;
					return (
						<button
							key={tool.id}
							type="button"
							onClick={() => setActiveTopTab(tool.id)}
							className={`flex-1 flex flex-col items-center justify-center py-1 rounded transition-colors group cursor-pointer ${
								isActive
									? "text-[#00e5ff]"
									: "text-slate-400 hover:text-slate-200"
							}`}
							title={tool.label}
						>
							<div className="w-4 h-4 flex items-center justify-center">
								{typeof Icon === "function" ? (
									<Icon />
								) : (
									<Icon className="w-3.5 h-3.5" />
								)}
							</div>
							<span className="text-[9.5px] font-medium leading-none mt-1 truncate max-w-full">
								{tool.label}
							</span>
							{isActive && (
								<div className="w-3 h-0.5 bg-[#00e5ff] rounded-full mt-0.5" />
							)}
						</button>
					);
				})}
			</div>

			{/* Sub-Tabs: CapCut Media Files vs Left Editing Checklist */}
			<div className="h-9 bg-[#17181c] border-b border-[#212328] px-2.5 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={() => setActiveSubTab("media")}
						className={`px-3 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
							activeSubTab === "media"
								? "bg-[#25272e] text-white shadow-sm"
								: "text-slate-400 hover:text-white"
						}`}
					>
						<Folder className="w-3 h-3 text-[#00e5ff]" />
						<span>Media Files</span>
					</button>

					<button
						type="button"
						onClick={() => setActiveSubTab("checklist")}
						className={`px-3 py-1 rounded text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
							activeSubTab === "checklist"
								? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 shadow-sm"
								: "text-slate-400 hover:text-white"
						}`}
					>
						<CheckSquare className="w-3 h-3" />
						<span>Left Editing Checklist</span>
						<span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
					</button>
				</div>

				<button
					type="button"
					onClick={onLoadSample}
					className="px-2 py-0.5 bg-[#202126] hover:bg-[#2b2d35] text-slate-300 rounded text-[10px] border border-[#2b2d35] transition-colors cursor-pointer"
					title="Load built-in rustic wooden test sample"
				>
					Sample
				</button>
			</div>

			{/* Main Content Viewport */}
			<div className="flex-1 flex overflow-hidden">
				{activeSubTab === "media" ? (
					/* 1. AUTHENTIC CAPCUT MEDIA ASSETS VIEW */
					<div className="flex-1 flex overflow-hidden">
						{/* Left Sub-Rail (Local / Library) */}
						<div className="w-16 border-r border-[#212328] bg-[#121316] p-1.5 flex flex-col gap-1 text-[10px] text-slate-400 shrink-0">
							<div className="flex items-center justify-between px-1 py-1 text-slate-300 font-semibold text-[10px] cursor-pointer">
								<span>Local</span>
								<ChevronDown className="w-2.5 h-2.5" />
							</div>
							<div className="px-2 py-1 rounded bg-[#202227] text-[#00e5ff] font-medium flex items-center gap-1">
								<ChevronRight className="w-2.5 h-2.5" />
								<span>Import</span>
							</div>
							<div className="px-2 py-1 text-slate-400 hover:text-white rounded hover:bg-[#1a1b20] cursor-pointer">
								Library
							</div>
						</div>

						{/* Center Media Shelf */}
						<div className="flex-1 flex flex-col p-2.5 bg-[#141518] overflow-hidden">
							{/* Toolbar: + Import button & Sort */}
							<div className="flex items-center justify-between pb-2 border-b border-[#212328] gap-2 shrink-0">
								<label className="cursor-pointer bg-[#1f2127] hover:bg-[#282a32] text-slate-200 px-3 py-1.5 rounded-md text-[11px] font-semibold border border-[#2f323c] flex items-center gap-1.5 transition-all shadow-sm">
									<span className="w-3.5 h-3.5 rounded-full bg-[#00e5ff] text-black flex items-center justify-center font-bold text-[10px]">
										+
									</span>
									<span>{isUploading ? "Importing..." : "Import"}</span>
									<input
										type="file"
										accept="video/*"
										className="hidden"
										onChange={(e) => onFileUpload(e.target.files?.[0])}
									/>
								</label>

								<div className="flex items-center gap-2 text-slate-400 text-[10px]">
									<Grid className="w-3.5 h-3.5 text-slate-300 cursor-pointer hover:text-white" />
									<div className="flex items-center gap-0.5 cursor-pointer hover:text-white">
										<span>Sort</span>
										<ChevronDown className="w-2.5 h-2.5" />
									</div>
									<div className="flex items-center gap-0.5 cursor-pointer hover:text-white">
										<span>All</span>
										<ChevronDown className="w-2.5 h-2.5" />
									</div>
								</div>
							</div>

							{/* Video Cards Grid (Matching the CapCut desktop layout) */}
							<div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2.5 pr-1 pt-2 content-start">
								{/* Card 1: Main Video (Uploaded or Sample) */}
								<div className="relative rounded-md overflow-hidden bg-[#1c1d22] border border-[#2f323c] aspect-[4/3] flex flex-col justify-between p-1.5 group cursor-pointer hover:border-[#00e5ff]/80 transition-colors">
									<div className="flex items-center justify-between z-10">
										<span className="bg-[#00e5ff] text-black text-[9px] font-bold px-1.5 py-0.2 rounded">
											Added
										</span>
										<span className="text-[9px] text-slate-300 font-mono bg-black/70 px-1 rounded">
											00:{Math.floor(duration || 36).toString().padStart(2, "0")}
										</span>
									</div>
									<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#2a241d] to-[#141518]">
										<Film className="w-7 h-7 text-amber-500/90" />
									</div>
									<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9.5px] text-slate-200 truncate font-mono">
										{videoTitle || "Rustic wo...e.mp4"}
									</div>
								</div>

								{/* Card 2: 2.mp4 (Puppet Chroma) */}
								<div className="relative rounded-md overflow-hidden bg-[#00dd00] aspect-[4/3] flex flex-col justify-between p-1.5 border border-[#2f323c]">
									<div className="flex items-center justify-between z-10">
										<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
											Added
										</span>
										<span className="text-[9px] text-black font-mono font-bold bg-white/70 px-1 rounded">
											00:09
										</span>
									</div>
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-8 h-8 rounded-full bg-amber-800/80 flex items-center justify-center text-[10px] text-white font-bold">
											🧸
										</div>
									</div>
									<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9.5px] text-slate-200">
										2.mp4
									</div>
								</div>

								{/* Card 3: 3.mp4 (Runner Chroma) */}
								<div className="relative rounded-md overflow-hidden bg-[#00dd00] aspect-[4/3] flex flex-col justify-between p-1.5 border border-[#2f323c]">
									<div className="flex items-center justify-between z-10">
										<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
											Added
										</span>
										<span className="text-[9px] text-black font-mono font-bold bg-white/70 px-1 rounded">
											00:16
										</span>
									</div>
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-[10px] text-white">
											🏃
										</div>
									</div>
									<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9.5px] text-slate-200">
										3.mp4
									</div>
								</div>

								{/* Card 4: 4.mp4 (Skeleton Chroma) */}
								<div className="relative rounded-md overflow-hidden bg-[#00dd00] aspect-[4/3] flex flex-col justify-between p-1.5 border border-[#2f323c]">
									<div className="flex items-center justify-between z-10">
										<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
											Added
										</span>
										<span className="text-[9px] text-black font-mono font-bold bg-white/70 px-1 rounded">
											00:13
										</span>
									</div>
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-[10px] text-white">
											💀
										</div>
									</div>
									<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9.5px] text-slate-200">
										4.mp4
									</div>
								</div>
							</div>

							{/* Quick Layer Status Bar at bottom of Media View */}
							<div className="mt-2 pt-2 border-t border-[#212328] flex items-center justify-between text-[10px] text-slate-400 shrink-0">
								<div className="flex items-center gap-1.5">
									<span className="w-2 h-2 rounded-full bg-[#00e5ff]" />
									<span>Base: black.jpg (Active)</span>
								</div>
								<button
									type="button"
									onClick={() => setActiveSubTab("checklist")}
									className="text-[#00e5ff] hover:underline flex items-center gap-0.5 cursor-pointer"
								>
									<span>Edit Checklist</span>
									<ChevronRight className="w-3 h-3" />
								</button>
							</div>
						</div>
					</div>
				) : (
					/* 2. LEFT EDITING CHECKLIST (With checkmarks + compact manual sliders) */
					<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 text-slate-300">
						<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
							<span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
								<Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
								Left Video Editing Checklist
							</span>
							<span className="text-[9px] text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0.5 rounded font-mono">
								Visual Layering
							</span>
						</div>

						{/* Item 1: Solid Black Canvas Base (The Red Mark CapCut Layer) */}
						<div
							className={`p-2.5 rounded-lg border transition-all ${
								blackBgLayer
									? "bg-[#0c1417] border-[#00e5ff]/60 text-white"
									: "bg-[#18191c] border-[#26282f] text-slate-400"
							}`}
						>
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-white flex items-center gap-1">
										<span>1. Solid Black Base Canvas</span>
										{blackBgLayer && (
											<span className="text-[9px] text-[#00e5ff] font-mono">
												[black.jpg]
											</span>
										)}
									</div>
									<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
										Adds solid black base layer beneath video to defeat YouTube frame matching.
									</p>
								</div>
								<input
									type="checkbox"
									checked={blackBgLayer}
									onChange={(e) => setBlackBgLayer(e.target.checked)}
									className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5"
								/>
							</label>
						</div>

						{/* Item 2: Video Scaling & Center Framing */}
						<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-white">
										2. Video Scale & Centering
									</div>
									<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
										Scales video slightly so black border surrounds the frame.
									</p>
								</div>
								<input
									type="checkbox"
									checked={videoScale < 100}
									onChange={(e) => setVideoScale(e.target.checked ? 94 : 100)}
									className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5"
								/>
							</label>

							{/* Compact Manual Slider */}
							<div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#212328]">
								<span className="text-slate-400">Manual Scale:</span>
								<div className="flex items-center gap-2">
									<input
										type="range"
										min={85}
										max={100}
										value={videoScale}
										onChange={(e) =>
											setVideoScale(Number.parseInt(e.target.value, 10))
										}
										className="accent-[#00e5ff] w-20 h-1 bg-[#25262c] rounded cursor-pointer"
									/>
									<span className="font-mono text-[#00e5ff] w-7 text-right font-bold">
										{videoScale}%
									</span>
								</div>
							</div>
						</div>

						{/* Item 3: Green Screen Overlay Track */}
						<div
							className={`p-2.5 rounded-lg border transition-all ${
								overlayChroma
									? "bg-[#0b1a10] border-emerald-500/60"
									: "bg-[#18191c] border-[#26282f]"
							}`}
						>
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-white flex items-center gap-1">
										<span>3. Green Screen Meme Overlay (V3)</span>
										<span className="text-[9px] text-emerald-400 font-mono">
											[Chroma]
										</span>
									</div>
									<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
										Superimposes reaction meme characters on top track.
									</p>
								</div>
								<input
									type="checkbox"
									checked={overlayChroma}
									onChange={(e) => setOverlayChroma(e.target.checked)}
									className="accent-emerald-400 w-4 h-4 cursor-pointer mt-0.5"
								/>
							</label>
						</div>

						{/* Item 4: CapCut Highlight Trimmer */}
						<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-white flex items-center gap-1">
										<Scissors className="w-3 h-3 text-amber-400" />
										<span>4. CapCut Highlight Trimmer</span>
									</div>
									<p className="text-[9px] text-slate-400 mt-0.5 leading-snug">
										Trims video to first 40s viral climax hook as per Docs.
									</p>
								</div>
								<input
									type="checkbox"
									checked={autoTrim40s}
									onChange={(e) => setAutoTrim40s(e.target.checked)}
									className="accent-amber-400 w-4 h-4 cursor-pointer mt-0.5"
								/>
							</label>

							{/* Compact Manual Trim Inputs */}
							{autoTrim40s && (
								<div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-[#212328]">
									<div className="flex items-center gap-1 bg-[#121316] p-1 rounded border border-[#2b2d35]">
										<span className="text-slate-500">Start:</span>
										<input
											type="number"
											min={0}
											value={trimStart}
											onChange={(e) =>
												setTrimStart(Number.parseFloat(e.target.value) || 0)
											}
											className="w-10 bg-transparent text-white font-mono focus:outline-none"
										/>
										<span>s</span>
									</div>
									<div className="flex items-center gap-1 bg-[#121316] p-1 rounded border border-[#2b2d35]">
										<span className="text-slate-500">End:</span>
										<input
											type="number"
											min={1}
											value={trimEnd}
											onChange={(e) =>
												setTrimEnd(Number.parseFloat(e.target.value) || 40)
											}
											className="w-10 bg-transparent text-white font-mono focus:outline-none"
										/>
										<span>s</span>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
