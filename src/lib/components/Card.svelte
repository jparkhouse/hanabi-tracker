<!-- /lib/components/Card.svelte -->

<script lang="ts">
    import gameConfig from '../stores/gameConfigStore';

    export let id: number;
    export let numberInformation: (boolean | null)[];
    export let colourInformation: (boolean | null)[];
    export let selected: boolean = false;
    export let onSelect: (id: number) => void;
  
    $: variant = $gameConfig.variant;
    $: numberOfCards = $gameConfig.numberOfCards;

    // Utility to decode colour information into readable format
    function decodeColour(colourInfo: (boolean | null)[]): string {
        let output: string = colourInfo.map((value, index) => 
        value === true || value === null ? getColourCodeByIndex(index) : '').join(' ')
        return output
    }
    
    // Utility to decode number information into readable format
    function decodeNumber(numberInfo: (boolean | null)[]): string {
        let output: string = numberInfo.map((value, index) => 
        value === true || value === null ? (index + 1).toString() : '').join(' ')
        return output
    }

    function getColourCodeByIndex(index: number): string {
        if (index < 5) {
            return ['r', 'y', 'b', 'w', 'g'][index]
        }
        if (variant == 'blacks' && index == 5) {
            return 'bl'
        }
        if (variant == 'rainbows' && index == 5) {
            return 'm'
        }
        if (variant == 'rainbows-and-blacks' && index == 5) {
            return 'm'
        }
        if (variant == 'rainbows-and-blacks' && index == 6) {
            return 'bl'
        }
        else {
            console.log('Index {index} out of range for card {self.id} and variant {variant}');
            return 'err'
        }
    }
  </script>
  
<div class="card {selected ? 'selected' : ''} no-{numberOfCards}" tabindex="0" role="button"
     on:click={() => onSelect(id)}
     on:keydown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelect(id)}>
  <p>Card {id + 1}</p>
  <p>{decodeNumber(numberInformation)}</p>
  <p>{decodeColour(colourInformation)}</p>
</div>
  
  <style>
    .card {
        background-color: dimgrey;
        border: 2px solid lightgray;
        color: white;
        border-radius: 8px;
        padding: 10px;
        cursor: pointer;
        min-width: 100px; /* Minimum width for a card */
        margin: 10px; /* Margin around cards */
        text-align: center; /* Center text inside cards */
        flex: 1;
        aspect-ratio: 3/4;
        font-size: 3vw;
    }

    .card.selected {
        border: 2px solid blue;
    }

    .card.no-3 {
        max-width: calc(100% / 3);
    }

    .card.no-4 {
        max-width: calc(100% / 4);
    }

    .card.no-5 {
        max-width: calc(100% / 5);
    }
</style>
  