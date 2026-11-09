export default {
    features: {
        datasource: true,
    },
    editor: {
        settings: [
            {
                edit: () => import('./src/components/SettingsEdit.vue'),
                summary: () => import('./src/components/SettingsSummary.vue'),
                getIsValid(settings) {
                    return (
                        (settings.privateData.metaApiKey || settings.privateData.apiKey) &&
                        !!settings.privateData.instanceId &&
                        (!settings.publicData.customDomain || !settings.publicData.customDomain.includes('http'))
                    );
                },
                onSave: 'init',
            },
            {
                label: 'Data Source',
                edit: () => import('./src/components/DataSource/SettingsEdit.vue'),
                summary: () => import('./src/components/DataSource/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
            },
            {
                label: 'Branching',
                edit: () => import('./src/components/Branching/SettingsEdit.vue'),
                summary: () => import('./src/components/Branching/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
                onSave: 'updateBranch',
            },
            {
                label: 'Global Headers',
                edit: () => import('./src/components/GlobalHeaders/SettingsEdit.vue'),
                summary: () => import('./src/components/GlobalHeaders/SettingsSummary.vue'),
                getIsValid() {
                    return true;
                },
            },
        ],
        collection: {
            edit: () => import('./src/components/CollectionEdit.vue'),
            summary: () => import('./src/components/CollectionSummary.vue'),
            getIsValid({ apiGroupUrl, endpoint }) {
                return !!apiGroupUrl && !!endpoint;
            },
        },
    },
    triggers: [
        {
            label: 'On realtime - All events',
            value: 'realtime',
            event: {
                channel: '<channel-name>',
                type: 'message',
                data: { client: null, action: '', options: {}, payload: null },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - connection status',
            value: 'realtime:connection_status',
            event: {
                channel: '<channel-name>',
                data: { action: 'connection_status', options: {}, payload: { status: 'disconnected' } },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - presence full',
            value: 'realtime:presence_full',
            event: {
                channel: '<channel-name>',
                data: {
                    client: null,
                    action: 'presence_full',
                    options: {},
                    payload: {
                        presence: [{ socketId: '<socket-id>', extras: {}, permissions: { dbo_id: 0, row_id: 0 } }],
                    },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - presence update',
            value: 'realtime:presence_update',
            event: {
                channel: '<channel-name>',
                data: {
                    client: null,
                    action: 'presence_full',
                    options: { channel: '<channel-name>' },
                    payload: {
                        action: 'join',
                        presence: {
                            socketId: '<socket-id>',
                            extras: {},
                            permissions: { dbo_id: 0, row_id: 0 },
                        },
                    },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
                {
                    name: 'Event type',
                    key: 'event',
                    placeholder: 'Default: All events',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'An event type as a string (join | leave)',
                    },
                    type: 'TextSelect',
                    options: [
                        { label: 'All events', value: null },
                        { label: 'Join', value: 'join' },
                        { label: 'Leave', value: 'leave' },
                    ],
                },
            ],
        },
        {
            label: 'On realtime - message',
            value: 'realtime:message',
            event: {
                channel: '<channel-name>',
                data: {
                    action: 'message',
                    options: { authenticated: false, socketId: null, channel: '' },
                    client: { socketId: '<socket-id>', extras: {}, permissions: { dbo_id: 0, row_id: 0 } },
                    payload: '<message>',
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - event',
            value: 'realtime:event',
            event: {
                channel: '<channel-name>',
                data: {
                    action: 'event',
                    options: {
                        channel: '<channel-name>',
                    },
                    client: null,
                    payload: {
                        data: '<event-data>',
                        dbo_id: 0,
                        row_id: 0,
                    },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - history',
            value: 'realtime:history',
            event: {
                channel: '<channel-name>',
                data: {
                    action: 'history',
                    options: { channel: '' },
                    client: null,
                    payload: {
                        history: [
                            {
                                action: 'message 1',
                                options: { authenticated: false, socketId: null, channel: '' },
                                client: { socketId: '<socket-id>', extras: {}, permissions: { dbo_id: 0, row_id: 0 } },
                                payload: '<message>',
                            },
                            {
                                action: 'message 2',
                                options: { authenticated: false, socketId: null, channel: '' },
                                client: { socketId: '<socket-id>', extras: {}, permissions: { dbo_id: 0, row_id: 0 } },
                                payload: '<message>',
                            },
                        ],
                    },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - error',
            value: 'realtime:error',
            event: {
                channel: '<channel-name>',
                data: {
                    action: 'event',
                    options: { channel: '<channel-name>' },
                    client: null,
                    payload: { message: '<error-message>' },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    placeholder: 'Default: All channels',
                    bindingValidation: {
                        type: 'string',
                        tooltip: 'A channel name as a string',
                    },
                    type: 'Text',
                },
            ],
        },
    ],
    actions: [
        {
            name: 'Request',
            code: 'request',
            parameters: [
                { name: 'apiGroup', type: 'string' },
                { name: 'endpoint', type: 'object' },
                { name: 'parameters', type: 'object' },
                { name: 'body', type: 'object' },
            ],
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/Request.vue'),
            copilot: {
                description: "Make a request to a Xano API endpoint",
                returns: "Promise<object>",
                schema: {
                    apiGroupUrl: {
                        type: "string",
                        description: "The base URL of the API group",
                        bindable: true
                    },
                    endpoint: {
                        type: "object",
                        description: "The endpoint configuration containing method and path",
                        bindable: false
                    },
                    headers: {
                        type: "array",
                        description: "Custom headers to send with the request",
                        bindable: true
                    },
                    parameters: {
                        type: "object", 
                        description: "URL parameters to include in the request",
                        bindable: true
                    },
                    body: {
                        type: "object",
                        description: "Request body data",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Open channel',
            code: 'openRealtimeChannel',
            parameters: [{ name: 'channel' }, { name: 'presence', type: 'boolean' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeOpenChannel.vue'),
            copilot: {
                description: "Opens a realtime channel connection",
                returns: "void",
                schema: {
                    channel: {
                        type: "string",
                        description: "The name of the channel to open",
                        bindable: true
                    },
                    presence: {
                        type: "boolean",
                        description: "Whether to enable presence detection",
                        bindable: true
                    },
                    history: {
                        type: "boolean",
                        description: "Whether to fetch message history on join",
                        bindable: true
                    },
                    queueOfflineActions: {
                        type: "boolean",
                        description: "Whether to queue actions when offline",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Close channel',
            code: 'closeRealtimeChannel',
            parameters: [{ name: 'channel' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeCloseChannel.vue'),
            copilot: {
                description: "Closes an open realtime channel",
                returns: "void", 
                schema: {
                    channel: {
                        type: "string",
                        description: "The name of the channel to close",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Send message',
            code: 'sendRealtimeMessage',
            parameters: [{ name: 'channel' }, { name: 'message' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeSendMessage.vue'),
            copilot: {
                description: "Sends a message through a realtime channel",
                returns: "void",
                schema: {
                    channel: {
                        type: "string", 
                        description: "The channel to send the message to",
                        bindable: true
                    },
                    message: {
                        type: "any",
                        description: "The message content to send",
                        bindable: true
                    },
                    audience: {
                        type: "string",
                        description: "The target audience (public/authenticated/private)",
                        bindable: true
                    },
                    socketId: {
                        type: "string",
                        description: "The specific socket ID for private messages",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Get presence',
            code: 'getRealtimePresence',
            parameters: [{ name: 'channel' }, { name: 'message' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeGetPresence.vue'),
            copilot: {
                description: "Gets the presence information for a channel",
                returns: "object",
                schema: {
                    channel: {
                        type: "string",
                        description: "The channel to get presence information for",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Request history',
            code: 'requestRealtimeHistory',
            parameters: [{ name: 'channel' }, { name: 'message' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeRequestHistory.vue'),
            copilot: {
                description: "Requests message history for a channel",
                returns: "void",
                schema: {
                    channel: {
                        type: "string",
                        description: "The channel to request history for",
                        bindable: true
                    }
                }
            },
            /* wwEditor:end */
        },
    ],
};