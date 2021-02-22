<script lang="ts">
    import { gameModel, GameState, updateGameModel } from "../gamelogic/gamemodel";
    import { setupLevel } from "../gamelogic/pixi/application";
    $: levelComplete = $gameModel.getEscapePercent() >= 50;

    function startGame() {
        setupLevel();
        $gameModel.state = GameState.playing;
        updateGameModel();
    }

    function changeLevel(change : number) {
        $gameModel.saveData.level += change;
        startGame();
    }
</script>

<div>
    {#if levelComplete}
        <h1>Level Complete</h1>
        <p>You helped {$gameModel.getEscapePercent()}% of the villagers to get home</p>
        <button on:click={startGame}>Replay level {$gameModel.saveData.level}</button>
        <button on:click={e => changeLevel(1)}>Start level {$gameModel.saveData.level + 1}</button>
    {:else}
        <h1>Level Failed</h1>
        <p>You only helped {$gameModel.getEscapePercent()}% of the villagers get home safely</p>
        <p>You must help 50% or more to complete the level</p>
        {#if $gameModel.saveData.level > 1}
            <button on:click={e => changeLevel(-1)}>Go back to level {$gameModel.saveData.level - 1}</button>
        {/if}
        <button on:click={startGame}>Replay level {$gameModel.saveData.level}</button>
    {/if}
    
</div>

<style>
    div {
        text-align: center;
    }
</style>