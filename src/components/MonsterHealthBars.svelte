<script lang="ts">
    import { monsterHealthBars } from "../gamelogic/stores";


    $monsterHealthBars
</script>

{#each $monsterHealthBars as bar}
    {#if bar.percent < 100}
        <div style="top:{bar.y}px;left:{bar.x}px;">
            <span style="width:{bar.percent}%"></span>
        </div>
    {/if}
{/each}


<style>
    div {
        z-index: 10;
        position: absolute;
        height:10px;
        width:40px;
        transform : translate(-50%, -40px);
        padding:1px;
        background-color: black;
    }
    span {
        height:8px;
        display: block;
        background-color: red;
    }
</style>