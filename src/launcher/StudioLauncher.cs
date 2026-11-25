using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace StudioApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            string appDir = AppDomain.CurrentDomain.BaseDirectory;
            Process serverProcess = null;

            try
            {
                // Check if server is already running on port 3000
                if (!IsPortOpen("http://localhost:3000"))
                {
                    // Start Next.js server in the background without showing any console window
                    ProcessStartInfo serverPsi = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/c npm run dev",
                        WorkingDirectory = appDir,
                        CreateNoWindow = true,
                        WindowStyle = ProcessWindowStyle.Hidden,
                        UseShellExecute = false
                    };

                    serverProcess = Process.Start(serverPsi);

                    // Wait until server is ready (up to 45 seconds)
                    int attempts = 0;
                    bool isReady = false;
                    while (attempts < 90)
                    {
                        Thread.Sleep(500);
                        if (IsPortOpen("http://localhost:3000"))
                        {
                            isReady = true;
                            break;
                        }
                        attempts++;
                    }

                    if (!isReady)
                    {
                        MessageBox.Show("Could not start local server on port 3000. Please check your project setup.", "Studio Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    }
                }

                // Locate Edge or Chrome for Application Mode
                string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgePath))
                {
                    edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                }

                string userDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "StudioAppProfile");

                ProcessStartInfo appPsi = new ProcessStartInfo
                {
                    FileName = File.Exists(edgePath) ? edgePath : "explorer.exe",
                    Arguments = File.Exists(edgePath)
                        ? string.Format("--app=http://localhost:3000 --window-size=1440,900 --user-data-dir=\"{0}\"", userDataDir)
                        : "http://localhost:3000",
                    UseShellExecute = true
                };

                Process appProcess = Process.Start(appPsi);
                if (appProcess != null && File.Exists(edgePath))
                {
                    // Wait for the desktop application window to exit
                    appProcess.WaitForExit();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error launching Studio: " + ex.Message, "Studio Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                // Cleanly kill the server process tree on window exit
                if (serverProcess != null && !serverProcess.HasExited)
                {
                    try
                    {
                        ProcessStartInfo killPsi = new ProcessStartInfo
                        {
                            FileName = "taskkill.exe",
                            Arguments = string.Format("/F /T /PID {0}", serverProcess.Id),
                            CreateNoWindow = true,
                            WindowStyle = ProcessWindowStyle.Hidden,
                            UseShellExecute = false
                        };
                        Process.Start(killPsi);
                    }
                    catch { }
                }
            }
        }

        static bool IsPortOpen(string url)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = 1000;
                req.Method = "GET";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                {
                    return res.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
