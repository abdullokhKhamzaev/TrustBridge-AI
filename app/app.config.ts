export default defineAppConfig({
  ui: {
    colors: {
      primary: 'cyan',
      neutral: 'slate'
    },
    button: {
      slots: {
        base: 'cursor-pointer'
      }
    },
    input: {
      slots: {
        root: 'w-full relative inline-flex items-center'
      }
    },
    textarea: {
      slots: {
        root: 'w-full relative'
      }
    },
    select: {
      slots: {
        base: 'w-full relative'
      }
    },
    selectMenu: {
      slots: {
        base: 'w-full relative'
      }
    }
  }
})
