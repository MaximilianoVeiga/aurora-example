import colors from 'colors';
import got from 'got';

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

got.get('http://localhost:3000/health').then(response => {
  console.log(`${'[Aurora Client]'.yellow} Connected to Aurora server.`);
  if (response.statusCode === 200) {
    console.log(`${'[Aurora Client]'.yellow} Aurora server is healthy.`);

    let session;

    var recursiveAsyncReadLine = function () {
      rl.question(`${'[User]'.green}: `, async function (text) {
       
        const params = { searchParams: { text: text } };

        if (session) {
          params.searchParams.sessionId = session;
        }

        const rawResponse = await got.get('http://localhost:3000/detectIntent', params);
        const response = JSON.parse(rawResponse.body);

        session = response.id;

        if (response.messages.length > 1) {
          for (let message of response.messages) {
            console.log(`${'[Bot]'.magenta} ${message.text}`);
          }
        } else {
          console.log(`${'[Bot]'.magenta}: ${response.fulfillmentText}`);
        }

        if (response.intent.endInteraction)
          return rl.close();

        recursiveAsyncReadLine();
      });
    };
    recursiveAsyncReadLine();
  }
}).catch(onErr => {
  console.log(onErr);
  return 1;
});