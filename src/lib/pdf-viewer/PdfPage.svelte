<script lang="ts">
    import {onMount} from "svelte";
    import type {PDFDocumentProxy, PDFPageProxy} from "pdfjs-dist";
    import {inView, round} from "./utils"

    const DRAWING_DELAY_MS = 300
    export let pdf: PDFDocumentProxy;
    export let pageNo: number;
    export let scale: number = 1;
    export let zoomScale: number;

    let page: PDFPageProxy
    let ctx: CanvasRenderingContext2D
    let drawingCtx: CanvasRenderingContext2D

    let canvas: HTMLCanvasElement
    let drawingCanvas: HTMLCanvasElement
    let wrapper: HTMLDivElement


    onMount(async () => {
        page = await pdf.getPage(pageNo)
        ctx = canvas.getContext("2d")
        drawingCtx = drawingCanvas.getContext("2d")
        lazyDraw()
    })


    $: scale, lazyDraw()
    $: zoomScale, scheduleDraw()


    function lazyDraw() {
        if (page == null || ctx == null) return;
        const viewport = page.getViewport({scale});
        wrapper.style.width = `${viewport.width}px`
        wrapper.style.height = `${viewport.height}px`
        canvas.style.scale = (viewport.width / canvas.width).toString()
        scheduleDraw()
    }

    let drawSchedule;
    let drawPromise;
    let drawing = false;

    function scheduleDraw() {
        if (page == null || ctx == null) return;
        clearTimeout(drawSchedule)
        drawSchedule = setTimeout(async () => {
            if (drawPromise) {
                if (drawing) {
                    drawing = false;
                    await drawPromise;
                } else
                    return
            }
            drawing = true;
            drawPromise = draw()
        }, DRAWING_DELAY_MS)
    }

    let insideView = true;
    let dirty = false;
    let renderTask;
    $: if (dirty && insideView) {
        scheduleDraw();
    }

    $: if (renderTask && !insideView)
        renderTask.cancel();

    async function draw() {
        if (!insideView) {
            dirty = true;
            return;
        }
        dirty = false;
        drawingCanvas.style.scale = (1 / zoomScale).toString();
        const viewport = page.getViewport({scale: scale * zoomScale});
        drawingCanvas.width = viewport.width;
        drawingCanvas.height = viewport.height;
        try {

            await (renderTask = page.render({
                canvasContext: drawingCtx,
                viewport
            })).promise
        } catch (e) {
            dirty = true;
            return;
        }
        canvas.hidden = true;
        drawingCanvas.hidden = false;
        [drawingCanvas, canvas] = [canvas, drawingCanvas];
        [drawingCtx, ctx] = [ctx, drawingCtx]
    }
</script>
<div bind:this={wrapper} class="border-2 border-red-500 overflow-hidden relative"
     use:inView
     on:enter={()=>insideView = true}
     on:exit={()=>insideView = false}
>
    <canvas bind:this={canvas} class="origin-top-left absolute"></canvas>
    <canvas bind:this={drawingCanvas} class="origin-top-left absolute" hidden></canvas>
</div>
