---
title: 使用cloudflare worker+r2做一个古明地恋的随机图api
published: 2025-07-22
description: '本教程详细介绍了如何利用 Cloudflare Workers 和 R2 存储构建一个古明地恋主题的随机图片 API。文章分为两部分，首先介绍了最新的实现方案，包括使用 Python 脚本从 Pixiv 下载、处理和上传图片到 R2 存储桶，以及如何配置 Cloudflare Worker 来提供 API 服务。此外，文章还保留了使用 PHP 虚拟主机的旧方案以供参考。'
image: 'https://r2.xmfu.cn/2025/07/3dda7e5ffffb1e6c6b0b0762d8cbe11c.png'
tags: [cloudflare worker,r2]
category: '教程'
draft: false 
lang: ''
---
# 更新 迁移到cloudflare worker+r2
## 准备
- [x] cloudflare r2

## 过程
### 准备过程（与php一致）
下载我做好的诡异项目

::github{repo="bili-fule/php-Random-picture"}

登录pixiv，把cookie扒下来（打码那一部分)
![cookie](https://r2.xmfu.cn/2025/07/a06c840287acbd5a8d1956932d7b8203.png)
找到想要的作品的tag，把链接或者tag复制下来

![tag](https://r2.xmfu.cn/2025/07/cb38192797eeb0f37944f869c5babf79.png)

粘贴到koshi.py程序里运行,koshi会自动帮你下载图片
然后删除目录里不需要的图片
运行prepare_api_images.py,会压缩图片并索引

### 上传至R2存储桶



![r2](https://r2.xmfu.cn/2025/07/5f1d8265a372c399a1cdfec0839da9ef.png)

在这个页面新建桶和api那里创建令牌

安装 [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) 



![image-20250723103138059](https://r2.xmfu.cn/2025/07/d5155775b4be63c38041907d273ca47b.png)

 访问密钥 ID (Access Key ID)
 机密访问密钥 (Secret Access Key)
 终结点 (Endpoint)
什么诡异翻译
运行 aws configure
提示 AWS Access Key ID: 粘贴截图中的【访问密钥 ID】
提示 AWS Secret Access Key: 粘贴截图中的【机密访问密钥】
提示 Default region name: 按回车跳过
提示 Default output format: 输入 json
接着运行 aws configure set s3.endpoint_url <URL>，这里的 <URL> 就是截图中的【终结点】地址。
接着在处理好的目录运行下面命令

![image-20250723103855870](https://r2.xmfu.cn/2025/07/0641e76da25451c0731698ce43a8723f.png)

aws s3 cp .\api_ready_images s3://koishi/ --recursive --endpoint-url https://S3-API.com





### worker配置

fork我的这个项目

::github{repo="bili-fule/cfpicapi"}

然后创建worker选择这个项目，构建，在项目中wrangler.toml修改存储桶名字

# （旧的）使用php虚拟主机做一个古明地恋的随机图api
## 准备
- [x] python
- [x] php虚拟主机
- [x] Pixiv高级会员
- [x] 一个聪明的大脑

## 过程

下载我做好的诡异项目

::github{repo="bili-fule/php-Random-picture"}

登录pixiv，把cookie扒下来（打码那一部分)
![cookie](https://r2.xmfu.cn/2025/07/a06c840287acbd5a8d1956932d7b8203.png)
找到想要的作品的tag，把链接或者tag复制下来

![tag](https://r2.xmfu.cn/2025/07/cb38192797eeb0f37944f869c5babf79.png)

粘贴到koshi.py程序里运行,koshi会自动帮你下载图片
然后删除目录里不需要的图片
运行prepare_api_images.py,会压缩图片并索引
然后将api.php，index.php，style.css，和api_ready_images放到虚拟主机根目录即可

