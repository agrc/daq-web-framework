namespace daq_api.Contracts
{
    public interface IShareMappable
    {
        void CreateMap(string driveLetter);
        string GetPathFrom(string path);
    }
}