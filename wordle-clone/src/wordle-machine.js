import { assign, createMachine } from "xstate";
import _ from "lodash";
import wordDB from "./wordle-nyt-answers-alphabetical.txt?raw";

export const wordsArr = wordDB.trim().split("\n");

const randomWord = () => wordsArr[_.random(0, wordsArr.length - 1)];

export const targetWord = randomWord();

export const WORD_LENGTH = 5;
export const GUESS_AMOUNT = 6;

export const KEY_CORRECT = "CORRECT";
export const KEY_PARTIAL = "PARTIAL";
export const KEY_WRONG = "WRONG";
export const KEY_PENDING = "PENDING";

export const checkCurrentGuess = (ctx) =>
  ctx.currentGuess.map(({ char }, i) => {
    if (ctx.targetWord[i] === char) {
      return { char, status: KEY_CORRECT };
    }
    if (_.includes(ctx.targetWord, char)) {
      return { char, status: KEY_PARTIAL };
    }
    return { char, status: KEY_WRONG };
  });

const getCurrentWord = (ctx) =>
  ctx.currentGuess.map(({ char }) => char).join("");

export const wordleMachine = createMachine({
  id: "WordleMachine",
  initial: "started",
  context: {
    guesses: [],
    currentGuess: "",
    targetWord: null,
    error: null,
  },
  states: {
    started: {
      id: "started",
      initial: "initializing",
      states: {
        initializing: {
          always: {
            actions: assign({
              guesses: () => [],
              currentGuess: () => [],
              targetWord: () => randomWord(),
            }),
            target: "guessing",
          },
        },
        invalid_guess: {
          after: {
            1000: "guessing",
          },
          exit: assign({
            error: () => null,
          }),
        },
        guessing: {
          on: {
            KEYDOWN: [
              {
                cond: (ctx, e) => e?.event?.key === "Enter",
                target: "checking",
              },
              {
                actions: assign({
                  currentGuess: (ctx, e) => {
                    const key = e?.event?.key;

                    if (
                      /^[a-z]$/.test(key) &&
                      ctx.currentGuess.length < WORD_LENGTH
                    ) {
                      ctx.currentGuess = [
                        ...ctx.currentGuess,
                        { char: key, status: KEY_PENDING },
                      ];
                    } else if (
                      key === "Backspace" &&
                      ctx.currentGuess.length > 0
                    ) {
                      ctx.currentGuess = ctx.currentGuess.slice(0, -1);
                    }
                    return ctx.currentGuess;
                  },
                }),
              },
            ],
          },
        },
        checking: {
          always: [
            {
              cond: (ctx) => ctx.currentGuess?.length < WORD_LENGTH,
              target: "invalid_guess",
              actions: assign({
                error: () => `Word too short!`,
              }),
            },
            {
              cond: (ctx) => !wordDB.includes(getCurrentWord(ctx)),
              target: "invalid_guess",
              actions: assign({
                error: (ctx) => `Word "${getCurrentWord(ctx)}" does not exist!`,
              }),
            },
            {
              cond: (ctx) => ctx.currentGuess === targetWord,
              target: "#win",
              actions: assign({
                guesses: (ctx) => [...ctx.guesses, checkCurrentGuess(ctx)],
                currentGuess: () => [],
              }),
            },
            {
              cond: (ctx) => ctx.guesses.length === GUESS_AMOUNT - 1,
              target: "#lose",
              actions: assign({
                guesses: (ctx) => [...ctx.guesses, checkCurrentGuess(ctx)],
                currentGuess: () => [],
              }),
            },
            {
              target: "guessing",
              actions: assign({
                guesses: (ctx) => [...ctx.guesses, checkCurrentGuess(ctx)],
                currentGuess: () => [],
              }),
            },
          ],
        },
      },
    },
    stopped: {
      states: {
        win: {
          id: "win",
          on: {
            START_GAME: "#started",
          },
        },
        lose: {
          id: "lose",
          on: {
            START_GAME: "#started",
          },
        },
      },
    },
  },
});
