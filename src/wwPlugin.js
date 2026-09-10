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
import './components/RealtimeOpenChannel.vue';
import './components/RealtimeCloseChannel.vue';
import './components/RealtimeSendMessage.vue';
import './components/RealtimeGetPresence.vue';
import './components/RealtimeRequestHistory.vue';

import DevApi from './api/developer.class';
import MetaApi from './api/metadata.class';
/* wwEditor:end */

import { XanoClient } from '@xano/js-sdk';

export default {
    xanoManager: null,
    xanoClient: null,
    channels: {},
    fullSpec: [],
    /*=============================================m_ÔÔ_m=============================================\
        Plugin API
    \================================================================================================*/
    async _onLoad(settings) {
        this.init(settings);
    },
    async init(settings) {
        /* wwEditor:start */
        await this.initManager(settings);
        /* wwEditor:end */
        this.xanoClient = new XanoClient({
            instanceBaseUrl: 'https://' + (settings.publicData.customDomain || settings.publicData.domain),
            realtimeConnectionHash: settings.publicData.realtimeConnectionHash,
            customAxiosRequestConfig: {
                withCredentials: settings.publicData.withCredentials,
            },
        });
        if (wwLib.wwPlugins.xanoAuth?.accessToken) {
            this.xanoClient.setAuthToken(wwLib.wwPlugins.xanoAuth.accessToken);
            this.xanoClient.setRealtimeAuthToken(wwLib.wwPlugins.xanoAuth.accessToken);
            this.xanoClient.realtimeReconnect();
        }
    },
    /*=============================================m_ÔÔ_m=============================================\
        Editor API
    \================================================================================================*/
    /* wwEditor:start */
    _getCopilotContext() {
        return {
            apiDoc: formatSpec(this.fullSpec),
        };
    },
    async initManager(settings) {
        this.xanoManager = this.createManager(settings);
        try {
            await this.xanoManager.init();
            this.fullSpec = await this.xanoManager.fetchFullSpec();
        } catch (error) {
            wwLib.wwNotification.open({
                text: 'Failed to init Xano, please ensure your API key has the permission required.',
                color: 'red',
            });
            wwLib.wwLog.error(error);
            throw error;
        }
    },
    createManager(settings) {
        const XanoManager = settings.privateData.metaApiKey ? MetaApi : DevApi;
        return new XanoManager(
            settings.privateData.metaApiKey || settings.privateData.apiKey,
            settings.privateData.instanceId,
            settings.privateData.workspaceId,
            getCurrentBranch(),
            settings.publicData.customDomain
        );
    },
    updateBranch() {
        this.xanoManager.changeBranch(getCurrentBranch());
    },
    /* wwEditor:end */
    /*=============================================m_ÔÔ_m=============================================\
        Collection API
    \================================================================================================*/
    async _fetchCollection(collection) {
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
    async request(
        { apiGroupUrl, endpoint, headers, withCredentials, parameters, body, dataType, useStreaming, streamVariableId },
        wwUtils
    ) {
        const authToken = wwLib.wwPlugins.xanoAuth && wwLib.wwPlugins.xanoAuth.accessToken;

        let path = endpoint.path;
        for (const key in parameters) path = path.replace(`{${key}}`, parameters[key]);

        /* wwEditor:start */
        wwUtils?.log('info', `[Xano] Requesting ${endpoint.method.toUpperCase()} - ${path}`, {
            type: 'request',
            preview: { headers, parameters, body },
        });
        /* wwEditor:end */

        if (useStreaming || dataType === 'text/event-stream') {
            try {
                await this.xanoClient.request({
                    endpoint: this.resolveUrl(apiGroupUrl) + path,
                    method: endpoint.method,
                    urlParams: parameters,
                    bodyParams: endpoint.method === 'get' ? null : body,
                    headerParams: buildXanoHeaders({ dataType }, headers),
                    streamingCallback: response => {
                        // Parse JSON strings into objects
                        let parsedData = response?.data;
                        if (typeof response?.data === 'string') {
                            try {
                                parsedData = JSON.parse(response.data);
                            } catch (error) {
                                // Keep original string if parsing fails
                            }
                        }

                        const currentValue = wwLib.wwVariable.getValue(streamVariableId) || [];
                        const newValue = [...currentValue, parsedData];
                        
                        wwLib.wwVariable.updateValue(streamVariableId, newValue);
                    },
                });

                return wwLib.wwVariable.getValue(streamVariableId);
            } catch (error) {
                throw error.getResponse
                    ? {
                          name: error.name,
                          stack: error.stack,
                          message: error.message,
                          response: {
                              status: error?.getResponse()?.status,
                          },
                      }
                    : error;
            }
        }

        return await axios({
            method: endpoint.method,
            baseURL: this.resolveUrl(apiGroupUrl),
            url: path,
            params: parameters,
            data: body,
            headers: buildXanoHeaders({ authToken, dataType }, headers),
            withCredentials: this.settings.publicData.withCredentials || withCredentials,
        });
    },
    openRealtimeChannel({ channel, presence = false, history = false, queueOfflineActions = true }) {
        if (this.channels[channel]) this.closeRealtimeChannel({ channel });
        this.channels[channel] = this.xanoClient.channel(channel, {
            presence,
            history,
            queueOfflineActions,
        });
        this.channels[channel].on(
            event => {
                wwLib.wwWorkflow.executeTrigger(this.id + '-realtime', {
                    event: { channel, type: event.action, data: event },
                    conditions: { type: event.action, channel },
                });
                wwLib.wwWorkflow.executeTrigger(this.id + '-realtime:' + event.action, {
                    event: { channel, data: event },
                    conditions: { channel },
                });
            },
            event => {
                wwLib.wwWorkflow.executeTrigger(this.id + '-realtime', {
                    event: { channel, type: event.action, data: event },
                    conditions: { type: event.action, channel },
                });
                wwLib.wwWorkflow.executeTrigger(this.id + '-realtime:error', {
                    event: { channel, data: event },
                    conditions: { channel },
                });
            }
        );
    },
    closeRealtimeChannel({ channel }) {
        if (!this.channels[channel]) return;
        this.channels[channel].destroy();
        this.channels[channel] = null;
    },
    getRealtimePresence({ channel }) {
        if (!this.channels[channel])
            throw new Error(`Channel ${channel} is not registered. Please open the channel first.`);
        return this.channels[channel].getPresence();
    },
    requestRealtimeHistory({ channel }) {
        if (!this.channels[channel])
            throw new Error(`Channel ${channel} is not registered. Please open the channel first.`);
        return this.channels[channel].history();
    },
    sendRealtimeMessage({ channel, message, audience = 'public', socketId = null }) {
        if (!this.channels[channel])
            throw new Error(`Channel ${channel} is not registered. Please open the channel first.`);
        this.channels[channel].message(message, { authenticated: audience === 'authenticated', socketId });
    },
    // Ensure everything use the same base domain
    resolveUrl(url) {
        if (!url) return null;
        const _url = new URL(url);
        _url.hostname = this.settings.publicData.customDomain || this.settings.publicData.domain || _url.hostname;

        return _url.href;
    },
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

function formatSpec(fullSpec) {
    return fullSpec.map(spec => {
        const result = {
            apiGroupName: spec.info.title,
            apiGroupUrl: spec.servers[0].url,
            endpoints: {},
        };

        // Process all paths
        for (const [path, methods] of Object.entries(spec.paths)) {
            for (const [method, details] of Object.entries(methods)) {
                const endpointKey = `${method}${path.replace(/\//g, '_')}`;

                // Create endpoint info
                const endpoint = {
                    apiGroupUrl: spec.servers[0].url,
                    path,
                    method,
                    requiresAuth: details.security?.length > 0,
                    summary: details.summary,
                };

                // Add path parameters if any
                if (details.parameters?.length) {
                    endpoint.pathParams = details.parameters
                        .filter(p => p.in === 'path')
                        .map(p => ({
                            name: p.name,
                            type: p.schema.type,
                            required: p.required,
                        }));
                }

                // Add query parameters if any
                if (details.parameters?.length) {
                    endpoint.queryParams = details.parameters
                        .filter(p => p.in === 'query')
                        .map(p => ({
                            name: p.name,
                            type: p.schema.type,
                            required: p.required,
                        }));
                }

                // Add request body if exists
                const requestBody = details.requestBody?.content['application/json']?.schema;
                if (requestBody) {
                    endpoint.requestSchema = {
                        type: requestBody.type,
                        properties: Object.entries(requestBody.properties).map(([key, value]) => ({
                            name: key,
                            type: value.type,
                            description: value.description,
                            enum: value.enum,
                            required: requestBody.required?.includes(key),
                        })),
                    };
                }

                // Add response schema if exists
                const responseSchema = details.responses['200']?.content['application/json']?.schema;
                if (responseSchema) {
                    endpoint.responseSchema = {
                        type: responseSchema.type,
                        properties:
                            responseSchema.type === 'array'
                                ? responseSchema.items.properties
                                : responseSchema.properties,
                    };
                }

                result.endpoints[endpointKey] = endpoint;
            }
        }

        return result;
    });
}
