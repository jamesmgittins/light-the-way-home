<script lang="ts">
import { gameModel } from "../gamelogic/gamemodel";
import { formatWhole } from "../gamelogic/utils";


</script>

<div class="stats">
    <p>
        <span>Level: {$gameModel.saveData.level}</span>
        <span>Gold: {formatWhole($gameModel.saveData.money)}</span>
        <span>Humans Spawned: {$gameModel.humansSpawned}</span>
        <span>Humans Eaten: {$gameModel.humansEaten}</span>
        <span>Humans Escaped: {$gameModel.humansEscaped} / {$gameModel.humansToSpawn} ({Math.round(100 * $gameModel.humansEscaped / $gameModel.humansToSpawn) * 100}%)</span>
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