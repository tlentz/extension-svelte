<script lang="ts">
    import { onMount } from "svelte";
    import { storage } from "../storage";
    import Options from "./Options.svelte";

    let count = 0;
    let key = '';

    onMount(() => {
        storage.get().then((storage) => (count = storage.count));
    });

    function handleKeydown(event: KeyboardEvent) {
        key = event.key;
        if (key === 'Escape') {
            key = '';
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="overlay">
    {#if key !==''}
         <div>last key pressed: {key}</div>
    {/if}
    <Options {count} />
</div>

<style>
    .overlay {
        position: fixed;
        width: 300px;
        top: 16px;
        left: 16px;
        background-color: white;
        border: 1px solid black;
        padding: 16px;
        color: black;
    }
</style>
