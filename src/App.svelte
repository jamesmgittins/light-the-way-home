<!-- 
	App.svelte is the first svelte file the application loads.
	svelte-spa-router handles navigation between different pages.
	The pages are stored in src/routes as .svelte files.
	They need to be added to the const routes in this file. Then they can be navigated to.
-->

<script lang="ts">
	import Home from "./routes/Home.svelte";
	import Notifications from './components/Notifications.svelte';
	import { onMount } from "svelte";
	import { startApplication } from "./gamelogic/pixi/application";
	import { GameState } from "./gamelogic/gamemodel";
	import Playing from "./routes/Playing.svelte";
	import LevelStats from "./components/LevelStats.svelte";
	import Options from "./components/Options.svelte";
	import EndLevel from "./routes/EndLevel.svelte";
	import { gameModel } from "./gamelogic/stores";
import MonsterHealthBars from "./components/MonsterHealthBars.svelte";

	onMount(() => {
		startApplication();
	});

	let componentToShow;
	$: switch($gameModel.state) {
		case GameState.startgame:
			componentToShow = Home;
			break;
		case GameState.playing:
			componentToShow = Playing;
			break;
		case GameState.endoflevel:
			componentToShow = EndLevel;
			break;
	}
</script>

<div class="grid">
	<canvas id="game-canvas"></canvas>

	<div class="item">
		<svelte:component this={componentToShow}/>
	</div>
</div>

{#if $gameModel.state == GameState.playing}
	<LevelStats/>
	<MonsterHealthBars/>
{/if}

<Options/>

<!-- Add the Notifications component so messages appear on every page -->
<Notifications></Notifications>

<!-- This is where CSS for the navigation menu can be defined -->
<style>
	div.grid {
		display:flex;
		flex-direction: column;
		height:100%;
		width:100%;
	}
	canvas {
		image-rendering: -moz-crisp-edges;
		image-rendering: -webkit-crisp-edges;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		/* flex-grow: 1; */
		flex-basis: auto;
		height:60vh;
		width: 100%;
		background-color: #000;
	}
	div.item {
		flex-grow: 1;
		flex-basis: auto;
		background-color: #111;
		width: 100%;
		z-index: 20;
		/* overflow: auto; */
	}
</style>