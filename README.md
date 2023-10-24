# codemirror-lang-liquidsoap

This package provides `liquidsoap` language support 
to codemirror editors.

Usage:

```typescript
import { EditorView, basicSetup } from "codemirror";
import { liquidsoap } from "codemirror-lang-liquidsoap";

new EditorView({
  extensions: [
    basicSetup,
    liquidsoap(),
  ],
  parent: document.querySelector("#editor"),
});
```

The code is licensed under an MIT license.
