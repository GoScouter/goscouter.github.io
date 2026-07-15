import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "GoScouter",
  description: "General purpose web analyzer tool",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',

    search: {
      provider: 'local'
    },

    nav: [
      { text: 'Guide', link: '/get-started' },
      { text: 'Modules', link: '/modules' },
      { text: 'SDK', link: '/sdk' },
      {
        text: 'Reference',
        items: [
          { text: 'SDK reference', link: 'https://pkg.go.dev/github.com/GoScouter/sdk#pkg-overview' },
          { text: 'Commands', link: '/commands' },
          { text: 'Publishing a Module', link: '/publishing' },
        ]
      }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Get Started', link: '/get-started' },
        ]
      },
      {
        text: 'Using GoScouter',
        items: [
          { text: 'Commands', link: '/commands' },
          { text: 'Modules', link: '/modules' },
        ]
      },
      {
        text: 'Building Modules',
        items: [
          { text: 'SDK Reference', link: '/sdk' },
          { text: 'Publishing a Module', link: '/publishing' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/GoScouter' }
    ]
  }
})
