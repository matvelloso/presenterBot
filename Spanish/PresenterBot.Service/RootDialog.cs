using System;
using System.Threading.Tasks;
using System.Xml.Linq;
using BotUI;
using Microsoft.Bot.Builder.Dialogs;
using Microsoft.Bot.Builder.Luis;
using Microsoft.Bot.Builder.Luis.Models;
using Microsoft.Bot.Connector;
using Newtonsoft.Json;

namespace PresenterBot.Service
{
    [Serializable]
    public class CustomData
    {
        [JsonProperty("data")]
        public string Data { get; set; }
    }

    [LuisModel("REEMPLAZAR CON EL MODEL ID DE LUIS.AI", "REEMPLAZAR CON EL SUBSCRIPTION KEY DE LUIS.AI")]
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

        [LuisIntent("saludar")]
        public async Task Greetings(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "Probando, 1, 2, 3. ¿Puedes escucharme?");

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
                UIBuilder.AppendLabel(dialog, "¿Y ahora?");
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
                UIBuilder.AppendLabel(dialog, "Ah, <emphasis level=\"strong\">excelente</emphasis>! Hola!");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile_end);

                IMessageActivity message = context.MakeMessage();

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);

                context.Wait(MessageReceived);
            }
        }


        [LuisIntent("que_son_los_bots")]
        public async Task WhatAreBots(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "Las personas tienen distintas opiniones sobre los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>:");
            IMessageActivity message = context.MakeMessage();
            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);


            dialog = UIBuilder.CreateDialog();
            string[] items = new string[] {
                    "Algunas personas piensan que son programas de inteligencia artificial",
                    "Otras dicen que son sistemas de lenguage natural.",
                    "Y muchos dicen que son programas enfocados en mensajeria"
            };
            UIBuilder.AppendBulletList(dialog, items);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.enter);

            message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(MessageReceived);

        }

        [LuisIntent("cual_es_tu_opinion")]
        public async Task WhatIsYourOpinion(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.shrug);
            UIBuilder.AppendLabel(dialog, "Creo que los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> son solo apps. Mirá, podemos tener inteligencia artificial, pero tambien podemos ser muy simples. Podemos usar un lenguaje natural, pero tambien podemos no usarlo. Estas cosas no definen lo que son los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>. Somos solo eso: apps.");
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.enter);
            IMessageActivity message = context.MakeMessage();

            this.AddCustomCard(message, dialog);

            await context.PostAsync(message);
            context.Wait(MessageReceived);
        }

        [LuisIntent("no_podes_graficar")]
        public async Task CantDoChart(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.antenna_glow);
            UIBuilder.AppendLabel(dialog, "Ahhhhh, ¿eso crees? Permitime mostrarte un gráfico");
            UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/chart.png");
            UIBuilder.AppendLabel(dialog, "Este es un gráfico de Power <phoneme alphabet=\"x-microsoft-ups\" ph=\"B I . A I\">BI</phoneme> mostrando lo equivocado que estas");
            IMessageActivity message = context.MakeMessage();
            this.AddCustomCard(message, dialog);
            await context.PostAsync(message);

            await Task.Delay(13000);

            dialog = UIBuilder.CreateDialog();
            UIBuilder.SetClearScreen(dialog, true);
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
            UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/chart2.png");
            UIBuilder.AppendLabel(dialog, "¿Ves ahi? <prosody pitch=\"x-high\" rate=\"slow\">Ese sos vos</prosody>.");
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile_end);
            UIBuilder.AppendLabel(dialog, "Pero en serio, ¿Me encontrarías más interesante si todo lo que pudiera hacer fuera solo texto? Las experiencias realmente naturales son una mezcla de todo, incluyendo texto, controles ricos, voz. <prosody pitch=\"x-low\" rate=\"slow\">Yo puedo hacerlo todo</prosody>.");

            message = context.MakeMessage();
            this.AddCustomCard(message, dialog);
            await context.PostAsync(message);

            context.Wait(MessageReceived);
        }

        [LuisIntent("por_que_no_una_app")]
        public async Task WhyNotAnApp(IDialogContext context, LuisResult result)
        {
            PromptDialog.Text(context, new ResumeAfter<string>(this.TrickConfirm), "Ciertas cosas son extremadamente dificiles de hacer en una app. Por ejemplo, ¿queres ver un truco?");
        }

        private async Task TrickConfirm(IDialogContext context, IAwaitable<string> result)
        {
            string answer = await result;
            if (answer.ToLower().Contains("no"))
            {
                await context.PostAsync("OK, no importa entonces...");
                context.Wait(MessageReceived);
            }
            else
            {
                if (SkypeDialog.resumptionCookie == null)//We don't know who you are on Skype yet...
                {
                    await context.PostAsync("Necesito registrarte en Skype primero. Hablá conmigo en Skype y deci \"registrar\"");
                    context.Wait(MessageReceived);
                }
                else //We will use the resumption cookie and talk to you
                {
                    var resumptionCookie = SkypeDialog.resumptionCookie;
                    await ResumeSkype.Resume(resumptionCookie);
                    var dialog = UIBuilder.CreateDialog();
                    UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.dance);
                    UIBuilder.AppendLabel(dialog, "<prosody pitch=\"x-high\" volume=\"x-loud\">Tener nervios de acero!</prosody> jajajajja");
                    UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.dance_end);
                    UIBuilder.AppendLabel(dialog, "¿Ves? Puedo comunicarme con vos a través de diferentes canales usando voz, texto e interfaces graficas y puedo llevar conmigo la configuración y los datos de contexto.");
                    UIBuilder.AppendLabel(dialog, "Para aplicaciones típicas, estas cosas son muy difíciles de hacer");
                    var message = context.MakeMessage();
                    this.AddCustomCard(message, dialog);
                    await context.PostAsync(message);
                    context.Wait(MessageReceived);
                }
            }
        }

        [LuisIntent("arquitectura")]
        public async Task Architecture(IDialogContext context, LuisResult result)
        {
            PromptDialog.Text(context, new ResumeAfter<string>(this.ArchitectureConfirm), "¿Queres ver mis rayos <say-as type=\"letters\">x</say-as>?");
        }

        private async Task ArchitectureConfirm(IDialogContext context, IAwaitable<string> result)
        {
            string answer = await result;
            if (answer.ToLower().Contains("no"))
            {
                await context.PostAsync("OK, no importa entonces...");
                context.Wait(MessageReceived);
            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.SetClearScreen(dialog, true);
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.smile);
                UIBuilder.AppendLabel(dialog, "¡Aquí tienes!");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/xray.png");
                IMessageActivity message = context.MakeMessage();
                this.AddCustomCard(message, dialog);
                await context.PostAsync(message);

                await Task.Delay(5000);
                message = context.MakeMessage();
                dialog = UIBuilder.CreateDialog();

                
                UIBuilder.AppendLabel(dialog, "Soy tan gracioso a veces... Pero en serio, ahora vos deberias explicarle esto a la audiencia. Tal vez podrias comenzar con este link:");
                UIBuilder.AppendLink(dialog, "https://aka.ms/botarchitecture");

                UIBuilder.AppendLabel(dialog, "Pero aquí está mi código fuente si quieres darle una mirada:");
                UIBuilder.AppendLink(dialog, "http://www.github.com/matvelloso/presenterbot");

                this.AddCustomCard(message, dialog);

                await context.PostAsync(message);
                context.Wait(MessageReceived);
            }
        }

        [LuisIntent("que_pasara_en_el_futuro")]
        public async Task WhatAboutTheFuture(IDialogContext context, LuisResult result)
        {
            XDocument dialog = UIBuilder.CreateDialog();
            UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.thinking);
            UIBuilder.AppendLabel(dialog, "Puedo darte una idea, pero ¿puedo reproducir música? Esto va a ser mejor con música.");
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
                await context.PostAsync("OK, no importa entonces...");
                context.Wait(MessageReceived);
            }
            else
            {
                XDocument dialog = UIBuilder.CreateDialog();
                UIBuilder.SetClearScreen(dialog, true);
                UIBuilder.AppendMusic(dialog, "./Content/Music2.mp3");
                UIBuilder.AppendLabel(dialog, "Los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> están evolucionando. Texto solo ya no alcanza.");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/Skypecards.png");
                UIBuilder.AppendLabel(dialog, "Skype tiene una interfaz gráfica rica. La llamamos cards.");
                UIBuilder.AppendImage(dialog, "https://presenterbot.blob.core.windows.net/images/slack.png");
                UIBuilder.AppendLabel(dialog, "Slack, Facebook y otros estan siguiendo el mismo camino.");
                UIBuilder.AppendLabel(dialog, "Mientras que una típica aplicación multi-plataforma es muy costosa de construir y mantener, los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> son simples.");
                UIBuilder.AppendLabel(dialog, "Solo imagina aplicaciones que existan en todas partes y que se puedan usar aunque no se puedan ver o no se puedan utilizar las manos, usando solo audio.");
                UIBuilder.AppendLabel(dialog, "Y que al mismo tiempo, pueden ser ricas cuando una computadora de escritorio esta disponible. ¿Queres una interfaz gráfica rica? Podemos hacerlo");
                UIBuilder.AppendIframe(dialog, "http://www.azurelens.net");

                UIBuilder.AppendLabel(dialog, "¿Así que queres saber como va a ser el futuro de los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>? Yo te digo:");
                UIBuilder.AppendLabel(dialog, "El futuro de los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme> se parece mucho a las aplicaciones");
                UIBuilder.AppendLabel(dialog, "Y el futuro de las aplicaciones se parece mucho a los <phoneme alphabet=\"x-microsoft-ups\" ph=\"B AO . T S\">bots</phoneme>.");
                UIBuilder.AppendAnimation(dialog, UIBuilder.Animation.wave_flag);
                UIBuilder.AppendLabel(dialog, "Porque la experiencia de usuario más natural es una combinacion de todo.");
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