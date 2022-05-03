<template>
    <wwEditorInputRow
        label="Api group"
        type="select"
        placeholder="Select an api group"
        required
        :model-value="api.apiGroupUrl"
        :options="apiGroupsOptions"
        @update:modelValue="setProp('apiGroupUrl', $event)"
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
        bindable
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
        bindable
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
        config: { type: Object, required: true },
    },
    emits: ['update:config'],
    data() {
        return {
            isLoading: false,
            apiGroup: null,
        };
    },
    computed: {
        api() {
            return {
                apiGroupUrl: null,
                endpoint: null,
                parameters: {},
                body: {},
                ...this.config,
            };
        },
        endpointValue() {
            if (!this.api.endpoint) return null;
            return `${this.api.endpoint.method}-${this.api.endpoint.path}`;
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
                        label: `${method} ${path}`,
                        value: `${method}-${path}`,
                    }))
                )
                .flat();
        },
        endpointParameters() {
            if (
                !this.apiGroup ||
                !this.api.endpoint ||
                !this.apiGroup.paths ||
                !this.apiGroup.paths[this.api.endpoint.path] ||
                !this.apiGroup.paths[this.api.endpoint.path][this.api.endpoint.method]
            )
                return [];
            return this.apiGroup.paths[this.api.endpoint.path][this.api.endpoint.method].parameters || [];
        },
        endpointBody() {
            if (
                !this.apiGroup ||
                !this.api.endpoint ||
                !this.apiGroup.paths ||
                !this.apiGroup.paths[this.api.endpoint.path] ||
                !this.apiGroup.paths[this.api.endpoint.path][this.api.endpoint.method] ||
                !this.apiGroup.paths[this.api.endpoint.path][this.api.endpoint.method].requestBody
            )
                return [];

            return Object.keys(
                this.apiGroup.paths[this.api.endpoint.path][this.api.endpoint.method].requestBody.content[
                    'application/json'
                ].schema.properties
            ).map(key => {
                const elem =
                    this.apiGroup.paths[this.api.endpoint.path][this.api.endpoint.method].requestBody.content[
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
        'api.apiGroupUrl': {
            immediate: true,
            async handler() {
                if (!this.api.apiGroupUrl) return;
                try {
                    this.isLoading = true;
                    this.apiGroup = await this.plugin.getApiGroup(this.api.apiGroupUrl);
                } catch (err) {
                    wwLib.wwLog.error(err);
                } finally {
                    this.isLoading = false;
                }
            },
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
    },
};
</script>
