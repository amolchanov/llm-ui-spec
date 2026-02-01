import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'LLM UI Spec',
  description: 'Declarative XML specification for defining UI structure',

  // Custom domain - use root base
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/spec/' },
      { text: 'Platforms', items: [
        { text: 'Webapp', link: '/spec/webapp' },
        { text: 'Mobile', link: '/spec/mobile' },
        { text: 'Desktop', link: '/spec/desktop' }
      ]},
      { text: 'Tools', items: [
        { text: 'Compiler', link: '/#spec-compiler' },
        { text: 'Editor', link: '/#visual-editor' }
      ]},
      { text: 'Reference', items: [
        { text: 'Platform Mapping', link: '/platform-mapping' }
      ]},
      { text: 'GitHub', link: 'https://github.com/amolchanov/llm-ui-spec' }
    ],

    sidebar: {
      '/spec/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/spec/' },
            { text: 'Quick Start', link: '/spec/#detail-levels' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Entities', link: '/spec/#entities' },
            { text: 'Components', link: '/spec/#components' },
            { text: 'Prompts', link: '/spec/#the-prompt-element' },
            { text: 'File Organization', link: '/spec/#file-organization' }
          ]
        },
        {
          text: 'Platform Guides',
          items: [
            { text: 'Webapp', link: '/spec/webapp' },
            { text: 'Mobile', link: '/spec/mobile' },
            { text: 'Desktop', link: '/spec/desktop' }
          ]
        },
        {
          text: 'Tools',
          items: [
            { text: 'Compiler', link: '/#spec-compiler' },
            { text: 'Editor', link: '/#visual-editor' }
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Platform Mapping', link: '/platform-mapping' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/amolchanov/llm-ui-spec' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3]
    }
  },

  markdown: {
    lineNumbers: true
  }
})
