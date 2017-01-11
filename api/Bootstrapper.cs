using daq_api.Services;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.Hosting.Aspnet;
using Nancy.TinyIoc;

namespace daq_api
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);

            pipelines.AfterRequest += (ctx) =>
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                ctx.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                ctx.Response.Headers.Add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
            };

            container.Register<ArcOnlineHttpClient>().AsSingleton();
            container.Register<IRepository, EdocsRepository>().AsPerRequestSingleton();
            container.Register<IEdocFolder, EdocFolderMock>().AsSingleton();

            StaticConfiguration.DisableErrorTraces = false;
        }
    }
}