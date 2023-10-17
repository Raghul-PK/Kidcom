import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import expressWs from 'express-ws';
// const app = express();
// const expressWs = require('express-ws')(app);
const app = expressWs(express()).app;

import {updatePage, compareSpeechToStory, getMeaning, wordCollector, retrieveDB, createStorySpeechMatch} from './serverHelper.js';

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.use(express.static('public'))

app.get('/', async function(req, res, next) {
  await retrieveDB("thehonestwoodcutters");
  await createStorySpeechMatch();
  res.sendFile(path.join(__dirname, './public/story.html'));
});

app.ws('/', function(ws, req) {
  ws.on('message', async function(msg) {
    var data = JSON.parse(msg);
    console.log(data);

    let server_data = "";
    if (data.action==="nav_button")
    {
      let [story_line, img_path] = updatePage(data.desc);
      
      server_data = {"action":"html_story_text", "desc":story_line};
      ws.send(JSON.stringify(server_data));
      server_data = {"action":"story_img", "desc":img_path};
      ws.send(JSON.stringify(server_data));
      console.log(server_data);
    }
    else if (data.action==="speech_interim")
    {
      let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(data.desc);

      server_data = {"action":"html_story_text", "desc":html_story_line};
      ws.send(JSON.stringify(server_data));   
      server_data = {"action":"story_img", "desc":img_path};
      ws.send(JSON.stringify(server_data));
      console.log(server_data);
    }
    else if (data.action==="speech_final")
    {
      let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(data.desc);
      
      if (correctness_percent>50)
      {
        let [story_line, img_path] = updatePage("next");
      
        server_data = {"action":"html_story_text", "desc":story_line};
        ws.send(JSON.stringify(server_data));
        server_data = {"action":"story_img", "desc":img_path};
        ws.send(JSON.stringify(server_data));
      }     
    }
    else if (data.action==="click_words")
    {
      let meaning = await getMeaning(data.desc);
      server_data = {"action":"story_word_meaning", "desc":meaning};
      ws.send(JSON.stringify(server_data));
    }
    else if (data.action==="collected_word")
    {
      let collected_word = data.desc;
      wordCollector(collected_word);
    }
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});