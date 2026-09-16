import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const postsDir = path.resolve(rootDir, 'src/content/posts')

const HOST = 'www.xmfu.cn'
const BASE_URL = `https://${HOST}`
const KEY = 'c772b369dde0553ae330da752a580d9f'
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`

// 获取全部公开发布的路由
function getAllUrls() {
  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/about`,
    `${BASE_URL}/friends`,
  ]

  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))
    for (const file of files) {
      const fullPath = path.join(postsDir, file)
      const raw = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(raw)
      if (!data.draft) {
        const slug = path.basename(file, '.md')
        urls.push(`${BASE_URL}/post/${encodeURI(slug)}`)
      }
    }
  }

  return urls
}

async function submitIndexNow() {
  const urls = getAllUrls()
  console.log(`[IndexNow] 准备向搜索引擎提交 ${urls.length} 个 URL...`)

  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  }

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`[IndexNow] 正在推送至: ${endpoint}`)
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
      })

      if (res.ok || res.status === 200 || res.status === 202) {
        console.log(`[IndexNow] ✓ 提交成功 (${res.status}): ${endpoint}`)
      } else {
        const text = await res.text()
        console.warn(`[IndexNow] ! 响应状态码 ${res.status}: ${text}`)
      }
    } catch (err) {
      console.error(`[IndexNow] ✗ 推送失败 ${endpoint}:`, err.message)
    }
  }
}

submitIndexNow()
