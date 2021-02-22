<script lang="ts">
    import { gameModel, GameState, updateGameModel } from "../gamelogic/gamemodel";
    import { setupLevel } from "../gamelogic/pixi/application";

    function startGame() {
        setupLevel();
        $gameModel.state = GameState.playing;
        updateGameModel();
    }

</script>

<div>
    <h1>Light the Way Home</h1>
    <p>We need your help! Please use your lights to protect the villagers from monsters as they make their way home...</p>
    <button on:click={startGame}>I Understand. Let me help!</button>
</div>

<style>
    div {
        text-align: center;
    }
</style>
