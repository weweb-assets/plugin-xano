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
        label="Presence"
        placeholder="Listen presence"
        bindable
        small
        :model-value="presence"
        @update:modelValue="setPresence"
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
            return this.args.presence || false;
        },
    },
    methods: {
        setChannel(channel) {
            this.$emit('update:args', { ...this.args, channel });
        },
        setPresence(presence) {
            this.$emit('update:args', { ...this.args, presence });
        },
    },
};
</script>
