using System;
using System.Text.RegularExpressions;

namespace daq_api.Models
{
    public class EDocEntry
    {
        private const string Separators = "__x00-00x";
        private static readonly Regex StripNonAlphaNumeric = new Regex("[^a-zA-Z0-9-]");
        private readonly int _maxSize = 100 - Separators.Length;

        public EDocEntry()
        {
            
        }

        public EDocEntry(EDocEntry mapped, string facilityId)
        {
            Id = mapped.Id;
            Path = mapped.Path;
            Title = mapped.Title;
            DocumentDate = mapped.DocumentDate;
            Name = mapped.Name;
            Branch = mapped.Branch;
            File = Rename(facilityId);
        }

        /// <summary>
        /// The Edocs Database Id
        /// </summary>
        public int Id { get; set; }
        /// <summary>
        /// The combination of a fields edocs fields to create a path to the file server document
        /// </summary>
        public string Path { get; set; }
        /// <summary>
        /// The renamed file for storing in arcgis online
        /// </summary>
        public string File { get; set; }
        /// <summary>
        /// the document title in edocs
        /// </summary>
        public string Title { get; set; }
        /// <summary>
        /// the date the document was created in edocs
        /// </summary>
        public DateTime DocumentDate { get; set; }
        /// <summary>
        /// the facility name
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// the branch the document is owned by
        /// </summary>
        public string Branch { get; set; }
        /// <summary>
        /// true if the file is already in arcgis online
        /// </summary>
        public bool Uploaded { get; set; }
        /// <summary>
        /// the upload id of the item in arcgis online
        /// </summary>
        public int UploadId { get; set; }

        public string Rename(string facilityId)
        {
            var filename = System.IO.Path.GetFileName(Path);
            var extension = System.IO.Path.GetExtension(filename);
            var extLength = 0;

            if (!string.IsNullOrEmpty(extension))
            {
                extLength = extension.Length;
            }

            var arcgisonlineIdLength = facilityId.Length;
            var edocIdLength = Id.ToString().Length;
            var charactersAllowed = _maxSize - extLength - arcgisonlineIdLength - edocIdLength;
            var title = Title.Replace('/', '-');
            title = StripNonAlphaNumeric.Replace(title, "");

            if (title.Length > charactersAllowed)
            {
                title = title.Substring(0, charactersAllowed);
            }

            var day = DateTime.Today.Day.ToString("d2");
            var month = DateTime.Today.Month.ToString("d2");

            return string.Format("x{4}-{5}x{0}_{1}_{2}{3}", facilityId, Id, title, extension, month, day);
        }
    }
}