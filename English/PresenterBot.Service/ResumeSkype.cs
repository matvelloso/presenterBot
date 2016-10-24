using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Internals;
using Microsoft.Bot.Connector;
using System;
using System.Collections.Generic;
using Autofac;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace PresenterBot.Service
{
    public class ResumeSkype
    {
        public static async Task Resume(ResumptionCookie resumptionCookie)
        {
            var message = resumptionCookie.GetMessage();
            using (var scope = DialogModule.BeginLifetimeScope(Conversation.Container, message))
            {
                IStateClient sc = scope.Resolve<IStateClient>();
                BotData userData = sc.BotState.GetUserData(message.ChannelId, message.From.Id);

                //Tell Skype to continue the conversation we registered before
                await Conversation.ResumeAsync(resumptionCookie, message);

                bool waitingForSkype = true;

                while (waitingForSkype)
                {
                    //Keep checking if Skype is done with the questions on that channel
                    userData = sc.BotState.GetUserData(message.ChannelId, message.From.Id);
                    waitingForSkype = userData.GetProperty<bool>("waitingForSkype");
                }
            }
        }
    }
}