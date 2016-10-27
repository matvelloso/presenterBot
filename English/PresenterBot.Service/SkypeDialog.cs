using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Connector;
using System.Threading;

namespace PresenterBot.Service
{
    [Serializable]
    public class SkypeDialog : IDialog<object>
    {
        public static ResumptionCookie resumptionCookie;
      
        public SkypeDialog()
        {
          
        }
        public async Task StartAsync(IDialogContext context)
        {
            context.Wait(MessageReceivedAsync);
        }

        public virtual async Task MessageReceivedAsync(IDialogContext context, IAwaitable<IMessageActivity> argument)
        {
            var message = await argument;
            if (message.Text == null) //Invoked when resuming the conversation, so it starts the knock knock joke
            {
                bool waitingForSkype=false;
                context.UserData.TryGetValue<bool>("waitingForSkype", out waitingForSkype);
                if (!waitingForSkype)
                {
                    context.UserData.SetValue<bool>("waitingForSkype", true);
                    await context.PostAsync("Knock knock...");
                }
            }
            else if (message.Text=="reset") //resets the flow
            {
                await context.PostAsync("reset");
                context.UserData.SetValue<bool>("waitingForSkype", false);
            }
            else if (message.Text.ToLower().Contains("there")) //Who's there?
            {
                await context.PostAsync("bot");
            }
            else if (message.Text.ToLower().Contains("register")) //Makes the bot remember who you are on Skype
            {
                SkypeDialog.resumptionCookie = new ResumptionCookie( message);
                await context.PostAsync("Registered");
            }
            else //Bot who?
            {
                context.UserData.SetValue<bool>("waitingForSkype", false);
            }

            context.Wait(MessageReceivedAsync);
        }     
    }
}