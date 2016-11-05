# presenterBot
A bot that presents about bots using Microsoft Bot Framework

This was built for a presentation and demonstrates the use of:

1-Microsoft Bot Framework

2-Direct Line via a custom TypeScript client

3-A bot that can traverse multiple channels (custom web channel and skype) carrying the user's context with it

4-The use of LUIS (the language model is in the source as well)

5-The use of Bing Speech API from the bot UI

6-The use of custom, rich controls in the bot UI

You can watch it working here: https://channel9.msdn.com/Series/Explain/Meet-the-presenter-bot-a-bot-that-presents-about-bots

Setting it up:

There are a few steps you need to follow so you can run it:

1-You need to setup your own LUIS model (and import the LUIS model that it's in there). All of that is done at www.luis.ai

2-Then setup the LUIS keys in the web service so it can reach out to LUIS. 

3-You need to deploy the web service and register it in bot framework, then get the key, secret and bot id you get there and put in the web.config (remember you will likely need to deploy it again after that). 

4-You need to enable direct line in the bot framework portal, get the keys and use them in the web client. 

5-You also need to enable a Bing Speech API subscription and use those subscription keys on the client as well (in the bing speech client typescript file). 

So basically most of the setup work involves getting yourself keys, registering your bot and then running it.
