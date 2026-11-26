"use client";

import React from "react";
import {
	ChevronDown,
	Download,
	Minus,
	Square,
	X,
	Upload,
	Command,
	LayoutGrid,
} from "lucide-react";

export default function CapCutTopNav({
	projectTitle = "1124 (2)",
	onExport,
	isExporting = false,
	hasVideo = false,
	editMode = "auto",
	setEditMode,
	aspectRatio = "9:16",
	setAspectRatio,
	videoType = "shorts",
	setVideoType,
}) {
	return (
		<div className="h-10 bg-[#121316] border-b border-[#212328] px-3 flex items-center justify-between text-xs text-slate-300 select-none">
			{/* Left: CapCut Geometric Logo, Menu & Auto Saved Indicator */}
			<div className="flex items-center gap-2.5">
				{/* CapCut Logo Icon */}
				<div className="flex items-center gap-1.5 cursor-pointer">
					<svg
						className="w-5 h-5 text-white"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polygon points="5 3 19 12 5 21 5 3" fill="white" />
						<polygon points="19 3 5 12 19 21 19 3" fill="white" opacity="0.4" />
					</svg>
					<span className="font-extrabold text-[13px] tracking-tight text-white">
						CapCut
					</span>
				</div>

				{/* Menu Pill Dropdown */}
				<button
					type="button"
					className="flex items-center gap-1 bg-[#1f2025] hover:bg-[#282a31] text-slate-200 px-2.5 py-1 rounded-md text-[11px] font-medium border border-[#2b2d35] transition-colors"
				>
					<span>Menu</span>
					<ChevronDown className="w-3 h-3 text-slate-400" />
				</button>

				{/* Auto Saved Status */}
				<div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono ml-1">
					<span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-sm shadow-cyan-400" />
					<span>Auto saved: 23:02:24</span>
				</div>
			</div>

			{/* Center: Mode Switcher (Auto All OK vs Manual Show All) */}
			<div className="flex items-center gap-2.5">
				<div className="flex items-center bg-[#1a1b20] p-0.5 rounded-lg border border-[#2d2f37]">
					<button
						type="button"
						onClick={() => setEditMode && setEditMode("auto")}
						className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
							editMode === "auto"
								? "bg-[#00e5ff] text-black font-extrabold shadow-sm"
								: "text-slate-400 hover:text-white"
						}`}
						title="Auto Mode: All 8 anti-copyright safeguards enabled automatically"
					>
						<span>⚡ Auto (All OK)</span>
					</button>

					<button
						type="button"
						onClick={() => setEditMode && setEditMode("manual")}
						className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
							editMode === "manual"
								? "bg-[#282a32] text-[#00e5ff] border border-[#00e5ff]/50 shadow-sm"
								: "text-slate-400 hover:text-white"
						}`}
						title="Manual Mode: Show all checklist cards, checkboxes & sliders"
					>
						<span>⚙️ Manual</span>
					</button>
				</div>

				{/* Aspect Ratio Selector (9:16 Shorts, 16:9 Long, 1:1, 4:3, 3:4, 21:9) */}
				<div className="flex items-center bg-[#1a1b20] p-0.5 rounded-lg border border-[#2d2f37] gap-1">
					<button
						type="button"
						onClick={() => {
							if (setVideoType) setVideoType("shorts");
							if (setAspectRatio) setAspectRatio("9:16");
						}}
						className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
							aspectRatio === "9:16"
								? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-extrabold shadow-sm"
								: "text-slate-400 hover:text-white"
						}`}
						title="9:16 Shorts (Vertical, YouTube Shorts / TikTok / Reels)"
					>
						<span>📱 9:16</span>
					</button>

					<button
						type="button"
						onClick={() => {
							if (setVideoType) setVideoType("long");
							if (setAspectRatio) setAspectRatio("16:9");
						}}
						className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
							aspectRatio === "16:9"
								? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold shadow-sm"
								: "text-slate-400 hover:text-white"
						}`}
						title="16:9 Long Video (Landscape Widescreen, YouTube Long-form)"
					>
						<span>🖥️ 16:9</span>
					</button>

					{/* Dropdown for All Ratios */}
					<select
						value={aspectRatio}
						onChange={(e) => {
							const val = e.target.value;
							if (setAspectRatio) setAspectRatio(val);
							if (setVideoType) setVideoType(val === "9:16" ? "shorts" : "long");
						}}
						className="bg-[#24262d] text-[#00e5ff] font-bold text-[10.5px] rounded px-1.5 py-1 border border-[#353742] focus:outline-none cursor-pointer"
						title="Select All Aspect Ratios"
					>
						<option value="9:16">📱 9:16 (Shorts / Reels)</option>
						<option value="16:9">🖥️ 16:9 (Long Video)</option>
						<option value="1:1">⬛ 1:1 (Square Post)</option>
						<option value="4:3">📺 4:3 (Classic Video)</option>
						<option value="3:4">📄 3:4 (Portrait Feed)</option>
						<option value="21:9">🎬 21:9 (Cinematic)</option>
					</select>
				</div>

				<span className="text-[12px] font-semibold text-slate-300 hidden md:inline ml-1 font-mono">
					{projectTitle}
				</span>
			</div>

			{/* Right: Layout, Shortcut, Cyan Export Button & Window Controls */}
			<div className="flex items-center gap-2">
				{/* Two-Pane Layout Icon */}
				<button
					type="button"
					className="p-1.5 rounded hover:bg-[#1f2025] text-slate-400 hover:text-white transition-colors"
					title="Layout options"
				>
					<LayoutGrid className="w-3.5 h-3.5" />
				</button>

				{/* Shortcut Pill */}
				<button
					type="button"
					className="flex items-center gap-1 bg-[#1f2025] hover:bg-[#282a31] text-slate-300 px-2 py-1 rounded text-[11px] font-medium border border-[#2b2d35] transition-colors"
				>
					<Command className="w-3 h-3 text-slate-400" />
					<span>Shortcut</span>
				</button>

				{/* The Real CapCut Cyan Export Button with Upload Tray Arrow */}
				<button
					type="button"
					onClick={onExport}
					disabled={isExporting || !hasVideo}
					className="px-3.5 py-1 bg-[#00e5ff] hover:bg-[#00cce3] text-[#0c0d10] font-black text-[12px] rounded-md shadow flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
				>
					<Upload className="w-3.5 h-3.5 stroke-[2.8]" />
					<span>{isExporting ? "Exporting..." : "Export"}</span>
				</button>

				{/* Standard Desktop Window Controls */}
				<div className="flex items-center text-slate-400 ml-1">
					<button
						type="button"
						className="p-1 hover:text-white hover:bg-[#1f2025] rounded"
					>
						<Minus className="w-3.5 h-3.5" />
					</button>
					<button
						type="button"
						className="p-1 hover:text-white hover:bg-[#1f2025] rounded"
					>
						<Square className="w-3 h-3" />
					</button>
					<button
						type="button"
						className="p-1 hover:text-white hover:bg-rose-600 rounded"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}
