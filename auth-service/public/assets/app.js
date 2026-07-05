async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "请求失败");
  return data;
}
const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

async function hydrateAuthChips() {
  const chips = qsa(".orasage-auth-chip[data-hydrate-auth]");
  if (!chips.length) return;

  let user = null;
  try {
    const data = await api("/auth/me");
    user = data.user;
  } catch {
    user = null;
  }

  const lang = document.documentElement.lang || "zh-CN";
  const loginLabel = lang.startsWith("zh") ? "登录" : "Login";

  chips.forEach((chip) => {
    chip.classList.remove("orasage-auth-chip--loading");
    if (user) {
      chip.href = chip.dataset.profileUrl || "/center";
      chip.textContent = user.displayName;
      chip.classList.add("orasage-auth-chip--signed-in");
      chip.title = user.email;
    } else {
      chip.href = chip.dataset.loginUrl || "/login";
      chip.textContent = loginLabel;
    }
  });
}

hydrateAuthChips();

const loginForm = qs("#login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = qs("#form-error");
    err.hidden = true;
    const fd = new FormData(loginForm);
    try {
      await api("/auth/login", { method: "POST", body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }) });
      location.href = loginForm.dataset.redirect || "/center";
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
  });
}

const registerForm = qs("#register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = qs("#form-error");
    err.hidden = true;
    const fd = new FormData(registerForm);
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password"), nickname: fd.get("nickname") || undefined }),
      });
      location.href = registerForm.dataset.redirect || "/center";
    } catch (ex) { err.textContent = ex.message; err.hidden = false; }
  });
}

qsa(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    qsa(".tab").forEach((t) => t.classList.remove("active"));
    qsa(".tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    qs(`#panel-${tab.dataset.tab}`)?.classList.add("active");
    if (tab.dataset.tab === "readings") loadReadings();
    if (tab.dataset.tab === "orders") loadOrders();
  });
});

qs("#logout-btn")?.addEventListener("click", async () => {
  await api("/auth/logout", { method: "POST" });
  location.href = "/login";
});

qs("#profile-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = qs("#profile-msg");
  const body = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api("/auth/profile", { method: "PUT", body: JSON.stringify(body) });
    msg.textContent = "保存成功"; msg.className = "msg ok"; msg.hidden = false;
    if (body.nickname) qs("#user-nickname").textContent = body.nickname;
  } catch (ex) { msg.textContent = ex.message; msg.className = "msg err"; msg.hidden = false; }
});

function fmt(iso) {
  return iso ? new Date(iso).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
}
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function loadReadings() {
  const el = qs("#readings-list");
  if (!el || el.dataset.loaded) return;
  try {
    const { readings } = await api("/auth/me/readings");
    el.dataset.loaded = "1";
    if (!readings.length) {
      el.innerHTML = `<div class="empty"><p>暂无测试记录</p><p>完成八字、紫微或塔罗解读后会同步到这里</p><a href="https://bazi.orasage.com">去八字 →</a> <a href="https://tarot.orasage.com">去塔罗 →</a></div>`;
      return;
    }
    el.innerHTML = readings.map((r) => {
      const detail = r.detailUrl
        ? `<a href="${esc(r.detailUrl)}" class="btn-outline" style="display:inline-block;margin-top:0.75rem;font-size:0.8rem;padding:0.35rem 0.75rem;border-radius:999px;border:1px solid rgba(201,169,98,0.4);color:#c9a962;text-decoration:none">查看详情 →</a>`
        : "";
      const report = r.reportUrl
        ? `<a href="${esc(r.reportUrl)}" target="_blank" rel="noopener" class="btn-outline" style="display:inline-block;margin-top:0.75rem;margin-left:0.5rem;font-size:0.8rem;padding:0.35rem 0.75rem;border-radius:999px;border:1px solid rgba(201,169,98,0.4);color:#c9a962;text-decoration:none">查看报告 →</a>`
        : "";
      return `<article class="card"><div class="meta"><span class="badge">${esc(r.appLabel)}</span>${fmt(r.createdAt)}</div><h3>${esc(r.title)}</h3>${r.summary ? `<p>${esc(r.summary)}</p>` : ""}${r.recommendationReason ? `<p style="margin-top:0.5rem;color:#c9a962;font-size:0.8rem">💎 ${esc(r.recommendationReason)}</p>` : ""}${detail}${report}</article>`;
    }).join("");
  } catch { el.innerHTML = `<p class="empty">加载失败</p>`; }
}

async function loadOrders() {
  const el = qs("#orders-list");
  if (!el || el.dataset.loaded) return;
  try {
    const { orders } = await api("/auth/me/orders");
    el.dataset.loaded = "1";
    if (!orders.length) {
      el.innerHTML = `<div class="empty"><p>暂无订单</p><a href="https://shop.orasage.com">去商城 →</a></div>`;
      return;
    }
    el.innerHTML = orders.map((o) => `<article class="card"><div class="meta">${esc(o.orderNo)} · ${fmt(o.createdAt)}</div><h3>${esc(o.title)} <span style="color:#c9a962">${o.amountDisplay}</span></h3><p><span class="badge">${esc(o.statusLabel)}</span>${o.appLabel ? `<span class="badge">${esc(o.appLabel)}</span>` : ""}</p></article>`).join("");
  } catch { el.innerHTML = `<p class="empty">加载失败</p>`; }
}
