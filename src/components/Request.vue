<template>
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
        v-for="(elem, index) in endpointBody"
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
        };
    },
    computed: {
        apiGroupUrl() {
            return this.args.apiGroupUrl;
        },
        endpoint() {
            return this.args.endpoint;
        },
        endpointValue() {
            if (!this.endpoint) return null;
            return `${this.endpoint.method}-${this.endpoint.path}`;
        },
        parameters() {
            return this.args.parameters || {};
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
                        value: apiGroup.api,
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
            this.$emit('update:args', { ...this.args, parameters: {}, body: {}, endpoint: null, apiGroupUrl });
        },
        setEndpoint(endpoint) {
            const [method, path] = endpoint.split(/-(.+)/);
            this.$emit('update:args', { ...this.args, parameters: {}, body: {}, endpoint: { method, path } });
        },
        setParameters(parameters) {
            this.$emit('update:args', { ...this.args, parameters });
        },
        setBody(body) {
            this.$emit('update:args', { ...this.args, body });
        },
        async refreshInstance() {
            try {
                this.isLoading = true;
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
