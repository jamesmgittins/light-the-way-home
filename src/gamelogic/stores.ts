/* eslint-disable no-self-assign */
import { writable } from "svelte/store";
import { GameModel } from "./gamemodel";

/**
 * A writable store of the gameModel that can be accessed from other parts of the application.
 */
export const gameModel = writable(new GameModel(null));

/**
 * A function that can be called anywhere to update the game model in the svelte store.
 * This will trigger the svelte components to re-evaluate and update their content.
 */
export function updateGameModel() : void {
    gameModel.update(m => m = m);
}

export type MonsterHealthBar = {
    x : number,
    y : number,
    percent : number
}

export const monsterHealthBars = writable([] as MonsterHealthBar[]);

export function updateMonsterHealthBars() : void {
    monsterHealthBars.update(m => m = m);
}