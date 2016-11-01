using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using daq.Services;
using Newtonsoft.Json;
using daq.Models;

namespace daq
{
    public class Startup
    {
        public bool IsDevelopment { get; set; }

        public static Credentials Credentials { get; set; }

        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();

            IsDevelopment = env.IsDevelopment();
        }

        public static IConfigurationRoot Configuration { get; set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy",
                    builder => builder.AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials()
                    .WithExposedHeaders("Content-Range"));
            });

            // Add framework services.
            services.AddMvc()
                    .AddJsonOptions(_ => _.SerializerSettings.NullValueHandling = NullValueHandling.Ignore);

            if (IsDevelopment)
            {
                services.AddTransient<IRepository, StaticRepository>();
            }
            else
            {
                services.AddTransient<IRepository, DocRepository>();
            }

            services.AddSingleton<ArcOnlineHttpClient>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseCors("CorsPolicy");

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapRoute(
                    name: "id-required",
                    template: "{controller=Home}/{action=Index}/{id}");
            });
        }
    }
}
