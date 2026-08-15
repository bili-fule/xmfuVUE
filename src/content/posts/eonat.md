---
title: stun建站端口不固定？教你用eo自动回源到你的stun端口
published: 2025-08-15
description: ''
image: ''
tags: [github,edgeone]
category: '教程'
---

啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊我没有ipv6
# 前言什么的
我想要用家宽建一个Matrix

我也没有ipv6，没有现成的方案实现eo回源

但是直接stun直连太麻烦了也不安全（我也成功了），于是考虑做个eo自动回源

## stun直连matrix的思路

因为matrix有点小众，我也没找到教程，以下是我摸索出来的，也分享下吧

stun直连的话我讲下思路吧，在github建个仓库，里面放.well-known\matrix\client这个文件（引导Matrix客户端寻找服务器的文件），然后使用lucky的webhook给action发请求更新这个文件的端口，这个文件像这样

```json
{
  "m.homeserver": {
    "base_url": "https://m.matrix.org"
  }
}
```

然后把这个仓库通过什么page什么的部署到上一级域名（比如）你的matrix部署在m.matrix.org，你的client文件必须放在m.matrix.org下或者matrix.org下，然后客户端写client文件所在的域名就可以连接了

# eo自动回源

其实也差不多，我们腾讯云有api可以调用，但是非常的答辩（发个请求需要复杂的密钥生成，因此使用action来发请求）

为此我做了个action仓库，里面有较为完善的教程，因此不多赘述了（使用eo国际站的可以自行更换api，该仓库使用的是腾讯云中国的api）

::github{repo="bili-fule/edgeone-updater"}

然后再lucky里webhook给action发请求

![1755222937799](https://r2.xmfu.cn/2025/08/ae5aad8ddd43f09ec10011f64e0a46f9.png)

然后就可以自动更新eo的回源链接/端口了
