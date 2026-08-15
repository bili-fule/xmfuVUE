---
title: 这个博客的搭建
published: 2025-07-13
description: '本教程介绍了如何使用 Fuwari 框架和 Cloudflare Workers 搭建博客，并利用腾讯云 EdgeOne 进行全球加速。内容涵盖了项目配置、Cloudflare Worker 部署、EdgeOne 加速设置、DNS 分区解析以及 R2 存储桶的流量优化。'
image: 'https://r2.xmfu.cn/2025/07/74bf6e2ad5315c94b80ea6fbd030ec0b.webp'
tags: [cloudflare,fuwari,edgeone]
category: '教程'
draft: false 
lang: ''
---

# fuwari

在fuwari根目录下创建wrangler.jsonc，输入

```json
{
  "name": "blog",
  "compatibility_date": "2025-07-13",
  "assets": {
    "directory": "./dist"
  }
}
```

name：worker名字

# cloudflare worker

在worker中连接到你的博客github项目

![部署命令](https://r2.xmfu.cn/2025/07/f77b1f1adc07f3fbdcc822d58371fd8c.png)

部署完成后在路由里添加yousite.com/*



![添加路由](https://r2.xmfu.cn/2025/07/3166f0e8243cd806c74301fb925a4142.png)



# edgeone

使用edgeone加速workers.dev（其实可以加速任意绑定到cloudflare的cname，比如说大佬配置好的优选，区别不大）

![edgeone](https://r2.xmfu.cn/2025/07/3614688eae5cd7294dcf676791e2d37e.png)

# 域名解析

使用阿里云dns分区域解析

![dns](https://r2.xmfu.cn/2025/07/a8e6cf7da977c70c90275a7e30b06d45.png)

# 最终表现

![itdog](https://r2.xmfu.cn/2025/07/5d4b339e81c326e4583dde62b37c081e.png)

# R2存储桶
然后打开你的网站，你会发现r2的流量并不是走的edgeone，我们来解决这个问题
打开cloudflare，点开规则>Cloud Connector

![cloudconnector](https://r2.xmfu.cn/2025/07/5dd9cfdf74b9ae31211c2adb0dae11a9.png)

然后在eo加速源站，dns分流

