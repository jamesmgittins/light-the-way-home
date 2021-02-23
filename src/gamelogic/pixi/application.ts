import * as PIXI from 'pixi.js';
import { GameModel, GameState } from '../gamemodel';
import { loadSaveGame, saveSaveGame } from '../saveloadfunctions';
import { gameModel, updateGameModel } from '../stores';
import { applyUpgrades } from '../upgrades';
import { setupBuildings, updateBuildingLights } from './buildings';
import { backgroundContainer, maskContainer, maskRenderTexture } from './containers';
import { setupEyes, updateEyes } from './eyes';
import { setHumanTextures, setupHumansLevel, updateHumans } from './humans';
import { KeysPressed } from './keyboard';
import { updateLights } from './light';
import { onWheel, canvasSize, gameFieldSize, centerGameContainer, scrollGameContainer, gameContainer } from './mapfunctions';
import { setMonsterTextures, setupMonstersLevel, updateMonsters } from './monsters';
import { getPlayerLights, updatePlayerLights } from './playerlights';

/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance: GameModel;
gameModel.subscribe(m => gameModelInstance = m);

function setSizes(reset = false): void {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (canvas) {
        canvasSize.x = canvas.width;
        canvasSize.y = canvas.height;
        canvasSize.defaultScale = Math.max(canvasSize.x, canvasSize.y) / 1000;
        centerGameContainer(reset);
        KeysPressed.scrollSpeed = Math.max(canvasSize.x, canvasSize.y) / 4;
    }
}

window.onresize = function () {
    setSizes();
}

function renderMask() : void {
    maskContainer.visible = true;
    app.renderer.render(maskContainer, maskRenderTexture);
    maskContainer.visible = false;
}

let endLevelTimer = 2;

function update(timeDiff: number) {
    scrollGameContainer(timeDiff);

    renderMask();
    updateEyes(timeDiff);    

    if (gameModelInstance.state === GameState.playing) {
        updateBuildingLights(timeDiff);
        updateHumans(timeDiff);
        updateMonsters(timeDiff);
        updateLights(timeDiff);
        updatePlayerLights(timeDiff);

        if (gameModelInstance.humansEaten + gameModelInstance.humansEscaped >= gameModelInstance.humansToSpawn) {
            endLevelTimer -= timeDiff;
            if (endLevelTimer < 0) {
                gameModelInstance.state = GameState.endoflevel;
                saveSaveGame(gameModelInstance.saveData);
                updateGameModel();
            }
        }
    }
}

export function setupLevel() : void {
    endLevelTimer = 2;
    gameModelInstance.setupLevel();
    applyUpgrades();
    setupHumansLevel();
    setupMonstersLevel();
    setupBuildings();
}


export let app: PIXI.Application;

export function startApplication(): void {
    
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.utils.skipHello();

    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    app = new PIXI.Application({ view: canvas, resizeTo: canvas, antialias: false });

    app.loader
        .add('sprites/eyes.jpg')
        .add('sprites/light.png')
        .add('sprites/beam-light.png')
        .add('sprites/beam.png')
        .add('sprites/building.png')
        .add('sprites/humans.json')
        .add('sprites/golem.json')
        .load(() => {

            setHumanTextures();
            setMonsterTextures();
            setupEyes();

            gameModelInstance.saveData = loadSaveGame();
            updateGameModel();

            app.stage.addChild(gameContainer);

            const grass = new PIXI.TilingSprite(PIXI.Texture.from('sprites/grass.png'));
            grass.width = gameFieldSize.x;
            grass.height = gameFieldSize.y;
            backgroundContainer.addChild(grass);

            canvas.onwheel = onWheel;
            canvas.oncontextmenu = function (event) { event.preventDefault(); };
            setSizes(true);

            // Listen for animate update
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            app.ticker.add((_delta: number) => {
                update(app.ticker.deltaMS / 1000);
            });
        });
}