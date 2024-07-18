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
                onSave: 'initManager',
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
                channel: 'My channel name',
                type: 'message',
                data: { client: null, action: '', options: {}, payload: null },
            },
            conditions: [
                {
                    name: 'Event type',
                    key: 'type',
                    type: 'TextSelect',
                    options: [
                        { label: 'All events', value: null },
                        { label: 'Connection status', value: 'connection_status' },
                        { label: 'Error', value: 'error' },
                        { label: 'Event', value: 'event' },
                        { label: 'History', value: 'history' },
                        { label: 'Message', value: 'message' },
                        { label: 'Presence full', value: 'presence_full' },
                        { label: 'Presence update', value: 'presence_update' },
                    ],
                },
                {
                    name: 'Channel name',
                    key: 'channel',
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - connection status',
            value: 'realtime:connection_status',
            event: {
                channel: 'My channel name',
                data: { action: 'connection_status', options: {}, payload: { status: 'disconnected' } },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - presence full',
            value: 'realtime:presence_full',
            event: {
                channel: 'My channel name',
                data: {
                    client: null,
                    action: 'presence_full',
                    options: {},
                    payload: {
                        presence: [{ socketId: 'A socket id', extras: {}, permissions: { dbo_id: 0, row_id: 0 } }],
                    },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - presence update',
            value: 'realtime:presence_update',
            event: {
                channel: 'My channel name',
                data: {
                    client: null,
                    action: 'presence_full',
                    options: { channel: '' },
                    payload: {
                        action: 'join',
                        presence: {
                            socketId: 'A socket id',
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
                    type: 'Text',
                },
                {
                    name: 'Event',
                    key: 'event',
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
                channel: 'My channel name',
                data: {
                    action: 'message',
                    options: { authenticated: false, socketId: null, channel: '' },
                    client: { socketId: 'A socket id', extras: {}, permissions: { dbo_id: 0, row_id: 0 } },
                    payload: 'message',
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - event',
            value: 'realtime:event',
            event: {
                channel: 'My channel name',
                data: {
                    action: 'event',
                    options: {},
                    client: null,
                    payload: 'event',
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - history',
            value: 'realtime:history',
            event: {
                channel: 'My channel name',
                data: {
                    action: 'history',
                    options: { channel: '' },
                    client: null,
                    payload: {
                        history: [
                            {
                                action: 'message 1',
                                options: { authenticated: false, socketId: null, channel: '' },
                                client: { socketId: 'A socket id', extras: {}, permissions: { dbo_id: 0, row_id: 0 } },
                                payload: 'message',
                            },
                            {
                                action: 'message 2',
                                options: { authenticated: false, socketId: null, channel: '' },
                                client: { socketId: 'A socket id', extras: {}, permissions: { dbo_id: 0, row_id: 0 } },
                                payload: 'message',
                            },
                        ],
                    },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
                    type: 'Text',
                },
            ],
        },
        {
            label: 'On realtime - error',
            value: 'realtime:error',
            event: {
                channel: 'My channel name',
                data: {
                    action: 'event',
                    options: { channel: '' },
                    client: null,
                    payload: { message: 'error message' },
                },
            },
            conditions: [
                {
                    name: 'Channel name',
                    key: 'channel',
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
            /* wwEditor:end */
        },
        {
            name: 'Request with streaming',
            code: 'requestStreaming',
            parameters: [
                { name: 'apiGroup', type: 'string' },
                { name: 'endpoint', type: 'object' },
                { name: 'parameters', type: 'object' },
            ],
            isAsync: true,
            /* wwEditor:start */
            edit: () => import('./src/components/RequestStreaming.vue'),
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
