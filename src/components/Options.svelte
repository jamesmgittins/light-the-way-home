<script lang="ts">
    import { gameModel } from "../gamelogic/gamemodel";
    import { sendMessage } from "../gamelogic/notifications";
    import { resetSaveGame, saveSaveGame } from "../gamelogic/saveloadfunctions";

    let showOptions = false;

    /**
     * On click action to save the game in localstorage
     */
    function saveGame() {
        saveSaveGame($gameModel.saveData);
        sendMessage("Game has been saved");
    }

    /**
     * On click action to reset the save game in localstorage
     */
    function resetGame() {
        if (confirm('Are you sure you want to reset your game?')) {
            resetSaveGame();
            sendMessage("Save Data has been wiped");
        }
    }
</script>

<div>
    {#if showOptions}
        <button on:click={e => showOptions = false}>Hide</button>
        <button on:click={resetGame}>Reset Save Game</button>
    {:else}
        <button on:click={e => showOptions = true}>Options</button>
    {/if}
</div>

<style>
    div {
        position: absolute;
        top:1rem;
        right:1rem;
        display: grid;
        grid-template-columns: 1;
    }
</style>