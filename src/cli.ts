#!/usr/bin/env node

import { parser } from "./liquidsoap.grammar";
import { Input, NodeType, Tree, TreeCursor } from "@lezer/common";
import parseArgs from "minimist";
import BluebirdPromise from "bluebird";
import { glob } from "glob";
import fs from "node:fs";
import process from "node:process";

enum Color {
  Red = 31,
  Green = 32,
  Yellow = 33,
}

function colorize(value: any, color: number): string {
  return "\u001b[" + color + "m" + String(value) + "\u001b[39m";
}

function focusedNode(cursor: TreeCursor): {
  readonly type: NodeType;
  readonly from: number;
  readonly to: number;
} {
  const { type, from, to } = cursor;
  return { type, from, to };
}

export function printTree(
  tree: Tree,
  input: string,
  options: {
    from?: number;
    to?: number;
    start?: number;
    includeParents?: boolean;
  } = {},
) {
  let errors = [];
  const cursor = tree.cursor();
  const {
    from = 0,
    to = input.length,
    start = 0,
    includeParents = false,
  } = options;
  let output = "";
  const prefixes: string[] = [];
  for (;;) {
    const node = focusedNode(cursor);
    let leave = false;
    if (node.from <= to && node.to >= from) {
      const enter =
        !node.type.isAnonymous &&
        (includeParents || (node.from >= from && node.to <= to));
      if (enter) {
        leave = true;
        const isTop = output === "";
        if (!isTop || node.from > 0) {
          output += (!isTop ? "\n" : "") + prefixes.join("");
          const hasNextSibling = cursor.nextSibling() && cursor.prevSibling();
          if (hasNextSibling) {
            output += " ├─ ";
            prefixes.push(" │  ");
          } else {
            output += " └─ ";
            prefixes.push("    ");
          }
        }
        if (node.type.isError) errors = [...errors, node];

        output += node.type.isError
          ? colorize(node.type.name, Color.Red)
          : node.type.name;
      }
      const isLeaf = !cursor.firstChild();
      if (enter) {
        const hasRange = node.from !== node.to;
        output +=
          " " +
          (hasRange
            ? "[" +
              colorize(start + node.from, Color.Yellow) +
              ".." +
              colorize(start + node.to, Color.Yellow) +
              "]"
            : colorize(start + node.from, Color.Yellow));
        if (hasRange && isLeaf) {
          output +=
            ": " +
            colorize(
              JSON.stringify(input.slice(node.from, node.to)),
              Color.Green,
            );
        }
      }
      if (!isLeaf) continue;
    }
    for (;;) {
      if (leave) prefixes.pop();
      leave = cursor.type.isAnonymous;
      if (cursor.nextSibling()) break;
      if (!cursor.parent()) return { errors, output };
      leave = true;
    }
  }
}

const run = async () => {
  try {
    const { _, q } = parseArgs(process.argv.slice(2), { boolean: ["q"] });

    if (!_.length) {
      console.error("No filename passed!");
      process.exit(1);
    }

    let exitCode = 0;

    const files = await glob(_);

    await BluebirdPromise.each(files, async (file) => {
      const input = "" + fs.readFileSync(file);
      const tree = parser.parse(input);

      console.log(`Parsing ${file}..`);
      const { errors, output } = printTree(tree, input);

      if (!q) console.log(output);

      if (errors.length) {
        exitCode = 1;

        console.error(
          `Encountered ${errors.length} error(s) while parsing ${file}!`,
        );
      }

      errors.forEach((node) => {
        const start = input.lastIndexOf("\n", node.from) || 0;
        const stop = input.indexOf("\n", node.to) || input.length;
        const lineStart = input.slice(0, start).split("\n").length + 1;

        if (node.to === node.from) {
          console.log(`Line ${lineStart}, char ${node.from - start}: Error!`);
          return;
        }

        console.log(
          `Line ${lineStart}, error: ` +
            input.slice(start, node.from) +
            colorize(input.slice(node.from, node.to), Color.Red) +
            input.slice(node.to, stop),
        );
      });
    });

    process.exit(exitCode);
  } catch (err) {
    console.error(`Error while running liquidsoap-lezer-print-tree: ${err}`);
    process.exit(1);
  }
};

run();
