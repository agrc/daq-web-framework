﻿using System.Configuration;
using daq_api.Contracts;
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

            StaticConfiguration.DisableErrorTraces = false;

            pipelines.AfterRequest += (ctx) =>
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                ctx.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                ctx.Response.Headers.Add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
            };

            container.Register<ArcOnlineHttpClient>().AsSingleton();

#if DEBUG
            container.Register<IShareMappable, DocumentumMockShare>().AsSingleton();
            container.Register<IRepository, EdocsMockRepository>().AsPerRequestSingleton();
#elif STAGING
            container.Register<IShareMappable, DocumentumShare>().AsSingleton();
            container.Register<IRepository, EdocsRepository>().AsPerRequestSingleton();
#else
            container.Register<IShareMappable, DocumentumShare>().AsSingleton();
            StaticConfiguration.DisableErrorTraces = true;
#endif

            var folder = container.Resolve<IShareMappable>();
            var driveLetter = ConfigurationManager.AppSettings["share_drive_letter"];
            folder.CreateMap(driveLetter);
        }
    }
}