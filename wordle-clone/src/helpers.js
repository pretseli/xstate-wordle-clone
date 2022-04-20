export const WORD_LENGTH = 5;
export const GUESS_AMOUNT = 6;

export const KEY_CORRECT = "CORRECT";
export const KEY_PARTIAL = "PARTIAL";
export const KEY_WRONG = "WRONG";
export const KEY_PENDING = "PENDING";

const COLOR_BY_STATUS = {
  [KEY_CORRECT]: "limegreen",
  [KEY_PARTIAL]: "gold",
  [KEY_WRONG]: "silver",
  [KEY_PENDING]: "lightgrey",
};

export const getStatusColor = (status) =>
  COLOR_BY_STATUS?.[status] || "lightgrey";
