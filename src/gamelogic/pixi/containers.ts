import * as PIXI from 'pixi.js';
import { gameFieldSize, gameContainer } from './mapfunctions';


export const innerContainer = new PIXI.Container();
export const backgroundContainer = new PIXI.Container();
export const characterContainer = new PIXI.Container();
export const maskContainer = new PIXI.Container();
export const unmaskedContainer = new PIXI.Container();

export const maskRenderTexture = PIXI.RenderTexture.create({width:gameFieldSize.x, height:gameFieldSize.y});
export const maskSprite = new PIXI.Sprite(maskRenderTexture);

innerContainer.addChild(backgroundContainer);
innerContainer.addChild(characterContainer);

gameContainer.addChild(innerContainer);
gameContainer.addChild(maskContainer);
gameContainer.addChild(maskSprite);
gameContainer.addChild(unmaskedContainer);

innerContainer.mask = maskSprite;