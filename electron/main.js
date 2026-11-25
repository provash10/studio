const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");
const http = require("node:http");

let mainWindow = null;
let serverProcess = null;

function checkServerReady(url, callback) {
	const req = http.get(url, (res) => {
		if (res.statusCode === 200) {
			callback(true);
		} else {
			setTimeout(() => checkServerReady(url, callback), 500);
		}
	});
	req.on("error", () => {
		setTimeout(() => checkServerReady(url, callback), 500);
	});
}

function startNextServer() {
	const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
	serverProcess = spawn(npmCmd, ["run", "dev"], {
		cwd: path.join(__dirname, ".."),
		shell: true,
		stdio: "ignore",
	});
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1440,
		height: 900,
		minWidth: 1080,
		minHeight: 720,
		title: "CapCut Video Studio - VideoForge",
		backgroundColor: "#0e0f12",
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	// Check if localhost:3000 is open; if not start Next.js dev server
	checkServerReady("http://localhost:3000", () => {
		if (mainWindow) {
			mainWindow.loadURL("http://localhost:3000");
		}
	});

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	// First probe if 3000 is running, if not spawn
	const req = http.get("http://localhost:3000", (res) => {
		createWindow();
	});
	req.on("error", () => {
		startNextServer();
		createWindow();
	});
});

app.on("window-all-closed", () => {
	if (serverProcess) {
		try {
			if (process.platform === "win32") {
				spawn("taskkill", ["/pid", serverProcess.pid, "/f", "/t"]);
			} else {
				serverProcess.kill();
			}
		} catch (e) {}
	}
	if (process.platform !== "darwin") {
		app.quit();
	}
});
