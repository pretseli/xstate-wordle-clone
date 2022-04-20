import _ from "lodash";
import { GUESS_AMOUNT, WORD_LENGTH, getStatusColor } from "./helpers";

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

export default function WordGrid({ words }) {
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
