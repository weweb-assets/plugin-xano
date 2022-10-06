<template>
    <wwEditorFormRow required label="API key">
        <template #append-label>
            <a class="xano-settings-edit__link" href="https://docs.xano.com/developer-api" target="_blank">
                Find it here
            </a>
        </template>
        <wwEditorInputText
            type="text"
            name="api-key"
            placeholder="ey**************"
            :model-value="settings.privateData.apiKey"
            @update:modelValue="changeApiKey"
        />
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
    <div class="divider"></div>
    <wwEditorFormRow label="Data source">
        <template #append-label>
            <a class="xano-settings-edit__link" href="https://docs.xano.com/database/data-sources" target="_blank">
                Learn more
            </a>
        </template>
        <wwEditorInputRow
            type="query"
            placeholder="Default to live data"
            :model-value="settings.publicData.xDataSourceEditor"
            label="In editor"
            @update:modelValue="changeXDataSource('xDataSourceEditor', $event)"
            small
        />
        <!-- <wwEditorInputRow
            type="query"
            placeholder="Default to live data"
            :model-value="settings.publicData.xDataSourceStaging"
            label="In staging"
            @update:modelValue="changeXDataSource('xDataSourceStaging', $event)"
            small
        /> -->
        <wwEditorInputRow
            type="query"
            placeholder="Default to live data"
            :model-value="settings.publicData.xDataSourceProd"
            label="In production"
            @update:modelValue="changeXDataSource('xDataSourceProd', $event)"
            small
        />
    </wwEditorFormRow>
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
        instancesOptions() {
            if (!this.instances) return [];
            return this.instances.map(instance => ({ label: instance.display, value: `${instance.id}` }));
        },
    },
    mounted() {
        this.fetchInstances(this.settings.privateData.apiKey);
        console.log(this.settings);
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
        async changeXDataSource(key, value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, [key]: value },
            });
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
.divider {
    width: 100%;
    height: 1px;
    background-color: var(--ww-color-dark-200);
    margin: 12px 0px;
}
</style>
