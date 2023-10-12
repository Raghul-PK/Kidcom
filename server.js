import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import expressWs from 'express-ws';
// const app = express();
// const expressWs = require('express-ws')(app);
const app = expressWs(express()).app;

import {updatePage, compareSpeechToStory, getMeaning, wordCollector} from './serverHelper.js';

const port = 3000;

app.use(express.static('public'))

// sendFile will go here
app.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, './public/story.html'));
  console.log('get route', req.testing);
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
    }
    else if (data.action==="speech_interim")
    {
      let [html_story_line, correctness_percent] = compareSpeechToStory(data.desc);

      server_data = {"action":"html_story_text", "desc":html_story_line};
      ws.send(JSON.stringify(server_data));   
    }
    else if (data.action==="speech_final")
    {
      let [html_story_line, correctness_percent] = compareSpeechToStory(data.desc);
      
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