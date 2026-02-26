import { Marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)

const marked = new Marked({
  renderer: {
    code({ text, lang }): string {
      const language = lang && hljs.getLanguage(lang) ? lang : 'javascript'
      const highlighted = hljs.highlight(text, { language }).value
      return `<div class="code-block-wrapper group relative">
        <div class="code-block-header">
          <span class="code-lang">${language}</span>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').textContent)">Copy</button>
        </div>
        <pre class="hljs"><code class="language-${language}">${highlighted}</code></pre>
      </div>`
    },
    heading({ tokens, depth }): string {
      const text = tokens.map((t) => ('text' in t ? t.text : t.raw)).join('')
      const slug = text
        .toLowerCase()
        .replace(/[^\w]+/g, '-')
        .replace(/^-|-$/g, '')
      return `<h${depth} id="${slug}" class="heading-anchor">
        <a href="#${slug}" class="anchor-link" aria-hidden="true">#</a>
        ${this.parser.parseInline(tokens)}
      </h${depth}>`
    },
    image({ href, title, text }): string {
      return `<figure class="chapter-figure">
        <img src="${href}" alt="${text}" title="${title ?? ''}" loading="lazy" class="chapter-image" />
        ${title ? `<figcaption>${title}</figcaption>` : ''}
      </figure>`
    },
    blockquote({ tokens }): string {
      const body = this.parser.parse(tokens)
      return `<blockquote class="chapter-blockquote">${body}</blockquote>`
    },
  },
})

export function useMarkdown() {
  function render(content: string): string {
    return marked.parse(content) as string
  }

  return { render }
}
