using System.Text.RegularExpressions;
using daq_api.Models;
using daq_api.Models.RouteModels;

namespace daq_api.Services
{
    public static class FileRenamer
    {
        static readonly Regex StripNonAlphaNumeric = new Regex("[^a-zA-Z0-9-]");

        public static string Rename(UploadAttachment uploadItem, EDocEntry dbItem, string extension)
        {
            const string separators = "__";

            var maxSize = 100 - separators.Length;
            var extLength = extension.Length;
            var arcgisonlineIdLength = uploadItem.FacilityId.Length;
            var edocIdLength = dbItem.Id.ToString().Length;
            var charactersAllowed = maxSize - extLength - arcgisonlineIdLength - edocIdLength;
            var title = dbItem.Title.Replace('/', '-');
            title = StripNonAlphaNumeric.Replace(title, ""); 

            if (title.Length > charactersAllowed)
            {
                title = title.Substring(0, charactersAllowed);
            }

            return string.Format("{0}_{1}_{2}{3}", uploadItem.FacilityId, dbItem.Id, title, extension);
        }
    }
}