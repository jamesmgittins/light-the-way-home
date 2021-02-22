<script lang="ts">
import { gameModel } from "../gamelogic/gamemodel";



</script>

<div class="upgrades">
    <div>
        <strong>Spotlight</strong>
        <div class="upgrades">
            <p>Lights</p>
            <p>{$gameModel.playerLights.spotlight.count}</p>
            <button>Upgrade</button>
            <p>Radius</p>
            <p>{$gameModel.playerLights.spotlight.radius}</p>
            <button>Upgrade</button>
            <p>Brightness</p>
            <p>{$gameModel.playerLights.spotlight.brightness}</p>
            <button>Upgrade</button>
        </div>
    </div>
    <div>
        <strong>Beam Light</strong>
        <div class="upgrades">
            <p>Lights</p>
            <p>{$gameModel.playerLights.beamlight.count}</p>
            <button>Upgrade</button>
            <p>Range</p>
            <p>{$gameModel.playerLights.beamlight.range}</p>
            <button>Upgrade</button>
            <p>Brightness</p>
            <p>{$gameModel.playerLights.beamlight.brightness}</p>
            <button>Upgrade</button>
        </div>
    </div>
    <div>
        <strong>Orb of Light</strong>
        <div class="upgrades">
            <p>Lights</p>
            <p>{$gameModel.playerLights.orboflight.count}</p>
            <button>Upgrade</button>
            <p>Radius</p>
            <p>{$gameModel.playerLights.orboflight.radius}</p>
            <button>Upgrade</button>
            <p>Brightness</p>
            <p>{$gameModel.playerLights.orboflight.brightness}</p>
            <button>Upgrade</button>
        </div>
    </div>
</div>

<style>
    div.upgrades {
        text-align: center;
        display: grid;
        grid-template-columns: fit-content(100px) fit-content(100px) fit-content(100px);
        justify-content: center;
        padding:1rem 0.5rem;
    }
    p {
        margin:0.5rem;
    }
    div.upgrades > div {
        padding: 0.5rem;
        margin:0 1rem;
        height:100%;
        box-shadow: inset 2px 2px 10px #000;
    }
</style>