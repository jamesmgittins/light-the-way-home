import * as PIXI from 'pixi.js';
import { backgroundContainer } from './containers';
import { getLight, Light } from './light';
import { gameFieldSize } from './mapfunctions';

let goalBuilding : PIXI.Sprite;
let startBuilding : PIXI.Sprite;

const lights : Light[] = [];

const buildingLightRadius = 96;

export function setupBuildings() : void {
    if (!goalBuilding) {
        goalBuilding = new PIXI.Sprite(PIXI.Texture.from('sprites/building.png'));
        backgroundContainer.addChild(goalBuilding);
        goalBuilding.scale.set(0.1, 0.1);
        goalBuilding.anchor.set(0.5, 0.9);
        goalBuilding.position.set(gameFieldSize.x - 100, gameFieldSize.y / 2);
        const goalLight = getLight(buildingLightRadius, 0.6)
        goalLight.position.set(goalBuilding.position.x, goalBuilding.position.y - 30);
        lights.push(goalLight);
    }
    if (!startBuilding) {
        startBuilding = new PIXI.Sprite(PIXI.Texture.from('sprites/building.png'));
        backgroundContainer.addChild(startBuilding);
        startBuilding.scale.set(0.1, 0.1);
        startBuilding.anchor.set(0.5, 0.9);
        startBuilding.position.set(100, gameFieldSize.y / 2);
        const startLight = getLight(buildingLightRadius, 0.6)
        startLight.position.set(startBuilding.position.x, startBuilding.position.y - 30);
        lights.push(startLight);
    }
}

export function updateBuildingLights(timeDiff : number) : void {
    for (let i = 0; i < lights.length; i++) {
        lights[i].update(timeDiff);
    }
}


export function getGoal() : PIXI.Sprite {
    return goalBuilding;
}

export function getStartBuilding() : PIXI.Sprite {
    return startBuilding;
}