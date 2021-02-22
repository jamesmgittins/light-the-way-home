<script lang="ts">
import { gameModel } from "../gamelogic/gamemodel";
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
        top:1rem;
        left:1rem;
    }
    p {
        margin:0.5rem;
    }
    p > span {
        margin-right: 1rem;
    }
</style>