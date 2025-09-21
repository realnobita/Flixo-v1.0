const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  WebhookClient,
  ButtonStyle,
} = require("discord.js");
const mongoose = require("mongoose");
const { Connectors } = require("shoukaku");
const { Kazagumo, Payload, Plugins } = require("kazagumo");
const spotify = require("kazagumo-spotify");
const fs = require("fs");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");
const Deezer = require("kazagumo-deezer");
const Apple = require("kazagumo-apple");
const Topgg = require("@top-gg/sdk");

class MainClient extends Client {
  constructor() {
    super({
      shards: getInfo().SHARD_LIST,
      shardCount: getInfo().TOTAL_SHARDS,
      allowedMentions: {
        parse: ["roles", "users", "everyone"],
        repliedUser: false,
      },
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.config = require("../config/config");
    this.emoji = require("../config/emoji");
    this.color = this.config.color;
    this.invite = this.config.invite;
    this.commands = new Collection();
    this.aliases = new Collection();
    this.cluster = new ClusterClient(this);
    this.topgg = new Topgg.Api(this.config.topgg_Api);
    this.error = new WebhookClient({ url: this.config.error_log });

    // music system
    this.manager = new Kazagumo(
      {
        plugins: [
          new spotify({
            clientId: this.config.spotiId,
            clientSecret: this.config.spotiSecret,
            playlistPageLimit: 1,
            albumPageLimit: 1,
            searchLimit: 10,
            searchMarket: "US",
          }),
          new Plugins.PlayerMoved(this),
          new Deezer({ playlistLimit: 20 }),
          new Apple({ countryCode: "us", imageWidth: 600, imageHeight: 900 }),
        ],
        defaultSearchEngine: "jssearch",
        send: (guildId, payload) => {
          const guild = this.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(this),
      this.config.nodes
    );

    this.on("error", (error) => {
      this.error.send(`\`\`\`js\n${error.stack}\`\`\``);
    });

    process.on("unhandledRejection", (error) => console.log(error));
    process.on("uncaughtException", (error) => console.log(error));

    // load handlers
    ["aliases", "mcommands"].forEach((x) => (this[x] = new Collection()));
    ["command", "player", "node"].forEach((x) =>
      require(`../handlers/${x}`)(this)
    );
  }

  async ConnectMongo() {
    console.log("[ TRYING ] Connecting to Mongo db...");
    mongoose.set("strictQuery", true);

    const mongoURI =
      this.config.Mongo ||
      "mongodb+srv://mongofloovi:Floovi@floovi.tu8lpdq.mongodb.net/your-database-name?retryWrites=true&w=majority&appName=Floovi";

    const connectWithRetry = () => {
      mongoose
        .connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 30000, // 30s timeout
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
          maxPoolSize: 10,
          heartbeatFrequencyMS: 10000,
        })
        .then(() => {
          console.log("[ CONNECTED ] Mongo db is now connected.");
        })
        .catch((error) => {
          console.error(
            "MongoDB connection failed, retrying in 5 seconds...",
            error
          );
          setTimeout(connectWithRetry, 5000);
        });
    };

    connectWithRetry();
  }

  async loadEvents() {
    fs.readdirSync("./src/events/").forEach((file) => {
      let eventName = file.split(".")[0];
      require(`${process.cwd()}/src/events/${file}`)(this);
      console.log(`[ LOADED ] ${eventName}.js event`);
    });
  }

  async reloadCommand(commandName) {
    const folders = fs.readdirSync("./src/commands");
    for (const folder of folders) {
      const filePath = `./src/commands/${folder}/${commandName}.js`;
      if (fs.existsSync(filePath)) {
        try {
          delete require.cache[require.resolve(filePath)];
          const newCommand = require(filePath);
          this.commands.set(newCommand.name, newCommand);
          return { success: true, name: newCommand.name };
        } catch (err) {
          return { success: false, error: err };
        }
      }
    }
    return { success: false, error: new Error("Command not found") };
  }

  connect() {
    return super.login(this.config.token);
  }
}

module.exports = MainClient;