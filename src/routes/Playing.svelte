<script lang="ts">
    import Upgrade from "../components/Upgrade.svelte";
    import { PlayerLightType } from "../gamelogic/pixi/playerlightenum";
    import { gameModel } from "../gamelogic/stores";
    import { upgradeMap } from "../gamelogic/upgrades";

    $: showBeam = $gameModel.playerLights.beamlight.count > 0;
    $: showOrb = $gameModel.playerLights.orboflight.count > 0;

    function selectLight(type : PlayerLightType) {
        switch(type) {
            case PlayerLightType.spotlight:
                $gameModel.playerLights.currentLight = PlayerLightType.spotlight;
                break;
            case PlayerLightType.beamlight:
                if ($gameModel.playerLights.beamlight.count > 0) {
                    $gameModel.playerLights.currentLight = PlayerLightType.beamlight;
                }
                break;
            case PlayerLightType.orboflight:
                if ($gameModel.playerLights.orboflight.count > 0) {
                    $gameModel.playerLights.currentLight = PlayerLightType.orboflight;
                }
                break;
        }
    }

</script>

<div class="upgrades">
    <div on:click={e => selectLight(PlayerLightType.spotlight)} class="clickable" class:selected={$gameModel.playerLights.currentLight == PlayerLightType.spotlight}>
        <strong>Lamp Post</strong>
        <div class="upgrades">
            <Upgrade upgradeId={1}/>
            <Upgrade upgradeId={2}/>
            <Upgrade upgradeId={3}/>
        </div>
    </div>
    <div on:click={e => selectLight(PlayerLightType.beamlight)} class:clickable={$gameModel.playerLights.beamlight.count > 0} class:selected={$gameModel.playerLights.currentLight == PlayerLightType.beamlight}>
        <strong>Beam Light</strong>
        {#if !showBeam}
            <button on:click={e => $upgradeMap.get(4).purchase()}>Unlock {$upgradeMap.get(4).getPrice()} Gold</button>
        {:else}
            <div class="upgrades">
                <Upgrade upgradeId={4}/>
                <Upgrade upgradeId={5}/>
                <Upgrade upgradeId={6}/>
            </div>
        {/if}
    </div>
    <div on:click={e => selectLight(PlayerLightType.orboflight)} class:clickable={$gameModel.playerLights.orboflight.count > 0} class:selected={$gameModel.playerLights.currentLight == PlayerLightType.orboflight}>
        <strong>Orb of Light</strong>
        {#if !showOrb}
        <button on:click={e => $upgradeMap.get(7).purchase()}>Unlock {$upgradeMap.get(7).getPrice()} Gold</button>
        {:else}
            <div class="upgrades">
                <Upgrade upgradeId={7}/>
                <Upgrade upgradeId={8}/>
                <Upgrade upgradeId={9}/>
            </div>
        {/if}
    </div>
</div>

<style>
    div.upgrades {
        text-align: center;
        width:fit-content;
        margin: auto;
        display: grid;
        grid-template-columns: fit-content(100px) fit-content(100px) fit-content(100px);
        justify-content: center;
        padding:1rem 0.5rem;
    }
    div.upgrades > div {
        padding: 0.5rem;
        margin:0 1rem;
        height:100%;
        box-shadow: inset 2px 2px 10px #000;
    }
    strong {
        white-space: nowrap;
    }
    button {
        margin-top: 1rem;
    }
    div.upgrades > div.clickable:not(.selected):hover {
        box-shadow: inset 0px 0px 10px #157;
        cursor: pointer;
    }
    div.upgrades > div.selected {
        box-shadow: inset 0px 0px 10px #379;
    }
</style>