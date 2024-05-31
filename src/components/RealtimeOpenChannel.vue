<template>
    <wwEditorInputRow
        type="query"
        label="Channel"
        placeholder="Channel name"
        bindable
        small
        :model-value="channel"
        @update:modelValue="setChannel"
    />
    <wwEditorInputRow
        type="onoff"
        label="Listen to presence"
        bindable
        small
        :model-value="presence"
        @update:modelValue="setPresence"
    />
    <wwEditorInputRow
        type="onoff"
        label="Get history on join"
        bindable
        small
        :model-value="history"
        @update:modelValue="setHistory"
    />
    <wwEditorInputRow
        type="onoff"
        label="Queue offline actions"
        bindable
        small
        :model-value="queueOfflineActions"
        @update:modelValue="setQueueOfflineActions"
    />
</template>

<script>
export default {
    props: {
        plugin: { type: Object, required: true },
        args: { type: Object, required: true },
    },
    emits: ['update:args'],
    computed: {
        channel() {
            return this.args.channel || '';
        },
        presence() {
            return this.args.presence ?? false;
        },
        history() {
            return this.args.history ?? false;
        },
        queueOfflineActions() {
            return this.args.queueOfflineActions ?? true;
        },
    },
    methods: {
        setChannel(channel) {
            this.$emit('update:args', { ...this.args, channel });
        },
        setPresence(presence) {
            this.$emit('update:args', { ...this.args, presence });
        },
        setHistory(history) {
            this.$emit('update:args', { ...this.args, history });
        },
        setQueueOfflineActions(queueOfflineActions) {
            this.$emit('update:args', { ...this.args, queueOfflineActions });
        },
    },
};
</script>
