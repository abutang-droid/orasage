# Telegram IM 客服对接（超级群 + Forum 话题）

网站 IM（`orasage.com` 右下角客服）与 Telegram 超级群双向桥接。  
每个登录用户会话 = 超级群内 **一个 Forum 话题**；运营在该话题里回复 → 用户网站 IM 收到。

订单通知可与 IM **分群**（推荐），也可共用同一群。

---

## 1. 超级群准备

1. 建 **超级群**（Supergroup），开启 **Topics（话题）**
2. 将 `@your_bot` 拉进群
3. 设为管理员，至少权限：
   - **Manage Topics**（创建话题）
   - **Send Messages**
4. @BotFather → Bot Settings → **Group Privacy** → **Turn off**（可选，话题模式不强制）

获取群 **chat id**（负数）：

```bash
export TG_TOKEN='你的bot_token'
# 在群里发一条消息后：
curl -s "https://api.telegram.org/bot${TG_TOKEN}/getUpdates" | python3 -m json.tool
# 找 "chat":{"id":-1001234567890}
```

---

## 2. VPS 环境变量

编辑 **`/opt/orasage/.env`**（systemd 读取此文件）：

```env
TELEGRAM_BOT_TOKEN=7123456789:AAH...
TELEGRAM_WEBHOOK_SECRET=随机长字符串至少32位

# IM 客服超级群（推荐单独配置）
TELEGRAM_IM_CHAT_ID=-1001234567890

# 订单/工单通知群（可与 IM 不同群）
TELEGRAM_CHAT_ID=-1009876543210

RESEND_API_KEY=re_...
ORDER_NOTIFY_EMAIL_TO=ops@example.com
```

---

## 3. 数据库迁移

在 VPS：

```bash
cd /opt/orasage/auth-service
npm ci && npm run build
npm run db:migrate
# 若 migrate 脚本未跑新文件，手动：
# psql "$DATABASE_URL" -f drizzle/0033_live_chat.sql
# psql "$DATABASE_URL" -f drizzle/0037_chat_telegram_topic.sql
sudo systemctl restart orasage-auth orasage-main
```

---

## 4. 注册 Telegram Webhook

```bash
export TG_TOKEN='你的token'
export WEBHOOK_SECRET='与 TELEGRAM_WEBHOOK_SECRET 相同'

curl -s -G "https://api.telegram.org/bot${TG_TOKEN}/setWebhook" \
  --data-urlencode "url=https://auth.orasage.com/api/telegram/webhook" \
  --data-urlencode "secret_token=${WEBHOOK_SECRET}" \
  --data-urlencode "allowed_updates=[\"message\"]"

# 验证
curl -s "https://api.telegram.org/bot${TG_TOKEN}/getWebhookInfo" | python3 -m json.tool
```

`url` 应为 `https://auth.orasage.com/api/telegram/webhook`，`last_error_message` 应为空。

---

## 5. 端到端测试

### A. 网站 → Telegram

1. 浏览器登录 https://orasage.com
2. 点右下角 **在线客服**，发一条测试消息
3. 超级群应 **自动出现新话题**（如 `💬 #1 张三`），话题内有用户消息

### B. Telegram → 网站

1. 点进该话题
2. **直接输入回复**（不必 reply 某条消息）
3. 网站 IM 约 4 秒内应显示客服回复

### C. 后台

- https://admin.orasage.com/im — 会话列表
- 首页可测订单 Telegram：`发送测试通知`

---

## 6. 常见问题

| 现象 | 处理 |
|------|------|
| 用户发消息，TG 无新话题 | 检查 `TELEGRAM_IM_CHAT_ID`、bot 是否有 Manage Topics；`journalctl -u orasage-auth` |
| TG 回复，网站收不到 | Webhook 未注册或 `TELEGRAM_WEBHOOK_SECRET` 不一致；`getWebhookInfo` 看错误 |
| 话题有了但回复不进网站 | 是否在 **对应话题** 里回复（不要只在 General 发） |
| 未登录无法 IM | 当前版本需登录；游客 IM 待后续迭代 |
| 403 webhook | `secret_token` 与 env 不一致 |

---

## 7. 架构速查

```
用户网站 LiveChatWidget
  → POST /auth/me/chat/messages (auth-service)
  → createForumTopic + sendMessage(thread_id)
  → Telegram 超级群话题

运营在话题回复
  → POST /api/telegram/webhook
  → ingestTelegramTopicMessage(topic_id)
  → 用户轮询 GET /auth/me/chat/messages
```
