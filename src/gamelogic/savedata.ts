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