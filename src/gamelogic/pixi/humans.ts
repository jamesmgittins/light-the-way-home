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

export class Human extends Character {
    captured = false;
    escaped = false;
    light : Light;
    walkingTextures : PIXI.Texture[];
    deadTextures : PIXI.Texture[];
    constructor(textureId : number) {
        super(textures[textureId].animated);
        this.walkingTextures = textures[textureId].animated;
        this.deadTextures = textures[textureId].dead;
        this.animationSpeed = 0.15;
        this.anchor.set(35 / 80, 1);
    }
    updateHumanSpeed(timeDiff : number, goal : PIXI.Sprite) : void {
        const targetVector = normalizeVector(goal.x - this.x, goal.y - this.y);
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
    updateHuman(timeDiff : number, goal : PIXI.Sprite) : void {
        if (this.visible && !this.captured) {
            this.updateHumanSpeed(timeDiff, goal);

            if (Math.abs(this.speed.x) > 1)
                this.scale.x = this.speed.x > 0 ? 1 : -1;
    
            this.light.position.set(this.x, this.y - 5);
    
            if (distanceBetweenPoints(goal.x, goal.y, this.x, this.y) < 20) {
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

function getHuman() : Human {
    if (discardedHumans.length > 0) {
        const human = discardedHumans.shift();
        human.captured = false;
        human.escaped = false;
        human.visible = true;
        human.textures = human.walkingTextures;
        human.light = getLight(gameModelInstance.humanLight.radius, gameModelInstance.humanLight.brightness);
        human.play();
        return human;
    }
    const human = new Human(Math.floor(Math.random() * 3));
    human.light = getLight(gameModelInstance.humanLight.radius, gameModelInstance.humanLight.brightness);
    humanArray.push(human);
    characterContainer.addChild(human);
    human.play();
    return human;
}

const humanSpawnRate = 2;
let humanTimer = 0;

export function updateHumans(timeDiff : number) : void {
    const startBuilding = getStartBuilding();
    const goalBuilding = getGoal();

    for (let i = 0; i < humanArray.length; i++) {
        humanArray[i].updateHuman(timeDiff, goalBuilding);
    }

    humanTimer += timeDiff;
    if (humanTimer > humanSpawnRate && gameModelInstance.humansSpawned < gameModelInstance.humansToSpawn) {
        humanTimer = 0;
        gameModelInstance.humansSpawned++;
        updateGameModel();
        const human = getHuman();
        human.position.set(startBuilding.x, startBuilding.y);
    }
}

export function setupHumansLevel() : void {
    humanArray.forEach(h => h.discard());
}


export function getAliveHumans() : Human[] {
    return humanArray.filter(h => !h.captured && !h.escaped);
}