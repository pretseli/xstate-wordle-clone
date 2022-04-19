import { assign, createMachine } from "xstate";
import _ from "lodash";
import { checkWordExists, pickRandomWord } from "./words-db";

export const WORD_LENGTH = 5;
export const GUESS_AMOUNT = 6;

export const KEY_CORRECT = "CORRECT";
export const KEY_PARTIAL = "PARTIAL";
export const KEY_WRONG = "WRONG";
export const KEY_PENDING = "PENDING";

export const checkCurrentGuess = (ctx) =>
  ctx.currentGuess.map(({ char }, i) => {
    switch (true) {
      case ctx.targetWord[i] === char:
        return { char, status: KEY_CORRECT };
      case _.includes(ctx.targetWord, char):
        return { char, status: KEY_PARTIAL };
      default:
        return { char, status: KEY_WRONG };
    }
  });

const getCurrentWord = (ctx) =>
  ctx.currentGuess.map(({ char }) => char).join("");

export const wordleMachine = createMachine(
  {
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
              actions: "resetContext",
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
                  cond: "isEnterKeyEvent",
                  target: "checking",
                },
                {
                  cond: "shouldRemoveGuessChar",
                  actions: "removeGuessChar",
                },
                {
                  cond: "shouldAddGuessChar",
                  actions: "addGuessChar",
                },
              ],
            },
          },
          checking: {
            always: [
              {
                cond: "isGuessTooShort",
                target: "invalid_guess",
                actions: assign({
                  error: () => `Word too short!`,
                }),
              },
              {
                cond: "isGuessNonExistingWord",
                target: "invalid_guess",
                actions: assign({
                  error: (ctx) =>
                    `Word "${getCurrentWord(ctx)}" does not exist!`,
                }),
              },
              {
                cond: "isGuessCorrect",
                target: "#won",
                actions: "freezeCurrentGuess",
              },
              {
                cond: "outOfGuesses",
                target: "#lost",
                actions: "freezeCurrentGuess",
              },
              {
                target: "guessing",
                actions: "freezeCurrentGuess",
              },
            ],
          },
        },
      },
      stopped: {
        states: {
          won: {
            id: "won",
            on: {
              START_GAME: "#started",
            },
          },
          lost: {
            id: "lost",
            on: {
              START_GAME: "#started",
            },
          },
        },
      },
    },
  },
  {
    guards: {
      isEnterKeyEvent: (ctx, e) => e?.event?.key === "Enter",
      shouldAddGuessChar: (ctx, e) =>
        /^[a-z]$/.test(e?.event?.key) && ctx.currentGuess.length < WORD_LENGTH,
      shouldRemoveGuessChar: (ctx, e) =>
        e?.event?.key === "Backspace" && ctx.currentGuess.length > 0,
      isGuessTooShort: (ctx) => ctx.currentGuess?.length < WORD_LENGTH,
      isGuessNonExistingWord: (ctx) => !checkWordExists(getCurrentWord(ctx)),
      isGuessCorrect: (ctx) => getCurrentWord(ctx) === ctx.targetWord,
      outOfGuesses: (ctx) => ctx.guesses.length === GUESS_AMOUNT - 1,
    },
    actions: {
      addGuessChar: (ctx, e) => {
        ctx.currentGuess = [
          ...ctx.currentGuess,
          { char: e?.event?.key, status: KEY_PENDING },
        ];
        return ctx;
      },
      removeGuessChar: (ctx) => {
        ctx.currentGuess = ctx.currentGuess.slice(0, -1);
        return ctx;
      },
      resetContext: assign({
        guesses: () => [],
        currentGuess: () => [],
        targetWord: () => pickRandomWord(),
      }),
      freezeCurrentGuess: assign({
        guesses: (ctx) => [...ctx.guesses, checkCurrentGuess(ctx)],
        currentGuess: () => [],
      }),
    },
  }
);
