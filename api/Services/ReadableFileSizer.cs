using System;

namespace daq_api.Services
{
    public static class ReadableFileSizer
    {
        private static readonly string[] SizeAbbreviations = {"B", "KB", "MB", "GB", "TB", "PB", "EB"};

        public static string MakeReadable(long byteCount)
        {
            if (byteCount == 0)
            {
                return "0";
            }

            var bytes = Math.Abs(byteCount);
            var place = Convert.ToInt32(Math.Floor(Math.Log(bytes, 1024)));
            var num = Math.Round(bytes / Math.Pow(1024, place), 1);

            return Math.Sign(byteCount) * num + SizeAbbreviations[place];
        }
    }
}
