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
        type="query"
        label="Message"
        placeholder="Message"
        bindable
        small
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
            return this.args.message || [];
        },
    },
    methods: {
        setChannel(channel) {
            this.$emit('update:args', { ...this.args, channel });
        },
        setMessage(message) {
            this.$emit('update:args', { ...this.args, message });
        },
    },
};
</script>
