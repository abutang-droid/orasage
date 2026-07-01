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
    el.innerHTML = readings.map((r) => `<article class="card"><div class="meta"><span class="badge">${esc(r.appLabel)}</span>${fmt(r.createdAt)}</div><h3>${esc(r.title)}</h3>${r.summary ? `<p>${esc(r.summary)}</p>` : ""}${r.recommendationReason ? `<p style="margin-top:0.5rem;color:#c9a962;font-size:0.8rem">💎 ${esc(r.recommendationReason)}</p>` : ""}</article>`).join("");
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
