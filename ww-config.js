export default {
    editor: {
        settings: {
            edit: () => import('./src/components/SettingsEdit.vue'),
            summary: () => import('./src/components/SettingsSummary.vue'),
            getIsValid(settings) {
                return !!settings.privateData.apiKey;
            },
        },
        // collection: {
        //     edit: () => import('./src/components/CollectionEdit.vue'),
        //     summary: () => import('./src/components/CollectionSummary.vue'),
        //     getIsValid() {
        //         return false;
        //     },
        // },
    },
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
    ],
};
