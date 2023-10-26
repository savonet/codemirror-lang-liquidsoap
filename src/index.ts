import { parser } from "./liquidsoap.grammar";

import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

export const LiquidsoapLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [
      styleTags({
        Var: t.variableName,
        "Type/...": t.typeName,
        Bool: t.bool,
        String: t.string,
        "Method/...": t.propertyName,
        "LabeledArgument/...": t.labelName,
        Integer: t.integer,
        Float: t.float,
        Regexp: t.regexp,
        EscapedChar: t.escape,
        Op: t.operatorKeyword,
        "LetDecoration/...": t.modifier,
        "Defined/Var": t.definition(t.variableName),
        "Defined/Varlpar": t.definition(t.function(t.variableName)),
        "Defined/Subfield/*/Var": t.definition(t.propertyName),
        "Defined/SubfieldLpar/*/Varlpar": t.definition(
          t.function(t.propertyName),
        ),
        "SubfieldLpar/*/Varlpar": t.function(t.propertyName),
        Varlpar: t.function(t.variableName),
        LineComment: t.lineComment,
        BlockComment: t.blockComment,
        DocComment: t.docComment,
        "ControlKeyword/...": t.controlKeyword,
        "Keyword/...": t.keyword,
        "DefinitionKeyword/...": t.definitionKeyword,
        "LogicOperator/...": t.logicOperator,
        "CompareOperator/...": t.compareOperator,
        "ArithmeticOperator/...": t.arithmeticOperator,
        DerefOp: t.derefOperator,
        UpdateOp: t.updateOperator,
        "( )": t.paren,
        "{ }": t.brace,
        "[ ]": t.squareBracket,
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
