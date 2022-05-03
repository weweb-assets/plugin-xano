/* wwEditor:start */
import './components/SettingsEdit.vue';
import './components/SettingsSummary.vue';
import './components/CollectionEdit.vue';
import './components/CollectionSummary.vue';
import './components/Request.vue';
/* wwEditor:end */

export default {
    instances: null,
    instance: null,
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async onLoad(settings) {
        /* wwEditor:start */
        await this.fetchInstances(settings.privateData.apiKey);
        await this.fetchInstance(settings.privateData.apiKey, settings.privateData.instanceId);
        /* wwEditor:end */
    },
    /*=============================================m_ÔÔ_m=============================================\
        Collection API
    \================================================================================================*/
    /* wwEditor:start */
    async fetchCollection(collection) {
        if (collection.mode === 'dynamic') {
            try {
                const { data } = await this.request(collection.config);
                return { data, error: null };
            } catch (err) {
                return {
                    error: Object.getOwnPropertyNames(err).reduce((obj, key) => ({ ...obj, [key]: err[key] }), {}),
                };
            }
        } else {
            return { data: null, error: null };
        }
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Xano API
    \================================================================================================*/
    async request({ apiGroupUrl, endpoint, parameters, body }, wwUtils) {
        const token = wwLib.wwPlugins.xanoAuth && wwLib.wwPlugins.xanoAuth.accessToken;
        let url = endpoint.path;
        for (const key in parameters) url = url.replace(`{${key}}`, parameters[key]);
        /* wwEditor:start */
        if (wwUtils) {
            wwUtils.log({ label: 'Endpoint', preview: `${endpoint.method.toUpperCase()} - ${url}` });
            wwUtils.log({ label: 'Payload', preview: body });
        }
        /* wwEditor:end */
        return await axios({
            method: endpoint.method,
            baseURL: apiGroupUrl,
            url,
            data: body,
            headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
    },
    /* wwEditor:start */
    async fetchInstances(apiKey) {
        if (!apiKey && !this.settings.privateData.apiKey) return;

        const { data: instances } = await axios.get('https://app.xano.com/api:developer/instance', {
            headers: { Authorization: `Bearer ${apiKey || this.settings.privateData.apiKey}` },
        });

        this.instances = instances;
        return instances;
    },
    async fetchInstance(apiKey, instanceId) {
        if (!apiKey && !this.settings.privateData.apiKey) return;
        if (!instanceId && !this.settings.privateData.instanceId) return;
        if (!this.instances) return;

        const instance = this.instances.find(
            instance => `${instance.id}` === (instanceId || this.settings.privateData.instanceId)
        );
        if (!instance) return;

        const {
            data: { authToken, origin },
        } = await axios.get(instance.tokenUrl, {
            headers: { Authorization: `Bearer ${apiKey || this.settings.privateData.apiKey}` },
        });

        const { data: workspaces } = await axios.get(`${origin}/api:developer/workspace?type=json`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        this.instance = workspaces;
        return this.instance;
    },
    async getApiGroup(apiGroupUrl) {
        if (!this.instance || !apiGroupUrl) return;

        const apiGroup = this.instance
            .map(({ apigroups }) => apigroups)
            .flat()
            .find(apiGroup => apiGroup.api === apiGroupUrl);
        if (!apiGroup) return;

        const { data } = await axios.get(apiGroup.swaggerspec, {
            headers: { Authorization: `Bearer ${this.settings.privateData.apiKey}` },
        });

        return data;
    },
    /* wwEditor:end */
};
