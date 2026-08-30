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
    'post.aiOriginal': 'AI 原稿',
    'post.aiUnreviewed': '未人工校订',
    'post.aiNotice': '这是一份未经人工校订的 AI 生成原稿，内容可能存在事实、逻辑和表达问题。',
    'post.generatedBy': '生成模型',
    'post.prompt': '初始提示词',
    'post.conversation': '关键对话',
    'post.conversationSummary': '对话摘要',
    'post.conversationCount': '{n} 个记录回合',
    'post.downloadMarkdown': '下载正文 Markdown',
    'post.downloadRecord': '下载生成记录',
    'post.downloadGroup': '下载文件',
    'post.noPrompt': '未记录初始提示词',
    'post.noConversation': '暂无关键对话记录',
    'post.backAiLab': '返回 AI 实验室',
    'aiLab.eyebrow': '生成记录档案',
    'aiLab.title': 'AI 实验室',
    'aiLab.description': '这里保存未经人工校订的 AI 原稿，以及促成它们的提示词和对话记录。',
    'aiLab.postCount': '{n} 份原稿',
    'aiLab.recordCount': '{n} 份含生成记录',
    'aiLab.empty': '还没有公开的 AI 原稿',
    'aiLab.emptyHint': '把 Markdown 文章加入 AI 原稿元数据后，它会出现在这里。',
    'archive.title': '归档',
    'archive.description': '按年份整理的全部文章',
    'archive.empty': '暂无文章',
    'friends.title': '友链',
    'friends.description': '我的友情链接',
    'friends.applyTitle': '申请友链',
    'friends.requirementsTitle': '网站要求',
    'friends.requirements.1': '网站支持 HTTPS 访问，内容积极健康，无违规广告及推广',
    'friends.requirements.2': '原创技术或生活分享类独立博客优先',
    'friends.requirements.3': '申请前请先添加本站链接~',
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
    'footer.copyright': 'Copyright',
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
    'post.aiOriginal': 'AI original',
    'post.aiUnreviewed': 'Not human-reviewed',
    'post.aiNotice': 'This is an AI-generated draft without human review. It may contain factual, logical, or writing issues.',
    'post.generatedBy': 'Generated with',
    'post.prompt': 'Initial prompt',
    'post.conversation': 'Key conversation',
    'post.conversationSummary': 'Conversation summary',
    'post.conversationCount': '{n} recorded turns',
    'post.downloadMarkdown': 'Download Markdown',
    'post.downloadRecord': 'Download generation record',
    'post.downloadGroup': 'Downloads',
    'post.noPrompt': 'No initial prompt recorded',
    'post.noConversation': 'No key conversation recorded',
    'post.backAiLab': 'Back to AI Lab',
    'aiLab.eyebrow': 'Generation records',
    'aiLab.title': 'AI Lab',
    'aiLab.description': 'Unreviewed AI drafts, together with the prompts and conversation records behind them.',
    'aiLab.postCount': '{n} drafts',
    'aiLab.recordCount': '{n} with records',
    'aiLab.empty': 'No public AI drafts yet',
    'aiLab.emptyHint': 'Add AI-origin metadata to a Markdown post to list it here.',
    'archive.title': 'Archive',
    'archive.description': 'All posts by year',
    'archive.empty': 'No posts yet',
    'friends.title': 'Friends',
    'friends.description': 'My friends',
    'friends.applyTitle': 'Friend request',
    'friends.requirementsTitle': 'Requirements',
    'friends.requirements.1': 'HTTPS access with positive, lawful content and no prohibited ads or promotions',
    'friends.requirements.2': 'Independent blogs sharing original tech or lifestyle content are preferred',
    'friends.requirements.3': 'Please add a link to this site before applying~',
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
  // SSR 无 localStorage，显式返回默认语言（避免依赖 try/catch 捕获 ReferenceError）
  if (typeof localStorage === 'undefined') return DEFAULT_LOCALE
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
