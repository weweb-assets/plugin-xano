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
        <button type="button" class="ww-editor-button -small -primary ml-2 mt-3" @click="refreshInstance">
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
            @click="refreshApiGroup"
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
        :required="parameter.required"
        :model-value="parameters[parameter.name]"
        @update:modelValue="setParameters({ ...parameters, [parameter.name]: $event })"
    />
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
        :required="elem.required"
        :model-value="body[elem.name]"
        @update:modelValue="setBody({ ...body, [elem.name]: $event })"
    />
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
            apiGroup: null,
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
    computed: {
        apiGroupUrl() {
            if (!this.args.apiGroupUrl) return null;
            // Ensure old api group value still match even if base domain has changed
            return this.plugin.resolveUrl(this.args.apiGroupUrl);
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
            if (!this.plugin.instance) return [];
            return this.plugin.instance
                .map(workspace =>
                    workspace.apigroups.map(apiGroup => ({
                        label: `${workspace.name} - ${apiGroup.name}`,
                        value: this.plugin.resolveUrl(apiGroup.api),
                    }))
                )
                .flat();
        },
        endpointsOptions() {
            if (!this.apiGroup) return [];
            return Object.keys(this.apiGroup.paths)
                .map(path =>
                    Object.keys(this.apiGroup.paths[path]).map(method => ({
                        label: `${method.toUpperCase()} ${path}`,
                        value: `${method}-${path}`,
                    }))
                )
                .flat();
        },
        endpointParameters() {
            if (
                !this.apiGroup ||
                !this.endpoint ||
                !this.apiGroup.paths ||
                !this.apiGroup.paths[this.endpoint.path] ||
                !this.apiGroup.paths[this.endpoint.path][this.endpoint.method]
            )
                return [];
            return this.apiGroup.paths[this.endpoint.path][this.endpoint.method].parameters || [];
        },
        endpointBody() {
            if (
                !this.apiGroup ||
                !this.endpoint ||
                !this.apiGroup.paths ||
                !this.apiGroup.paths[this.endpoint.path] ||
                !this.apiGroup.paths[this.endpoint.path][this.endpoint.method] ||
                !this.apiGroup.paths[this.endpoint.path][this.endpoint.method].requestBody
            )
                return [];

            const endpoint =
                this.apiGroup.paths[this.endpoint.path][this.endpoint.method].requestBody.content['application/json'] ||
                this.apiGroup.paths[this.endpoint.path][this.endpoint.method].requestBody.content[
                    'multipart/form-data'
                ];

            return Object.keys(endpoint.schema.properties).map(key => {
                const elem = endpoint.schema.properties[key];
                return {
                    name: key,
                    type: elem.type === 'string' ? 'query' : elem.type,
                    required: elem.required,
                };
            });
        },
        endpointBodyFiltered() {
            return this.endpointBody.filter(
                item => !this.bodyFields || !this.bodyFields.length || this.bodyFields.includes(item.name)
            );
        },
        bodyFieldOptions() {
            return this.endpointBody.map(item => ({ label: item.name, value: item.name }));
        },
    },
    watch: {
        apiGroupUrl: {
            immediate: true,
            async handler() {
                await this.refreshApiGroup();
            },
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
            for (const bodyKey in body) {
                if (!this.endpointBodyFiltered.find(field => field.name === bodyKey)) {
                    delete body[bodyKey];
                }
            }
            for (const field of this.endpointBodyFiltered) {
                body[field.name] = body[field.name] || null;
            }
            this.$emit('update:args', { ...this.args, body });
        },
        setBodyFields(bodyFields) {
            this.$emit('update:args', { ...this.args, bodyFields });
            this.$nextTick(() => this.setBody({ ...this.body }));
        },
        setDataType(dataType) {
            this.$emit('update:args', { ...this.args, dataType });
        },
        async refreshInstance() {
            try {
                this.isLoading = true;
                await this.plugin.fetchInstances();
                await this.plugin.fetchInstance();
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
        async refreshApiGroup() {
            if (!this.apiGroupUrl) return;
            try {
                this.isLoading = true;
                this.apiGroup = await this.plugin.getApiGroup(this.apiGroupUrl);
            } catch (err) {
                wwLib.wwLog.error(err);
            } finally {
                this.isLoading = false;
            }
        },
    },
};
</script>
