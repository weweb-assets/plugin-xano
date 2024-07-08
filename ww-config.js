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
            label: 'On realtime event',
            value: 'realtime',
            event: { channel: '', type: 'message', event: { client: null, action: '', options: {}, payload: null } },
            conditions: [
                {
                    name: 'Type',
                    key: 'type',
                    type: 'TextSelect',
                    options: [
                        { label: 'connection_status', value: 'connection_status' },
                        { label: 'error', value: 'error' },
                        { label: 'event', value: 'event' },
                        { label: 'history', value: 'history' },
                        { label: 'join', value: 'join' },
                        { label: 'leave', value: 'leave' },
                        { label: 'message', value: 'message' },
                        { label: 'presence_full', value: 'presence_full' },
                        { label: 'presence_update', value: 'presence_update' },
                    ],
                },
                {
                    name: 'Channel',
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
