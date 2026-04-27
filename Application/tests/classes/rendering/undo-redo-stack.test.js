import { describe, it, expect } from "vitest";

import {
    UndoRedoStack
} from "../../../functions/src/core";


describe("classes.undo-redo-stack.new", () => {
    it("creates a new UndoRedoStack with empty stacks", () => {
        let reverter = new UndoRedoStack();

        expect( reverter.getActions().UndoStack.length ).toBe( 0 );
        expect( reverter.getActions().RedoStack.length ).toBe( 0 );
    });
});

describe("classes.undo-redo-stack.recordAction", () => {
    it("records the given action in the stack", () => {
        let action = {Action: "Action!"};
        
        let reverter = new UndoRedoStack();
        reverter.recordAction(action);
        
        expect( reverter.getUndoSize() ).toBe( 1 );
        expect( reverter.getRedoSize() ).toBe( 0 );
        expect( reverter.getActions().UndoStack[0] ).toEqual( action );
    });

    it("throws an error if the action provided is not an object (dictionary)", () => {
        let reverter = new UndoRedoStack();

        expect( () => reverter.recordAction() ).toThrowError();
        expect( () => reverter.recordAction("a") ).toThrowError();
        expect( () => reverter.recordAction(new UndoRedoStack() ) ).toThrowError();
    });
});

describe("classes.undo-redo-stack.getUndoSize", () => {
    it("returns the number of actions to undo", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action!"});
        reverter.recordAction({Action: "Action!"});
        reverter.recordAction({Action: "Action!"});

        reverter.undoAction({Action: "Action!"});
        
        expect( reverter.getUndoSize() ).toBe( 2 );
    });

    it("returns 0 when there are no actions to undo", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action!"});
        reverter.undoAction({Action: "Action!"});
        
        expect( reverter.getUndoSize() ).toBe( 0 );
    });
});

describe("classes.undo-redo-stack.getRedoSize", () => {
    it("returns the number of actions to redo", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action!"});
        reverter.recordAction({Action: "Action!"});
        reverter.recordAction({Action: "Action!"});

        reverter.undoAction({Action: "Action!"});
        
        expect( reverter.getRedoSize() ).toBe( 1 );
    });

    it("returns 0 when there are no actions to redo", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action!"});
        reverter.undoAction({Action: "Action!"});
        
        reverter.redoAction({Action: "Action!"});
        
        expect( reverter.getRedoSize() ).toBe( 0 );
    });
});

describe("classes.undo-redo-stack.undoAction", () => {
    it("transfers actions from undo to redo in order when undone", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action 1"});
        reverter.recordAction({Action: "Action 2"});
        reverter.recordAction({Action: "Action 3"});
        reverter.recordAction({Action: "Action 4"});
        reverter.recordAction({Action: "Action 5"});

        reverter.undoAction();
        reverter.undoAction();

        expect( reverter.getUndoSize() ).toBe( 3 );
        expect( reverter.getRedoSize() ).toBe( 2 );

        let redos = reverter.getActions().RedoStack;
        expect( redos[0].Action ).toBe( "Action 5" );
        expect( redos[1].Action ).toBe( "Action 4" );
    });

    it("transfers nothing when there are no actions to undo", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action 1"});
        reverter.recordAction({Action: "Action 2"});
        
        reverter.undoAction();
        reverter.undoAction();
        reverter.undoAction();

        expect( reverter.getUndoSize() ).toBe( 0 );
        expect( reverter.getRedoSize() ).toBe( 2 );
        
        let redos = reverter.getActions().RedoStack;
        expect( redos[0].Action ).toBe( "Action 2" );
        expect( redos[1].Action ).toBe( "Action 1" );
    });
});

describe("classes.undo-redo-stack.redoAction", () => {
    it("transfers actions from redo to undo in order when redone", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action 1"});
        reverter.recordAction({Action: "Action 2"});
        reverter.recordAction({Action: "Action 3"});
        reverter.recordAction({Action: "Action 4"});
        reverter.recordAction({Action: "Action 5"});

        reverter.undoAction();
        reverter.undoAction();
        reverter.undoAction();

        reverter.redoAction();
        reverter.redoAction();

        expect( reverter.getUndoSize() ).toBe( 4 );
        expect( reverter.getRedoSize() ).toBe( 1 );

        let undos = reverter.getActions().UndoStack;
        expect( undos[0].Action ).toBe( "Action 1" );
        expect( undos[1].Action ).toBe( "Action 2" );
        expect( undos[2].Action ).toBe( "Action 3" );
        expect( undos[3].Action ).toBe( "Action 4" );
    });

    it("transfers nothing when there are no actions to redo", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action 1"});
        reverter.recordAction({Action: "Action 2"});

        reverter.undoAction();
        reverter.undoAction();

        reverter.redoAction();
        reverter.redoAction();
        reverter.redoAction();

        expect( reverter.getUndoSize() ).toBe( 2 );
        expect( reverter.getRedoSize() ).toBe( 0 );

        let undos = reverter.getActions().UndoStack;
        expect( undos[0].Action ).toBe( "Action 1" );
        expect( undos[1].Action ).toBe( "Action 2" );
    });
});

describe("classes.undo-redo-stack.clearActions", () => {
    it("clears all actions from the UndoRedoStack", () => {
        let reverter = new UndoRedoStack();

        reverter.recordAction({Action: "Action!"});
        reverter.recordAction({Action: "Action!"});
        reverter.recordAction({Action: "Action!"});

        reverter.undoAction({Action: "Action!"});
        reverter.undoAction({Action: "Action!"});

        reverter.clearActions();

        expect( reverter.getUndoSize() ).toBe( 0 );
        expect( reverter.getRedoSize() ).toBe( 0 );
    });
});