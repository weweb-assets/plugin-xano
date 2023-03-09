<template>
    <wwEditorFormRow required label="API key">
        <template #append-label>
            <a class="xano-settings-edit__link" href="https://docs.xano.com/developer-api" target="_blank">
                Find it here
            </a>
        </template>
        <div class="flex items-center">
            <wwEditorInputText
                :type="isKeyVisible ? 'text' : 'password'"
                name="api-key"
                placeholder="ey**************"
                :model-value="settings.privateData.apiKey"
                @update:modelValue="changeApiKey"
                class="w-full mr-3"
            />
            <button class="pointer" @click.prevent="isKeyVisible = !isKeyVisible">
                <wwEditorIcon :name="isKeyVisible ? 'eye-off' : 'eye'"></wwEditorIcon>
            </button>
        </div>
    </wwEditorFormRow>
    <wwEditorInputRow
        type="select"
        placeholder="Select an instance"
        :model-value="settings.privateData.instanceId"
        :disabled="!settings.privateData.apiKey"
        :options="instancesOptions"
        required
        label="Instance"
        @update:modelValue="changeInstance"
    />
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
            isKeyVisible: false,
            isLoading: false,
            instances: null,
        };
    },
    computed: {
        instancesOptions() {
            if (!this.instances) return [];
            return this.instances.map(instance => ({ label: instance.display, value: `${instance.id}` }));
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
        changeApiKey(apiKey) {
            this.$emit('update:settings', { ...this.settings, privateData: { ...this.settings.privateData, apiKey } });
            this.fetchInstances(apiKey);
        },
        async changeInstance(instanceId) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, instanceId },
            });
            try {
                this.isLoading = true;
                await this.plugin.fetchInstance(this.settings.privateData.apiKey, instanceId);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.xano-settings-edit {
    &__link {
        color: var(--ww-color-blue-500);
        margin-left: var(--ww-spacing-02);
    }
}
</style>
