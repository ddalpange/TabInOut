"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import {
  window,
  commands,
  Disposable,
  ExtensionContext,
  StatusBarAlignment,
  StatusBarItem,
  TextDocument,
  Selection,
  Range,
  Position,
} from "vscode";
import { characterSetsToTabOutFrom } from "./charactersToTabOutFrom";
import {
  selectNextCharacter,
  returnHighest,
  returnLowest,
  oneNumberIsNegative,
  getPreviousChar,
  getNextChar,

  determineNextSpecialCharPosition,
  determinePrevSpecialCharPosition,
} from "./utils";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let isDisabledByDefault = vscode.workspace
    .getConfiguration("tabInOut")
    .get("disableByDefault");
  context.workspaceState.update(
    "tabInOut-active",
    isDisabledByDefault ? false : true,
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("toggle-tabInOut", () => {
      let currentState = context.workspaceState.get("tabInOut-active");
      context.workspaceState.update("tabInOut-active", !currentState);
      window.showInformationMessage(
        "TabInOut is " + (!currentState ? "" : " NOT ") + "active",
      );
    }),
  );

  let outOf = vscode.commands.registerCommand("tabInOut-out", () => {
    // The code you place here will be executed every time your command is executed
    let editor = window.activeTextEditor;

    //vscode.commands.executeCommand("acceptSelectedSuggestion");

    if (!editor) return;

    if (!context.workspaceState.get("tabInOut-active")) {
      commands.executeCommand("tab");
      return;
    }

    let currentLineText = editor.document.lineAt(
      editor.selection.active.line,
    ).text;
    let currentPositionInLine = editor.selection.active.character;

    if (currentPositionInLine == 0) {
      commands.executeCommand("tab");
      return;
    }

    if (editor.selection.active.character > 0) {
      var rangeBeforeCurrentPosition = new Range(
        new Position(editor.selection.active.line, 0),
        new Position(editor.selection.active.line, currentPositionInLine),
      );
      var textBeforeCurrentPosition = editor.document.getText(
        rangeBeforeCurrentPosition,
      );
      if (textBeforeCurrentPosition.trim() == "") {
        commands.executeCommand("tab");
        return;
      }
    }

    //Previous character special?
    let previousCharacter = getPreviousChar(
      currentPositionInLine,
      currentLineText,
    );
    let characterInfo = characterSetsToTabOutFrom().find(
      (o) => o.open == previousCharacter || o.close == previousCharacter,
    );

    if (characterInfo !== undefined) {
      let nextCharacter = getNextChar(currentPositionInLine, currentLineText);
      let indxNext = characterSetsToTabOutFrom().find(
        (o) => o.open == nextCharacter || o.close == nextCharacter,
      );

      if (indxNext !== undefined) {
        return selectNextCharacter(currentLineText, currentPositionInLine);
      }
    }

    if (characterInfo !== undefined) {
      //no tab, put selection just before the next special character
      let positionNextSpecialCharacter = determineNextSpecialCharPosition(
        characterInfo,
        currentLineText,
        currentPositionInLine,
      );
      if (positionNextSpecialCharacter > -1) {
        //Move cursor
        let nextCursorPosition = new vscode.Position(
          editor.selection.active.line,
          positionNextSpecialCharacter,
        );
        return (editor.selection = new vscode.Selection(
          nextCursorPosition,
          nextCursorPosition,
        ));
      }
    }

    //Next character special?
    return selectNextCharacter(currentLineText, currentPositionInLine);
  });

  let inOf = vscode.commands.registerCommand("tabInOut-in", () => {
    // The code you place here will be executed every time your command is executed
    let editor = window.activeTextEditor;

    //vscode.commands.executeCommand("acceptSelectedSuggestion");

    if (!editor) return;

    if (!context.workspaceState.get("tabInOut-active")) {
      commands.executeCommand("tab");
      return;
    }

    let currentLineText = editor.document.lineAt(
      editor.selection.active.line,
    ).text;
    let currentPositionInLine = editor.selection.active.character;

    if (currentPositionInLine == 0) {
      commands.executeCommand("shift+tab");
      return;
    }

    if (editor.selection.active.character > 0) {
      var rangeBeforeCurrentPosition = new Range(
        new Position(editor.selection.active.line, 0),
        new Position(editor.selection.active.line, currentPositionInLine),
      );
      var textBeforeCurrentPosition = editor.document.getText(
        rangeBeforeCurrentPosition,
      );
      if (textBeforeCurrentPosition.trim() == "") {
        commands.executeCommand("shift+tab");
        return;
      }
    }

    //Previous character special?
    let previousCharacter = getPreviousChar(
      currentPositionInLine,
      currentLineText,
    );
    let characterInfo = characterSetsToTabOutFrom().find(
      (o) => o.open == previousCharacter || o.close == previousCharacter,
    );

    if (characterInfo !== undefined) {
      let prevChar = getPreviousChar(currentPositionInLine, currentLineText);
      let indxPrev = characterSetsToTabOutFrom().find(
        (o) => o.open == prevChar || o.close == prevChar,
      );

      if (indxPrev !== undefined) {
        return selectNextCharacter(currentLineText, currentPositionInLine);
      }
    }

    if (characterInfo !== undefined) {
      //no tab, put selection just before the next special character
      let positionPrevSpecialCharacter = determinePrevSpecialCharPosition(
        characterInfo,
        currentLineText,
        currentPositionInLine,
      );
      if (positionPrevSpecialCharacter > -1) {
        //Move cursor
        let prevCursorPosition = new vscode.Position(
          editor.selection.active.line,
          positionPrevSpecialCharacter,
        );
        return (editor.selection = new vscode.Selection(
          prevCursorPosition,
          prevCursorPosition,
        ));
      }
    }

    //Next character special?
    return selectNextCharacter(currentLineText, currentPositionInLine);
  });

  context.subscriptions.push(outOf);
  context.subscriptions.push(inOf);
}

// this method is called when your extension is deactivated
export function deactivate() {}
