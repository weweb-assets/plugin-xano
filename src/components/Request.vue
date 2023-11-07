<template>
    <div class="flex items-center">
        <div class="w-100 -full">
            <wwEditorFormRow label="Content type">
                <wwEditorInputTextSelect
                    :options="dataTypeOptions"
                    :model-value="dataType"
                    @update:modelValue="setDataType"
                />
            </wwEditorFormRow>
        </div>
    </div>
    <div class="flex items-center">
        <div class="w-100 -full">
            <wwEditorInputRow
                label="Api group"
                type="select"
                placeholder="Select an api group"
                required
                :model-value="apiGroupUrl"
                :options="apiGroupsOptions"
                @update:modelValue="setApiGroupUrl"
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
            :disabled="!apiGroupUrl"
        >
            refresh
        </button>
    </div>
    <wwEditorInputRow
        label="Headers"
        type="array"
        :model-value="headers"
        bindable
        @update:modelValue="setHeaders"
        @add-item="setHeaders([...(headers || []), {}])"
    >
        <template #default="{ item, setItem }">
            <wwEditorInputRow
                type="query"
                :model-value="item.key"
                label="Key"
                placeholder="Enter a value"
                bindable
                small
                @update:modelValue="setItem({ ...item, key: $event })"
            />
            <wwEditorInputRow
                type="query"
                :model-value="item.value"
                label="Value"
                placeholder="Enter a value"
                bindable
                small
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
        bindable
        :binding-validation="parameter.bindingValidation"
        :required="parameter.required"
        :model-value="parameters[parameter.name]"
        @update:modelValue="setParameters({ ...parameters, [parameter.name]: $event })"
    />
    <wwEditorFormRow v-for="(key, index) in legacyEndpointParameters" :key="index" :label="key">
        <template #append-label>
            <div class="flex items-center justify-end w-full body-3 text-red-500">
                This parameter doesn't exist anymore
                <button
                    type="button"
                    class="ww-editor-button -icon -small -tertiary -red ml-1"
                    @click="removeParam([key])"
                >
                    <wwEditorIcon small name="trash" />
                </button>
            </div>
        </template>
        <wwEditorInputRow type="query" bindable :model-value="parameters[key]" />
    </wwEditorFormRow>
    <wwEditorInputRow
        v-if="endpointBody.length"
        label="Body fields"
        type="select"
        required
        multiple
        :options="bodyFieldOptions"
        :model-value="bodyFields"
        placeholder="All body fields"
        @update:modelValue="setBodyFields"
    />
    <wwEditorInputRow
        v-for="(elem, index) in endpointBodyFiltered"
        :key="index"
        :label="elem.name"
        :type="elem.type || 'string'"
        placeholder="Enter a value"
        bindable
        :binding-validation="elem.bindingValidation"
        :required="elem.required"
        :model-value="body[elem.name]"
        @update:modelValue="setBody({ ...body, [elem.name]: $event })"
    />
    <wwEditorFormRow v-for="(key, index) in legacyEndpointBody" :key="index" :label="key">
        <template #append-label>
            <div class="flex items-center justify-end w-full body-3 text-red-500">
                This field doesn't exist anymore
                <button
                    type="button"
                    class="ww-editor-button -icon -small -tertiary -red ml-1"
                    @click="removeBody([key])"
                >
                    <wwEditorIcon small name="trash" />
                </button>
            </div>
        </template>
        <wwEditorInputRow
            type="query"
            bindable
            :model-value="body[key]"
            @update:modelValue="setBody({ ...body, [key]: $event })"
        />
    </wwEditorFormRow>
    <wwLoader :loading="isLoading" />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, default: () => {} },
    },
    emits: ['update:args'],
    data() {
        return {
            isLoading: false,
            spec: null,
            apiGroups: [],
            dataTypeOptions: [
                { label: 'Default (application/json)', value: 'application/json', default: true },
                { label: 'application/x-www-form-urlencoded', value: 'application/x-www-form-urlencoded' },
                { label: 'application/javascript', value: 'application/javascript' },
                { label: 'application/xml', value: 'application/xml' },
                { label: 'multipart/form-data', value: 'multipart/form-data' },
                { label: 'text/plain', value: 'text/plain' },
                { label: 'text/html', value: 'text/html' },
            ],
        };
    },
    mounted() {
        if (this.plugin.xanoManager.hasFailed()) {
            wwLib.wwNotification.open({
                text: 'Failed to init Xano, please ensure your API key has the permission required.',
                color: 'red',
            });
            return;
        }
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
            return this.plugin.xanoManager.fixUrl(this.args.apiGroupUrl);
        },
        endpoint() {
            return this.args.endpoint;
        },
        endpointValue() {
            if (!this.endpoint) return null;
            return `${this.endpoint.method}-${this.endpoint.path}`;
        },
        dataType() {
            return this.args.dataType || null;
        },
        headers() {
            return this.args.headers || [];
        },
        parameters() {
            return this.args.parameters || {};
        },
        bodyFields() {
            return this.args.bodyFields;
        },
        body() {
            return this.args.body || {};
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
            return this.plugin.xanoManager.parseSpecEndpointParameters(this.spec, this.endpoint);
        },
        legacyEndpointParameters() {
            const fields = this.endpointParameters.map(field => field.name);
            return Object.keys(this.parameters).filter(key => !fields.includes(key));
        },
        endpointBody() {
            return this.plugin.xanoManager.parseSpecEndpointBody(this.spec, this.endpoint);
        },
        endpointBodyFiltered() {
            return this.endpointBody.filter(
                item => !this.bodyFields || !this.bodyFields.length || this.bodyFields.includes(item.name)
            );
        },
        legacyEndpointBody() {
            const fields = this.endpointBody.map(field => field.name);
            return Object.keys(this.body).filter(key => !fields.includes(key));
        },
        bodyFieldOptions() {
            return this.endpointBody.map(item => ({ label: item.name, value: item.name }));
        },
    },
    watch: {
        apiGroupUrl() {
            this.refreshSpec();
        },
    },
    methods: {
        setApiGroupUrl(apiGroupUrl) {
            this.$emit('update:args', {
                ...this.args,
                parameters: {},
                body: {},
                bodyFields: [],
                endpoint: null,
                apiGroupUrl,
                dataType: null,
            });
        },
        setEndpoint(endpoint) {
            const [method, path] = endpoint.split(/-(.+)/);
            this.$emit('update:args', {
                ...this.args,
                parameters: {},
                body: {},
                bodyFields: [],
                endpoint: { method, path },
            });
        },
        setHeaders(headers) {
            this.$emit('update:args', { ...this.args, headers });
        },
        setParameters(parameters) {
            this.$emit('update:args', { ...this.args, parameters });
        },
        setBody(body) {
            this.$emit('update:args', { ...this.args, body });
        },
        setBodyFields(bodyFields) {
            this.$emit('update:args', { ...this.args, bodyFields });
            this.$nextTick(() => this.removeBody(this.legacyEndpointBody));
        },
        setDataType(dataType) {
            this.$emit('update:args', { ...this.args, dataType });
        },
        removeParam(keys) {
            const parameters = { ...this.parameters };
            for (const key of keys) {
                delete parameters[key];
            }
            this.setParameters({ ...parameters });
        },
        removeBody(keys) {
            const body = { ...this.body };
            for (const key of keys) {
                delete body[key];
            }
            this.setBody({ ...body });
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
