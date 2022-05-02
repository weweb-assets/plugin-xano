<template>
    <div class="flex items-center">
        <wwEditorIcon name="key" class="mr-2"></wwEditorIcon>
        <span class="caption-m">{{ settings.privateData.apiKey }}</span>
    </div>
    <div class="flex items-center">
        <wwEditorIcon name="link" class="mr-2"></wwEditorIcon>
        <span class="caption-m">{{ settings.privateData.instanceId }}</span>
    </div>
</template>

<script>
export default {
    props: {
        settings: { type: Object, required: true },
    },
};
</script>
