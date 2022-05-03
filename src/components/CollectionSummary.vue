<template>
    <div class="mb-1">URL: {{ config.apiGroupUrl || '-' }}</div>
    <div class="mb-1">Path: {{ (config.endpoint && config.endpoint.path) || '-' }}</div>
</template>

<script>
export default {
    props: {
        config: { type: Object, required: true },
    },
};
</script>
