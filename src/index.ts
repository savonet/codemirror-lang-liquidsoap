import { parser } from "./liquidsoap.grammar";

import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

export const LiquidsoapLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Var: t.variableName,
        Type: t.typeName,
        Bool: t.bool,
        String: t.string,
        Method: t.propertyName,
        LabeledArgument: t.labelName,
        Integer: t.integer,
        Float: t.float,
        Regexp: t.regexp,
        EscapedChar: t.escape,
        Op: t.operatorKeyword,
        LineComment: t.lineComment,
        BlockComment: t.blockComment,
        ControlKeyword: t.controlKeyword,
        Keyword: t.keyword,
        DefinitionKeyword: t.definitionKeyword,
        LogicOperator: t.logicOperator,
        CompareOperator: t.compareOperator,
        ArithmeticOperator: t.arithmeticOperator,
        DerefOp: t.derefOperator,
        UpdateOp: t.updateOperator,
        "( )": t.paren,
        "[ ]": t.bracket,
      }),
    ],
  }),
  languageData: {
    commentTokens: { line: ";" },
  },
});

export function liquidsoap() {
  return new LanguageSupport(LiquidsoapLanguage);
}
