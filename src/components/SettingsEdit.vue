<template>
    <div class="flex flex-col">
        <wwEditorFormRow required label="Developer API key (Deprecated)" v-if="deprecated">
            <template #append-label>
                <a class="ml-2 ww-editor-link" href="https://docs.xano.com/developer-api" target="_blank">
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
                    class="w-full mr-2"
                    :disabled="settings.privateData.metaApiKey"
                />
                <button class="ww-editor-button -icon -secondary -dark" @click.prevent="isKeyVisible = !isKeyVisible">
                    <wwEditorIcon :name="isKeyVisible ? 'eye-off' : 'eye'"></wwEditorIcon>
                </button>
            </div>
        </wwEditorFormRow>
        <wwEditorFormRow required label="Metadata API Key">
            <template #append-label>
                <a class="ml-2 ww-editor-link" href="https://docs.xano.com/metadata-api" target="_blank">
                    Find it here
                </a>
            </template>
            <div class="flex items-center">
                <wwEditorInputText
                    :type="isKeyVisible ? 'text' : 'password'"
                    name="meta-api-key"
                    placeholder="ey**************"
                    :model-value="settings.privateData.metaApiKey"
                    @update:modelValue="changeMetaApiKey"
                    class="w-full mr-2"
                />
                <button class="ww-editor-button -icon -secondary -dark" @click.prevent="isKeyVisible = !isKeyVisible">
                    <wwEditorIcon :name="isKeyVisible ? 'eye-off' : 'eye'"></wwEditorIcon>
                </button>
            </div>
        </wwEditorFormRow>
        <p v-if="deprecated" class="label-sm flex items-center text-yellow-500 mb-3">
            <wwEditorIcon class="mr-1" name="warning" small />
            Setting up your Metadata API key will reset your configuration for this step.
        </p>
        <wwEditorInputRow
            type="select"
            placeholder="Select an instance"
            :model-value="settings.privateData.instanceId"
            :disabled="!settings.privateData.apiKey && !settings.privateData.metaApiKey"
            :options="instancesOptions"
            required
            label="Instance"
            @update:modelValue="changeInstance"
        />
        <wwEditorInputRow
            type="query"
            :placeholder="'Default: ' + (defaultDomain || '')"
            :model-value="settings.publicData.customDomain"
            :disabled="!settings.privateData.instanceId"
            label="Instance domain"
            @update:modelValue="setCustomDomain"
        />
        <p v-if="incorrectCustomDomain" class="label-sm flex items-center text-red-500 mb-3">
            <wwEditorIcon class="mr-1" name="warning" small />
            The custom domain must not include the protocol (http(s)://)
        </p>
        <wwEditorInputRow
            label="Workspace"
            type="select"
            placeholder="Select a workspace"
            :model-value="settings.privateData.workspaceId"
            :disabled="!settings.privateData.instanceId"
            :options="workspacesOptions"
            @update:modelValue="changeWorkspace"
        />
        <wwEditorInputRow
            label="Realtime connection hash"
            type="query"
            :model-value="settings.publicData.realtimeConnectionHash"
            @update:modelValue="setRealtimeConnectionHash"
        />
    </div>
    <wwLoader :loading="isLoading" />
</template>

<script>
let xanoManager = null;
export default {
    props: {
        plugin: { type: Object, required: true },
        settings: { type: Object, required: true },
    },
    emits: ['update:settings'],
    data() {
        return {
            deprecated: false,
            useMetaApi: false,
            isKeyVisible: false,
            isLoading: false,
            instances: [],
            workspaces: [],
            defaultDomain: null,
        };
    },
    computed: {
        instancesOptions() {
            return this.instances.map(instance => ({ label: instance.name, value: String(instance.id) }));
        },
        workspacesOptions() {
            return [
                { label: 'None', value: null },
                ...this.workspaces.map(workspace => ({ label: workspace.name, value: workspace.id, ...workspace })),
            ];
        },
        incorrectCustomDomain() {
            return (this.settings.publicData.customDomain || '').includes('http');
        },
    },
    watch: {
        async 'settings.privateData.metaApiKey'(value) {
            this.isLoading = true;
            try {
                if (this.useMetaApi) {
                    await xanoManager.changeApiKey(value);
                    this.sync();
                } else {
                    await this.initManager();
                    this.useMetaApi = true;
                }
            } catch (error) {
                wwLib.wwNotification.open({
                    text: 'Failed to use the new API key, please ensure your API key has the permission required.',
                    color: 'red',
                });
            }

            this.isLoading = false;
        },
    },
    async mounted() {
        this.deprecated = !!this.settings.privateData.apiKey;
        this.useMetaApi = !!this.settings.privateData.metaApiKey;
        this.initManager();
    },
    methods: {
        async initManager() {
            this.isLoading = true;
            xanoManager = this.plugin.createManager(this.settings);
            try {
                await xanoManager.init();
                this.sync();
            } catch (error) {
                wwLib.wwNotification.open({
                    text: 'Failed to init Xano, please ensure your API key has the permission required.',
                    color: 'red',
                });
            }

            this.isLoading = false;
        },
        sync() {
            this.instances = xanoManager.getInstances();
            this.workspaces = xanoManager.getWorkspaces();
            this.defaultDomain = xanoManager.getBaseDomain();
            this.$emit('update:settings', {
                ...this.settings,
                privateData: {
                    ...this.settings.privateData,
                    instanceId: xanoManager.getInstance()?.id,
                    workspaceId: xanoManager.getWorkspace()?.id,
                },
                publicData: {
                    ...this.settings.publicData,
                    domain: xanoManager.getBaseDomain(),
                    customDomain: xanoManager.getCustomDomain() || this.settings.publicData.customDomain,
                },
            });
        },
        async changeApiKey(apiKey) {
            this.isLoading = true;
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey },
            });

            await xanoManager.changeApiKey(apiKey);
            this.sync();

            this.isLoading = false;
        },
        async changeMetaApiKey(metaApiKey) {
            this.$emit('update:settings', {
                ...this.settings,
                privateData: { ...this.settings.privateData, apiKey: null, metaApiKey },
            });
        },
        async changeInstance(instanceId) {
            this.isLoading = true;
            await xanoManager.changeInstance(instanceId);
            this.sync();
            this.isLoading = false;
        },
        async changeWorkspace(value) {
            this.isLoading = true;
            await xanoManager.changeWorkspace(value);
            this.sync();
            this.isLoading = false;
        },
        setCustomDomain(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, customDomain: value },
            });
        },
        setRealtimeConnectionHash(value) {
            this.$emit('update:settings', {
                ...this.settings,
                publicData: { ...this.settings.publicData, realtimeConnectionHash: value },
            });
        },
    },
};
</script>
