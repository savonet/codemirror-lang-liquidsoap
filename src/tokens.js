import { ExternalTokenizer, ContextTracker } from "@lezer/lr";
import { _var, varLpar, varLbra, uminus, float } from "./parser.terms.js";

const whiteSpace = /[ \t]/;

const letKeywords = ["eval", "replaces", "json", "yaml"];

const defKeywords = ["rec", "replaces"];

const keywords = [
  "open",
  "let",
  "def",
  "fun",
  "if",
  "then",
  "elsif",
  "else",
  "end",
  "not",
  "begin",
  "for",
  "while",
  "do",
  "to",
  "try",
  "catch",
  "and",
  "or",
  "mod",
];

export const noUminus = new ContextTracker({
  start: { disabled: false },
  strict: false,
});

const previousKeyword = (input, startPosition) => {
  let ret = "";
  let pos = -startPosition - 1;

  while (whiteSpace.test(String.fromCharCode(input.peek(pos)))) {
    pos--;
  }

  while (/[\p{Alphabetic}]/u.test(String.fromCharCode(input.peek(pos)))) {
    ret = `${String.fromCharCode(input.peek(pos))}${ret}`;
    pos--;
  }

  return ret;
};

export const varTok = new ExternalTokenizer((input, stack) => {
  let next = String.fromCharCode(input.next);
  let str = next;
  let isEmoji = false;
  let isVar = false;

  if (/[\p{Emoji_Presentation}\p{So}]/u.test(next)) {
    isEmoji = true;
    isVar = true;
  }

  if (str === "_") isVar = true;

  if (/[\p{Alphabetic}]/u.test(next)) isVar = true;

  if (!isVar) return;

  // Discard "_"
  if (next === "_" && whiteSpace.test(String.fromCharCode(input.peek(1))))
    return;

  // Discard "r/"
  if (next === "r" && String.fromCharCode(input.peek(1)) === "/") return;

  next = String.fromCharCode(input.advance());
  while (!isEmoji && /[\p{Alphabetic}0-9_']/u.test(next)) {
    str = str + next;
    next = String.fromCharCode(input.advance());
  }

  const prevKeyword = previousKeyword(input, str.length);

  if (prevKeyword === "def" && defKeywords.includes(str)) return;
  if (prevKeyword === "let" && letKeywords.includes(str)) {
    if (!["json", "yaml"].includes(str)) return;

    let parseStr = "";
    let parsePos = 0;
    while (/[a-zA-Z.]/.test(String.fromCharCode(input.peek(parsePos)))) {
      parseStr += String.fromCharCode(input.peek(parsePos));
      parsePos++;
    }

    if (parseStr === ".parse") return;
  }

  if (
    keywords.includes(str) &&
    String.fromCharCode(input.peek(-str.length - 1)) !== "."
  ) {
    stack.context.disabled = false;
    return;
  }

  stack.context.disabled = true;
  let pos = 0;
  next = String.fromCharCode(input.peek(0));

  while (whiteSpace.test(next)) {
    pos++;
    next = String.fromCharCode(input.peek(pos));
  }

  if (next === "(") {
    input.acceptToken(varLpar);
    return;
  }

  if (next === "[") {
    input.acceptToken(varLbra);
    return;
  }

  input.acceptToken(_var);
});

export const floatTok = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  let hasPrefix = false;

  if (String.fromCharCode(next) !== ".") {
    if (!/[0-9]/.test(String.fromCharCode(next))) return;

    hasPrefix = true;
    stack.context.disabled = true;

    while (/[0-9_]/.test(String.fromCharCode(next))) {
      next = input.advance();
    }
  }

  if (String.fromCharCode(next) !== ".") {
    return;
  }

  next = input.advance();

  if (hasPrefix && whiteSpace.test(String.fromCharCode(input.peek(1)))) {
    stack.context.disabled = true;
    input.acceptToken(float);
    return;
  }

  if (!hasPrefix && !/[0-9]/.test(String.fromCharCode(next))) return;

  while (/[0-9_]/.test(String.fromCharCode(next))) {
    next = input.advance();
  }

  let pos = 0;
  next = input.peek(pos);

  while (whiteSpace.test(String.fromCharCode(next))) {
    pos++;
    next = input.peek(pos);
  }

  if (String.fromCharCode(next) === "{") {
    return;
  }

  stack.context.disabled = true;
  input.acceptToken(float);
  return;
});

export const uminusTok = new ExternalTokenizer(
  (input, stack) => {
    let pos = -1;
    let prev = input.peek(pos);
    while (whiteSpace.test(String.fromCharCode(prev))) {
      pos--;
      prev = input.peek(pos);
    }

    if (String.fromCharCode(prev) === ")") stack.context.disabled = true;
    if (/[,=(]/.test(String.fromCharCode(prev))) stack.context.disabled = false;
    if (keywords.includes(previousKeyword(input, 0)))
      stack.context.disabled = false;

    let { next } = input;

    if (String.fromCharCode(next) === "-") {
      const disabled = stack.context.disabled;
      stack.context.disabled = false;

      if (disabled) return;

      input.advance();
      input.acceptToken(uminus);
    }
  },
  { contextual: true },
);
