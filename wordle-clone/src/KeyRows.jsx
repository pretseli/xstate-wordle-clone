import _ from "lodash";
import {
  getStatusColor,
  KEY_CORRECT,
  KEY_PARTIAL,
  KEY_PENDING,
  KEY_WRONG,
} from "./helpers";

const KEY_PRIORITIES = [KEY_PENDING, KEY_WRONG, KEY_PARTIAL, KEY_CORRECT];

const selectCharStatus = (status1, status2) =>
  KEY_PRIORITIES[
    Math.max(KEY_PRIORITIES.indexOf(status1), KEY_PRIORITIES.indexOf(status2))
  ];

export const KEY_ROWS = [
  _.toArray("QWERTYUIOP"),
  _.toArray("ASDFGHJKL"),
  _.toArray("ZXCVBNM"),
];

export const guessesToStatusByChar = (letters) =>
  _.reduce(
    letters,
    (acc, { char, status }) => ({
      ...acc,
      [char]: selectCharStatus(status, acc[char]),
    }),
    {}
  );

export const KeyRows = ({ words }) => {
  const statusMap = guessesToStatusByChar(_.flatten(words));
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

export default KeyRows;
