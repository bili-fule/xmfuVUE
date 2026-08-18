export interface SocialLink {
  name: string
  url: string
  icon?: string
}

export interface FriendLink {
  name: string
  url: string
  description: string
  avatar: string
}

export interface SiteConfig {
  site: {
    title: string
    description: string
  }
  author: {
    name: string
    avatar: string
    bio: string
    links: SocialLink[]
  }
  friends: FriendLink[]
  license: {
    name: string
    url: string
  }
}

export const siteConfig: SiteConfig = {
  site: {
    title: 'fulieblog',
    description: '这是孚狸的博客，分享关于前端开发、网络技术、服务器部署和生活感悟的见解。',
  },
  author: {
    name: 'fulie',
    avatar: 'https://q2.qlogo.cn/headimg_dl?dst_uin=3672492995&spec=5',
    bio: '我不知道这个事有没有意义，但是做了我就不会因没做而后悔。',
    links: [
      {
        name: 'bilibili',
        url: 'https://space.bilibili.com/597709678',
      },
      {
        name: 'GitHub',
        url: 'https://github.com/bili-fule',
      },
    ],
  },
  friends: [
    {
      name: '二叉树树',
      url: 'https://2x.nz/',
      description: '爱你所爱~',
      avatar: 'https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=5',
    },
    {
      name: 'qwwshs',
      url: 'https://qwwshs.top/',
      description: '这是qwwshs的个人博客',
      avatar: 'https://qwwshs.top/img/avatar.png',
    },
    {
      name: 'Morlvoid',
      url: 'https://www.morlvoid.pro/',
      description: '事已至此先睡觉吧',
      avatar: 'https://www.xmfu.cn/Morlvoid.png',
    },
  ],
  license: {
    name: 'CC BY-NC-SA 4.0',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
  },
}
