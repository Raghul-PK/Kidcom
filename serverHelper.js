import fetch from 'node-fetch';

let page = 0;

let img_dir_path = "./Images_without_Text/img";
let img_count_per_line = [3,3,5,4,5,5,3,2,3,2,2,2,3,2,4,3,3,5,3,2];

let story_lines = [ "Chop Chop Chop", 
                    "The Woodcutter was cutting trees in the forest",
                    "Suddenly the axe slipped out of his hands",
                    "Oh god ! My axe fell into this deep river",
                    "What will I do now ?",
                    "The river fairy appeared and offered help",
                    "She dived back into the river and came up asking",
                    "Is this Golden axe yours ?",
                    "No, this is not mine",
                    "The fairy again went in and came up asking",
                    "Is this Silver axe yours ?",
                    "No, this is also not mine",
                    "For the third time, the fairy went in and came up",
                    "Is this Iron axe yours ?",
                    "Yes, it is !",
                    "The fairy smiled and told",
                    "I am impressed by your honesty",
                    "Here, take these golden and silver axes as my gift",
                    "Thank you fairy !!!"];

// Array of arrays to keep track of correctly spoken words
let story_speech_match = createStorySpeechMatch();

let collected_words = [];

export function createStorySpeechMatch()
{
  let arr_story_speech_match = [];

  for (var i=0; i<story_lines.length; i++)
  {
    let storyLine = story_lines[i];
    let storyLine1 = storyLine.replace(/[^a-zA-Z ]/g, "");
    let storyLine2 = storyLine1.trim();
    let storyLine3 = storyLine2.toLowerCase();

    let storyArr3 = storyLine3.split(" ");

    let inside_arr = Array(storyArr3.length).fill(0);
    arr_story_speech_match.push(inside_arr);
  }
  
  return arr_story_speech_match;
}


export function compareSpeechToStory(speechLine)
{
  let storyLine = story_lines[page];
  let storyLine1 = storyLine.replace(/[^a-zA-Z ]/g, "");
  let storyLine2 = storyLine1.trim();
  let storyLine3 = storyLine2.toLowerCase();

  let speechLine1 = speechLine.replace(/[^a-zA-Z ]/g, "");
  let speechLine2 = speechLine1.trim();
  let speechLine3 = speechLine2.toLowerCase();

  let speechArr3 = speechLine3.split(" ");
  let storyArr = storyLine.split(" ");
  let storyArr3 = storyLine3.split(" ");

  let modified_html_text = "";
  let correct_word_count = 0, correctness_percent = 0;

  for (var i=0; i<storyArr3.length; i++)
  {
    if (speechArr3.includes(storyArr3[i]))
    {
      story_speech_match[page][i] = 1;
      correct_word_count++;
    }

    let str_word_id = "word_id='" + i + "'";
    if (story_speech_match[page][i]===1)
      modified_html_text += "<span " + str_word_id + " class='correct-word'>" + storyArr[i] + "</span> ";
    else
      modified_html_text += "<span " + str_word_id + ">" + storyArr[i] + "</span> ";
  }
  correctness_percent = (correct_word_count/storyArr3.length)*100;

  let word_counter = speechArr3.length;
  let img_no = word_counter % img_count_per_line[page];

  let modified_img_path = img_dir_path + "" + page + "" + img_no +".png";
  
  return [modified_html_text, modified_img_path, correctness_percent];

}

export function updatePage(button)
{
  if (button==="prev")
    page--;
  else if (button==="next")
    page++;

  let storyLine = story_lines[page];
  let storyArr = storyLine.split(" ");
  let modified_html_text = "";
  for (var i=0; i<storyArr.length; i++)
  {
    let str_word_id = "word_id='" + i + "'";
    modified_html_text += "<span " + str_word_id + ">" + storyArr[i] + "</span> ";
  }

  let page_story_line = modified_html_text;
  let page_img_path = img_dir_path + "" + page + "0.png";;

  return [page_story_line, page_img_path];
}

export async function getMeaning(word)
{
  let word1 = word.replace(/[^a-zA-Z ]/g, "");
  let word2 = word1.trim();
  let word3 = word2.toLowerCase();

  // retrieve the meaning of the word using api call
  let url = "https://api.dictionaryapi.dev/api/v2/entries/en/" + word3;
  let meaning="Sorry, no meaning fetched!!!";
  try {
    const response = await fetch(url, {method: "GET"});
    const json = await response.json();
    meaning = json[0].meanings[0].definitions[0].definition;
  } catch (error) {
    console.log(error);
  }

  console.log(meaning);
  return meaning;
}

export function wordCollector(word)
{
  collected_words.push(word);
  console.log(collected_words);
}
