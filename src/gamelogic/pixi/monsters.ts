import * as PIXI from 'pixi.js';
import type { GameModel } from "../gamemodel";
import { gameModel, MonsterHealthBar, monsterHealthBars, updateGameModel, updateMonsterHealthBars } from '../stores';
import { distanceBetweenPoints, normalizeVector } from "../utils";
import { Character } from "./character";
import { characterContainer } from './containers';
import { getAliveHumans, Human } from "./humans";
import { gameFieldSize } from "./mapfunctions";
import { getPlayerLights, PlayerLight } from './playerlights';

/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance: GameModel;
gameModel.subscribe(m => gameModelInstance = m);

let monsterHealthBarArray : MonsterHealthBar[];
monsterHealthBars.subscribe(m => monsterHealthBarArray = m);

enum Directions {
    up, down, left, right
}

const textures = {
    set: false,
    down: [] as PIXI.Texture[],
    up: [] as PIXI.Texture[],
    left: [] as PIXI.Texture[],
    right: [] as PIXI.Texture[],
    dead: [] as PIXI.Texture[]
};
const monsterArray: Monster[] = [];

const maxMonsters = 5;
const monsterSpeed = 43;
const monsterScaling = 1;

export function setMonsterTextures(): void {
    if (!textures.set) {
        textures.down = [];
        textures.up = [];
        textures.right = [];
        textures.dead = [];
        for (let i = 0; i < 3; i++) {
            textures.down.push(PIXI.Texture.from('golem' + i + '.png'));
        }
        for (let i = 3; i < 6; i++) {
            textures.up.push(PIXI.Texture.from('golem' + i + '.png'));
        }
        for (let i = 6; i < 9; i++) {
            textures.right.push(PIXI.Texture.from('golem' + i + '.png'));
        }
        textures.dead.push(PIXI.Texture.from('golem9.png'));
        textures.set = true;
    }
}

export class Monster extends Character {
    target: Human;
    escapeVector : {x:number, y:number};
    health : number;
    startDelay = Math.random() * 10;
    holdingTarget = false;
    currentDirection = Directions.down;

    findClosestHuman(aliveHumans : Human[]) : Human {
        let closestHuman : Human;
        let closestDistance = 10000;
        for (let i = 0; i < aliveHumans.length; i++) {
            const distance = distanceBetweenPoints(this.x, this.y, aliveHumans[i].x, aliveHumans[i].y);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestHuman = aliveHumans[i];
            }
        }
        return closestHuman;
    }

    updateMonster(timeDiff: number, aliveHumans : Human[], maxHealth : number): void {
        if (this.startDelay > 0) {
            this.startDelay -= timeDiff;
            return;
        }
        if (!this.holdingTarget && this.health > maxHealth / 2 && (!this.target || this.target.captured || this.target.escaped)) {
            this.target = this.findClosestHuman(aliveHumans);
            if (this.target && (this.target.captured || this.target.escaped)) this.target = undefined;
            if (!this.target) return;
        }
        this.updateMonsterSpeed(timeDiff, maxHealth);
        if (this.holdingTarget) {
            this.target.position.set(this.position.x, this.position.y - 5);
            this.target.light.position.set(this.position.x, this.position.y - 5);
            if (this.currentDirection == Directions.up) {
                this.target.zIndex = this.zIndex - 1;
            } else {
                this.target.zIndex = this.zIndex + 1;
            }
            if (distanceBetweenPoints(this.x, this.y, this.escapeVector.x, this.escapeVector.y) < 20) {
                if (!this.target.escaped) {
                    gameModelInstance.humansEaten++;
                    updateGameModel();
                }
                this.target.discard();
                this.target = undefined;
                this.holdingTarget = false;
            }
        } else {
            if (this.target && distanceBetweenPoints(this.x, this.y, this.target.x, this.target.y) < 10) {
                if (this.target.escaped || this.target.captured) {
                    this.target = undefined;
                    return;
                }
                this.target.capture();
                this.target.light.brightness = gameModelInstance.humanLight.brightness / 2;
                this.holdingTarget = true;
                this.escapeVector = getRandomPosition();
            }
            if (this.health < maxHealth * 0.5 && distanceBetweenPoints(this.x, this.y, this.escapeVector.x, this.escapeVector.y) < 20) {
                this.health = maxHealth;
                this.position.copyFrom(getRandomPosition());
            }
        }
    }

    updateMonsterHealth(timeDiff : number, playerLights : PlayerLight[], maxHealth : number) : void {
        let hasBeenhit = false;
        for (let i = 0; i < playerLights.length; i++) {
            const lightValue = playerLights[i].hitEffect(this);
            if (lightValue > 0) hasBeenhit = true;
            this.health -= lightValue * timeDiff;
            if (this.health < maxHealth / 2) {
                if (this.holdingTarget) {
                    this.dropTarget();
                }
                this.target = undefined;
            }
            if (this.health <= 0) {
                this.health = 0;
            }
        }
        if (!hasBeenhit) {
            this.health += maxHealth / 5 * timeDiff;
            if (this.health > maxHealth) {
                this.health = maxHealth;
            }
        }
    }

    updateMonsterSpeed(timeDiff: number, maxHealth : number): void {

        let vector : {x:number, y:number};

        if (this.holdingTarget || this.health < maxHealth / 2) {
            if (!this.escapeVector) this.escapeVector = getRandomPosition();
            vector = normalizeVector(this.escapeVector.x - this.x, this.escapeVector.y - this.y);
        } else {
            vector = normalizeVector(this.target.x - this.x, this.target.y - this.y);
        }

        this.speed.x = vector.x * (monsterSpeed + gameModelInstance.saveData.level);
        this.speed.y = vector.y * (monsterSpeed + gameModelInstance.saveData.level);

        this.position.x += this.speed.x * timeDiff;
        this.position.y += this.speed.y * timeDiff;
        this.zIndex = this.y;
        this.changeDirection();
    }

    dropTarget() : void {
        if (this.holdingTarget) {
            this.holdingTarget = false;
            this.target.drop();
            this.target = undefined;
        }
    }

    getDirection() : Directions {
        if(Math.abs(this.speed.x) > Math.abs(this.speed.y)) {
            //left right
            if (this.speed.x < 0) {
              return Directions.left;
            }
            return Directions.right;
          } else {
            // up down
            if (this.speed.y < 0) {
              return Directions.up;
            }
            return Directions.down;
          }
    }

    changeDirection(): void {
        const direction = this.getDirection();
        if (direction !== this.currentDirection) {
            switch (direction) {
                case Directions.up:
                    this.textures = textures.up;
                    this.scale.x = monsterScaling;
                    break;
                case Directions.down:
                    this.textures = textures.down;
                    this.scale.x = monsterScaling;
                    break;
                case Directions.right:
                    this.textures = textures.right;
                    this.scale.x = monsterScaling;
                    break;
                case Directions.left:
                    this.textures = textures.right;
                    this.scale.x = -monsterScaling;
                    break;
            }
            this.currentDirection = direction;
            this.play();
        }
    }
}

