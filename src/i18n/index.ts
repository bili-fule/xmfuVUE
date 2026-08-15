import { ref, type Ref } from 'vue'

export type Locale = 'zh' | 'en'

const STORAGE_KEY = 'locale'

type MessageDict = Record<string, string>

const messages: Record<Locale, MessageDict> = {
  zh: {
    'nav.home': '首页',
    'nav.archive': '归档',
    'nav.friends': '友链',
    'nav.about': '关于',
    'nav.search': '搜索',
    'theme.toggle': '切换主题',
    'search.placeholder': '搜索文章...',
    'search.empty': '输入关键词开始搜索',
    'search.noResults': '没有找到结果',
    'search.hint': '支持标题、标签与全文',
    'post.back': '返回首页',
    'post.readingTime': '{n} 分钟阅读',
    'post.notFound': '文章不存在',
    'post.notFoundDesc': '你访问的链接可能已经失效，或者文章已被移除。',
    'post.backHome': '回到首页',
    'post.toc': '目录',
    'post.tags': '标签',
    'archive.title': '归档',
    'archive.description': '按年份整理的全部文章',
    'archive.empty': '暂无文章',
    'friends.title': '友链',
    'friends.description': '我的友情链接',
    'friends.applyTitle': '申请友链',
    'friends.requirementsTitle': '网站要求',
    'friends.requirements': '内容积极向上，无违法违规内容\n网站可以正常访问\n最好是技术类或个人博客',
    'friends.formatTitle': '友链格式',
    'friends.formatHint': '复制以下信息联系我们',
    'about.role': '前端与网络',
    'about.siteSubtitle': '个人技术记录',
    'about.techTitle': '主要记录',
    'about.tech.1': '前端开发架构、Vue3/Vite/TypeScript 实践',
    'about.tech.2': '计算机网络协议、代理路由与网络调优',
    'about.tech.3': 'Linux 服务器运维、容器化与部署',
    'about.tech.4': '日常生活中的所思所想与踩坑心得',
    'about.licenseTitle': '版权与许可',
    'about.licenseDesc': '本站所有原创内容在无特别声明的情况下，均采用',
    'about.licenseNote': '转载请注明出处，署名原作者，且不得用于商业用途',
    'footer.copyright': '版权',
    'footer.backToTop': '回到顶部',
  },
  en: {
    'nav.home': 'Home',
    'nav.archive': 'Archive',
    'nav.friends': 'Friends',
    'nav.about': 'About',
    'nav.search': 'Search',
    'theme.toggle': 'Toggle theme',
    'search.placeholder': 'Search articles...',
    'search.empty': 'Type to search',
    'search.noResults': 'No results',
    'search.hint': 'Title, tags & full text',
    'post.back': 'Back to home',
    'post.readingTime': '{n} min read',
    'post.notFound': 'Post not found',
    'post.notFoundDesc': 'The link may be invalid or the post has been removed.',
    'post.backHome': 'Back to home',
    'post.toc': 'Contents',
    'post.tags': 'Tags',
    'archive.title': 'Archive',
    'archive.description': 'All posts by year',
    'archive.empty': 'No posts yet',
    'friends.title': 'Friends',
    'friends.description': 'My friends',
    'friends.applyTitle': 'Friend request',
    'friends.requirementsTitle': 'Requirements',
    'friends.requirements': 'Positive & lawful content\nWebsite accessible\nPreferably tech or personal blog',
    'friends.formatTitle': 'Format',
    'friends.formatHint': 'Contact me with:',
    'about.role': 'Frontend & Network',
    'about.siteSubtitle': 'Personal tech notes',
    'about.techTitle': 'Mainly about',
    'about.tech.1': 'Frontend architecture, Vue3/Vite/TypeScript',
    'about.tech.2': 'Networking, proxy & routing',
    'about.tech.3': 'Linux ops, containerization & deployment',
    'about.tech.4': 'Daily life & lessons learned',
    'about.licenseTitle': 'License',
    'about.licenseDesc': 'Licensed under',
    'about.licenseNote': 'License note: attribution, non-commercial',
    'footer.copyright': 'Copyright',
    'footer.backToTop': 'Back to top',
  },
}

const DEFAULT_LOCALE: Locale = 'zh'

function readInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'en' ? 'en' : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export const locale: Ref<Locale> = ref<Locale>(readInitialLocale())

// 初始化时同步 html lang
if (typeof document !== 'undefined') {
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
}

export function setLocale(l: Locale): void {
  locale.value = l
  try {
    localStorage.setItem(STORAGE_KEY, l)
  } catch {
    // 忽略持久化失败（如隐私模式）
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = l === 'zh' ? 'zh-CN' : 'en'
  }
}

export function t(key: string, params?: Record<string, string | number>): string {
  const dict = messages[locale.value] ?? messages.zh
  let str = dict[key] ?? messages.zh[key] ?? key
  if (params) {
    str = str.replace(/\{(\w+)\}/g, (match, name) => {
      const value = params[name]
      return value !== undefined ? String(value) : match
    })
  }
  return str
}
