---
title: 尝试更新一个我的世界fabricmod的经历
published: 2025-07-16
description: '本文记录了一次尝试将一个 Minecraft Fabric Mod 从 1.19.3 版本更新到 1.21 版本的经历。文章详细描述了更新过程中的环境配置、依赖更新、代码修复等步骤，并分享了借助 AI 工具解决编译错误的方法，最终也记录了更新后遇到的建模和行为问题。'
image: 'https://fabricmc.net/assets/logo.png'
tags: [我的世界]
category: '教程'
draft: false 
lang: ''
---
# 前言
想开一个我的世界浮岛生存服务器
::github{repo="Youmiel/FloatingIslands-Datapack"}
其中一个想要搭配的mod只更新到了1.19.3，我想要在1.21上使用，因此尝试更新
::github{repo="innnky/majobroom"}
# 过程
先将这个仓库Fork 和 Clone
拖入IntelliJ IDEA
打开[fabric](https://fabricmc.net/develop/)查看想要的版本推荐的Fabric Loader、Yarn 和 Fabric API 

写入gradle.properties（fabric）、build.gradle（loom版本）

打开gradle/wrapper/gradle-wrapper.properties将gradle版本更新（一般直接build后报错会直接说需要哪个版本）

将jdk更新到java21并修改jdk目录，点击右侧小白象输入gradlew build

然后就可以看到绝望的一幕![erreo](https://r2.xmfu.cn/2025/07/9ba8beb66018ad809e109156885da420.png)

接下来的就全部交给deepwiki了

打开[fabric的deepwiki](https://deepwiki.com/FabricMC/fabric-docs)

打开deepwiki，告诉它你想干什么（移植到1.21），告诉他错误和源码，他会给你解决方案

![image-20250716204918248](https://r2.xmfu.cn/2025/07/0df6af9e2cbfdf918de585f240f712a5.png)

你可以自己实验它的解决方案（推荐），或者把解决方案粘贴到aiide里，最好的方法就是给你的aiide部署一个知识库

很快我们修复好了所有报错，进游戏看看吧

![image-20250716212544485](https://r2.xmfu.cn/2025/07/02893e4550f2e76b90ef8f4ee6da5436.png)

可以发现建模和行为（扫帚一直在抖动）出现了明显问题

然后我就修不好了qwq

意义不明的文章