import { writable } from "svelte/store";
import type { GameModel } from "./gamemodel";
import { PlayerLightType } from "./pixi/playerlightenum";
import { saveSaveGame } from "./saveloadfunctions";
import { gameModel, updateGameModel } from "./stores";

/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance : GameModel;
gameModel.subscribe(m => gameModelInstance = m);

/**
 * Class that defines common Upgrade properties.
 */
export class Upgrade {
    public id: number; // unique id
    public name: string;
    public lightType : PlayerLightType;
    public basePrice: number; 
    public multiplier: number;
    public getCurrentValue : () => number;
    public apply : () => void;
    
    constructor(id: number, lightType : PlayerLightType, name: string, basePrice: number, multiplier: number,
            getCurrentValue : () => number, apply : () => void) {
        this.id = id;
        this.name = name;
        this.lightType = lightType;
        this.basePrice = basePrice;
        this.multiplier = multiplier;
        this.getCurrentValue = getCurrentValue;
        this.apply = apply;
    }

    /**
     * Get the count of how many of this upgrade have been bought.
     */
    getCount() : number {
        return gameModelInstance.saveData.upgradesBought[this.id] || 0;
    }


    /**
     * Get the current price to buy one of these upgrades.
     * Formula to calculate the price is basePrice * (multiplier ^ bought)
     */
    getPrice(): number {
        return this.basePrice * Math.pow(this.multiplier, this.getCount());
    }


    canAfford() : boolean {
        return gameModelInstance.saveData.money >= this.getPrice();
    }

    /**
     * Attempt to purchase this upgrade.
     * Returns true if it was purchased, false if not.
     */
    purchase() : boolean {
        if (gameModelInstance.spendMoney(this.getPrice())) {
            // increase the amount owned
            gameModelInstance.saveData.upgradesBought[this.id] = this.getCount() + 1;
            this.apply();
            // Update the svelte store
            updateGameModel();
            // Save game to localStorage
            saveSaveGame(gameModelInstance.saveData);
            // eslint-disable-next-line no-self-assign
            upgradeMap.update(m => m = m);
            return true;
        }
        return false;
    }
}

export const upgrades = [
    new Upgrade(1, PlayerLightType.spotlight, 'Lights', 50, 2,
    function() {
        return gameModelInstance.playerLights.spotlight.count
    },
    function() {
        gameModelInstance.playerLights.spotlight.count = 1 + this.getCount();
    }),
    new Upgrade(2, PlayerLightType.spotlight, 'Radius', 50, 1.5,
    function() {
        return gameModelInstance.playerLights.spotlight.radius
    },
    function() {
        gameModelInstance.playerLights.spotlight.radius = 42 * Math.pow(1.1, this.getCount());
    }),
    new Upgrade(3, PlayerLightType.spotlight, 'Brightness', 50, 1.5,
    function() {
        return gameModelInstance.playerLights.spotlight.brightness
    },
    function() {
        gameModelInstance.playerLights.spotlight.brightness = 35 * Math.pow(1.1, this.getCount());
    }),
    new Upgrade(4, PlayerLightType.beamlight, 'Lights', 500, 2,
    function() {
        return gameModelInstance.playerLights.beamlight.count
    },
    function() {
        gameModelInstance.playerLights.beamlight.count = 0 + this.getCount();
    }),
    new Upgrade(5, PlayerLightType.beamlight, 'Range', 500, 1.5,
    function() {
        return gameModelInstance.playerLights.beamlight.range
    },
    function() {
        gameModelInstance.playerLights.beamlight.range = 128 * Math.pow(1.1, this.getCount());
    }),
    new Upgrade(6, PlayerLightType.beamlight, 'Brightness', 500, 1.5,
    function() {
        return gameModelInstance.playerLights.beamlight.brightness
    },
    function() {
        gameModelInstance.playerLights.beamlight.brightness = 375 * Math.pow(1.1, this.getCount());
    }),
    new Upgrade(7, PlayerLightType.orboflight, 'Lights', 1000, 3,
    function() {
        return gameModelInstance.playerLights.orboflight.count
    },
    function() {
        gameModelInstance.playerLights.orboflight.count = 0 + this.getCount();
    }),
    new Upgrade(8, PlayerLightType.orboflight, 'Radius', 500, 1.5,
    function() {
        return gameModelInstance.playerLights.orboflight.radius
    },
    function() {
        gameModelInstance.playerLights.orboflight.radius = 32 * Math.pow(1.1, this.getCount());
    }),
    new Upgrade(9, PlayerLightType.orboflight, 'Brightness', 500, 1.5,
    function() {
        return gameModelInstance.playerLights.orboflight.brightness
    },
    function() {
        gameModelInstance.playerLights.orboflight.brightness = 195 * Math.pow(1.1, this.getCount());
    }),
];

const upgradeMapInstance = new Map<number, Upgrade>();
upgrades.forEach(u => upgradeMapInstance.set(u.id, u));

export const upgradeMap = writable(upgradeMapInstance);


export function applyUpgrades() : void {
    upgrades.forEach(u => u.apply());
    updateGameModel();
}

/**
 * Self executing function that will automatically run when the game loads in order to test
 * that the upgrade ids are all unique. This is only for validation.
 */
(() => {
    const ids = [];
    upgrades.forEach(e => {
        if (ids[e.id]) {
            alert(`Upgrade id: ${e.id} has been used more than once. All upgrade ids must be unique!`);
        }
        ids[e.id] = true;
    })
})();