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

    [LuisModel("COLOQUE O MODEL ID DO LUIS.AI AQUI", "COLOQUE O SUBSCRIPTION ID DO LUIS.AI AQUI")]
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

        [LuisIntent("saudar")]
        public async Task Greetings(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Testando, 1, 2, 3. Consegue me ouvir?</prosody>");

            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(this.GreetingsConfirm);
        }

        public async Task GreetingsConfirm(IDialogContext context, IAwaitable<IMessageActivity> item)
        {
            string answer = (await item).Text;
            if (answer.ToLower().Contains("não"))
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.frown);
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">E agora?</prosody>");
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
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Ah, <emphasis level=\"strong\">ótimo</emphasis>! Olá!</prosody>");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile_end);

                IMessageActivity message = context.MakeMessage();

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);

                context.Wait(MessageReceived);
            }
        }


        [LuisIntent("que_sao_bots")]
        public async Task WhatAreBots(IDialogContext context, LuisResult result)
        {


            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">As pessoas têm opiniões diferentes sobre <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>:</prosody>");
            IMessageActivity message = context.MakeMessage();
            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);


            dialog = UIBuilder.CreateDialog();
            string[] items = new string[] {
                    "<prosody rate=\"fast\">Algumas pessoas pensam que são programas de inteligência artificial.</prosody>",
                    "<prosody rate=\"fast\">Outras dizem que são sistemas de linguagem natural.</prosody>",
                    "<prosody rate=\"fast\">E muitos dizem que são programas focados em sistemas de mensagens</prosody>"
            };
            UIBuilder.AppendBulletList(dialog, items);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.enter);

            message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(MessageReceived);

        }

        [LuisIntent("qual_sua_opiniao")]
        public async Task WhatIsYourOpinion(IDialogContext context, LuisResult result)
        {


            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.shrug);
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Eu acredito que <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> são apenas apps. Veja, nós podemos ter inteligência artificial, mas podemos também ser muito simples. Nós podemos usar linguagem natural, mas em muitos casos nós não usamos nada disso. Essas coisas não definem <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>. Nós somos apenas isso: apps.</prosody>");
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.enter);
            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(MessageReceived);
        }

        [LuisIntent("nao_pode_grafico")]
        public async Task CantDoChart(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.antenna_glow);
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Ah, você acha? Veja só:</prosody>");
            UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/chart.png");
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Esse é um gráfico em Power <phoneme alphabet=\"x-microsoft-ups\" ph=\"B I . A I\">BI</phoneme> mostrando o quanto você está errado</prosody>");
            IMessageActivity message = context.MakeMessage();
            this.AddCustomCard(message, dialog);
            await context.PostAsync(message);

            await Task.Delay(13000);

            dialog = UIBuilder.CreateDialog();
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
            UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/chart2.png");
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Viu? Ali, ó:</prosody> <prosody pitch=\"x-high\" rate=\"slow\">Você</prosody>.");
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile_end);
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Mas falando sério: Você ia me achar mais interessante se eu só soubesse me comunicar por texto? As experiências realmente naturais são uma mistura de tudo: Texto, voz, interface gráfica, tudo junto.</prosody>");

            message = context.MakeMessage();
            this.AddCustomCard(message, dialog);
            await context.PostAsync(message);

            context.Wait(MessageReceived);
        }

        [LuisIntent("por_que_nao_app")]
        public async Task WhyNotAnApp(IDialogContext context, LuisResult result)
        {
            PromptDialog.Text(context, new ResumeAfter<string>(this.TrickConfirm), "<prosody rate=\"fast\">Certas coisas são bem complicadas de se fazer numa app. Por exemplo, quer ver um truque?</prosody>");
        }

        private async Task TrickConfirm(IDialogContext context, IAwaitable<string> result)
        {
            string answer = await result;
            if (answer.ToLower().Contains("não"))
            {
                await context.PostAsync("<prosody rate=\"fast\">OK, esquece...</prosody>");
                context.Wait(MessageReceived);
            }
            else
            {
                if (SkypeDialog.resumptionCookie == null)//We don't know who you are on Skype yet...
                {
                    await context.PostAsync("<prosody rate=\"fast\">Eu preciso registrar você no Skype primeiro. Converse comigo no Skype e diga \"registrar\"</prosody>");
                    context.Wait(MessageReceived);
                }
                else //We will use the resumption cookie and talk to you
                {
                    var resumptionCookie = SkypeDialog.resumptionCookie;
                    await ResumeSkype.Resume(resumptionCookie);
                    var dialog = UIBuilder.CreateDialog();
                    UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.dance);
                    UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\" pitch=\"x-high\" volume=\"x-loud\">Bota aqui o seu pezinho!</prosody> haha!");
                    UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.dance_end);
                    UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Viu? Eu posso me comunicar com você usando canais diversos, tanto via voz como texto e interfaces gráficas e eu levo comigo suas configurações e contexto de dados.</prosody>");
                    UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Em uma app típica isso seria muito difícil de fazer.</prosody>");
                    var message = context.MakeMessage();
                    this.AddCustomCard(message, dialog);
                    await context.PostAsync(message);
                    context.Wait(MessageReceived);
                }
            }
        }

        [LuisIntent("arquitetura")]
        public async Task Architecture(IDialogContext context, LuisResult result)
        {
            PromptDialog.Text(context, new ResumeAfter<string>(this.ArchitectureConfirm), "<prosody rate=\"fast\">Você quer ver o meu raio <say-as type=\"letters\">x</say-as>?</prosody>");
        }

        private async Task ArchitectureConfirm(IDialogContext context, IAwaitable<string> result)
        {
            string answer = await result;
            if (answer.ToLower().Contains("não"))
            {
                await context.PostAsync("<prosody rate=\"fast\">OK, esquece...</prosody>");
                context.Wait(MessageReceived);
            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.SetClearScreen(dialog, true);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Aqui vai!</prosody>");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/xray.png");
                IMessageActivity message = context.MakeMessage();
                this.AddCustomCard(message, dialog);
                await context.PostAsync(message);

                await Task.Delay(5000);
                message = context.MakeMessage();
                dialog = UIBuilder.CreateDialog();

                
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Eu sou tão engraçado... Mas sério, você devia explicar para audiência agora. Talvez comece por esse link:</prosody>");
                UIBuilder.AppendLink(dialog, "https://aka.ms/botarchitecture");

                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Mas aqui está meu código fonte se você quiser ver:</prosody>");
                UIBuilder.AppendLink(dialog, "http://www.github.com/matvelloso/presenterbot");

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);
                context.Wait(MessageReceived);
            }
        }

        [LuisIntent("e_quanto_ao_futuro")]
        public async Task WhatAboutTheFuture(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Eu posso te dar uma ideia, mas posso tocar uma música? Isso funciona melhor com música...</prosody>");
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking_end);

            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(this.Music);

        }
        
        private async Task Music(IDialogContext context, IAwaitable<IMessageActivity> item)
        {
            string answer = (await item).Text;

            if (answer.ToLower().Contains("não"))
            {
                await context.PostAsync("<prosody rate=\"fast\">OK, esquece...</prosody>");
                context.Wait(MessageReceived);
            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.SetClearScreen(dialog, true);
                UIBuilder.AppendMusic(dialog, "./Content/Music2.mp3");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Os <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> estão evoluindo. Texto apenas não basta.</prosody>");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/Skypecards.png");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Skype tem uma interface gráfica rica que nós chamamos de cards.</prosody>");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/slack.png");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Slack, Facebook e outros estão seguindo o mesmo caminho.</prosody>");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Enquanto uma app multi plataforma típica é muito cara de se construir e suportar, <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> são simples.</prosody>");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Apenas imagine apps que existem em qualquer lugar e podem ser usadas até quando você não pode ver ou usar suas mãos, usando apenas áudio.</prosody>");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">E ao mesmo tempo, podem ser ricas quando um desktop está disponível. Quer uma interface gráfica rica? Nós podemos fazer isso</prosody>");
                UIBuilder.AppendIframe(dialog, "http://www.azurelens.net");

                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Então você quer saber como o futuro dos <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> vai ser? Eu te digo:</prosody>");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">O futuro dos <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> parece muito com apps.</prosody>");
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">E o futuro das apps parece muito com <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>.</prosody>");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.wave_flag);
                UIBuilder.AppendLabel(dialog, "<prosody rate=\"fast\">Porque a experiência mais natural é uma combinação de tudo.</prosody>");
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