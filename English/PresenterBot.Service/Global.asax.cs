using System.Reflection;
using System.Web.Http;
using Autofac;
using Autofac.Integration.WebApi;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Internals;
using Microsoft.Bot.Builder.Internals.Fibers;

namespace PresenterBot.Service
{
    public class WebApiApplication : System.Web.HttpApplication
    {

        //public static ILifetimeScope FindContainer()
        //{
        //    var config = GlobalConfiguration.Configuration;
        //    var resolver = (AutofacWebApiDependencyResolver)config.DependencyResolver;
        //    return resolver.Container;
        //}


        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            //var builder = new ContainerBuilder();
            //builder.RegisterType<ResumptionCookie>().AsSelf().InstancePerMatchingLifetimeScope(DialogModule.LifetimeScopeTag);
            //builder.RegisterModule(new DialogModule());
            //builder.RegisterModule(new SkypeModule());
            //// Register your Web API controllers.
            //builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
            //var config = GlobalConfiguration.Configuration;
            //var container = builder.Build();
            //config.DependencyResolver = new AutofacWebApiDependencyResolver(container);
        }
    }
}
