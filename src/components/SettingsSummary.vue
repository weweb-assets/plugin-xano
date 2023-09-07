<template>
    <wwEditorFormRow label="Instance">
        <div class="flex items-center mb-2">
            <div><wwEditorIcon large name="data" class="mr-2" /></div>
            <span class="truncate">{{ instanceName }}</span>
        </div>
    </wwEditorFormRow>
    <wwEditorFormRow label="Workspace">
        <div class="flex items-center">
            <div><wwEditorIcon large name="data" class="mr-2" /></div>
            <span class="truncate">{{ workspaceName }}</span>
        </div>
    </wwEditorFormRow>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    data: () => ({
        isLoading: false,
        instanceName: null,
        workspaceName: null,
    }),
    mounted() {
        this.isLoading = true;
        this.plugin.xanoManager.onReady(() => {
            this.instanceName = this.plugin.xanoManager.getInstance()?.name || 'None';
            this.workspaceName = this.plugin.xanoManager.getWorkspace()?.name || 'None';
            this.isLoading = false;
        });
    },
};
</script>
