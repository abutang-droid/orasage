# 交接：把玄隐 `/scene` 推上已联通的家里机

> 日期：2026-08-29  
> 写给：**已经 SSH 通了的那个对话**（以及下一任）。  
> 本对话（Cloud Agent「Ai人物视频规范」）**到不了** `192.168.31.52`，不能代你执行部署。

**你怎么用这份文档：** 打开已联通对话，把下面 **§0 整段原样粘贴** 发出去。不要跑全站 `bootstrap-all`，不要覆盖家里机现网 Nginx。

---

## 0. 给已联通 Agent 的可粘贴任务（整段复制）

```
目标：把八字玄隐 V3 页面 /scene 更新到已经跑起来的家里机 ora。不要动其它正在服务的 App 的 Nginx / 证书 / cloudflared。读 docs/AGENT-RULES.md。只穿透 bazi 客户端路由 /scene + 静态 /xuanyin/* + systemd orasage-bazi。不要改 auth / shop / 支付 / 全站导航。

机器事实（上一对话已验证，不要再扫端口、不要再 bootstrap）：
- 公网 SSH：root@ssh.orasage.com（Cloudflare Tunnel / cloudflared access ssh；本机 Host 常见别名 orasage-ssh）
- 局域网：192.168.31.52（主机名 ora，Debian 13 / Proxmox）。Cloud Agent 公网侧路由不到这个 IP，不要对它直连 22。
- 代码：/opt/orasage ，当前是 main @ 07a4fe03
- systemd：orasage-{auth,main,shop,admin,bazi,ziwei,tarot,cms} + cloudflared 均为 active
- 用户已确认公网可访问各子域

不要用：34.75.40.67（旧 GCP，22 超时）
不要：FORTUNE_MODE=native bash deploy/bootstrap-all-on-vps.sh（会重装全部 App）
不要：无备份覆盖 /etc/nginx/sites-available/orasage（仓库 deploy/nginx/orasage.conf 面向旧 VPS + certbot；家里机是 tunnel + 自签）
不要：把顾问数字人照片接到 /scene 或 Hero（那是另一条线，未要求上生产）

部署步骤（在 ora 上，用你已经打通的 SSH）：

1) 备份 Nginx
   NGINX_BAK=/root/orasage.nginx.bak-$(date +%Y%m%d%H%M)
   cp -a /etc/nginx/sites-available/orasage "$NGINX_BAK"
   echo "$NGINX_BAK"

2) 确认服务用户存在（仓库 systemd 是 User=ubuntu）
   id ubuntu
   systemctl show orasage-bazi -p User -p ActiveState

3) 拉场景分支并只编 bazi，且跳过 ensure_nginx
   cd /opt/orasage
   git fetch origin cursor/bazi-xuanyin-scene-v3-cc83
   git checkout cursor/bazi-xuanyin-scene-v3-cc83
   git reset --hard origin/cursor/bazi-xuanyin-scene-v3-cc83
   # HEAD 必须是 2c5fa831

   # 用脚本副本删掉末尾那一行 ensure_nginx，避免覆盖家里机 nginx
   sed '/^ensure_nginx$/d' deploy/bazi/deploy-bazi.sh > /tmp/deploy-bazi-no-nginx.sh
   sudo DEPLOY_DIR=/opt/orasage DEPLOY_MODE=native \
     ORASAGE_REF=cursor/bazi-xuanyin-scene-v3-cc83 \
     bash /tmp/deploy-bazi-no-nginx.sh

   # 若脚本仍改了 nginx（兜底）：立刻 restore
   cp -a "$NGINX_BAK" /etc/nginx/sites-available/orasage
   nginx -t && systemctl reload nginx

4) 验证（在 ora 上）
   curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3110/scene
   JS=$(curl -s http://127.0.0.1:3110/ | grep -oE '/assets/index-[^"]+\.js' | head -1)
   echo "JS=$JS"
   curl -s "http://127.0.0.1:3110$JS" | grep -o 'XuanYinScene\|玄隐' | sort -u
   # 必须同时看到 XuanYinScene 和 玄隐；旧生产是 index-DFioMpH_.js 且没有这两词
   curl -sI https://bazi.orasage.com/scene | head -15
   journalctl -u orasage-bazi -n 40 --no-pager
   systemctl is-active orasage-bazi cloudflared

5) 浏览器
   https://bazi.orasage.com/scene
     应看到透明底半身玄隐（白须道袍拂尘）+ 对话，而不是普通排盘表单。
   https://bazi.orasage.com/
     仍是排盘表单，表单上方有「试一试 · 玄隐真人对话排盘」链接。

6) 回归抽检（必须 200/302/307，不要破）
   https://orasage.com
   https://shop.orasage.com
   https://auth.orasage.com
   排盘提交、登录 cookie。

关联：PR https://github.com/abutang-droid/orasage/pull/376
分支：cursor/bazi-xuanyin-scene-v3-cc83 @ 2c5fa831
本对话：https://cursor.com/agents/bc-243d7ef1-2bfe-4f44-b034-85d519c4cc83 （IDLE，SSH 已通）
另一对话（写这份交接、SSH 不通）：https://cursor.com/agents/bc-1ca7c471-86c9-4dda-a89f-75601a9eef64
完整交接：docs/HANDOFF-bazi-scene-deploy-2026-08-29.md
```

