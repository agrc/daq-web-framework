using System.IO;
using daq_api.Contracts;

namespace daq_api.Services
{
    public class DocumentumMockShare : IShareMappable
    {
        public string GetPathFrom(string path)
        {
            path = path.Replace('/', '\\');
            path = path.TrimStart('\\');

            var edocsPath = Path.Combine("C:\\Projects\\TestData", path);

            return edocsPath;
        }

        public void CreateMap(string driveLetter)
        {
            // no share used in local development
        }
    }
}