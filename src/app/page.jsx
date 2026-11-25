"use client";

import React, { useState } from "react";
import CapCutTopNav from "@/components/CapCutTopNav";
import CapCutMediaLibrary from "@/components/CapCutMediaLibrary";
import CapCutPlayer from "@/components/CapCutPlayer";
import CapCutInspector from "@/components/CapCutInspector";
import CapCutTimeline from "@/components/CapCutTimeline";
import { CheckCircle2, Download, X, FolderOpen } from "lucide-react";

export default function CapCutStudio() {
	// Project State
	const [videoFilename, setVideoFilename] = useState("");
	const [videoUrl, setVideoUrl] = useState("");
	const [videoTitle, setVideoTitle] = useState("");
	const [duration, setDuration] = useState(36.22);
	const [currentTime, setCurrentTime] = useState(0);
	const [seekTime, setSeekTime] = useState(null);
	const [isUploading, setIsUploading] = useState(false);

	// Aspect Ratio
	const [aspectRatio, setAspectRatio] = useState("9:16");
	const [resolution, setResolution] = useState("1080p");

	// Left Editing Checklist States
	const [blackBgLayer, setBlackBgLayer] = useState(true); // black.jpg solid layer
	const [videoScale, setVideoScale] = useState(94); // 94% scale
	const [overlayChroma, setOverlayChroma] = useState(true);
	const [autoTrim40s, setAutoTrim40s] = useState(false);
	const [trimStart, setTrimStart] = useState(0);
	const [trimEnd, setTrimEnd] = useState(40);

	// Right Editing Checklist States
	const [mirror, setMirror] = useState(true);
	const [applyZoom, setApplyZoom] = useState(false);
	const [colorFilter, setColorFilter] = useState("cinematic");
	const [brightness, setBrightness] = useState(0.03);
	const [contrast, setContrast] = useState(1.05);
	const [saturation, setSaturation] = useState(1.08);
	const [muteOriginalAudio, setMuteOriginalAudio] = useState(true); // 100% Mute for zero copyright
	const [bgmEnabled, setBgmEnabled] = useState(true);
	const [bgmTrackName, setBgmTrackName] = useState("bg3.mp4");
	const [bgmVolume, setBgmVolume] = useState(0.25);
	const [metadataClean, setMetadataClean] = useState(true);

	// Text & Sticker Overlays
	const [textOverlay, setTextOverlay] = useState("WAIT FOR IT... 🔥");
	const [showTextOverlay, setShowTextOverlay] = useState(false);
	const [stickerOverlay, setStickerOverlay] = useState("🧸");
	const [showStickerOverlay, setShowStickerOverlay] = useState(false);
	const [activeTransition, setActiveTransition] = useState("crossfade");
	const [activeTopTab, setActiveTopTab] = useState("media");

	// Voiceover States
	const [voiceoverEnabled, setVoiceoverEnabled] = useState(false);
	const [voiceoverFileName, setVoiceoverFileName] = useState(null);
	const [voiceoverVolume, setVoiceoverVolume] = useState(1.2);

	// Export / Process State
	const [isExporting, setIsExporting] = useState(false);
	const [isCreatingVideo, setIsCreatingVideo] = useState(false);
	const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
	const [processedFilename, setProcessedFilename] = useState(null);
	const [previewMode, setPreviewMode] = useState("raw"); // 'raw' or 'copyright_free'
	const [exportResult, setExportResult] = useState(null);
	const [errorMessage, setErrorMessage] = useState("");

	// Upload Video Handler
	const handleFileUpload = async (file) => {
		if (!file) return;
		setIsUploading(true);
		setErrorMessage("");
		setExportResult(null);
		setProcessedVideoUrl(null);
		setProcessedFilename(null);
		setPreviewMode("raw");

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (data.success) {
				setVideoFilename(data.filename);
				setVideoUrl(data.url);
				setVideoTitle(file.name);
				if (data.metadata?.duration) {
					setDuration(data.metadata.duration);
				}
			} else {
				setErrorMessage(data.error || "Upload failed");
			}
		} catch (err) {
			setErrorMessage(err.message);
		} finally {
			setIsUploading(false);
		}
	};

	// Quick Load Sample Video
	const handleLoadSample = () => {
		setVideoFilename("sample_crash.mp4");
		setVideoUrl("/uploads/sample_crash.mp4");
		setVideoTitle("Rustic wooden... (Sample)");
		setDuration(36.22);
		setExportResult(null);
		setProcessedVideoUrl(null);
		setProcessedFilename(null);
		setPreviewMode("raw");
	};

	// 1. Create Anti-Copyright Video via FFmpeg
	const handleCreateVideo = async () => {
		if (!videoFilename) {
			alert("Please import or select a video first!");
			return;
		}

		setIsCreatingVideo(true);
		setErrorMessage("");

		try {
			console.log("create video request initiated with anti-copyright filters");
			const res = await fetch("/api/process", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filename: videoFilename,
					aspectRatio,
					resolution,
					trim: {
						enabled: autoTrim40s,
						start: trimStart,
						end: trimEnd,
					},
					mirror,
					blackBgLayer,
					videoScale,
					applyZoom,
					colorFilter,
					brightness,
					contrast,
					saturation,
					speedShift: true,
					muteOriginalAudio,
					originalAudioVolume: muteOriginalAudio ? 0 : 0.35,
					applyAudioEqualizer: true,
					stereoDelay: 20,
					bgmEnabled,
					bgmTrackName,
					bgmVolume,
					metadataClean,
					voiceoverEnabled,
					voiceoverFileName,
					voiceoverVolume,
				}),
			});

			const data = await res.json();
			if (data.success) {
				console.log("video created successfully and ready for preview");
				setProcessedVideoUrl(data.url);
				setProcessedFilename(data.filename);
				setPreviewMode("copyright_free");
				setExportResult(data);
				return data;
			} else {
				console.log("video creation returned an error");
				setErrorMessage(data.error || "Processing failed");
				return null;
			}
		} catch (err) {
			setErrorMessage(err.message);
			return null;
		} finally {
			setIsCreatingVideo(false);
		}
	};

	// 2. Execute CapCut Export & Browser Download to Local Documents/Studio
	const handleExport = async () => {
		if (!videoFilename) {
			alert("Please import a video first!");
			return;
		}

		setIsExporting(true);
		setErrorMessage("");

		try {
			let currentResult = exportResult;
			let downloadUrl = processedVideoUrl;
			let downloadName = processedFilename;

			// If video was not created yet, create it now
			if (!downloadUrl) {
				currentResult = await handleCreateVideo();
				if (currentResult && currentResult.success) {
					downloadUrl = currentResult.url;
					downloadName = currentResult.filename;
				}
			}

			if (downloadUrl) {
				// Trigger automatic browser download
				const link = document.createElement("a");
				link.href = downloadUrl;
				link.download = downloadName || "Studio_Video.mp4";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				if (currentResult) {
					setExportResult(currentResult);
				}
			}
		} catch (err) {
			setErrorMessage(err.message);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="h-screen w-screen overflow-hidden bg-[#0e0f12] text-slate-100 flex flex-col font-sans select-none">
			{/* 1. CapCut Top Navigation Bar */}
			<CapCutTopNav
				projectTitle="1124 (2)"
				onExport={handleExport}
				isExporting={isExporting}
				hasVideo={Boolean(videoFilename)}
			/>

			{/* 2. CapCut Middle Workspace (3 Columns: Left Panel Expanded, Center Player, Right Panel Expanded) */}
			<div className="flex-1 flex overflow-hidden">
				{/* Column 1: Left Media Shelf & Left Editing Checklist (Expanded to 410px to perfectly fit CapCut top tools and media shelf) */}
				<div className="w-[410px] h-full shrink-0">
					<CapCutMediaLibrary
						onFileUpload={handleFileUpload}
						onLoadSample={handleLoadSample}
						uploadedVideo={videoUrl}
						videoTitle={videoTitle}
						duration={duration}
						isUploading={isUploading}
						blackBgLayer={blackBgLayer}
						setBlackBgLayer={setBlackBgLayer}
						videoScale={videoScale}
						setVideoScale={setVideoScale}
						overlayChroma={overlayChroma}
						setOverlayChroma={setOverlayChroma}
						autoTrim40s={autoTrim40s}
						setAutoTrim40s={setAutoTrim40s}
						trimStart={trimStart}
						setTrimStart={setTrimStart}
						trimEnd={trimEnd}
						setTrimEnd={setTrimEnd}
						activeTopTab={activeTopTab}
						setActiveTopTab={setActiveTopTab}
						// Audio tools
						onCreateVideo={handleCreateVideo}
						isCreatingVideo={isCreatingVideo}
						processedVideoUrl={processedVideoUrl}
						bgmEnabled={bgmEnabled}
						setBgmEnabled={setBgmEnabled}
						bgmTrackName={bgmTrackName}
						setBgmTrackName={setBgmTrackName}
						bgmVolume={bgmVolume}
						setBgmVolume={setBgmVolume}
						muteOriginalAudio={muteOriginalAudio}
						setMuteOriginalAudio={setMuteOriginalAudio}
						// Text & Sticker overlays
						textOverlay={textOverlay}
						setTextOverlay={setTextOverlay}
						showTextOverlay={showTextOverlay}
						setShowTextOverlay={setShowTextOverlay}
						stickerOverlay={stickerOverlay}
						setStickerOverlay={setStickerOverlay}
						showStickerOverlay={showStickerOverlay}
						setShowStickerOverlay={setShowStickerOverlay}
						// Effects & Transitions
						applyZoom={applyZoom}
						setApplyZoom={setApplyZoom}
						mirror={mirror}
						setMirror={setMirror}
						activeTransition={activeTransition}
						setActiveTransition={setActiveTransition}
						// Filters & Adjustments
						colorFilter={colorFilter}
						setColorFilter={setColorFilter}
						brightness={brightness}
						setBrightness={setBrightness}
						contrast={contrast}
						setContrast={setContrast}
						saturation={saturation}
						setSaturation={setSaturation}
					/>
				</div>

				{/* Column 2: Center Player Viewport (Cleanly filling the center without empty gaps) */}
				<div className="flex-1 h-full min-w-0">
					<CapCutPlayer
						videoUrl={videoUrl}
						aspectRatio={aspectRatio}
						setAspectRatio={setAspectRatio}
						mirror={mirror}
						blackBgLayer={blackBgLayer}
						applyZoom={applyZoom}
						colorFilter={colorFilter}
						brightness={brightness}
						contrast={contrast}
						saturation={saturation}
						muteOriginalAudio={muteOriginalAudio}
						videoScale={videoScale}
						textOverlay={textOverlay}
						showTextOverlay={showTextOverlay}
						stickerOverlay={stickerOverlay}
						showStickerOverlay={showStickerOverlay}
						currentTime={currentTime}
						duration={duration}
						onTimeUpdate={(t) => setCurrentTime(t)}
						onDurationChange={(d) => setDuration(d)}
						seekTime={seekTime}
						// Video Creation & Preview Controls
						onCreateVideo={handleCreateVideo}
						isCreatingVideo={isCreatingVideo}
						processedVideoUrl={processedVideoUrl}
						previewMode={previewMode}
						setPreviewMode={setPreviewMode}
						onExport={handleExport}
					/>
				</div>

				{/* Column 3: Right Inspector & Right Editing Checklist (Expanded to 360px to fill the right red mark) */}
				<div className="w-[360px] h-full shrink-0">
					<CapCutInspector
						mirror={mirror}
						setMirror={setMirror}
						applyZoom={applyZoom}
						setApplyZoom={setApplyZoom}
						colorFilter={colorFilter}
						setColorFilter={setColorFilter}
						brightness={brightness}
						setBrightness={setBrightness}
						contrast={contrast}
						setContrast={setContrast}
						saturation={saturation}
						setSaturation={setSaturation}
						muteOriginalAudio={muteOriginalAudio}
						setMuteOriginalAudio={setMuteOriginalAudio}
						bgmEnabled={bgmEnabled}
						setBgmEnabled={setBgmEnabled}
						bgmTrackName={bgmTrackName}
						setBgmTrackName={setBgmTrackName}
						bgmVolume={bgmVolume}
						setBgmVolume={setBgmVolume}
						metadataClean={metadataClean}
						setMetadataClean={setMetadataClean}
						voiceoverEnabled={voiceoverEnabled}
						setVoiceoverEnabled={setVoiceoverEnabled}
						voiceoverFileName={voiceoverFileName}
						setVoiceoverFileName={setVoiceoverFileName}
						voiceoverVolume={voiceoverVolume}
						setVoiceoverVolume={setVoiceoverVolume}
						videoTitle={videoTitle}
					/>
				</div>
			</div>

			{/* 3. CapCut Bottom Multi-Track Timeline (Interactive editing with Freeze/Split/Delete/Record) */}
			<div className="h-[215px] shrink-0">
				<CapCutTimeline
					duration={duration}
					currentTime={currentTime}
					onSeek={(time) => setSeekTime(time)}
					videoTitle={videoTitle || "Rustic wooden..."}
					blackBgLayer={blackBgLayer}
					mirror={mirror}
					setMirror={setMirror}
					voiceoverFileName={voiceoverFileName}
					bgmTrackName={bgmTrackName}
					bgmEnabled={bgmEnabled}
					onRecordMic={() => alert("Microphone live recording is ready!")}
				/>
			</div>

			{/* Export Result Modal with Documents/Studio/1. Title.mp4 Info */}
			{exportResult && (
				<div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-[#18191c] border border-[#2e3036] rounded-xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2 text-[#00e5ff] font-bold text-sm">
								<CheckCircle2 className="w-5 h-5 text-[#00e5ff]" />
								<span>Export Finished & Saved Locally!</span>
							</div>
							<button
								type="button"
								onClick={() => setExportResult(null)}
								className="text-slate-400 hover:text-white"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Saved Location info */}
						<div className="bg-[#111215] border border-[#24252a] p-3 rounded-lg flex flex-col gap-1.5 text-xs">
							<div className="flex items-center gap-2 text-slate-200 font-semibold">
								<FolderOpen className="w-4 h-4 text-emerald-400" />
								<span>Saved in Documents/Studio Folder:</span>
							</div>
							<div className="font-mono text-[11px] text-[#00e5ff] bg-black/50 p-2 rounded border border-[#202126] break-all">
								{exportResult.localDocPath ||
									`C:\\Users\\Computer Solution\\Documents\\Studio\\${exportResult.filename}`}
							</div>
						</div>

						{/* Video Preview */}
						<div className="rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#2a2b30]">
							<video
								src={exportResult.url}
								controls
								autoPlay
								className="w-full h-full object-contain"
							/>
						</div>

						<div className="flex items-center justify-end gap-2 pt-1">
							<button
								type="button"
								onClick={() => setExportResult(null)}
								className="px-3.5 py-1.5 bg-[#25262c] text-slate-300 rounded text-xs font-semibold hover:bg-[#303238]"
							>
								Close
							</button>
							<a
								href={exportResult.url}
								download={exportResult.filename}
								className="px-4 py-1.5 bg-[#00e5ff] text-black rounded text-xs font-bold hover:bg-[#00cbe2] flex items-center gap-1.5 shadow"
							>
								<Download className="w-3.5 h-3.5 stroke-[2.5]" />
								Download Video
							</a>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
