require('dotenv').config();
const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });
  
  let score = 0;
  const msgQueue = [];
  const error = resp => {
    const json = resp.json();
    console.dir(json);
    if(resp.ok){
      return json;
    } else {
      throw Error(resp.json());
    }
  };
  client.on('message', msg => {
    if(msg.author.bot) return;
    msgQueue.push(msg.content);
    if(msgQueue.length === 3) {
      fetch('http://text-processing.com/api/sentiment/', {
        method: 'POST',
        body: `text=${msgQueue.join(' ')}`
      }).then(error).then((jsonResp) => {
        switch(jsonResp.label) {
          case 'pos':
          console.log('pos', msgQueue);
          score += jsonResp.probability.pos;
            msg.reply(' thanks for bringing the mood up! You increased the chat\'s mood by ' + jsonResp.probability.pos + ' points' );
          break;
          case 'neg':
          console.log('neg', msgQueue);
          score -= jsonResp.probability.neg;
          break;
        }
        if(score < 1) {
          msg.reply(`The chat seems super negative right now, at a score of ${score}. Lets post upbeat things to fight back!`);
        }
        msgQueue.length = 0;
      }).catch(console.error);
    }
  }); 
  client.login(process.env.CLIENT_TOKEN);