import { PlayerLightType } from './pixi/playerlightenum';
import type { SaveData } from './savedata';
// import { loadSaveGame } from './saveloadfunctions';

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

    public playerLights = {
        currentLight : PlayerLightType.spotlight,
        spotlight : {
            type : PlayerLightType.spotlight,
            count : 1,
            radius : 32,
            brightness : 24
        },
        beamlight : {
            type : PlayerLightType.beamlight,
            count : 0,
            range : 64,
            brightness : 95
        },
        orboflight : {
            type : PlayerLightType.orboflight,
            count : 0,
            radius : 24,
            brightness : 64
        }
    }

    public getEscapePercent() : number {
        return Math.round((this.humansEscaped / this.humansToSpawn) * 100);
    }
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
        this.humanValue = this.saveData.level * 10;
    }

    public constructor(saveData : SaveData) {
        // when we first create the game model we need to load any save data from localstorage
        // this.saveData = loadSaveGame();
        this.saveData = saveData;
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