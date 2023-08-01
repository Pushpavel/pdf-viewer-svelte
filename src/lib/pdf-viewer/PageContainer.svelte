<script lang="ts">
    import {PDFDocumentProxy} from "pdfjs-dist";
    import PdfPage from "./PdfPage.svelte";
    import {onMount, tick} from "svelte";
    import {round} from "./utils";

    const MAX_ZOOM = 7;
    const MIN_ZOOM = 0.05;

    export let pdf: PDFDocumentProxy;

    let scale = 1;
    let zoomScale = window.visualViewport.scale * devicePixelRatio;

    let container: HTMLDivElement;

    onMount(() => {
        window.visualViewport.addEventListener("resize", () => {
            const newZoomScale = round(window.visualViewport.scale * devicePixelRatio, 100);
            if (newZoomScale != zoomScale)
                zoomScale = newZoomScale;
        })

        window.addEventListener('wheel', e => {
            if (!e.ctrlKey) return
            // panzoom.zoomWithWheel(e)
            e.preventDefault()
            // Normalize to deltaX in case shift modifier is used on Mac
            const delta = e.deltaY === 0 && e.deltaX ? e.deltaX : e.deltaY
            const wheel = delta < 0 ? 1 : -1
            const toScale = scale * Math.exp((wheel * 0.3) / 3)
            zoomTo(toScale, e.clientX, e.clientY)
        }, {passive: false})
    });

    async function zoomTo(scaleTo: number, clientX: number, clientY: number) {
        scaleTo = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, round(scaleTo, 100)));
        if (scaleTo == scale) return;

        const prevScale = scale;
        scale = scaleTo;
        await tick(); // update UI
        const delta = scale / prevScale;
        const [ox, oy] = [container.offsetLeft, container.offsetTop];
        const [wx, wy] = [window.scrollX, window.scrollY];
        const sx = (clientX + wx - ox) * delta + ox - clientX;
        const sy = (clientY + wy - oy) * delta + oy - clientY;
        window.scrollTo({left: sx, top: sy});
    }

</script>
<div bind:this={container}>
    {#each Array(pdf.numPages) as _, pageNo}
        <PdfPage pageNo={pageNo + 1} {pdf} {scale} {zoomScale}/>
        <br>
    {/each}
</div>