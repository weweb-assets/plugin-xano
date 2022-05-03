<template>
    <div class="mb-1">{{ config || '-' }}</div>
</template>

<script>
export default {
    props: {
        config: { type: Object, required: true },
    },
};
</script>
