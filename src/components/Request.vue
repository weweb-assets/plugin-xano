<template>
    <wwEditorInputRow
        label="Api group"
        type="select"
        placeholder="Select an api group"
        required
        :model-value="apiGroupId"
        :options="apiGroupsOptions"
        @update:modelValue="setApiGroupId"
    />
    <wwEditorInputRow
        label="Endpoint"
        type="select"
        placeholder="Select an endpoint"
        required
        :model-value="endpointValue"
        :options="endpointsOptions"
        @update:modelValue="setEndpoint"
    />
    <wwEditorInputRow
        v-for="(parameter, index) in endpointParameters"
        :key="index"
        :label="parameter.name"
        type="query"
        placeholder="Enter a value"
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
        apiGroupId() {
            return this.args.apiGroupId;
        },
        endpoint() {
            return this.args.endpoint;
        },
        endpointValue() {
            if (!this.endpoint) return null;
            return `${this.endpoint.method}-${this.endpoint.path}`;
        },
        parameters() {
            return this.args.parameters;
        },
        body() {
            return this.args.body;
        },
        apiGroupsOptions() {
            if (!this.plugin.instance) return [];
            return this.plugin.instance
                .map(workspace =>
                    workspace.apigroups.map(apiGroup => ({
                        label: apiGroup.name,
                        value: `${apiGroup.id}`,
                    }))
                )
                .flat();
        },
        endpointsOptions() {
            if (!this.apiGroup) return [];
            return Object.keys(this.apiGroup.paths)
                .map(path =>
                    Object.keys(this.apiGroup.paths[path]).map(method => ({
                        label: this.apiGroup.paths[path][method].summary || `${method} ${path}`,
                        value: `${method}-${path}`,
                    }))
                )
                .flat();
        },
        endpointParameters() {
            if (!this.apiGroup || !this.endpoint) return [];
            return this.apiGroup.paths[this.endpoint.path][this.endpoint.method].parameters;
        },
        endpointBody() {
            if (
                !this.apiGroup ||
                !this.endpoint ||
                !this.apiGroup.paths[this.endpoint.path][this.endpoint.method].requestBody
            )
                return [];

            return Object.keys(
                this.apiGroup.paths[this.endpoint.path][this.endpoint.method].requestBody.content['application/json']
                    .schema.properties
            ).map(key => {
                const elem =
                    this.apiGroup.paths[this.endpoint.path][this.endpoint.method].requestBody.content[
                        'application/json'
                    ].schema.properties[key];
                return {
                    name: key,
                    type: elem.type === 'string' ? 'query' : elem.type,
                    required: elem.required,
                };
            });
        },
    },
    watch: {
        apiGroupId: {
            immediate: true,
            async handler() {
                if (!this.apiGroupId) return;
                try {
                    this.isLoading = true;
                    this.apiGroup = await this.plugin.getApiGroup(this.apiGroupId);
                } catch (err) {
                    wwLib.wwLog.error(err);
                } finally {
                    this.isLoading = false;
                }
            },
        },
    },
    methods: {
        setApiGroupId(apiGroupId) {
            this.$emit('update:args', [apiGroupId, this.endpoint, this.parameters, this.body]);
        },
        setEndpoint(endpoint) {
            const [method, path] = endpoint.split(/-(.+)/);
            this.$emit('update:args', [this.apiGroupId, { path, method }, this.parameters, this.body]);
        },
        setParameters(parameters) {
            this.$emit('update:args', [this.apiGroupId, this.endpoint, parameters, this.body]);
        },
        setBody(body) {
            this.$emit('update:args', [this.apiGroupId, this.endpoint, this.parameters, body]);
        },
    },
};
</script>
