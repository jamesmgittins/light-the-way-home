import * as PIXI from 'pixi.js';
import { GameModel, GameState } from '../gamemodel';
import { gameModel } from '../stores';
import { distanceBetweenPoints } from "../utils";
import { KeysPressed } from './keyboard';
import { playerClick, playerMouseMove } from './playerlights';

/**
 * Reference to the GameModel.
 * We use the subscribe function so if the store is updated our local instance will also update.
 */
let gameModelInstance: GameModel;
gameModel.subscribe(m => gameModelInstance = m);

export const gameContainer = new PIXI.Container();
export const canvasSize = { x: 1024, y: 512, defaultScale: 1 };
export const gameFieldSize = { x: 1024, y: 512 };

let lastDiff = 0;
let lastPinchZoom = 0;

function preventGameContainerLeavingBounds(gc: PIXI.Container) {
    const gcWidth = gameFieldSize.x * gc.scale.x;
    const gcHeight = gameFieldSize.y * gc.scale.y;
    if (gc.x > canvasSize.x * 0.5)
        gc.x = canvasSize.x * 0.5;
    if (gc.x + gcWidth < canvasSize.x * 0.5)
        gc.x = canvasSize.x * 0.5 - gcWidth;
    if (gc.y > canvasSize.y * 0.5)
        gc.y = canvasSize.y * 0.5;
    if (gc.y + gcHeight < canvasSize.y * 0.5)
        gc.y = canvasSize.y * 0.5 - gcHeight;
}


export function onDragStart(event): void {
    this.data = event.data;
    this.dragging = true;
    this.dragOffset = this.data.getLocalPosition(this);
    this.dragOffset.x *= this.scale.x;
    this.dragOffset.y *= this.scale.y;
    this.dragStartX = this.x;
    this.dragStartY = this.y;
    lastDiff = 0;
}

export function onDragEnd(): void {
    this.dragging = false;
    this.data = null;
    lastDiff = 0;
}

export function onDragMove(event): void {
    if (event.data.originalEvent.touches && event.data.originalEvent.touches.length > 1) {
        pinchZoom(event);
    } else if (this.dragging) {
        const newPosition = this.data.getLocalPosition(this.parent);
        this.x = newPosition.x - this.dragOffset.x;
        this.y = newPosition.y - this.dragOffset.y;
        preventGameContainerLeavingBounds(this);
        if (distanceBetweenPoints(this.dragStartX, this.dragStartY, this.x, this.y) > 10) {
            this.hasMoved = true;
        }
    } else {
        playerMouseMove(event.data.getLocalPosition(this).x, event.data.getLocalPosition(this).y);
    }
}


export function pinchZoom(event): void {
    const curDiff = Math.abs(event.data.originalEvent.touches[0].clientX - event.data.originalEvent.touches[1].clientX);
    if (lastDiff) {
        if (lastPinchZoom + 50 < Date.now() && Math.abs(curDiff - lastDiff) > 10) {
            if (curDiff > lastDiff) {
                zoom(1, null);
            } else {
                zoom(-1, null);
            }
            lastPinchZoom = Date.now();
            lastDiff = curDiff;
        }
    } else {
        lastDiff = curDiff;
    }
}


function zoom(change: number, coords: { x: number, y: number }): void {

    if (lastPinchZoom + 50 > Date.now()) {
        return;
    }
    lastPinchZoom = Date.now();
    const gc = gameContainer;

    if (!coords) {
        coords = { x: canvasSize.x * 0.5, y: canvasSize.y * 0.5 };
    }

    const gcWidth = gameFieldSize.x * gc.scale.x;
    const gcHeight = gameFieldSize.y * gc.scale.y;

    if (coords.x > gc.x + gcWidth)
        coords.x = gc.x + gcWidth;
    if (coords.x < gc.x)
        coords.x = gc.x;
    if (coords.y < gc.y)
        coords.y = gc.y;
    if (coords.y > gc.y + gcHeight)
        coords.y = gc.y + gcHeight;

    const centerPosition = {
        x: (coords.x - (gc.x)) / gc.scale.x,
        y: (coords.y - (gc.y)) / gc.scale.y
    };

    if (change > 0) {
        if (gc.scale.x < 3) {
            gc.scale.x = gc.scale.y = gc.scale.x * 1.1;
        }
    } else {
        if (Math.max(gcWidth, gcHeight) > Math.min(canvasSize.y, canvasSize.x) * 2) {
            gc.scale.x = gc.scale.y = gc.scale.x * 0.9;
        }
    }

    gc.x = coords.x - centerPosition.x * gc.scale.x;
    gc.y = coords.y - centerPosition.y * gc.scale.y;
    preventGameContainerLeavingBounds(gc);
}

export function onWheel(event: WheelEvent): void {
    event.preventDefault();
    const coords = {
        x: event.clientX * (canvasSize.x / document.body.clientWidth),
        y: event.clientY * (canvasSize.y / document.body.clientHeight)
    };

    if (event.deltaY < 0 || event.deltaX < 0)
        zoom(+1, coords);
    else
        zoom(-1, coords);
}

export function centerGameContainer(resetZoom = false): void {
    if (resetZoom) {
        gameContainer.scale.x = canvasSize.defaultScale;
        gameContainer.scale.y = canvasSize.defaultScale;
    }

    gameContainer.x = (canvasSize.x - gameFieldSize.x * gameContainer.scale.x) / 2;
    gameContainer.y = (canvasSize.y - gameFieldSize.y * gameContainer.scale.y) / 2;
}

function onClickTap(event) {
    if (!this.hasMoved && gameModelInstance.state == GameState.playing) {
        playerClick(event.data.getLocalPosition(this).x, event.data.getLocalPosition(this).y);
    }
    this.hasMoved = false;
}
gameContainer.interactive = true;
gameContainer.interactiveChildren = true;

gameContainer.on('pointerdown', onDragStart);
gameContainer.on('pointerup', onDragEnd);
gameContainer.on('pointerupoutside', onDragEnd);
gameContainer.on('pointermove', onDragMove);
gameContainer.on('click', onClickTap);
gameContainer.on('tap', onClickTap);


export function scrollGameContainer(timeDiff: number): void {
    let moved = false;
    if (KeysPressed.w) {
        gameContainer.y += KeysPressed.scrollSpeed * timeDiff;
        moved = true;
    }
    if (KeysPressed.a) {
        gameContainer.x += KeysPressed.scrollSpeed * timeDiff;
        moved = true;
    }
    if (KeysPressed.s) {
        gameContainer.y -= KeysPressed.scrollSpeed * timeDiff;
        moved = true;
    }
    if (KeysPressed.d) {
        gameContainer.x -= KeysPressed.scrollSpeed * timeDiff;
        moved = true;
    }
    if (moved)
        preventGameContainerLeavingBounds(gameContainer);
}