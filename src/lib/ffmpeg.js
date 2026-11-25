import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";

// Path to bundled ffmpeg
const FFMPEG_PATH = path.join(process.cwd(), "Docs", "Software", "ffmpeg.exe");

/**
 * Get video duration and metadata using ffmpeg -i
 */
export function probeVideo(filePath) {
	return new Promise((resolve) => {
		const proc = spawn(FFMPEG_PATH, ["-i", filePath]);
		let stderr = "";

		proc.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		proc.on("close", () => {
			let duration = 0;
			let width = 1920;
			let height = 1080;
			let hasAudio = false;

			// Parse duration: Duration: 00:00:56.27
			const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
			if (durMatch) {
				const hours = Number.parseFloat(durMatch[1]);
				const mins = Number.parseFloat(durMatch[2]);
				const secs = Number.parseFloat(durMatch[3]);
				duration = hours * 3600 + mins * 60 + secs;
			}

			// Parse resolution: 1078x1920 or 1920x1080
			const resMatch = stderr.match(/Stream.*Video:.*,\s*(\d{2,5})x(\d{2,5})/);
			if (resMatch) {
				width = Number.parseInt(resMatch[1], 10);
				height = Number.parseInt(resMatch[2], 10);
			}

			if (stderr.includes("Audio:")) {
				hasAudio = true;
			}

			resolve({ duration, width, height, hasAudio });
		});

		proc.on("error", () => {
			resolve({ duration: 0, width: 1920, height: 1080, hasAudio: false });
		});
	});
}

/**
 * Execute FFmpeg command with filter chains
 */
export function runFFmpeg(args) {
	return new Promise((resolve, reject) => {
		const proc = spawn(FFMPEG_PATH, args);
		let stdout = "";
		let stderr = "";

		proc.stdout.on("data", (data) => {
			stdout += data.toString();
		});

		proc.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		proc.on("close", (code) => {
			if (code === 0) {
				resolve({ stdout, stderr });
			} else {
				reject(new Error(`FFmpeg exited with code ${code}\nStderr: ${stderr}`));
			}
		});

		proc.on("error", (err) => {
			reject(err);
		});
	});
}
