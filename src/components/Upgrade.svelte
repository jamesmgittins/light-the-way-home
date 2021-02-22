<script lang="ts">
    import { upgradeMap } from "../gamelogic/upgrades";
    import { formatNumber, formatWhole } from "../gamelogic/utils";
    export let upgradeId : number;
    $: upgrade = $upgradeMap.get(upgradeId);
</script>

<p>{upgrade.name}</p>
<p>{formatNumber(upgrade.getCurrentValue(), 2)}</p>
<button on:click={e => upgrade.purchase()}>{formatWhole(upgrade.getPrice())} Gold</button>

<style>
    p {
        margin:0.5rem;
    }
    button {
        white-space: nowrap;
    }
</style>