---

## 1. 两段对话各做了什么

| 对话 | Agent / 分支 | 结果 |
| :--- | :--- | :--- |
| **已联通（请在那边继续部署）** | [公共政策未登录可见](https://cursor.com/agents/bc-243d7ef1-2bfe-4f44-b034-85d519c4cc83) · `cursor/bazi-xuanyin-scene-v3-cc83` · **IDLE** | 家里机 `ora` 已装齐 8 App；SSH 走 `ssh.orasage.com`；**尚未**把 `/scene` 编进生产 bazi。PR [#376](https://github.com/abutang-droid/orasage/pull/376) 开着，13 文件 |
| **本对话** | [Ai人物视频规范](https://cursor.com/agents/bc-1ca7c471-86c9-4dda-a89f-75601a9eef64) · `cursor/ai-consultant-video-spec-ef64` | 顾问数字人规范 + 3s 无声片；本机预览过 `/scene`；**SSH 不到** `192.168.31.52`，也连不上旧 GCP |

用户原话脉络（本对话）：顾问视频规范 → 先出 3s 无声片 → 「服务已搭好，把新页面更新上去」→ 给出 `192.168.31.52` → 「另一个对话已经联通，写交接文档」。

---

## 2. 机器与网络（以已联通对话为准）

| 项 | 值 |
| :--- | :--- |
| 主机名 | `ora` |
| 系统 | Debian 13，Proxmox `7.0.2-6-pve`，约 31Gi RAM |
| 局域网 | `192.168.31.52`（Cloud Agent 公网侧 **路由不到**，不要再对这个 IP 直连 22） |
| SSH | `root@ssh.orasage.com`（Cloudflare Tunnel；本机 `~/.ssh/config` 里常见别名 `orasage-ssh`） |
| 旧 GCP | `34.75.40.67` — **弃用**，22 超时 |
| 代码目录 | `/opt/orasage` |
| 当前磁盘 git | `main` @ **`07a4fe03`**（`fix(shop): show element once — badge OR chips, not both`） |
| 进程 | `orasage-auth/main/shop/admin/bazi/ziwei/tarot/cms` + `cloudflared` |
| 公网入口 | Cloudflare Anycast（`orasage.com` A 不是 192.168.31.52）；隧道把 `bazi.orasage.com` 等打到家里 Nginx |
| 家里公网 IP | **不固定**；用户已加过 agent 公钥 |

仓库脚本默认 `User=ubuntu`（`deploy/bazi/orasage-bazi.service`）。上一对话若已用 bootstrap 装过 8 App，`ubuntu` 用户应已存在；部署前用 `id ubuntu` 确认。不要把 `chown -R` 打到整个 `/opt/orasage` 给 root。

---

## 3. 新页面是什么（还没上生产）

**PR [#376](https://github.com/abutang-droid/orasage/pull/376)** · 分支 `cursor/bazi-xuanyin-scene-v3-cc83` · HEAD **`2c5fa831`**

| 路径 | 作用 |
| :--- | :--- |
| `bazi/client/src/pages/XuanYinScene.tsx` | `/scene` 对话场景 |
| `bazi/client/src/components/xuanyin/*` | 角色、台词、CSS |
| `bazi/client/public/xuanyin/immortal-bust.{png,webp}` | 透明底半身 |
| `bazi/client/src/App.tsx` | 注册 `/scene`；scene 全屏不套 App Shell |
| `bazi/client/src/pages/Home.tsx` | 表单上「试一试 · 玄隐真人对话排盘」 |

生产现状（2026-08-29 抽检）：`https://bazi.orasage.com/scene` 返回与首页相同的旧 SPA 壳，JS 为 `index-DFioMpH_.js`，**不含** `XuanYinScene`。

本 Cloud 环境已用该分支 `vite preview --port 3110` 打开过 `/scene`（角色 + 对话 + 回排盘）。那只是本机预览，**不是**家里机。

`deploy/bazi/deploy-bazi.sh` 末尾会调用 `ensure_nginx`，把仓库 `deploy/nginx/orasage.conf` **覆盖**到 `/etc/nginx/sites-available/orasage`。家里机现网是 tunnel / 自签，覆盖会把全站入口打挂。所以 §0 用 `sed` 删掉那一行调用，并保留 conf 备份作兜底。

---

## 4. 推荐命令备忘（与 §0 相同，便于仓库内查阅）

```bash
NGINX_BAK=/root/orasage.nginx.bak-$(date +%Y%m%d%H%M)
cp -a /etc/nginx/sites-available/orasage "$NGINX_BAK"

cd /opt/orasage
git fetch origin cursor/bazi-xuanyin-scene-v3-cc83
git checkout cursor/bazi-xuanyin-scene-v3-cc83
git reset --hard origin/cursor/bazi-xuanyin-scene-v3-cc83

sed '/^ensure_nginx$/d' deploy/bazi/deploy-bazi.sh > /tmp/deploy-bazi-no-nginx.sh
sudo DEPLOY_DIR=/opt/orasage DEPLOY_MODE=native \
  ORASAGE_REF=cursor/bazi-xuanyin-scene-v3-cc83 \
  bash /tmp/deploy-bazi-no-nginx.sh

cp -a "$NGINX_BAK" /etc/nginx/sites-available/orasage
nginx -t && systemctl reload nginx
```

脚本会：`pnpm install` → `drizzle-kit push` → `pnpm run build` → `systemctl restart orasage-bazi`。需要 `/opt/orasage/bazi/.env` 里已有 `DATABASE_URL` / `JWT_SECRET`（上一对话已写好）。

**不要**从本对话跑 `deploy/remote-deploy-bazi.sh`：默认 `SSH_HOST=34.75.40.67`、`SSH_USER=ubuntu`，和家里机 `root@ssh.orasage.com` + cloudflared ProxyCommand 不一致。已联通对话应复用它自己的 SSH 方式，在 `ora` 上直接执行上面命令。

---

## 5. 验收

在 `ora` 上：

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3110/scene
JS=$(curl -s http://127.0.0.1:3110/ | grep -oE '/assets/index-[^"]+\.js' | head -1)
echo "JS=$JS"
curl -s "http://127.0.0.1:3110$JS" | grep -o 'XuanYinScene\|玄隐' | sort -u
curl -sI https://bazi.orasage.com/scene | head -15
systemctl is-active orasage-bazi cloudflared
```

浏览器：`https://bazi.orasage.com/scene` 为玄隐半身 + 对话；`/` 仍是排盘表单。

回归（不要破）：`https://orasage.com`、`https://shop.orasage.com`、`https://auth.orasage.com`、排盘提交、登录 cookie。

失败回滚：

```bash
cd /opt/orasage
git checkout main
git reset --hard origin/main
# 再跑一次跳过 nginx 的 deploy-bazi，或 systemctl restart orasage-bazi 前先恢复旧 dist
cp -a /root/orasage.nginx.bak-* /etc/nginx/sites-available/orasage
nginx -t && systemctl reload nginx
```

---

## 6. 不要做

- 不要 `bootstrap-all-on-vps.sh`（会重编全部 8 App）。
- 不要把仓库 `deploy/nginx/orasage.conf` 当成家里机最终配置。
- 不要改 JWT、Stripe、数据库名、cloudflared 凭证。
- 不要把顾问照片当 favicon / 社媒头像（VI §8.1）。
- 不要在未备份时 `chown -R root` 整个 `/opt/orasage`。
- 不要把 PR #377（顾问数字人）和 PR #378（GCP 重建）混进这次部署。

---

## 7. 另一条线（本对话，与 `/scene` 无关）

顾问对镜头讲话规范，**未要求上生产页面**：

| 项 | 位置 |
| :--- | :--- |
| 规范 | `docs/design-system/ai-consultant-talking-head.md` |
| 身份锁 | `shared/brand/ai-consultant/identity-lock.png` |
| 3s 无声预览 | `shared/brand/ai-consultant/silent-idle-3s.mp4` |
| PR | [#377](https://github.com/abutang-droid/orasage/pull/377) |

GCP 重建手册（未执行建机）：PR [#378](https://github.com/abutang-droid/orasage/pull/378)。家里机已用 tunnel 顶上，**不必**再为这次 `/scene` 去开新 GCE。

---

## 8. 关联影响

| 范围 | 这次部署 | 风险 |
| :--- | :--- | :--- |
| bazi 前端 | `/` 多一条入口，新增 `/scene` | 低；旧排盘仍在 `/` |
| bazi systemd | 重启 `orasage-bazi` | 短暂中断 3110 |
| Nginx / 其它 App | **不应变化** | 若误覆盖 conf，全站证书/反代会挂 → 用 §4 备份回滚 |
| auth / shop / 支付 | 无 | — |

---

## 9. 相关链接

- 已联通对话（去这里粘贴 §0）：https://cursor.com/agents/bc-243d7ef1-2bfe-4f44-b034-85d519c4cc83
- 本对话：https://cursor.com/agents/bc-1ca7c471-86c9-4dda-a89f-75601a9eef64
- 场景 PR：https://github.com/abutang-droid/orasage/pull/376
- 规则：[`docs/AGENT-RULES.md`](./AGENT-RULES.md)
- 平台总交接（部分过期）：[`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)
