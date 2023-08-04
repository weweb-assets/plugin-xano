/* wwEditor:start */
import './components/SettingsEdit.vue';
import './components/SettingsSummary.vue';
import './components/CollectionEdit.vue';
import './components/CollectionSummary.vue';
import './components/DataSource/SettingsEdit.vue';
import './components/DataSource/SettingsSummary.vue';
import './components/Branching/SettingsEdit.vue';
import './components/Branching/SettingsSummary.vue';
import './components/GlobalHeaders/SettingsEdit.vue';
import './components/GlobalHeaders/SettingsSummary.vue';
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
    /*=============================================m_ÔÔ_m=============================================\
        Xano API
    \================================================================================================*/
    async request({ apiGroupUrl, endpoint, headers, parameters, body, dataType }, wwUtils) {
        const authToken = wwLib.wwPlugins.xanoAuth && wwLib.wwPlugins.xanoAuth.accessToken;

        let url = endpoint.path;
        for (const key in parameters) url = url.replace(`{${key}}`, parameters[key]);

        /* wwEditor:start */
        if (wwUtils) {
            wwUtils.log({ label: 'Endpoint', preview: `${endpoint.method.toUpperCase()} - ${url}` });
            if (Object.keys(body).length) wwUtils.log({ label: 'Payload', preview: body });
        }
        /* wwEditor:end */

        return await axios({
            method: endpoint.method,
            baseURL: this.resolveUrl(apiGroupUrl),
            url,
            params: parameters,
            data: body,
            headers: buildXanoHeaders({ authToken, dataType }, headers),
            withCredentials: this.settings.publicData.withCredentials || false,
        });
    },
    // Ensure everything use the same base domain
    resolveUrl(url) {
        if (!url) return null;
        const _url = new URL(url);
        _url.hostname = this.settings.publicData.customDomain || this.settings.publicData.domain || _url.hostname;

        return _url.href;
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
            .find(apiGroup => this.resolveUrl(apiGroup.api) === apiGroupUrl);
        if (!apiGroup) return;

        const { data } = await axios.get(apiGroup.swaggerspec, {
            headers: { Authorization: `Bearer ${this.settings.privateData.apiKey}` },
        });

        return data;
    },
    /* wwEditor:end */
};

function getCurrentDataSource() {
    const settings = wwLib.wwPlugins.xano.settings;
    switch (wwLib.globalContext.browser.environment) {
        case 'editor':
            return settings.publicData.xDataSourceEditor;
        case 'preview':
            return settings.publicData.xDataSourceProd;
        case 'staging':
            return settings.publicData.xDataSourceStaging;
        case 'production':
            return settings.publicData.xDataSourceProd;
        default:
            return null;
    }
}

function getCurrentBranch() {
    const settings = wwLib.wwPlugins.xano.settings;
    switch (wwLib.globalContext.browser.environment) {
        case 'editor':
            return settings.publicData.xBranchEditor;
        case 'preview':
            return settings.publicData.xBranchProd;
        case 'staging':
            return settings.publicData.xBranchStaging;
        case 'production':
            return settings.publicData.xBranchProd;
        default:
            return null;
    }
}

function getGlobalHeaders() {
    return wwLib.wwFormula.getValue(wwLib.wwPlugins.xano.settings.publicData.globalHeaders);
}

function buildXanoHeaders(
    {
        xDataSource = getCurrentDataSource(),
        xBranch = getCurrentBranch(),
        authToken,
        dataType,
        globalHeaders = getGlobalHeaders(),
    },
    customHeaders = []
) {
    return {
        ...(xDataSource ? { 'X-Data-Source': xDataSource } : {}),
        ...(xBranch ? { 'X-Branch': xBranch } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(dataType ? { 'Content-Type': dataType } : {}),
        ...(Array.isArray(globalHeaders) ? globalHeaders : [])
            .filter(header => !!header && !!header.key)
            .reduce((curr, next) => ({ ...curr, [next.key]: next.value }), {}),
        ...(Array.isArray(customHeaders) ? customHeaders : [])
            .filter(header => !!header && !!header.key)
            .reduce((curr, next) => ({ ...curr, [next.key]: next.value }), {}),
    };
}
