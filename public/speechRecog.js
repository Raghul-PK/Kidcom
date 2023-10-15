let socket = new WebSocket("ws://localhost:3000/");

var recognizing = false;

socket.addEventListener("message", (event) => {
  var data = JSON.parse(event.data);
  // console.log("story.js --> " + data.action + ", " + data.desc);

  if (data.action==="html_story_text")
      $("#story-text").html(data.desc); // Update story-line
  else if (data.action==="story_img")
      $("#story-img").attr("src", data.desc); // Update image
  
});

socket.onclose = function(event) {
  if (event.wasClean) {
    alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    alert('[close] Connection died');
  }
  console.log(event);
};

socket.onerror = function(error) {
  alert(`[error]`);
};

// var myTimeout = window.setInterval(function() {
//   console.log('one second has passed without any speech');
// }, 3000);

if ("webkitSpeechRecognition" in window) 
{
  let speechRecognition = new webkitSpeechRecognition();
  let final_transcript = "";

  speechRecognition.continuous = true;
  speechRecognition.interimResults = true; // Gives in b/w results

  speechRecognition.onstart = () => {
    console.log("Speech Recognition Started");
    recognizing = true;
  };
  speechRecognition.onerror = (event) => {
    console.log("Speech Recognition Error");
    console.log(event);
    recognizing = false;
  };
  speechRecognition.onend = () => {
    console.log("Speech Recognition Ended");
    recognizing = false;
    console.log("Restarting again...");
    startSpeechRecog();
    recognizing = true;
  };

  speechRecognition.onresult = (event) => {
    let interim_transcript = "";
    let final_transcript = "";

    let final_flag = 0;
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
        final_flag = 1; 
      } else {
        interim_transcript += event.results[i][0].transcript;
      }    
      console.log("Final : " + final_transcript);
    }

    if (final_transcript!="")
    {
      let data = {"action":"speech_final", "desc":final_transcript};
      socket.send(JSON.stringify(data));
      console.log(data);
    }
    else
    {
      interim_transcript = interim_transcript.trim();
      let data = {"action":"speech_interim", "desc":interim_transcript};
      socket.send(JSON.stringify(data));
    }
    
  };

  $( window ).on( "load", function() {
    startSpeechRecog();
  });

  // Define the startSpeechRecog function
  function startSpeechRecog(){
    if (!recognizing)
      speechRecognition.start();
  }
  
} 
else 
{
  console.log("Speech Recognition Not Available");
}