function getRandomPosition() : {x:number, y:number} {
    return {
        x : gameFieldSize.x * 0.1 + Math.random() * gameFieldSize.x * 0.8,
        y : Math.random() > 0.5 ? 0 : gameFieldSize.y
    }
}

function createMonster(maxHealth : number) : void {
    const monster = new Monster(textures.down);
    monster.position.copyFrom(getRandomPosition());
    monster.animationSpeed = 0.15;
    monster.anchor.set(8.5/16,1);
    monster.tint = 0x000000;
    monster.play();
    monster.health = maxHealth;
    monsterArray.push(monster);
    characterContainer.addChild(monster);
}

export function setupMonstersLevel() : void {
    monsterArray.forEach(m => {
        m.holdingTarget = false;
        m.position.copyFrom(getRandomPosition());
        m.startDelay = Math.random() * 10;
    });
}

export function updateMonsters(timeDiff : number) : void {
    const aliveHumans = getAliveHumans();
    const playerLights = getPlayerLights();
    const monsterMaxHealth = (150 * gameModelInstance.saveData.level) - 75;
    const numMonsters = maxMonsters;

    if (monsterArray.length < numMonsters) {
        for (let i = 0; i < numMonsters - monsterArray.length; i++) {
            createMonster(monsterMaxHealth);
        }
    }
    if (monsterHealthBarArray.length < numMonsters) {
        for (let i = 0; i < numMonsters - monsterHealthBarArray.length; i++) {
            monsterHealthBarArray.push({x:0,y:0,percent:100});
        }
    }

    for (let i = 0; i < monsterArray.length; i++) {
        if (i >= numMonsters) {
            monsterArray[i].visible = false;
            if (monsterHealthBarArray[i]) {
                monsterHealthBarArray[i].percent = 100;
            }
        } else {
            monsterArray[i].visible = true;
            monsterArray[i].updateMonster(timeDiff, aliveHumans, monsterMaxHealth);
            monsterArray[i].updateMonsterHealth(timeDiff, playerLights, monsterMaxHealth);
            if (monsterHealthBarArray[i]) {
                monsterHealthBarArray[i].percent = Math.round((monsterArray[i].health / monsterMaxHealth) * 100);
                const globalPos = monsterArray[i].toGlobal({x:0,y:0});
                monsterHealthBarArray[i].x = globalPos.x;
                monsterHealthBarArray[i].y = globalPos.y;
            }
        }
    }
    updateMonsterHealthBars();
}