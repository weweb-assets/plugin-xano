<template>
    <div class="flex items-center caption-m">
        <wwEditorIcon name="link" class="mr-2"></wwEditorIcon>
        {{ instance }}
    </div>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            isLoading: false,
            instances: null,
        };
    },
    computed: {
        instance() {
            const instance = this.instances.find(instance => instance.id === this.settings.privateData.instanceId);
            return instance ? instance.display : 'Not found';
        },
    },
    mounted() {
        this.fetchInstances(this.settings.privateData.apiKey);
    },
    methods: {
        async fetchInstances(apiKey) {
            if (!apiKey) return;
            try {
                this.isLoading = true;
                this.instances = await this.plugin.fetchInstances(apiKey);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>
