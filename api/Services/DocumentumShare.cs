using System;
using System.Configuration;
using System.IO;
using daq_api.Contracts;

namespace daq_api.Services
{
    public class DocumentumShare : IShareMappable
    {
        private static readonly string TestServerShare = ConfigurationManager.AppSettings["share_path"];
        private static readonly string Username = ConfigurationManager.AppSettings["share_user"];
        private static readonly string Password = ConfigurationManager.AppSettings["share_password"];
        private string _driveLetter = "";

        public void CreateMap(string driveLetter)
        {
            if (string.IsNullOrEmpty(driveLetter) || driveLetter.Length != 1)
            {
                throw new ArgumentException("Drive letter must be one character.", "driveLetter");
            }
            DriverMapper.Map(driveLetter, TestServerShare, Username, Password);
            _driveLetter = string.Format("{0}:\\", driveLetter);
        }

        public string GetPathFrom(string path)
        {
            if (string.IsNullOrEmpty(_driveLetter))
            {
                throw new ArgumentNullException("_driveLetter", "Create map needs to be called prior to set the share drive letter.");
            }

            path = path.Replace('/', '\\');
            path = path.TrimStart('\\');
            path = path.Remove(0, 4);
            path = path.Replace("Agency Interest", "AgencyInterest");

            var edocsPath = Path.Combine(_driveLetter, path);

            return edocsPath;
        }
    }
}