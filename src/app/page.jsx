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

	// Video Format Type & Aspect Ratio
	const [videoType, setVideoType] = useState("shorts"); // 'shorts' or 'long'
	const [aspectRatio, setAspectRatio] = useState("9:16");
	const [resolution, setResolution] = useState("1080p");

	// Unified Aspect Ratio change handler - preserves ANY selected ratio (9:16, 16:9, 1:1, 4:3, 3:4, 21:9)
	const handleAspectRatioChange = (ratio) => {
		setAspectRatio(ratio);
		if (ratio === "9:16" || ratio === "3:4") {
			setVideoType("shorts");
		} else {
			setVideoType("long");
		}
	};

	const handleVideoTypeChange = (type) => {
		setVideoType(type);
		if (type === "shorts") {
			setAspectRatio("9:16");
		} else {
			if (aspectRatio === "9:16" || aspectRatio === "3:4") {
				setAspectRatio("16:9");
			}
		}
	};

	// Left Editing Checklist States
	const [blackBgLayer, setBlackBgLayer] = useState(true); // black.jpg solid layer
	const [videoScale, setVideoScale] = useState(94); // 94% scale
	const [overlayChroma, setOverlayChroma] = useState(true);
	const [autoTrim40s, setAutoTrim40s] = useState(false);
	const [trimStart, setTrimStart] = useState(0);
	const [trimEnd, setTrimEnd] = useState(40);

	// Right Editing Checklist States
	const [mirror, setMirror] = useState(true);
	const [applyZoom, setApplyZoom] = useState(true); // Safe 2% zoom with top-anchor headroom protection enabled by default
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
	const [textPosition, setTextPosition] = useState({ x: 50, y: 12 }); // {x: %, y: %}
	const [stickerOverlay, setStickerOverlay] = useState("🧸");
	const [showStickerOverlay, setShowStickerOverlay] = useState(false);
	const [stickerPosition, setStickerPosition] = useState({ x: 85, y: 85 }); // {x: %, y: %}
	const [activeTransition, setActiveTransition] = useState("crossfade");
	const [activeTopTab, setActiveTopTab] = useState("media");

	// Voiceover States
	const [voiceoverEnabled, setVoiceoverEnabled] = useState(true);
	const [voiceoverFileName, setVoiceoverFileName] = useState(null);
	const [voiceoverVolume, setVoiceoverVolume] = useState(1.2);
	const [voiceProvider, setVoiceProvider] = useState("edge"); // 'edge' (free), 'elevenlabs' (paid), 'system'
	const [selectedVoice, setSelectedVoice] = useState("bn-BD-PradeepNeural");
	const [voiceRate, setVoiceRate] = useState(1.10); // 1.10x speech rate matched to video speed
	const [videoSpeed, setVideoSpeed] = useState(1.10); // 1.10x video speed boost
	const [syncVoiceSpeed, setSyncVoiceSpeed] = useState(true);
	const [creatingStatus, setCreatingStatus] = useState("");

	// Mode Switcher: 'auto' (1-click all safeguards) vs 'manual' (show all sliders & controls)
	const [editMode, setEditMode] = useState("auto");

	const handleSetEditMode = (mode) => {
		setEditMode(mode);
		if (mode === "auto") {
			// Auto mode: all 8 anti-copyright safeguards locked & enabled
			setBlackBgLayer(true);
			setVideoScale(94);
			setOverlayChroma(true);
			setMirror(true);
			setApplyZoom(true);
			setColorFilter("cinematic");
			setBrightness(0.03);
			setContrast(1.05);
			setSaturation(1.08);
			setMuteOriginalAudio(true);
			setBgmEnabled(true);
			setMetadataClean(true);
		}
	};

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
			let currentVoice = voiceoverFileName;
			let voiceActive = voiceoverEnabled;

			// If no voiceover track has been created yet, automatically generate AI script & synthesize ElevenLabs/TTS voiceover
			if (!currentVoice) {
				setCreatingStatus("1/3 Watching video scenes with AI Vision & writing commentary...");
				let script = "";
				try {
					const scriptRes = await fetch("/api/ai/script", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							prompt: videoTitle || "ভিডিওটির ড্রামাটিক ক্লাইম্যাক্স ও আকর্ষণীয় ধারাভাষ্য",
							language: "bn",
							provider: "auto",
							videoTitle,
							videoFilename,
							videoType,
						}),
					});
					const scriptData = await scriptRes.json();
					script = scriptData.script || "";
				} catch (sErr) {
					console.warn("Script generation note:", sErr);
				}

				if (!script) {
					script = "Wait until you see what happens next in this incredible video! Watch closely right now!";
				}

				setCreatingStatus("2/3 Synthesizing AI voiceover...");
				try {
					const savedElevenKey = typeof window !== "undefined" ? localStorage.getItem("studio_elevenlabs_key") : "";
					const ttsRes = await fetch("/api/ai/tts", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							text: script,
							provider: voiceProvider,
							voice: selectedVoice,
							voiceId: selectedVoice,
							apiKey: savedElevenKey || undefined,
							rate: voiceRate,
						}),
					});
					const ttsData = await ttsRes.json();
					if (ttsData.success && ttsData.fileName) {
						currentVoice = ttsData.fileName;
						voiceActive = true;
						setVoiceoverFileName(ttsData.fileName);
						setVoiceoverEnabled(true);
					}
				} catch (vErr) {
					console.warn("TTS synthesis note:", vErr);
				}
			}

			setCreatingStatus("3/3 Rendering anti-copyright video with FFmpeg...");
			console.log("create video request initiated with anti-copyright filters and voiceover");
			const res = await fetch("/api/process", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					filename: videoFilename,
					videoType,
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
					videoSpeed,
					muteOriginalAudio: true, // 100% original audio muted
					originalAudioVolume: 0,
					applyAudioEqualizer: true,
					stereoDelay: 20,
					bgmEnabled: true,
					bgmTrackName: bgmTrackName || "bg3.mp4",
					bgmVolume: 0.25,
					metadataClean: true,
					voiceoverEnabled: Boolean(currentVoice),
					voiceoverFileName: currentVoice,
					voiceoverVolume: 1.25,
					// Text Overlay
					textOverlay,
					showTextOverlay,
					textPosition,
					// Sticker Overlay
					stickerOverlay,
					showStickerOverlay,
					stickerPosition,
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
			setCreatingStatus("");
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
				editMode={editMode}
				setEditMode={handleSetEditMode}
				aspectRatio={aspectRatio}
				setAspectRatio={handleAspectRatioChange}
				videoType={videoType}
				setVideoType={handleVideoTypeChange}
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
						editMode={editMode}
						setEditMode={handleSetEditMode}
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
						textPosition={textPosition}
						setTextPosition={setTextPosition}
						stickerOverlay={stickerOverlay}
						setStickerOverlay={setStickerOverlay}
						showStickerOverlay={showStickerOverlay}
						setShowStickerOverlay={setShowStickerOverlay}
						stickerPosition={stickerPosition}
						setStickerPosition={setStickerPosition}
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
						setAspectRatio={handleAspectRatioChange}
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
						textPosition={textPosition}
						setTextPosition={setTextPosition}
						stickerOverlay={stickerOverlay}
						showStickerOverlay={showStickerOverlay}
						stickerPosition={stickerPosition}
						setStickerPosition={setStickerPosition}
						currentTime={currentTime}
						duration={duration}
						onTimeUpdate={(t) => setCurrentTime(t)}
						onDurationChange={(d) => setDuration(d)}
						seekTime={seekTime}
						// Video Creation & Preview Controls
						onCreateVideo={handleCreateVideo}
						isCreatingVideo={isCreatingVideo}
						creatingStatus={creatingStatus}
						processedVideoUrl={processedVideoUrl}
						previewMode={previewMode}
						setPreviewMode={setPreviewMode}
						onExport={handleExport}
					/>
				</div>

				{/* Column 3: Right Inspector & Right Editing Checklist (Expanded to 360px to fill the right red mark) */}
				<div className="w-[360px] h-full shrink-0">
					<CapCutInspector
						editMode={editMode}
						setEditMode={handleSetEditMode}
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
						voiceProvider={voiceProvider}
						setVoiceProvider={setVoiceProvider}
						selectedVoice={selectedVoice}
						setSelectedVoice={setSelectedVoice}
						voiceRate={voiceRate}
						setVoiceRate={setVoiceRate}
						videoSpeed={videoSpeed}
						setVideoSpeed={setVideoSpeed}
						syncVoiceSpeed={syncVoiceSpeed}
						setSyncVoiceSpeed={setSyncVoiceSpeed}
						videoTitle={videoTitle}
						videoFilename={videoFilename}
						videoType={videoType}
						setVideoType={handleVideoTypeChange}
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
