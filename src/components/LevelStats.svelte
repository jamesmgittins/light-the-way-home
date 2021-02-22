<script lang="ts">
import { gameModel } from "../gamelogic/stores";
import { formatWhole } from "../gamelogic/utils";
</script>

<div class="stats">
    <p>
        <span>Level: {$gameModel.saveData.level}</span>
        <span>Gold: {formatWhole($gameModel.saveData.money)}</span>
        <span>Villagers left pub: {$gameModel.humansSpawned}</span>
        <span>Villagers eaten by monsters: {$gameModel.humansEaten}</span>
        <span>Villagers home safe: {$gameModel.humansEscaped} / {$gameModel.humansToSpawn} ({$gameModel.getEscapePercent()}%)</span>
    </p>
</div>

<style>
    div.stats {
        position: absolute;
        top:0.5rem;
        left:0.5rem;
        z-index: 30;
    }
    p {
        margin:0.5rem;
    }
    p > span {
        margin-right: 0.5rem;
    }
</style>