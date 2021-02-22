import { writable } from 'svelte/store';
import { loadSaveGame } from './saveloadfunctions';

/**
 * This class holds any data that needs to be saved when the player saves their game.
 * It should only be used for values that must be saved. Anything transient should go directly on the GameModel.
 */
export class SaveData {

    // Used to hold the current money the player has, initialized at 0
    public money  = 0;

    // Level reached
    public level  = 1;

    // Used to hold which upgrades have been bought, and the quantity
    public upgradesBought : number[] = [];

    // Used to hold when the game was last saved, needed to calculate offline progress
    public lastSaved  = 0;
}

export enum GameState {
    startgame, endoflevel, playing
}

/**
 * This class holds the data the game needs to function.
 * It will be accessible from anywhere in the game using svelte stores.
 */
export class GameModel {
    public saveData : SaveData;
    public state = GameState.startgame;

    public humansToSpawn = 100;
    public humansSpawned = 0;
    public humansEscaped = 0;
    public humansEaten = 0;
    public humanValue = 1;
    public humanSpeed = 16;
    public humanLight = {
        brightness : 0.5, radius : 32
    };

    public setupLevel() : void {
        this.humansToSpawn = 90 + (10 * this.saveData.level);
        this.humansEscaped = 0;
        this.humansSpawned = 0;
        this.humansEaten = 0;
        this.humanValue = this.saveData.level;
    }

    public constructor() {
        // when we first create the game model we need to load any save data from localstorage
        this.saveData = loadSaveGame();
    }

    /**
     * Add money to the save data
     * @param value Amount of money to add
     */
    public addMoney(value : number) : void {
        if (!isNaN(value)) {
            this.saveData.money += value;
        }
    }

    /**
     * Takes money from the save data.
     * Returns true if there was enough money, false if not.
     * @param value Amount of money to spend
     */
    public spendMoney(value : number) : boolean {
        if (!isNaN(value) && this.saveData.money >= value) {
            this.saveData.money -= value;
            return true;
        }
        return false;
    }
}

/**
 * A writable store of the gameModel that can be accessed from other parts of the application.
 */
export const gameModel = writable(new GameModel());

/**
 * A function that can be called anywhere to update the game model in the svelte store.
 * This will trigger the svelte components to re-evaluate and update their content.
 */
export function updateGameModel() : void {
    // eslint-disable-next-line no-self-assign
    gameModel.update(m => m = m);
}