<script lang="ts">
    import { GameState } from "../gamelogic/gamemodel";
    import { setupLevel } from "../gamelogic/pixi/application";
    import { gameModel, updateGameModel } from "../gamelogic/stores";

    function startGame() {
        setupLevel();
        $gameModel.state = GameState.playing;
        updateGameModel();
    }

</script>

<div>
    <h1>Light the Way Home</h1>
    <p>We need your help! Use your lights to protect the drunken villagers from monsters as they make their way home from the pub...</p>
    <button on:click={startGame}>I Understand. Let me help!</button>
</div>

<style>
    div {
        text-align: center;
    }
</style>
