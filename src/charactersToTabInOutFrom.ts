import { CharacterSet } from "./CharacterSet";

export function characterSetsToTabInOutFrom(): Array<CharacterSet> {
  return CharacterSet.loadCharacterSets();
}
