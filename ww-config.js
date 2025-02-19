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
                description:
                    'Make a request to a Xano API endpoint. Can handle both regular REST requests and streaming responses. Automatically includes Xano authentication token if available.',
                returns:
                    'For regular requests: Axios response object containing { data, status, headers, config }. For streaming requests: Array of accumulated stream data accessed through the specified streamVariableId.',
                schema: {
                    apiGroupUrl: {
                        type: 'string',
                        description:
                            'The base URL of the Xano API group (e.g., "https://x8ki-letl-twmt.n7.xano.io/api:abcdef"). CRITICAL: select the correct API group base URL depending of the endpoint you want to use.',
                        bindable: true,
                    },
                    endpoint: {
                        type: 'object',
                        description:
                            'The endpoint configuration object with required properties:\n- method: HTTP method (get, post, put, patch, delete)\n- path: Endpoint path with optional parameter placeholders (e.g., "/users/{userId}")',
                        bindable: true,
                    },
                    headers: {
                        type: 'Array<{key: string, value: string}',
                        description:
                            'Custom headers as key-value pairs, e.g., [{"Content-Type": "application/json"}]. Automatically includes Xano authentication token if available. key and value are bindable individually.',
                        bindable: true,
                    },
                    parameters: {
                        type: 'object',
                        description:
                            'URL parameters object serving two purposes: 1) Replace path placeholders (e.g., {userId} in path), 2) Add query parameters to URL. Example: {"userId": "123", "filter": "active"}. The values are bindable, but not the whole object.',
                        bindable: false,
                    },
                    body: {
                        type: 'object',
                        description:
                            'Request body data. Only used for non-GET requests. Should be a JSON-serializable object. The key values are bindable, but not the whole object. The object cannot be bind, you have to bind individual sub keys. eg. {email: {__wwType: "...", code: "..."}, password:  {__wwType: "...", code: "..."}}',
                        bindable: false,
                    },
                    dataType: {
                        type: 'string',
                        description:
                            'Content type for the request. Set to "text/event-stream" for SSE streaming. Default is "application/json"',
                        bindable: true,
                    },
                    withCredentials: {
                        type: 'boolean',
                        description:
                            'Include credentials (cookies) with the request. Falls back to plugin settings if not specified.',
                        bindable: true,
                    },
                    useStreaming: {
                        type: 'boolean',
                        description:
                            'Enable Server-Sent Events (SSE) streaming mode. When true, responses will be accumulated in the specified streamVariableId.',
                        bindable: true,
                    },
                    streamVariableId: {
                        type: 'string',
                        description:
                            'Required when useStreaming is true. The ID of the variable where streaming responses will be accumulated as an array.',
                        bindable: true,
                    },
                },
            },
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Open channel',
            code: 'openRealtimeChannel',
            parameters: [{ name: 'channel' }, { name: 'presence', type: 'boolean' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeOpenChannel.vue'),
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Close channel',
            code: 'closeRealtimeChannel',
            parameters: [{ name: 'channel' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeCloseChannel.vue'),
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Send message',
            code: 'sendRealtimeMessage',
            parameters: [{ name: 'channel' }, { name: 'message' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeSendMessage.vue'),
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Get presence',
            code: 'getRealtimePresence',
            parameters: [{ name: 'channel' }, { name: 'message' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeGetPresence.vue'),
            /* wwEditor:end */
        },
        {
            name: 'Realtime | Request history',
            code: 'requestRealtimeHistory',
            parameters: [{ name: 'channel' }, { name: 'message' }],
            /* wwEditor:start */
            edit: () => import('./src/components/RealtimeRequestHistory.vue'),
            /* wwEditor:end */
        },
    ],
};
