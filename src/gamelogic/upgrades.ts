import { gameModel, GameModel, updateGameModel } from "./gamemodel";
import { saveSaveGame } from "./saveloadfunctions";

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
    public description: string;
    public basePrice: number;
    public multiplier: number;
    
    constructor(id: number, name: string, description: string, basePrice: number, multiplier: number) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
        this.multiplier = multiplier;
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

    /**
     * Attempt to purchase this upgrade.
     * Returns true if it was purchased, false if not.
     */
    purchase() : boolean {
        if (gameModelInstance.spendMoney(this.getPrice())) {
            // increase the amount owned
            gameModelInstance.saveData.upgradesBought[this.id] = this.getCount() + 1;
            // Update the svelte store
            updateGameModel();
            // Save game to localStorage
            saveSaveGame(gameModelInstance.saveData);
            return true;
        }
        return false;
    }
}

export const upgrades = [
    new Upgrade(1, 'Additional Light', 'Increase the amount of lights you can place by 1', 50, 1.5)
];

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