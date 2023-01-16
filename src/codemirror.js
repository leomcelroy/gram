import { EditorView, basicSetup } from "codemirror"
import { EditorState, StateField } from "@codemirror/state";
// import { syntaxTree } from "@codemirror/language";

// const countDocChanges = StateField.define({
//   create(state) {
//     return 0;
//   },
//   update(value, transaction) {
//     if (transaction.docChanged) {
//       const { state } = transaction;
//       const ast = syntaxTree(state);
//       return value + 1;
//     } else {
//       return value;
//     }
//   },
//   provide(field) {
//     return [];
//   }
// });

class CodeMirror extends HTMLElement {
    constructor() {
        super();
        this.view = undefined;
        this.state = undefined;
    }

    foldRange() {}

    // lifecycle
    connectedCallback() {
        const extensions = [
            basicSetup, 
            // javascript(),
            // countDocChanges
        ]

        const state = EditorState.create({ extensions });

        this.view = new EditorView({
          state,
          parent: this
        })
    }
}

window.customElements.define("codemirror-editor", CodeMirror);