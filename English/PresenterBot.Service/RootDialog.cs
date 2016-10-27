using BotUI;
using Autofac;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Dialogs.Internals;
using Microsoft.Bot.Builder.Luis;
using Microsoft.Bot.Builder.Luis.Models;
using Microsoft.Bot.Connector;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;
using System.Threading;
using Newtonsoft.Json;

namespace PresenterBot.Service
{
    [Serializable]
    public class CustomData
    {
        [JsonProperty("data")]
        public string Data { get; set; }
    }

    [LuisModel("TODO:PUT YOUR LUIS MODEL ID HERE", "TOOD: PUT YOUR LUIS SUBSCRIPTION KEY HERE")]
    [Serializable]
    public class RootDialog : LuisDialog<object>
    {

        private void AddCustomCard(IMessageActivity message, XDocument cardData)
        {
            message.Text = "Custom Data";
            CustomData card = new CustomData();
            card.Data = cardData.ToString();
            message.ChannelData = card;
        }

        [LuisIntent("greetings")]
        public async Task Greetings(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "Testing, 1, 2, 3. Can you hear me?");

            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(this.GreetingsConfirm);
        }

        public async Task GreetingsConfirm(IDialogContext context, IAwaitable<IMessageActivity> item)
        {
            string answer = (await item).Text;
            if (answer.ToLower().Contains("no"))
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.frown);
                UIBuilder.AppendLabel(dialog, "What about now?");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.frown_end);

                IMessageActivity message = context.MakeMessage();

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);

                context.Wait(this.GreetingsConfirm);

            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
                UIBuilder.AppendLabel(dialog, "Oh <emphasis level=\"strong\">great</emphasis>! Hi there!");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile_end);

                IMessageActivity message = context.MakeMessage();

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);

                context.Wait(MessageReceived);
            }
        }


        [LuisIntent("guggs_greeting")]
        public async Task GuggsGreeting(IDialogContext context, LuisResult result)
        {
            context.UserData.SetValue<bool>("isguggs", true);
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "Hey there! Are you presenting the keynote?");

            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(this.GuggsGreetingConfirm);
        }

        public async Task GuggsGreetingConfirm(IDialogContext context, IAwaitable<IMessageActivity> item)
        {
            string answer = (await item).Text;
            if (answer.ToLower().Contains("no"))
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);
                UIBuilder.AppendLabel(dialog, "Oh, ok");
                IMessageActivity message = context.MakeMessage();
                this.AddCustomCard(message, dialog);
                await context.PostAsync(message);
                context.Wait(this.MessageReceived);

            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.frown);
                UIBuilder.AppendLabel(dialog, "Is there a lot of people there? I'm <prosody rate=\"slow\">nervous... </prosody>");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.frown_end);

                IMessageActivity message = context.MakeMessage();

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);

                context.Wait(MessageReceived);
            }
        }


        [LuisIntent("what_are_bots")]
        public async Task WhatAreBots(IDialogContext context, LuisResult result)
        {
            bool isguggs = false;
            context.UserData.TryGetValue<bool>("isguggs", out isguggs);
            if (isguggs)
            {
                XDocument dialog = UIBuilder.CreateDialog();
                var message = context.MakeMessage();

                UIBuilder.AppendLabel(dialog, "Tell folks to come to the next presentation after this. I'll discuss about bots with the help of my assistant, Mat.");
                UIBuilder.AppendLabel(dialog, "(don't tell him I said that)");
                UIBuilder.AppendLabel(dialog, "But if you want to give people an overview of bots architecture, perhaps start here:");
                UIBuilder.AppendLink(dialog, "https://aka.ms/botarchitecture");
                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);
                context.Wait(MessageReceived);

            }
            else
            {

                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
                UIBuilder.AppendLabel(dialog, "Different people have different views on bots:");
                IMessageActivity message = context.MakeMessage();
                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);


                dialog = UIBuilder.CreateDialog();
                string[] items = new string[] {
                    "Some people think bots are all about <say-as type=\"letters\">AI</say-as>.",
                    "Others say it's all about natural language.",
                    "And some will say it's all about messaging"
            };
                UIBuilder.AppendBulletList(dialog, items);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.enter);

                message = context.MakeMessage();

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);
                context.Wait(MessageReceived);
            }
        }

        [LuisIntent("what_is_your_opinion")]
        public async Task WhatIsYourOpinion(IDialogContext context, LuisResult result)
        {


            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.shrug);
            UIBuilder.AppendLabel(dialog, "I believe bots are just apps. You see, we may have <say-as type=\"letters\">AI</say-as>, but we may just as well be very simple. We may use natural language, but maybe not. These things don't define what bots are. We are apps, that's it.");
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.enter);
            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(MessageReceived);
        }

        [LuisIntent("cant_do_chart")]
        public async Task CantDoChart(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.antenna_glow);
            UIBuilder.AppendLabel(dialog, "You think so? Let me show you a chart:");
            UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/chart.png");
            UIBuilder.AppendLabel(dialog, "See, this is a Power <say-as type=\"letters\">BI</say-as> chart showing how wrong you are");
            IMessageActivity message = context.MakeMessage();
            this.AddCustomCard(message, dialog);
            await context.PostAsync(message);

            await Task.Delay(13000);

            dialog = UIBuilder.CreateDialog();
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
            UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/chart2.png");
            UIBuilder.AppendLabel(dialog, "See there? <prosody pitch=\"x-low\" rate=\"x-slow\">You</prosody>.");
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile_end);
            UIBuilder.AppendLabel(dialog, "But seriously: Would you find me more interesting if all I could do was text? The real natural experiences are a mix of everything, including text, rich controls and voice. <prosody pitch=\"x-low\" rate=\"slow\">I can do it all</prosody>");

            message = context.MakeMessage();
            this.AddCustomCard(message, dialog);
            await context.PostAsync(message);

            context.Wait(MessageReceived);
        }

        [LuisIntent("why_not_an_app")]
        public async Task WhyNotAnApp(IDialogContext context, LuisResult result)
        {
            PromptDialog.Text(context, new ResumeAfter<string>(this.TrickConfirm), "Certain things are extremely difficult to do in apps. For example, want to see a trick?");
        }

        private async Task TrickConfirm(IDialogContext context, IAwaitable<string> result)
        {
            string answer = await result;
            if (answer.ToLower().Contains("no"))
            {
                await context.PostAsync("OK, never mind then...");
                context.Wait(MessageReceived);
            }
            else
            {
                if (SkypeDialog.resumptionCookie == null)//We don't know who you are on Skype yet...
                {
                    await context.PostAsync("I need to register you on Skype first. Talk to me on Skype and say \"register\"" );
                    context.Wait(MessageReceived);
                }
                else //We will use the resumption cookie and talk to you
                {
                    var resumptionCookie = SkypeDialog.resumptionCookie;
                    await ResumeSkype.Resume(resumptionCookie);
                    var dialog = UIBuilder.CreateDialog();
                    UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.dance);
                    UIBuilder.AppendLabel(dialog, "<prosody pitch=\"x-high\" volume=\"x-loud\">Kiss my bot!</prosody> haha!");
                    UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.dance_end);
                    UIBuilder.AppendLabel(dialog, "See? I can reach you using different channels using both voice and text and I can carry your settings and context data with me.");
                    UIBuilder.AppendLabel(dialog, "For typical apps, these things are very hard to do.");
                    var message = context.MakeMessage();
                    this.AddCustomCard(message, dialog);
                    await context.PostAsync(message);
                    context.Wait(MessageReceived);
                }
            }
        }

        [LuisIntent("architecture")]
        public async Task Architecture(IDialogContext context, LuisResult result)
        {
            PromptDialog.Text(context, new ResumeAfter<string>(this.ArchitectureConfirm), "Do you want to see my <say-as type=\"letters\">x</say-as>-ray?");
        }

        private async Task ArchitectureConfirm(IDialogContext context, IAwaitable<string> result)
        {
            string answer = await result;
            if (answer.ToLower().Contains("no"))
            {
                await context.PostAsync("OK, never mind then...");
                context.Wait(MessageReceived);
            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.SetClearScreen(dialog, true);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
                UIBuilder.AppendLabel(dialog, "There you go!");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/xray.png");
                IMessageActivity message = context.MakeMessage();
                this.AddCustomCard(message, dialog);
                await context.PostAsync(message);

                await Task.Delay(5000);
                message = context.MakeMessage();
                dialog = UIBuilder.CreateDialog();

                
                UIBuilder.AppendLabel(dialog, "I am so funny sometimes... But seriously, you should explain them yourself now. Perhaps start with this link:");
                UIBuilder.AppendLink(dialog, "https://aka.ms/botarchitecture");

                UIBuilder.AppendLabel(dialog, "But here's my source code if you want to take a look at it:");
                UIBuilder.AppendLink(dialog, "http://www.github.com/matvelloso/presenterbot");

                
                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);
                context.Wait(MessageReceived);
            }
        }

        [LuisIntent("what_about_the_future")]
        public async Task WhatAboutTheFuture(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "I can give you an idea, but can I play some music? This works best with music...");
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);

            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(this.Music);

        }
        
        private async Task Music(IDialogContext context, IAwaitable<IMessageActivity> item)
        {
            string answer = (await item).Text;

            if (answer.ToLower().Contains("no"))
            {
                await context.PostAsync("OK, never mind then...");
                context.Wait(MessageReceived);
            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.SetClearScreen(dialog, true);
                UIBuilder.AppendMusic(dialog, "./Content/Music2.mp3");
                UIBuilder.AppendLabel(dialog, "Bots are evolving. Just text isn't enough anymore.");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/Skypecards.png");
                UIBuilder.AppendLabel(dialog, "Skype has a range of rich controls. We call them cards.");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/slack.png");
                UIBuilder.AppendLabel(dialog, "Slack, Facebook and others are following the same path.");
                UIBuilder.AppendLabel(dialog, "While a typical cross platform app is very expensive to build and support. Bots are simple.");
                UIBuilder.AppendLabel(dialog, "Just imagine apps that exist anywhere and can be used even if you can't see, via audio only.");
                UIBuilder.AppendLabel(dialog, "And at the same time, can be rich when a desktop is available. Want a rich user interface control? We can do that");
                UIBuilder.AppendIframe(dialog, "http://www.azurelens.net");

                UIBuilder.AppendLabel(dialog, "So you want to know how the future looks like? I tell you:");
                UIBuilder.AppendLabel(dialog, "The future of bots looks more like apps.");
                UIBuilder.AppendLabel(dialog, "And the future of apps looks more like bots.");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.wave_flag);
                UIBuilder.AppendLabel(dialog, "Because the most natural user experience is all of it combined.");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.wave_flag_end);

                UIBuilder.AppendCalendar(dialog, DateTime.Now);

                IMessageActivity message = context.MakeMessage();
                this.AddCustomCard(message, dialog);
                await context.PostAsync(message);

                context.Wait(MessageReceived);
            }
        }

        public RootDialog()
        {

        }
        public RootDialog(ILuisService service)
            : base(service)
        {
        }


    }
}