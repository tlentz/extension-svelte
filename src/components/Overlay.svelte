<script lang="ts">
  import { onMount } from "svelte";
  import { storage } from "../storage";
  import Options from "./Options.svelte";
  import { writable } from "svelte/store";
  import { clip, type ClipperResponse } from "../lib/Clipper.ts";
  import { JsonView } from "@zerodevx/svelte-json-view";

  let count = 0;
  let key = "";

  // Store to keep track of the hovered element
  let hoveredElement = writable<HTMLElement | undefined>(undefined);
  let clipperResponse = writable<ClipperResponse>({});
  let hovering = writable(true);
  let isCollapsed = writable(true);

  let overlayLeft = 16;
  let overlayTop = 16;
  let moving = false;

  onMount(() => {
    storage.get().then((storage) => (count = storage.count));
  });

  function handleKeydown(event: KeyboardEvent) {
    key = event.key;
    if (key === "Escape") {
      key = "";
    } else if (key === "1") {
      hovering.set(!$hovering);
    } else if (key === "2") {
      isCollapsed.set(!$isCollapsed);
    } else if (key === "3") {
      if($hoveredElement) {
        $hoveredElement.click();
      }
    }
  }

  function handleMouseOver(event: MouseEvent) {
    // Set the store value to the target of the event (the hovered element)
    if ($hovering && event.target instanceof HTMLElement) {
      hoveredElement.set(event.target);
      $hoveredElement?.classList.add("hovered-element");
      clipElement();
    }
  }

  function onMouseDown() {
    moving = true;
  }

  function onMouseUp() {
    moving = false;
  }

  function onMouseMove(e: MouseEvent) {
    if (moving) {
      overlayLeft += e.movementX;
      overlayTop += e.movementY;
    }
  }

  function handleMouseOut() {
    if ($hovering) {
      $hoveredElement?.classList.remove("hovered-element");
      hoveredElement.set(undefined);
    }
  }

  async function clipElement() {
    clip({ el: $hoveredElement }).then(clipperResponse.set);
  }
</script>

<svelte:window
  on:keydown={handleKeydown}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
  on:mouseup={onMouseUp}
  on:mousemove={onMouseMove}
/>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  on:mousedown={onMouseDown}
  class="overlay draggable"
  class:isCollapsed={$isCollapsed}
  style="top: {overlayTop}px; left: {overlayLeft}px;"
>
  {#if key !== ""}
    <div>last key pressed: {key}</div>
  {/if}

  <Options {count} />
  <!-- Display metadata -->
  {#if $clipperResponse.ok}
    <div class="metadata">
      <h3>Element Metadata</h3>
      <JsonView json={$clipperResponse.ok} />
    </div>
  {:else if $clipperResponse.error}
    <div class="error">
      Error: {$clipperResponse.error}
    </div>
  {/if}
</div>


<!-- SVG Circle -->
<!-- {#if $clipperResponse.ok?.dimensions && $clipperResponse.ok?.absolutePosition}
  {@const dimensions = $clipperResponse.ok.dimensions}
  {@const pos = $clipperResponse.ok.absolutePosition}
  <svg
    style="position: absolute; top: {pos.top}; left: {pos.left}; pointer-events: none; z-index: 100000;"
  >
    <circle cx="25" cy="25" r="10" fill="red" />
  </svg>
{/if} -->

<style lang="scss">
  .draggable {
    user-select: none;
    cursor: move;
    border: solid 1px gray;
    position: absolute;
  }

  .overlay {
    z-index: 999;
    width: 350px;
    background-color: white;
    border: 1px solid black;
    padding: 16px;
    color: black;
    max-height: 800px;
    &.isCollapsed {
      max-height: 100px;
    }
    overflow: auto;
  }

  .metadata {
    font-family: "Arial", sans-serif;
    background-color: #f9f9f9;
    border: 1px solid #e1e1e1;
    border-radius: 5px;
    padding: 20px;
    width: 300px; // Adjust width as needed
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
    margin-top: 20px;

    h3 {
      border-bottom: 1px solid #e1e1e1;
      padding-bottom: 10px;
      margin-bottom: 20px;
      font-size: 1.2em;
      color: #333;
    }
  }

  .error {
    font-family: "Arial", sans-serif;
    background-color: #ffe0e0;
    border: 1px solid #ffcccc;
    border-radius: 5px;
    padding: 20px;
    width: 300px; // Adjust width as needed
    box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
    color: #d33;
    font-size: 0.9em;
  }

  :global(.hovered-element) {
    outline: 1px solid red;
  }
</style>
