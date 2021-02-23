import * as PIXI from 'pixi.js';
import type { GameModel } from "../gamemodel";
import { gameModel } from "../stores";
import { distanceBetweenPoints, normalizeVector } from "../utils";
import { characterContainer, maskContainer, unmaskedContainer } from "./containers";
import { generateLightTexture } from "./light";
import { gameFieldSize } from './mapfunctions';
import type { Monster } from "./monsters";
import { PlayerLightType } from "./playerlightenum";

/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance : GameModel;
gameModel.subscribe(m => gameModelInstance = m);

export abstract class PlayerLight extends PIXI.Sprite {
    abstract hitEffect(monster : Monster) : number;
    abstract update(timeDiff : number) : void;
}

export class SpotLight extends PlayerLight {
    brightness = 0;
    radius = 0;
    innerSprite : PIXI.Sprite;

    constructor(texture : PIXI.Texture) {
        super(texture);
        maskContainer.addChild(this);
        this.anchor.set(0.5, 0.5);
        this.innerSprite = new PIXI.Sprite(PIXI.Texture.from('sprites/light.png'));
        this.innerSprite.anchor.set(0.5, 0.2);
        characterContainer.addChild(this.innerSprite);
    }

    hitEffect(monster : Monster) : number {
        if (distanceBetweenPoints(this.x, this.y, monster.x, monster.y) < this.radius) {
            return this.brightness;
        }
        return 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    update(timeDiff : number) : void {
        if (gameModelInstance.playerLights.spotlight.brightness != this.brightness) {
            this.brightness = gameModelInstance.playerLights.spotlight.brightness;
        }
        if (gameModelInstance.playerLights.spotlight.radius != this.radius) {
            this.radius = gameModelInstance.playerLights.spotlight.radius;
            this.scale.set(this.radius / 95, this.radius / 95);
        }
        this.alpha = 0.6 + Math.random() * 0.05;
    }
}

const spotLights : SpotLight[] = [];
let spotLightIndex = 0;
let spotLightCursor : PIXI.Sprite;

export class BeamLight extends PlayerLight {
    brightness = 0;
    innerSprite : PIXI.Sprite;
    innerSprite2 : PIXI.Sprite;
    innerLight : PIXI.Sprite;
    innerLight2 : PIXI.Sprite;
    minX = 0;
    minY = 0;
    maxX = 0;
    maxY = 0;
    vector = {x:0, y: 0};
    constructor(texture : PIXI.Texture) {
        super(texture);
        maskContainer.addChild(this);
        this.anchor.set(0.5, 1);
        this.innerSprite = new PIXI.Sprite(PIXI.Texture.from('sprites/beam-light.png'));
        this.innerSprite.anchor.set(0.5, 0.2);
        characterContainer.addChild(this.innerSprite);
        this.innerSprite2 = new PIXI.Sprite(PIXI.Texture.from('sprites/beam-light.png'));
        this.innerSprite2.anchor.set(0.5, 0.2);
        characterContainer.addChild(this.innerSprite2);
        this.innerLight = new PIXI.Sprite(generateLightTexture());
        this.innerLight.anchor.set(0.5,0.5);
        this.innerLight.scale.set(30 / 100);
        maskContainer.addChild(this.innerLight);
        this.innerLight2 = new PIXI.Sprite(generateLightTexture());
        this.innerLight2.anchor.set(0.5,0.5);
        this.innerLight2.scale.set(30 / 100);
        maskContainer.addChild(this.innerLight2);
    }
    hitEffect(monster : Monster) : number {
        if (monster.x < this.maxX && monster.x > this.minX && monster.y < this.maxY && monster.y > this.minY) {
            for (let i = 0; i < 11; i++) {
                if (distanceBetweenPoints(monster.x, monster.y,
                    this.innerSprite.x + ((this.vector.x / 10) * i), this.innerSprite.y + ((this.vector.y / 10) * i)) < 18) {
                    return this.brightness;
                }
            }
        }
        return 0;
    }
    update(timeDiff : number) : void {
        if (gameModelInstance.playerLights.beamlight.brightness != this.brightness) {
            this.brightness = gameModelInstance.playerLights.beamlight.brightness;
        }
        this.alpha = 0.8 + Math.random() * 0.05;
        this.innerLight.alpha = 0.8 + Math.random() * 0.05;
        this.innerLight2.alpha = 0.8 + Math.random() * 0.05;
    }
}
const beamLights : BeamLight[] = [];
let beamLightHalfPlaced = false;
let beamLightIndex = 0;
let beamLightCursor : PIXI.Sprite;

const orbLightSpeed = 40;

export class OrbOfLight extends PlayerLight {
    brightness = 0;
    radius = 0;
    innerSprite : PIXI.Sprite;
    speed = {x : 0, y : 0};
    constructor(texture : PIXI.Texture) {
        super(texture);
        this.position.set(gameFieldSize.x / 2, gameFieldSize.y / 2);
        this.speed.x = Math.random() - 0.5;
        this.speed.y = Math.random() - 0.5;
        this.speed = normalizeVector(this.speed.x, this.speed.y);
        this.speed.x *= orbLightSpeed;
        this.speed.y *= orbLightSpeed;
        this.anchor.set(0.5, 0.5);
        this.innerSprite = new PIXI.Sprite(generateLightTexture());
        this.innerSprite.anchor.set(0.5, 0.5);
        this.innerSprite.scale.set(0.1, 0.1);
        maskContainer.addChild(this);
        characterContainer.addChild(this.innerSprite);
    }
    hitEffect(monster : Monster) : number {
        if (distanceBetweenPoints(this.x, this.y, monster.x, monster.y) < this.radius) {
            return this.brightness;
        }
        return 0;
    }
    update(timeDiff : number) : void {

        if (gameModelInstance.playerLights.orboflight.radius != this.radius) {
            this.radius = gameModelInstance.playerLights.orboflight.radius;
            this.scale.set(this.radius / 95, this.radius / 95);
        }
        if (gameModelInstance.playerLights.orboflight.brightness != this.brightness) {
            this.brightness = gameModelInstance.playerLights.orboflight.brightness;
        }

        this.x += this.speed.x * timeDiff;
        this.y += this.speed.y * timeDiff;
        if (this.speed.x > 0 && this.x > gameFieldSize.x * 0.9)
            this.speed.x *= -1;
        if (this.speed.y > 0 && this.y > gameFieldSize.y * 0.9)
            this.speed.y *= -1;
        if (this.speed.x < 0 && this.x < gameFieldSize.x * 0.1)
            this.speed.x *= -1;
        if (this.speed.y < 0 && this.y < gameFieldSize.x * 0.1)
            this.speed.y *= -1;

        this.alpha = 0.9 + Math.random() * 0.05;
    }
}

const orbLights : OrbOfLight[] = [];

export function getPlayerLights() : PlayerLight[] {
    return [...spotLights, ...beamLights, ...orbLights];
}

export function updatePlayerLights(timeDiff : number) : void {

    if (spotLights.length < gameModelInstance.playerLights.spotlight.count) {
        spotLights.push(new SpotLight(generateLightTexture()));
    }
    for (let i = 0; i < spotLights.length; i++) {
        spotLights[i].update(timeDiff);
    }

    if (beamLights.length < gameModelInstance.playerLights.beamlight.count) {
        beamLights.push(new BeamLight(PIXI.Texture.from('sprites/beam.png')));
    }
    for (let i = 0; i < beamLights.length; i++) {
        beamLights[i].update(timeDiff);
    }

    if (orbLights.length < gameModelInstance.playerLights.orboflight.count) {
        orbLights.push(new OrbOfLight(generateLightTexture()));
    }
    for (let i = 0; i < orbLights.length; i++) {
        orbLights[i].update(timeDiff);
    }
}


export function playerClick(x : number, y : number) : void {
    if (gameModelInstance.playerLights.currentLight == PlayerLightType.spotlight && spotLights.length > 0) {
        const spotLight = spotLights[spotLightIndex];
        spotLight.position.set(x, y);
        spotLight.innerSprite.position.set(x, y);
        spotLightIndex++;
        if (spotLightIndex >= spotLights.length) {
            spotLightIndex = 0;
        }
    }
    if (gameModelInstance.playerLights.currentLight == PlayerLightType.beamlight && beamLights.length > 0) {
        const beamLight = beamLights[beamLightIndex];
        if (beamLightHalfPlaced) {
            const distance = distanceBetweenPoints(beamLight.innerSprite.x, beamLight.innerSprite.y, x, y);
            const pos = {x:x,y:y};
            if (distance > gameModelInstance.playerLights.beamlight.range) {
                const vect = normalizeVector(x - beamLight.innerSprite.x, y - beamLight.innerSprite.y);
                pos.x = beamLight.innerSprite.x + vect.x * gameModelInstance.playerLights.beamlight.range;
                pos.y = beamLight.innerSprite.y + vect.y * gameModelInstance.playerLights.beamlight.range;
            }
            beamLight.innerSprite2.position.set(pos.x, pos.y);
            beamLight.innerLight2.position.set(pos.x, pos.y);
            beamLight.position.set(beamLight.innerSprite.x, beamLight.innerSprite.y);
            beamLight.scale.y = distanceBetweenPoints(beamLight.innerSprite.x, beamLight.innerSprite.y, beamLight.innerSprite2.x, beamLight.innerSprite2.y) / 32;
            beamLight.rotation = Math.atan2(beamLight.innerSprite2.y - beamLight.innerSprite.y, beamLight.innerSprite2.x - beamLight.innerSprite.x) + Math.PI / 2;
            beamLightIndex++;
            beamLight.minX = Math.min(beamLight.innerLight.x, beamLight.innerLight2.x) - 20;
            beamLight.minY = Math.min(beamLight.innerLight.y, beamLight.innerLight2.y) - 20;
            beamLight.maxX = Math.max(beamLight.innerLight.x, beamLight.innerLight2.x) + 20;
            beamLight.maxY = Math.max(beamLight.innerLight.y, beamLight.innerLight2.y) + 20;
            beamLight.vector = {
                x: beamLight.innerSprite2.x - beamLight.innerSprite.x,
                y: beamLight.innerSprite2.y - beamLight.innerSprite.y
            }
            if (beamLightIndex >= beamLights.length) {
                beamLightIndex = 0;
            }
            beamLight.visible = true;
            beamLightHalfPlaced = false;
        } else {
            beamLight.innerSprite.position.set(x, y);
            beamLight.innerLight.position.set(x, y);
            beamLight.visible = false;
            beamLightHalfPlaced = true;
        }
    }
}

export function playerMouseMove(x : number, y : number) : void {
    if (spotLightCursor) spotLightCursor.visible = false;
    if (gameModelInstance.playerLights.currentLight == PlayerLightType.spotlight && spotLights.length > 0) {
        if (!spotLightCursor) {
            spotLightCursor = new PIXI.Sprite(PIXI.Texture.from('sprites/light.png'));
            spotLightCursor.anchor.set(0.5, 0.2);
            unmaskedContainer.addChild(spotLightCursor);
        }
        spotLightCursor.visible = true;
        spotLightCursor.position.set(x,y);
    }
    if (beamLightCursor) beamLightCursor.visible = false;
    if (gameModelInstance.playerLights.currentLight == PlayerLightType.beamlight && beamLights.length > 0) {
        if (!beamLightCursor) {
            beamLightCursor = new PIXI.Sprite(PIXI.Texture.from('sprites/beam-light.png'));
            beamLightCursor.anchor.set(0.5, 0.2);
            unmaskedContainer.addChild(beamLightCursor);
        }
        beamLightCursor.visible = true;
        if (beamLightHalfPlaced) {
            const beamLight = beamLights[beamLightIndex];
            const distance = distanceBetweenPoints(beamLight.innerSprite.x, beamLight.innerSprite.y, x, y);
            if (distance > gameModelInstance.playerLights.beamlight.range) {
                const vect = normalizeVector(x - beamLight.innerSprite.x, y - beamLight.innerSprite.y);
                beamLightCursor.position.set(beamLight.innerSprite.x + vect.x * gameModelInstance.playerLights.beamlight.range,
                    beamLight.innerSprite.y + vect.y * gameModelInstance.playerLights.beamlight.range);
            } else {
                beamLightCursor.position.set(x,y);
            }
        } else {
            beamLightCursor.position.set(x,y);
        }
        
    }
}