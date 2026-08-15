---
title: 让你的fuwari有一个自适应的giscus评论区
published: 2025-07-16
description: '本教程将指导您如何为您的 Fuwari 博客集成一个能够根据网站主题自动切换亮色/暗色模式的 Giscus 评论区。通过创建一个自定义的 Astro 组件，您可以轻松实现评论区与网站外观的无缝融合。'
image: ''
tags: [fuwari,giscus]
category: '教程'
draft: false 
lang: ''
---

# 配置github仓库

新建一个公开仓库，在设置将Discussions开启，我们的评论将存储在这里

![Discussions](https://r2.xmfu.cn/2025/07/8a0e086127cd42df39898cb9b17c9d47.png)

在你的仓库安装 [giscus](https://github.com/apps/giscus)![giscus](https://r2.xmfu.cn/2025/07/f833ef6027b8bebe00cd0c6749710ab6.png)

# 配置你的网站

打开[giscus官网](https://giscus.app/)

选择好你的想要的参数，他会自动输出script

![image-20250714210625664](https://r2.xmfu.cn/2025/07/d09ce464f61cf4ca3a7c61b2d2acd3be.png)

你可以在网站任意部分插入这个脚本即可使用

# fuwari的主题自适应

在\src\components\下创建一个astro组件，爱叫啥叫啥

![image-20250716001852560](https://r2.xmfu.cn/2025/07/d5847f76721282e2f53903904b62e3d8.png)

写入以下内容

```astro

---  
// GiscusComment.astro  
interface Props {  
  repo: string;  
  repoId: string;  
  category: string;  
  categoryId: string;  
  mapping?: string;  
  reactionsEnabled?: boolean;  
  emitMetadata?: boolean;  
  inputPosition?: 'top' | 'bottom';  
  lang?: string;  
}  
  
const {  
  repo,  
  repoId,  
  category,  
  categoryId,  
  mapping = 'pathname',  
  reactionsEnabled = true,  
  emitMetadata = false,  
  inputPosition = 'bottom',  
  lang = 'zh-CN'  
} = Astro.props;  
---  
  
<div id="giscus-container"></div>  
  
<script define:vars={{ repo, repoId, category, categoryId, mapping, reactionsEnabled, emitMetadata, inputPosition, lang }}>  
  function loadGiscus() {  
    const container = document.getElementById('giscus-container');  
    if (!container) return;  
  
    // 获取当前主题  
    const isDark = document.documentElement.classList.contains('dark');  
    const theme = isDark ? 'dark' : 'light';  
  
    // 创建Giscus脚本  
    const script = document.createElement('script');  
    script.src = 'https://giscus.app/client.js';  
    script.setAttribute('data-repo', repo);  
    script.setAttribute('data-repo-id', repoId);  
    script.setAttribute('data-category', category);  
    script.setAttribute('data-category-id', categoryId);  
    script.setAttribute('data-mapping', mapping);  
    script.setAttribute('data-strict', '0');  
    script.setAttribute('data-reactions-enabled', reactionsEnabled ? '1' : '0');  
    script.setAttribute('data-emit-metadata', emitMetadata ? '1' : '0');  
    script.setAttribute('data-input-position', inputPosition);  
    script.setAttribute('data-theme', theme);  
    script.setAttribute('data-lang', lang);  
    script.setAttribute('data-loading', 'lazy');  
    script.crossOrigin = 'anonymous';  
    script.async = true;  
  
    container.appendChild(script);  
  }  
  
  // 监听主题变化  
  function updateGiscusTheme() {  
    const giscusFrame = document.querySelector('iframe[src*="giscus"]');  
    if (giscusFrame) {  
      const isDark = document.documentElement.classList.contains('dark');  
      const theme = isDark ? 'dark' : 'light';  
        
      giscusFrame.contentWindow.postMessage({  
        giscus: {  
          setConfig: {  
            theme: theme  
          }  
        }  
      }, 'https://giscus.app');  
    }  
  }  
  
  // 监听DOM变化来检测主题切换  
  const observer = new MutationObserver((mutations) => {  
    mutations.forEach((mutation) => {  
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {  
        updateGiscusTheme();  
      }  
    });  
  });  
  
  // 页面加载时初始化  
  if (document.readyState === 'loading') {  
    document.addEventListener('DOMContentLoaded', loadGiscus);  
  } else {  
    loadGiscus();  
  }  
  
  // 开始观察主题变化  
  observer.observe(document.documentElement, {  
    attributes: true,  
    attributeFilter: ['class']  
  });  
</script>

```

然后想在哪里引入，比如文章页

那就在src\pages\posts\[...slug].astro开头引入这个文件

```astro
import Giscus from "../../components/misc/Giscus.astro";
```

然后在想要的地方添加（例如协议下面）

```astro
<GiscusComment   
  repo="your-username/your-repo"  
  repoId="your-repo-id"  
  category="General"  
  categoryId="your-category-id"  
/>
```

![image-20250716002449856](https://r2.xmfu.cn/2025/07/8200216d89e6a9d42452c019a10039d7.png)
