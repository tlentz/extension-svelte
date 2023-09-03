<script lang="ts">
  import { onMount } from "svelte";
  import { storage } from "../storage";
  import Options from "./Options.svelte";
  import { writable } from "svelte/store";
  import { clip, type ClipperResponse } from "../lib/Clipper";

  let count = 0;
  let key = "";

  // Store to keep track of the hovered element
  let hoveredElement = writable<HTMLElement | undefined>(undefined);
  let clipperResponse: ClipperResponse = {};

  onMount(() => {
    storage.get().then((storage) => (count = storage.count));
  });

  function handleKeydown(event: KeyboardEvent) {
    key = event.key;
    if (key === "Escape") {
      key = "";
    }
  }

  function handleMouseOver(event: MouseEvent) {
    // Set the store value to the target of the event (the hovered element)
    if (event.target instanceof HTMLElement) {
      hoveredElement.set(event.target);
      clipElement();
    }
  }

  function handleMouseOut() {
    // Reset the store value
    hoveredElement.set(undefined);
  }

  async function clipElement() {
    clipperResponse = await clip({ el: $hoveredElement });
  }
</script>

<svelte:window
  on:keydown={handleKeydown}
  on:mouseover={handleMouseOver}
  on:mouseout={handleMouseOut}
/>

<div class="overlay">
  {#if key !== ""}
    <div>last key pressed: {key}</div>
  {/if}
  <Options {count} />
  <!-- Display metadata -->
  {#if clipperResponse.ok}
    <div class="metadata">
      <h3>Element Metadata</h3>
      <p><strong>Tag Name:</strong> {clipperResponse.ok.tagName}</p>
      {#if clipperResponse.ok.id}
        <p><strong>ID:</strong> {clipperResponse.ok.id}</p>
      {/if}
      <p>
        <strong>Class List:</strong>
        {clipperResponse.ok.classList.join(", ")}
      </p>
      <p class="text-content" data-fulltext={clipperResponse.ok.innerText}>
        <strong>Inner Text:</strong>
        {clipperResponse.ok.innerText}
      </p>
      <p><strong>Attributes:</strong></p>
      <ul>
        {#each Object.entries(clipperResponse.ok.attributes) as [key, value]}
          <li>{key}: {value}</li>
        {/each}
      </ul>
    </div>
  {:else if clipperResponse.error}
    <div class="error">
      Error: {clipperResponse.error}
    </div>
  {/if}
</div>

<style lang="scss">
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

    p {
      margin-bottom: 10px;
      font-size: 0.9em;
      color: #555;

      strong {
        color: #333;
        margin-right: 5px;
      }

      &.text-content {
        max-width: 250px; // Adjust as needed
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        // Tooltip styling
        position: relative;

        &:hover::after {
          content: attr(data-fulltext);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 5px;
          border-radius: 3px;
          font-size: 0.8em;
          white-space: normal;
          max-width: 200px;
          text-align: center;
        }
      }
    }

    ul {
      list-style-type: none;
      padding: 0;

      li {
        font-size: 0.9em;
        margin-bottom: 5px;
        color: #555;

        &:last-child {
          margin-bottom: 0;
        }
      }
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
</style>
