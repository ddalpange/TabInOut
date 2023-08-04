import { CharacterSet } from "./CharacterSet";
import { characterSetsToTabInOutFrom } from "./charactersToTabInOutFrom";
import { window, Position, Selection, commands } from "vscode";

export function getPreviousChar(currentPosition: number, text: string): string {
  return text.substring(currentPosition - 1, currentPosition);
}

export function getNextChar(currentPosition: number, text: string): string {
  return text.substring(currentPosition + 1, currentPosition);
}

export function determinePrevSpecialCharPosition(
  nextCharInfo: CharacterSet,
  text: string,
  position: number,
): number {
  var strToSearchIn = text.substr(0, position - 1);
  for (let i = strToSearchIn.length; i >= 0; i--) {
    const char = strToSearchIn[i];
    let info = char === nextCharInfo.open || char === nextCharInfo.close;
    if (info) {
      return i;
    }
  }

  return -1;
}


export function determineNextSpecialCharPosition(
  charInfo: CharacterSet,
  text: string,
  position: number,
): number {
  let positionNextOpenChar = text.indexOf(charInfo.open, position + 1);

  if (positionNextOpenChar == -1) {
    positionNextOpenChar = text.indexOf(charInfo.close, position + 1);
  }

  if (positionNextOpenChar == -1) {
    //find first other special character
    var strToSearchIn = text.substr(position);
    var counter = position;
    for (var char of strToSearchIn) {
      counter++;
      let info = characterSetsToTabInOutFrom().find(
        (c) => c.open == char || c.close == char,
      );

      if (info !== undefined) {
        positionNextOpenChar = counter;
        break;
      }
    }
  }

  return positionNextOpenChar;
}

export function selectNextCharacter(text: string, position: number) {
  let nextCharacter = getNextChar(position, text);
  let indxNext = characterSetsToTabInOutFrom().find(
    (o) => o.open == nextCharacter || o.close == nextCharacter,
  );
  if (indxNext !== undefined) {
    //no tab, put selection just AFTER the next special character
    let nextCursorPosition = new Position(
      window.activeTextEditor.selection.active.line,
      position + 1,
    );
    return (window.activeTextEditor.selection = new Selection(
      nextCursorPosition,
      nextCursorPosition,
    ));
  }

  //Default
  commands.executeCommand("tab");
}

export function selectPrevCharacter(text: string, position: number) {
  let prevCharacter = getPreviousChar(position, text);
  let indxPrev = characterSetsToTabInOutFrom().find(
    (o) => o.open == prevCharacter || o.close == prevCharacter,
  );
  if (indxPrev !== undefined) {
    //no tab, put selection just AFTER the next special character
    let prevCursorPosition = new Position(
      window.activeTextEditor.selection.active.line,
      position - 1,
    );
    return (window.activeTextEditor.selection = new Selection(
      prevCursorPosition,
      prevCursorPosition,
    ));
  }

  //Default
  commands.executeCommand("outdent");
}
