---
title: 记录我如何将Folia服务器迁移到Fabric
published: 2026-07-22
description: 记录一次将 Minecraft Folia 服务器迁移到 Fabric 的过程、配置调整与问题排查。
image: ''
tags: [Minecraft, Folia, Fabric, 服务器迁移]
category: 技术
draft: false
lang: zh
---

感觉folia服务器好难配置（

并且我想使用投影打印机之类的垃圾mod，所以现在把folia服务器转换到fabric

开开心心的把那个核心换完，然后发现启动不了

```text
[15:17:05] [main/WARN]: Missing data pack file/bukkit
[15:17:05] [main/WARN]: Missing data pack paper
[15:17:05] [main/INFO]: Found new data pack fabric-convention-tags-v2, loading it automatically
[15:17:05] [Worker-Main-11/ERROR]: Unable to read or access the world gen settings file! Falling back to the default settings with a random world seed. .\world\data\minecraft\world_gen_settings.dat
[15:17:05] [main/WARN]: Failed to load datapacks, can't proceed with server load. You can either fix your datapacks or reset to vanilla with --safeMode
```

我在paper的官网上找到了这篇文章：

## Migrating from Paper 从纸质形式迁移过来

### To Vanilla 致 Vanilla

[https://docs.papermc.io/paper/migration/](https://docs.papermc.io/paper/migration/)


以下文件需要从 `world/dimensions/minecraft/overworld/data/minecraft/` 移动到 `world/data/minecraft/` ：

- `game_rules.dat`
- `scheduled_events.dat`
- `wandering_trader.dat`
- `weather.dat`
- `world_gen_settings.dat`

照着操作即可

## 迁移 TPA 插件的 Home 数据

原来使用的是 [TPA 3.2.9](https://modrinth.com/plugin/tpa.66666/versions) 插件。它是 Bukkit/Paper 插件，不能直接放到 Fabric 的 `mods/` 目录中运行。不过这个插件的 Home 数据比较简单，可以转换到 Fabric 版传送模组中。

原插件将每个玩家的数据保存在：

```text
plugins/TPA/playerdata/<玩家 UUID>.yml
```

Home 数据大致是下面这种 YAML 格式：

```yaml
player_name: xyzonline
homes:
  家:
    world: world
    x: 12.586520283619185
    y: 67.0
    z: -362.67385057135806
    pitch: 30.299927
    yaw: -174.40253
```

我使用的 Fabric 传送模组是 [Simple-Warp-Tpa-Home-Back](https://modrinth.com/mod/ziy-swthb)，它将所有玩家的 Home 统一保存在：

```text
world/data/simple-warp-tpa-home-back/data.json
```

目标格式如下：

```json
{
  "homes": {
    "玩家 UUID": [
      {
        "name": "家",
        "world": "minecraft:overworld",
        "x": 12.586520283619185,
        "y": 67.0,
        "z": -362.67385057135806,
        "yaw": -174.40253,
        "pitch": 30.299927
      }
    ]
  }
}
```

迁移时需要注意世界名称的转换：

```text
world        -> minecraft:overworld
world_nether  -> minecraft:the_nether
world_the_end -> minecraft:the_end
```

迁移过程不会直接复制旧的 YAML 文件，而是读取玩家 UUID、Home 名称、维度、坐标和视角，重新生成 Fabric 模组需要的 JSON 数据。玩家 UUID 必须保持一致，否则 Home 会被认为属于其他玩家。

在修改目标文件前，应该先备份：

```text
world/data/simple-warp-tpa-home-back/data.json.before-home-migration.bak
```

迁移完成后，可以使用以下命令检查 Home：

```text
/homes
/home 家
/home <Home名称>
```

原来的 `plugins/TPA/playerdata/` 不应删除，保留它可以在迁移失败时重新转换。TPA 请求和冷却状态通常是临时数据，不需要迁移；需要重点迁移的是 Home 坐标数据。
