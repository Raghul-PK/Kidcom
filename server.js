// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// import express from 'express';

// const app = express();
// const port = process.env.PORT || 3000;

// import {updatePage, compareSpeechToStory, getMeaning, wordCollector, retrieveDB, createStorySpeechMatch} from './serverHelper.js';

// app.use(express.static('public'));

// app.get('/', async function(req, res, next) {
//   await retrieveDB("thehonestwoodcutters");
//   createStorySpeechMatch();
//   res.sendFile(path.join(__dirname, './public/story.html'));
// });

// app.ws('/', function(ws, req) {
//   ws.on('message', async function(msg) {
//     var data = JSON.parse(msg);
//     console.log(data);

//     let server_data = "";
//     if (data.action==="nav_button")
//     {
//       let [story_line, img_path] = updatePage(data.desc);
      
//       server_data = {"action":"html_story_text", "desc":story_line};
//       ws.send(JSON.stringify(server_data));
//       server_data = {"action":"story_img", "desc":img_path};
//       ws.send(JSON.stringify(server_data));
//       console.log(server_data);
//     }
//     else if (data.action==="speech_interim")
//     {
//       let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(data.desc);

//       server_data = {"action":"html_story_text", "desc":html_story_line};
//       ws.send(JSON.stringify(server_data));   
//       server_data = {"action":"story_img", "desc":img_path};
//       ws.send(JSON.stringify(server_data));
//       console.log(server_data);
//     }
//     else if (data.action==="speech_final")
//     {
//       let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(data.desc);
      
//       if (correctness_percent>50)
//       {
//         let [story_line, img_path] = updatePage("next");
      
//         server_data = {"action":"html_story_text", "desc":story_line};
//         ws.send(JSON.stringify(server_data));
//         server_data = {"action":"story_img", "desc":img_path};
//         ws.send(JSON.stringify(server_data));
//       }     
//     }
//     else if (data.action==="click_words")
//     {
//       let meaning = await getMeaning(data.desc);
//       server_data = {"action":"story_word_meaning", "desc":meaning};
//       ws.send(JSON.stringify(server_data));
//     }
//     else if (data.action==="collected_word")
//     {
//       let collected_word = data.desc;
//       wordCollector(collected_word);
//     }
//   });
// });

// app.listen(port, () => {
//   console.log(`App listening on port ${port}`);
// });

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import {updatePage, compareSpeechToStory, getMeaning, wordCollector, retrieveDB, createStorySpeechMatch} from './serverHelper.js';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', async function(req, res, next) {
    await retrieveDB("thehonestwoodcutters");
    createStorySpeechMatch();
    res.sendFile(path.join(__dirname, './public/story.html'));
  });

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
      });

    socket.on("nav_button", (msg) => {
        console.log("server.js --> " + msg);
        let [story_line, img_path] = updatePage(msg);
        io.emit("html_story_text", story_line);
        io.emit("story_img", img_path);
    });

    socket.on("speech_interim", (msg) => {
        console.log("server.js --> " + msg);
        let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(msg);
        io.emit("html_story_text", html_story_line);
        io.emit("story_img", img_path);
    });

    socket.on("speech_final", (msg) => {
        console.log("server.js --> " + msg);
        let [html_story_line, img_path, correctness_percent] = compareSpeechToStory(msg);
        if (correctness_percent>50)
        {
          let [story_line, img_path] = updatePage("next");
        
          io.emit("html_story_text", html_story_line);
          io.emit("story_img", img_path);
        } 
    });

    socket.on("click_words", async (msg) => {
        console.log("server.js --> " + msg);
        let meaning = await getMeaning(msg);
        io.emit("story_word_meaning", meaning);
    });

    socket.on("collected_word", (msg) => {
        wordCollector(msg);
    });

});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log('server running at http://localhost:3000');
});