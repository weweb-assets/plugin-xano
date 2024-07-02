<template>
    <wwEditorInputRow
        type="query"
        label="Channel"
        placeholder="Channel name"
        bindable
        small
        required
        :model-value="channel"
        @update:modelValue="setChannel"
    />
    <wwEditorInputRow
        type="query"
        label="Socket ID"
        placeholder="Socket ID"
        bindable
        small
        :model-value="socketId"
        @update:modelValue="setSocketId"
    />
    <wwEditorInputRow
        type="onoff"
        label="Authenticated only"
        bindable
        small
        :model-value="authenticated"
        @update:modelValue="setAuthenticated"
    />
    <wwEditorInputRow
        type="query"
        label="Message"
        placeholder="Message"
        bindable
        small
        required
        :model-value="message"
        @update:modelValue="setMessage"
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
            return this.args.channel || [];
        },
        message() {
            return this.args.message || '';
        },
        authenticated() {
            return this.args.authenticated ?? false;
        },
        socketId() {
            return this.args.socketId || null;
        },
    },
    methods: {
        setChannel(channel) {
            this.$emit('update:args', { ...this.args, channel });
        },
        setMessage(message) {
            this.$emit('update:args', { ...this.args, message });
        },
        setAuthenticated(authenticated) {
            this.$emit('update:args', { ...this.args, authenticated });
        },
        setSocketId(socketId) {
            this.$emit('update:args', { ...this.args, socketId });
        },
    },
};
</script>
