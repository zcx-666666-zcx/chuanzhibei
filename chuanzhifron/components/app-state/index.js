Component({
  properties: {
    type: {
      type: String,
      value: 'loading'
    },
    title: {
      type: String,
      value: ''
    },
    description: {
      type: String,
      value: ''
    },
    actionText: {
      type: String,
      value: ''
    },
    secondaryActionText: {
      type: String,
      value: ''
    },
    compact: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onPrimaryAction() {
      this.triggerEvent('action')
    },

    onSecondaryAction() {
      this.triggerEvent('secondaryaction')
    }
  }
})
