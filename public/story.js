let socket2 = new WebSocket("ws://localhost:3000/");

// Get the elements by their ID
var popupWindow = document.getElementById("popup-window");
var popupWord = $("#popup-word");
var popupMeaning = $("#popup-meaning");
var closeButton = document.getElementById("close-button");
var collectButton = document.getElementById("collect-button");

let clicked_word;
const synth = window.speechSynthesis; // from Web-speech API

// Listen for messages
socket2.addEventListener("message", (event) => {
    var data = JSON.parse(event.data);
    console.log("story.js --> " + data.action + ", " + data.desc);

    if (data.action==="html_story_text")
        $("#story-text").html(data.desc); // Update story-line
    else if (data.action==="story_img")
        $("#story-img").attr("src", data.desc); // Update image
    else
    {
        event.preventDefault();
        popupWindow.style.display = "block";
        $("#collect-button").text("Collect");
        $("#popup-word").text(clicked_word);
        $("#popup-meaning").text(data.desc);
    }

});

$(".nav-button.prev").on("click", function(){
    let data = {"action":"nav_button", "desc":"prev"};
    socket2.send(JSON.stringify(data));
    speak("previous");
});

$(".nav-button.next").on("click", function(){
    let data = {"action":"nav_button", "desc":"next"};
    socket2.send(JSON.stringify(data));
    speak("next");
});

$("#story-text").on("click", "span", function(){
    clicked_word = $(this).text();
    console.log(clicked_word);
    $(this).addClass("red-text");

    let data = {"action":"click_words", "desc":clicked_word};
    socket2.send(JSON.stringify(data));
});

collectButton.addEventListener("click", function() {
    $("#collect-button").text("Collected");
    let word = $("#popup-word").text();
    let data = {"action":"collected_word", "desc":word};
    socket2.send(JSON.stringify(data));
  });

// Hide the pop-up window when the close button is clicked
closeButton.addEventListener("click", function() {
  popupWindow.style.display = "none";
});

const custom_cursor = document.querySelector('#invertedcursor');

document.addEventListener('mousemove', function(e) {
    const {clientWidth, clientHeight} = custom_cursor;
    custom_cursor.style.left = ((e.pageX - (clientWidth / 2)) + 'px');
    custom_cursor.style.top = (e.pageY - (clientHeight / 2)) + 'px';

    $("#story-text").on("mouseover", "span", function(){
        hovered_word = $(this).text();
        console.log(hovered_word);
        speak(hovered_word);
        $(this).addClass("increase-word-font-size");

        setTimeout(() => {
            $(this).removeClass("increase-word-font-size");
        }, 1000);
    });
});

function speak(word)
{
    // event.preventDefault();
    if (synth.speaking) {
        console.log("speechSynthesis.speaking");
        return;
    }

    const utterThis = new SpeechSynthesisUtterance(word);
    utterThis.voice = synth.getVoices()[0]
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
}