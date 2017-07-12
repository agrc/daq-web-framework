using System.Collections.Generic;

namespace daq_api.Models
{
    public class GenericAttachment : Errorable
    {
        public GenericAttachment()
        {
            Files = new GenericFile[0];
        }

        public GenericAttachment(IEnumerable<GenericFile> files)
        {
            Files = files;
        }

        public IEnumerable<GenericFile> Files { get; set; }

        public struct GenericFile
        {
            public GenericFile(string name, string url) : this()
            {
                Name = name;
                Url = url;
            }

            public string Name { get; set; }
            public string Url { get; set; }
        }
    }
}