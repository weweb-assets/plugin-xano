<template>
    <div class="flex items-center">
        <div class="w-100 -full">
            <wwEditorInputRow
                label="Api group"
                type="select"
                placeholder="Select an api group"
                required
                :model-value="api.apiGroupUrl"
                :options="apiGroupsOptions"
                @update:modelValue="setProp('apiGroupUrl', $event)"
            />
        </div>
        <button type="button" class="ww-editor-button -small -primary ml-2 mt-3" @click="refreshManager">
            refresh
        </button>
    </div>
    <div class="flex items-center">
        <div class="w-100 -full">
            <wwEditorInputRow
                label="Endpoint"
                type="select"
                full
                placeholder="Select an endpoint"
                required
                :model-value="endpointValue"
                :options="endpointsOptions"
                @update:modelValue="setEndpoint"
            />
        </div>
        <button
            type="button"
            class="ww-editor-button -small -primary ml-2 mt-3"
            @click="refreshSpec"
            :disabled="!api.apiGroupUrl"
        >
            refresh
        </button>
    </div>
    <wwEditorInputRow
        label="Headers"
        type="array"
        :model-value="api.headers"
        :bindable="collection.mode === 'dynamic'"
        @update:modelValue="setProp('headers', $event)"
        @add-item="setProp('headers', [...(api.headers || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                type="query"
                :model-value="item.key"
                label="Key"
                placeholder="Enter a value"
                small
                :bindable="collection.mode === 'dynamic'"
                @update:modelValue="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                type="query"
                :model-value="item.value"
                label="Value"
                placeholder="Enter a value"
                small
                :bindable="collection.mode === 'dynamic'"
                @update:modelValue="setItem({ ...item, value: $event })"
            />
        </template>
    </wwEditorInputRow>
    <wwEditorInputRow
        v-for="(parameter, index) in endpointParameters"
        :key="index"
        :label="parameter.name"
        type="query"
        placeholder="Enter a value"
        :bindable="collection.mode === 'dynamic'"
        :binding-validation="parameter.bindingValidation"
        :required="parameter.required"
        :model-value="api.parameters[parameter.name]"
        @update:modelValue="setProp('parameters', { ...api.parameters, [parameter.name]: $event })"
    />
    <wwEditorInputRow
        v-for="(elem, index) in endpointBody"
        :key="index"
        :label="elem.name"
        :type="elem.type || 'string'"
        placeholder="Enter a value"
        :bindable="collection.mode === 'dynamic'"
        :binding-validation="elem.bindingValidation"
        :required="elem.required"
        :model-value="api.body[elem.name]"
        @update:modelValue="setProp('body', { ...api.body, [elem.name]: $event })"
    />
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        collection: { type: Object, required: true },
        config: { type: Object, required: true },
    },
    emits: ['update:config'],
    data() {
        return {
            isLoading: false,
            apiGroups: [],
            spec: null,
        };
    },
    mounted() {
        this.isLoading = true;
        this.plugin.xanoManager.onReady(async () => {
            this.apiGroups = this.plugin.xanoManager.getApiGroups();
            await this.refreshSpec();
            this.isLoading = false;
        });
    },
    computed: {
        apiGroupUrl() {
            // Ensure old api group value still match even if base domain has changed
            return this.plugin.xanoManager.fixUrl(this.config.apiGroupUrl);
        },
        api() {
            return {
                endpoint: null,
                headers: [],
                parameters: {},
                body: {},
                ...this.config,
                apiGroupUrl: this.apiGroupUrl,
            };
        },
        endpointValue() {
            if (!this.api.endpoint) return null;
            return `${this.api.endpoint.method}-${this.api.endpoint.path}`;
        },
        apiGroupsOptions() {
            return this.apiGroups.map(apiGroup => ({
                label: apiGroup.name,
                value: apiGroup.api,
            }));
        },
        endpointsOptions() {
            return this.plugin.xanoManager.parseSpecEndpoints(this.spec);
        },
        endpointParameters() {
            return this.plugin.xanoManager.parseSpecEndpointParameters(this.spec, this.api.endpoint);
        },
        endpointBody() {
            return this.plugin.xanoManager.parseSpecEndpointBody(this.spec, this.api.endpoint);
        },
    },
    watch: {
        apiGroupUrl() {
            this.refreshSpec();
        },
    },
    methods: {
        setProp(key, value) {
            this.$emit('update:config', { ...this.api, [key]: value });
        },
        setEndpoint(endpoint) {
            const [method, path] = endpoint.split(/-(.+)/);
            this.setProp('endpoint', { method, path });
        },
        async refreshManager() {
            try {
                this.isLoading = true;
                await this.plugin.xanoManager.init();
                this.apiGroups = this.plugin.xanoManager.getApiGroups();
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        async refreshSpec() {
            if (!this.apiGroupUrl) return;
            try {
                this.isLoading = true;
                this.spec = await this.plugin.xanoManager.fetchApiGroupSpec(this.apiGroupUrl);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>
