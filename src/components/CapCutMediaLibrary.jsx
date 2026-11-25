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
	Filter,
	ArrowUpDown,
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
	const [activeSubTab, setActiveSubTab] = useState("checklist"); // 'media', 'checklist'

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
		<div className="h-full flex flex-col bg-[#141518] border-r border-[#212328] select-none text-xs">
			{/* Top Tool Shelf (Horizontal row of tools like CapCut) */}
			<div className="h-10 bg-[#141518] border-b border-[#212328] px-2 flex items-center justify-between gap-1 overflow-x-auto shrink-0">
				{topTools.map((tool) => {
					const Icon = tool.icon;
					const isActive = activeTopTab === tool.id;
					return (
						<button
							key={tool.id}
							type="button"
							onClick={() => setActiveTopTab(tool.id)}
							className={`flex flex-col items-center justify-center px-1.5 py-0.5 rounded transition-colors shrink-0 ${
								isActive
									? "text-[#00e5ff]"
									: "text-slate-400 hover:text-slate-200"
							}`}
						>
							<div className="w-3.5 h-3.5 flex items-center justify-center">
								{typeof Icon === "function" ? (
									<Icon />
								) : (
									<Icon className="w-3.5 h-3.5" />
								)}
							</div>
							<span className="text-[9px] font-medium leading-tight mt-0.5">
								{tool.label}
							</span>
						</button>
					);
				})}
			</div>

			{/* Sub-Tabs: Media Assets vs Left Editing Checklist */}
			<div className="h-8 bg-[#18191c] border-b border-[#212328] px-2 flex items-center justify-between shrink-0">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => setActiveSubTab("media")}
						className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-colors ${
							activeSubTab === "media"
								? "bg-[#25262c] text-white"
								: "text-slate-400 hover:text-white"
						}`}
					>
						Media Files
					</button>
					<button
						type="button"
						onClick={() => setActiveSubTab("checklist")}
						className={`px-2.5 py-1 rounded text-[10px] font-bold transition-colors flex items-center gap-1 ${
							activeSubTab === "checklist"
								? "bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40"
								: "text-slate-400 hover:text-white"
						}`}
					>
						<CheckSquare className="w-3 h-3" />
						<span>Left Editing Checklist</span>
					</button>
				</div>

				<button
					type="button"
					onClick={onLoadSample}
					className="px-2 py-0.5 bg-[#202126] hover:bg-[#2b2d35] text-slate-300 rounded text-[10px] border border-[#2b2d35]"
					title="Load built-in sample"
				>
					Sample
				</button>
			</div>

			{/* Content Area: Filling the Left Red-Marked Space */}
			<div className="flex-1 flex overflow-hidden">
				{activeSubTab === "checklist" ? (
					/* LEFT EDITING CHECKLIST (With checkmarks + compact manual sliders) */
					<div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 text-slate-300">
						<div className="flex items-center justify-between pb-1.5 border-b border-[#212328]">
							<span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
								<Layers className="w-3.5 h-3.5 text-[#00e5ff]" />
								Left Video Editing Checklist
							</span>
							<span className="text-[9px] text-[#00e5ff] bg-[#00e5ff]/10 px-1.5 py-0.2 rounded font-mono">
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
										Adds solid black base layer beneath video to defeat YouTube
										frame matching.
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
									<span className="font-mono text-[#00e5ff] w-7 text-right">
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

						{/* Item 4: CapCut Auto Trim (40s Highlight Cutter) */}
						<div className="p-2.5 rounded-lg border bg-[#18191c] border-[#26282f] flex flex-col gap-2">
							<label className="flex items-start justify-between cursor-pointer gap-2">
								<div>
									<div className="text-[11px] font-bold text-white flex items-center gap-1">
										<Scissors className="w-3 h-3 text-[#00e5ff]" />
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
									className="accent-[#00e5ff] w-4 h-4 cursor-pointer mt-0.5"
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
				) : (
					/* MEDIA ASSETS VIEW */
					<div className="flex-1 flex flex-col p-2.5 bg-[#141518] overflow-hidden">
						{/* Toolbar: + Import button, Grid view, Sort */}
						<div className="flex items-center justify-between pb-2 border-b border-[#212328] gap-2 shrink-0">
							<label className="cursor-pointer bg-[#1f2025] hover:bg-[#282a32] text-slate-200 px-3 py-1 rounded-md text-[11px] font-medium border border-[#2b2d35] flex items-center gap-1.5 transition-colors">
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

							<div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
								<Grid className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-white" />
								<div className="flex items-center gap-0.5 cursor-pointer hover:text-white">
									<span>All</span>
									<ChevronDown className="w-2.5 h-2.5" />
								</div>
							</div>
						</div>

						{/* Media Cards Grid */}
						<div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-1 pt-2">
							{/* Card 1: Main Video */}
							<div className="relative rounded-md overflow-hidden bg-[#1a1b20] border border-[#2e3037] aspect-[4/3] flex flex-col justify-between p-1.5 group cursor-pointer hover:border-[#00e5ff]/60">
								<div className="flex items-center justify-between z-10">
									<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
										Added
									</span>
									<span className="text-[9px] text-slate-300 font-mono">
										00:12
									</span>
								</div>
								<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#2a241d] to-[#141518]">
									<Film className="w-6 h-6 text-amber-500/80" />
								</div>
								<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9px] text-slate-200 truncate">
									{videoTitle || "Rustic wo...e.mp4"}
								</div>
							</div>

							{/* Card 2: 2.mp4 */}
							<div className="relative rounded-md overflow-hidden bg-[#00ff00] aspect-[4/3] flex flex-col justify-between p-1.5 border border-[#2e3037]">
								<div className="flex items-center justify-between z-10">
									<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
										Added
									</span>
									<span className="text-[9px] text-black font-mono font-bold">
										00:09
									</span>
								</div>
								<div className="absolute inset-0 flex items-center justify-center text-2xl">
									🪵
								</div>
								<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9px] text-slate-200 truncate">
									2.mp4
								</div>
							</div>

							{/* Card 3: 3.mp4 */}
							<div className="relative rounded-md overflow-hidden bg-[#00ff00] aspect-[4/3] flex flex-col justify-between p-1.5 border border-[#2e3037]">
								<div className="flex items-center justify-between z-10">
									<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
										Added
									</span>
									<span className="text-[9px] text-black font-mono font-bold">
										00:16
									</span>
								</div>
								<div className="absolute inset-0 flex items-center justify-center text-2xl">
									🧍
								</div>
								<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9px] text-slate-200 truncate">
									3.mp4
								</div>
							</div>

							{/* Card 4: 4.mp4 */}
							<div className="relative rounded-md overflow-hidden bg-[#00ff00] aspect-[4/3] flex flex-col justify-between p-1.5 border border-[#2e3037]">
								<div className="flex items-center justify-between z-10">
									<span className="bg-black/80 text-white text-[9px] font-medium px-1.5 py-0.2 rounded">
										Added
									</span>
									<span className="text-[9px] text-black font-mono font-bold">
										00:13
									</span>
								</div>
								<div className="absolute inset-0 flex items-center justify-center text-2xl">
									💀
								</div>
								<div className="z-10 bg-black/80 px-1 py-0.5 rounded text-[9px] text-slate-200 truncate">
									4.mp4
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
