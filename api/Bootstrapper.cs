using System;
using System.Configuration;
using System.IO;
using System.Web;
using daq_api.Contracts;
using daq_api.Models;
using daq_api.Services;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.Conventions;
using Nancy.Hosting.Aspnet;
using Nancy.TinyIoc;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Sinks.Email;

namespace daq_api
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);

            StaticConfiguration.DisableErrorTraces = false;

            pipelines.AfterRequest += ctx =>
            {
                ctx.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                ctx.Response.Headers.Add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                ctx.Response.Headers.Add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
            };

            var email = new EmailConnectionInfo
            {
                EmailSubject = "DAQ Log Email",
                FromEmail = "noreply@utah.gov",
                ToEmail = "SGourley@utah.gov",
                MailServer = "send.state.ut.us",
                Port = 25
            };

            var dir = Path.Combine(HttpRuntime.AppDomainAppPath, @"logs\daq.log-{Date}.txt");
            var levelSwitch = new LoggingLevelSwitch();
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.ControlledBy(levelSwitch)
                .WriteTo.RollingFile(dir)
                .WriteTo.Email(email, restrictedToMinimumLevel: LogEventLevel.Error)
                .CreateLogger();

            container.Register<ArcOnlineHttpClient>().AsSingleton();
            container.Register<IArcOnlineCredentials, AgoCredentials>().AsSingleton();

#if DEBUG
            levelSwitch.MinimumLevel = LogEventLevel.Verbose;
            
            container.Register<IShareMappable, DocumentumMockShare>().AsSingleton();
            container.Register<IRepository, EdocsMockRepository>().AsPerRequestSingleton();
#elif STAGING
            levelSwitch.MinimumLevel = LogEventLevel.Debug;

            container.Register<IShareMappable, DocumentumShare>().AsSingleton();
            container.Register<IRepository, EdocsRepository>().AsPerRequestSingleton();
#else
            levelSwitch.MinimumLevel = LogEventLevel.Debug;

            container.Register<IShareMappable, DocumentumShare>().AsSingleton();
            container.Register<IRepository, EdocsRepository>().AsPerRequestSingleton();
            StaticConfiguration.DisableErrorTraces = true;
#endif

            Log.Debug("Logging initialized");
            
            var folder = container.Resolve<IShareMappable>();
            var driveLetter = ConfigurationManager.AppSettings["share_drive_letter"];
            folder.CreateMap(driveLetter);
        }

        protected override void ConfigureConventions(NancyConventions conventions)
        {
            base.ConfigureConventions(conventions);

            // for font awesome
            conventions.StaticContentsConventions.Add(
                StaticContentConventionBuilder.AddDirectory("fonts", @"fonts")
                );
        }
    }
}