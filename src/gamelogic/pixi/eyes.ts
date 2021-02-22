import * as PIXI from 'pixi.js';
import { GameModel, GameState } from '../gamemodel';
import { gameModel } from '../stores';
import { unmaskedContainer } from "./containers";
import { gameFieldSize } from './mapfunctions';

/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance: GameModel;
gameModel.subscribe(m => gameModelInstance = m);


let sprite : PIXI.Sprite;
let increasing = false;

function getRandomPosition() : {x:number, y:number} {
    return {
        x : gameFieldSize.x * 0.2 + Math.random() * gameFieldSize.x * 0.6,
        y : (gameFieldSize.y * 0.3) + (Math.random() * gameFieldSize.y * 0.4)
    }
}

export function setupEyes() : void {
    if (!sprite) {
        sprite = new PIXI.Sprite(PIXI.Texture.from('sprites/eyes.jpg'));
        sprite.anchor.set(0.5, 0.5);
        sprite.alpha = 0;
        sprite.scale.set(0.15, 0.15);
        sprite.position.copyFrom(getRandomPosition());
        unmaskedContainer.addChild(sprite);
    }
}

export function updateEyes(timeDiff : number) : void {

    if (gameModelInstance.state == GameState.playing || gameModelInstance.state == GameState.endoflevel) {
        sprite.visible = false;
        return;
    }
    sprite.visible = true;

    if (increasing) {
        sprite.alpha += timeDiff / 2;
        if (sprite.alpha > 0.9) {
            increasing = false;
        }
    } else {
        sprite.alpha -= timeDiff / 2;
        if (sprite.alpha < -0.1) {
            increasing = true;
            sprite.position.copyFrom(getRandomPosition());
        }
    }

}