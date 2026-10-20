# 生活账本

`/ledger` 使用 Vue 同站页面，公开准确月度收入、净支出和结余；具体交易、商品、支付账户、分类和来源只在登录后由服务端返回。构建时不请求数据库，静态产物不含真实账目。

## 数据链路

浏览器 → 同源 `/api/ledger/*` → EdgeOne `edge-functions/api/ledger/[[path]].js` → 独立 HTTPS 白名单网关 → 微信助手私人 SQLite。函数不接受动态回源地址、不转发管理 Authorization 或网站其他 Cookie，不缓存响应。仅允许 public/session/details/login/logout 五个端点，不能通过它访问助手管理界面、原始附件或 Shell。

后端为 bili-fule/dsh-life-assistant 的 ledger 模块，使用 integer cents、源交易号去重、原账单汇总核对、版本更正及独立账本密码。密码和会话均在私人数据库，不写进本站代码或环境构建产物。登录 Cookie 为 HttpOnly/Secure/SameSite=Strict，退出及页面离开清空明细，过期请求不得重新显示旧数据。

退款按入账月份抵支出，充值/提现不算收入或消费。页面只覆盖已导入和记录的数据，收支结余不是账户余额；公开默认展示最近六个有记录月份。

## 验证

`npm run build:check` 检查类型和完整 SSG 构建；`node --test scripts/ledger-proxy.test.mjs` 验证固定源站、Cookie 白名单、无管理权限转发及跨站写请求拒绝。上线还需验证匿名明细 401、登录后的明细、退出后拒绝访问以及无缓存。

EdgeOne 文件路由与处理函数参考：https://pages.edgeone.ai/document/edge-functions 。

EdgeOne 运行时不提供 AbortSignal.timeout，代理不依赖此接口；20 秒后端超时由独立 HTTPS 网关执行。回归测试包含该方法缺失的环境。
