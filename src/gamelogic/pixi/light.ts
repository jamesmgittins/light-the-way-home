import * as PIXI from 'pixi.js';
import { maskContainer } from './containers';

const textures : PIXI.Texture[] = [];
const lights : Light[] = [];
const discardedLights : Light[] = [];

function generateTexture(radius : number) : PIXI.Texture {

    if (textures[radius])
        return textures[radius];

    const blast = document.createElement('canvas');
    blast.width = radius * 2;
    blast.height = radius * 2;
    const blastCtx = blast.getContext('2d');

    const radgrad = blastCtx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    radgrad.addColorStop(0, 'rgba(255,255,255,1)');
    radgrad.addColorStop(1, 'rgba(255,255,255,0)');

    blastCtx.fillStyle = radgrad;
    blastCtx.fillRect(0, 0, radius * 2, radius * 2);

    return PIXI.Texture.from(blast);
}

export class Light extends PIXI.Sprite {
    radius = 0;
    brightness = 0;
    wobble = 0;
    discarded = false;

    constructor(radius : number, brightness : number) {
        super(generateTexture(radius));
        this.radius = radius;
        this.brightness = brightness;
        this.wobble = Math.random() * 6;
    }

    discard() : void {
        this.discarded = true;
        this.visible = false;
        if (!discardedLights.includes(this)) {
            discardedLights.push(this);
        }
    }

    update(timeDiff : number) : void {
        if (this.visible) {
            // this.wobble += timeDiff * 22;
            // if (this.wobble > Math.PI * 2) this.wobble = 0;
            // this.alpha = this.brightness + (Math.sin(this.wobble) * 0.04);
            this.alpha = this.brightness + (Math.random() - 0.5) * 0.08;
        }
    }
}

export function getLight(radius : number, brightness : number) : Light {
    if (discardedLights.length > 0) {
        const light = discardedLights.pop();
        light.discarded = false;
        light.visible = true;
        light.texture = generateTexture(radius);
        light.radius = radius;
        light.brightness = brightness;
        light.anchor.set(0.5, 0.5);
        return light;
    } else {
        const light = new Light(radius, brightness);
        lights.push(light);
        light.anchor.set(0.5, 0.5);
        maskContainer.addChild(light);
        return light;
    }
}

export function updateLights(timeDiff : number) : void {
    for (let i = 0; i < lights.length; i++) {
        lights[i].update(timeDiff);
    }
}