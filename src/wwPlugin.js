/* wwEditor:start */
import './components/SettingsEdit.vue';
import './components/SettingsSummary.vue';
// import './components/CollectionEdit.vue';
// import './components/CollectionSummary.vue';
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
    // eslint-disable-next-line no-unused-vars
    async fetchCollection(_collection) {
        return { data: null, error: null };
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Xano API
    \================================================================================================*/
    async request({ endpoint, parameters, body }, wwUtils) {
        /* wwEditor:start */
        if (wwUtils) {
            wwUtils.log({ label: 'Endpoint', preview: `${endpoint.method.toUpperCase()} - ${endpoint.path}` });
            wwUtils.log({ label: 'Payload', preview: { ...parameters, ...body } });
        }
        /* wwEditor:end */
        return await axios({
            method: endpoint.method,
            baseURL: this.settings.publicData.apiUrl,
            url: endpoint.path,
            data: body,
            headers: { Authorization: 'Bearer Token' },
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

        const {
            data: [instanceSpec],
        } = await axios.get(`${origin}/api:developer/workspace?type=json`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        this.instance = instanceSpec;
        return instanceSpec;
    },
    async getApiGroup(apiGroupId) {
        if (!this.instance || !apiGroupId) return;

        const apiGroup = this.instance.apigroups.find(apiGroup => `${apiGroup.id}` === apiGroupId);
        if (!apiGroup) return;

        const { data } = await axios.get(apiGroup.swaggerspec, {
            headers: { Authorization: `Bearer ${this.settings.privateData.apiKey}` },
        });

        return data;
    },
    /* wwEditor:end */
};
