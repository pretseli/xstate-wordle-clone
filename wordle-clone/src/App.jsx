import "./App.css";
import _ from "lodash";

import { useEffect } from "react";
import { useMachine } from "@xstate/react";
import {
  GUESS_AMOUNT,
  WORD_LENGTH,
  wordleMachine,
  KEY_CORRECT,
  KEY_PARTIAL,
  KEY_WRONG,
  KEY_PENDING,
} from "./wordle-machine";

const COLOR_BY_STATUS = {
  [KEY_CORRECT]: "limegreen",
  [KEY_PARTIAL]: "gold",
  [KEY_WRONG]: "silver",
  [KEY_PENDING]: "lightgrey",
};

const getStatusColor = (status) => COLOR_BY_STATUS?.[status] || "lightgrey";

function WordGridCell({ char, status }) {
  return (
    <div
      className="WordGridItem"
      style={{ backgroundColor: getStatusColor(status) }}
    >
      <div>{_.capitalize(char) ?? ""}</div>
    </div>
  );
}

function WordGrid({ words }) {
  const letters = _.flatten(words) || [];

  return (
    <div
      style={{
        marginBottom: "50px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {_.range(GUESS_AMOUNT).map((row) => (
        <div
          key={`guess_${row}`}
          style={{ display: "flex", flexDirection: "row" }}
        >
          {_.range(WORD_LENGTH).map((column) => {
            const letter = words?.[row]?.[column] ?? {};
            return (
              <WordGridCell
                key={`${row}_${column}`}
                char={letter?.char}
                status={letter?.status}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

const KEY_ROWS = [
  _.toArray("QWERTYUIOP"),
  _.toArray("ASDFGHJKL"),
  _.toArray("ZXCVBNM"),
];

const wordsToMap = (letters) =>
  _.reduce(
    letters,
    (acc, { char, status }) => ({
      ...acc,
      [char]: status,
    }),
    {}
  );

const KeyRows = ({ words }) => {
  const statusMap = wordsToMap(_.flatten(words));
  return KEY_ROWS.map((row) => (
    <div key={row.join()}>
      {row.map((key) => (
        <div
          key={key}
          className="KeyRows"
          style={{
            backgroundColor: getStatusColor(statusMap?.[_.toLower(key)]),
            display: "inline-block",
            margin: "1px",
            padding: "5px",
            width: "20px",
            height: "20px",
          }}
        >
          {key}
        </div>
      ))}
    </div>
  ));
};

function App() {
  const [state, send] = useMachine(wordleMachine, { devTools: true });

  const guesses = state?.context?.guesses;
  const currentGuess = state?.context.currentGuess;

  const gridGuesses = [...guesses, currentGuess];

  useEffect(() => {
    const eventListener = (event) => {
      send({ type: "KEYDOWN", event });
    };

    document.addEventListener("keydown", eventListener);

    return () => document.removeEventListener("keydown", eventListener);
  }, [send]);

  return (
    <>
      {state.matches("started.invalid_guess") && (
        <div
          style={{
            fontSize: "30px",
            display: "flex",
            position: "fixed",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>{state.context.error}</div>
        </div>
      )}
      <div className="App">
        <h1>Wordle</h1>

        <main>
          <WordGrid words={gridGuesses} />
          <KeyRows words={gridGuesses} />
          {state.matches("stopped.win") && <p>You won!</p>}
          {state.matches("stopped.win") && <p>You lost!</p>}
          {state.matches("stopped") && (
            <>
              <p>The right word was "{state.context.targetWord}".</p>
              <button type="button" onClick={() => send("START_GAME")}>
                Try again!
              </button>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default App;