// class to create instances of UndoRedoStack objects
// * an UndoRedoStack provides undo / redo recording


export default class UndoRedoStack {
    #actions;

    constructor() {
        this.clearActions();
    }

    // getters / setters
    getActions() { return this.#actions; }


    // methods
    recordAction(action) {
        this.#actions.UndoStack.push(action);
        this.#actions.RedoStack = [];
    }

    getUndoSize() {
        return this.#actions.UndoStack.length;
    }

    getRedoSize() {
        return this.#actions.RedoStack.length;
    }

    undoAction() {
        if (this.#actions.UndoStack.length == 0) return;

        let action = this.#actions.UndoStack.pop();
        this.#actions.RedoStack.push(action);

        return action;
    }

    redoAction() {
        if (this.#actions.RedoStack.length == 0) return;

        let action = this.#actions.RedoStack.pop();
        this.#actions.UndoStack.push(action);

        return action;
    }

    clearActions() {
        this.#actions = {
            RedoStack: [],
            UndoStack: []
        }
    }
}