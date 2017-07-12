using System;
using System.Diagnostics;
using System.IO;
using Serilog;

namespace daq_api.Services
{
    public static class DriverMapper
    {
        public static void Map(string driveLetter, string path, string username, string password)
        {
            Log.Verbose("Mapping {Drive}", driveLetter);

            if (Directory.Exists(driveLetter + ":\\"))
            {
                Disconnect(driveLetter);
            }

            var p = new Process
            {
                StartInfo =
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardError = true,
                    RedirectStandardOutput = true,
                    FileName = "net.exe",
                    Arguments = " use " + driveLetter + ": " + '"' + path + '"' + " " + password + " /user:" + username
                }
            };

            p.Start();
            p.WaitForExit();

            var errorMessage = p.StandardError.ReadToEnd();

            if (errorMessage.Length > 0)
            {
                Log.Error("Error mapping drive {Message}", errorMessage);
                throw new Exception("Error:" + errorMessage);
            }
        }

        public static void Disconnect(string driveLetter)
        {
            Log.Verbose("disconnecting {Drive}", driveLetter);

            var p = new Process
            {
                StartInfo =
                {
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardError = true,
                    RedirectStandardOutput = true,
                    FileName = "net.exe",
                    Arguments = " use " + driveLetter + ": /DELETE"
                }
            };

            p.Start();
            p.WaitForExit();

            var errorMessage = p.StandardError.ReadToEnd();
            if (errorMessage.Length > 0)
            {
                Log.Error("Error unmounting drive {Message}", errorMessage);
                throw new Exception("Error:" + errorMessage);
            }
        }
    }
}