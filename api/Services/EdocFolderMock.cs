using System.IO;

namespace daq_api.Services
{
    public class EdocFolderMock : IEdocFolder
    {
        public string Get(string path)
        {
            path = path.Replace('/', '\\');
            path = path.TrimStart('\\');

            var edocsPath = Path.Combine("C:\\Projects\\TestData", path);

            return edocsPath;
        }
    }
}