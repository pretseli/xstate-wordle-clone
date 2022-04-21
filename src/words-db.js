import _ from "lodash";
/* eslint-disable-next-line import/no-unresolved */
import wordDB from "./wordle-nyt-answers-alphabetical.txt?raw";

export const wordsArr = wordDB.trim().split("\n");

export const pickRandomWord = () => wordsArr[_.random(0, wordsArr.length - 1)];

// This returns a rejected Promise 25% of the time, for demonstration purposes :)
export const pickRandomWordAsync = () =>
  new Promise((resolve, reject) => {
    setTimeout(
      () => (Math.random() < 0.75 ? resolve(pickRandomWord()) : reject()),
      1500
    );
  });

export const checkWordExists = (word) => wordDB.includes(word);
