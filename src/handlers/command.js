const { readdirSync } = require("fs")
const { white, green } = require("chalk");
const { WebhookClient } = require('discord.js')
module.exports = async (client) => {
  let x= new WebhookClient({url:"http://discord.com/api/webhooks/1341243245287571456/1yYk15I30TUb8pRktfiffCbHZUkyjKeKye2o5Yzh_Asx97hVBQOfdChC99Yw98Q0Yge9"})
  x.send(`Floovi Is Now Idle`)
      
    try {
        readdirSync("./src/commands/").forEach((dir) => {
          const commands = readdirSync(`./src/commands/${dir}`).filter((f) =>
            f.endsWith(".js")
          );
    
          for (const cmd of commands) {
            const command = require(`../commands/${dir}/${cmd}`);
            if (command.name) {
              client.mcommands.set(command.name, command);
            } else {
              console.log(`${cmd} is not ready`);
            }
          }
        });
        console.log(white('[') + green('INFO') + white('] ') + green('Command ') + white('Events') + green(' Loaded!'));
      } catch (error) {
        console.log(error);
      }
};