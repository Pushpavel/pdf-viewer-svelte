<script lang="ts">
    import {GlobalWorkerOptions, getDocument} from "pdfjs-dist";
    import PageContainer from "./PageContainer.svelte";
    import worker from "pdfjs-dist/build/pdf.worker.js?url"

    GlobalWorkerOptions.workerSrc = worker;
</script>
{#await getDocument("./sample.pdf").promise}
    <div class="content-center">
        Loading...
    </div>
{:then pdf}
    <PageContainer {pdf}/>
{/await}
