import * as PIXI from 'pixi.js';
import { gameModel, GameModel, updateGameModel } from '../gamemodel';
import { distanceBetweenPoints, normalizeVector } from '../utils';
import { getGoal, getStartBuilding } from './buildings';
import { Character } from './character';
import { characterContainer } from './containers';
import { getLight, Light } from './light';


/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance : GameModel;
gameModel.subscribe(m => gameModelInstance = m);

const textures : {animated:PIXI.Texture[], dead:PIXI.Texture[]}[] = [];
const humanArray : Human[] = [];
const discardedHumans : Human[] = [];

export function setHumanTextures() : void {
    for (let i = 3; i < 6; i++) {
        const animated = [];
        for (let j = 0; j < 3; j++) {
            animated.push(PIXI.Texture.from('human' + (i + 1) + '_' + (j + 1) + '.png'));
        }
        textures.push({
            animated: animated,
            dead: [PIXI.Texture.from('human' + (i + 1) + '_dead.png')]
        })
    }
}

const drunkTimer = 5;

export class Human extends Character {
    captured = false;
    escaped = false;
    light : Light;
    drunkTimer = Math.random() * drunkTimer;
    walkingTextures : PIXI.Texture[];
    deadTextures : PIXI.Texture[];
    goal : PIXI.Sprite;
    constructor(textureId : number) {
        super(textures[textureId].animated);
        this.walkingTextures = textures[textureId].animated;
        this.deadTextures = textures[textureId].dead;
        this.animationSpeed = 0.15;
        this.anchor.set(35 / 80, 1);
    }
    updateHumanSpeed(timeDiff : number) : void {
        const targetVector = normalizeVector(this.goal.x - this.x, this.goal.y - this.y);
        const factor = gameModelInstance.humanSpeed * 5 * timeDiff;

        this.speed.x += targetVector.x * factor;
        this.speed.y += targetVector.y * factor;

        const speedMagSq = this.speedMagSq();
        const maxSpeedSq = gameModelInstance.humanSpeed * gameModelInstance.humanSpeed;

        if (speedMagSq > maxSpeedSq) {
            this.speed.x *= maxSpeedSq / speedMagSq;
            this.speed.y *= maxSpeedSq / speedMagSq;
        }

        this.x += this.speed.x * timeDiff;
        this.y += this.speed.y * timeDiff;
        this.zIndex = this.y;
    }
    updateHuman(timeDiff : number) : void {
        if (this.visible && !this.captured) {
            this.updateHumanSpeed(timeDiff);

            this.drunkTimer -= timeDiff;
            if (this.drunkTimer < 0) {
                this.drunkTimer = Math.random() * drunkTimer;
                this.speed = {
                    x:(Math.random() - 0.5) * gameModelInstance.humanSpeed * 2,
                    y:(Math.random() - 0.5) * gameModelInstance.humanSpeed * 2
                }
            }

            if (Math.abs(this.speed.x) > 1)
                this.scale.x = this.speed.x > 0 ? 1 : -1;
    
            this.light.position.set(this.x, this.y - 5);
    
            if (distanceBetweenPoints(this.goal.x, this.goal.y, this.x, this.y) < 20) {
                this.discard();
                this.light.discard();
                gameModelInstance.addMoney(gameModelInstance.humanValue);
                gameModelInstance.humansEscaped++;
                updateGameModel();
            }
        }
    }
    speedMagSq() : number {
        return this.speed.x * this.speed.x + this.speed.y * this.speed.y;
    }
    capture() : void {
        this.captured = true;
        this.textures = this.deadTextures;
    }
    drop() : void {
        this.captured = false;
        this.textures = this.walkingTextures;
    }
    discard() : void {
        this.visible = false;
        this.light.discard();
        if (!discardedHumans.includes(this)) {
            discardedHumans.push(this);
        }
    }
}

function getHuman(goalBuildings : PIXI.Sprite[]) : Human {
    if (discardedHumans.length > 0) {
        const human = discardedHumans.shift();
        human.captured = false;
        human.escaped = false;
        human.visible = true;
        human.textures = human.walkingTextures;
        human.light = getLight(gameModelInstance.humanLight.radius, gameModelInstance.humanLight.brightness);
        human.play();
        human.goal = goalBuildings[Math.floor(Math.random() * goalBuildings.length)];
        return human;
    }
    const human = new Human(Math.floor(Math.random() * 3));
    human.light = getLight(gameModelInstance.humanLight.radius, gameModelInstance.humanLight.brightness);
    human.goal = goalBuildings[Math.floor(Math.random() * goalBuildings.length)];
    humanArray.push(human);
    characterContainer.addChild(human);
    human.play();
    return human;
}

const humanSpawnRate = 2;
let humanTimer = 0;

export function updateHumans(timeDiff : number) : void {
    const startBuilding = getStartBuilding();
    const goalBuildings = getGoal();

    for (let i = 0; i < humanArray.length; i++) {
        humanArray[i].updateHuman(timeDiff);
    }

    humanTimer += timeDiff;
    if (humanTimer > humanSpawnRate && gameModelInstance.humansSpawned < gameModelInstance.humansToSpawn) {
        humanTimer = 0;
        gameModelInstance.humansSpawned++;
        updateGameModel();
        const human = getHuman(goalBuildings);
        human.position.set(startBuilding.x + 12, startBuilding.y);
    }
}

export function setupHumansLevel() : void {
    humanArray.forEach(h => h.discard());
}


export function getAliveHumans() : Human[] {
    return humanArray.filter(h => !h.captured && !h.escaped && h.visible);
}