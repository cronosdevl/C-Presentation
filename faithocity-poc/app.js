/**
 * Faithocity POC — intentionally simple.
 * Shows guided flow + Easy Button mock + template switch + readiness + fake publish.
 */
const STEPS = [
  { id: "account", label: "Account" },
  { id: "church", label: "Church info" },
  { id: "path", label: "Build path" },
  { id: "easy", label: "Easy Button" },
  { id: "template", label: "Template" },
  { id: "pages", label: "Pages" },
  { id: "content", label: "Content" },
  { id: "ready", label: "Readiness" },
  { id: "publish", label: "Publish" },
];

/* Aligned to leadership Sanctuary comps (Downloads/tem) */
const TEMPLATES = [
  { id: "cornerstone", name: "Cornerstone", accent: "#0d9488", bg: "#0b1220", dark: true },
  { id: "heritage", name: "Heritage", accent: "#c45c26", bg: "#f7f2ea", dark: false },
  { id: "riverside", name: "Riverside", accent: "#e07a5f", bg: "#f3f6f2", dark: false },
];

const DEFAULT_PAGES = ["Home", "About Us", "Our Pastor", "Ministries", "Events", "Give", "Watch Live"];

const state = {
  step: 0,
  email: "",
  emailOptIn: true,
  smsOptIn: false,
  churchName: "",
  city: "",
  awwa: "",
  serviceTimes: "Sunday 11:00 AM",
  pastorName: "",
  path: "guided", // guided | easy
  existingUrl: "",
  ownUrlConfirmed: false,
  scraped: false,
  templateId: "heritage",
  pages: ["Home", "About Us", "Our Pastor", "Ministries", "Events", "Give"],
  about: "",
  ministries: "",
  giveUrl: "",
  liveUrl: "",
  published: false,
  subdomain: "",
};

const $ = (sel) => document.querySelector(sel);

function renderSteps() {
  const ol = $("#steps");
  ol.innerHTML = STEPS.map((s, i) => {
    const cls = i < state.step ? "done" : i === state.step ? "active" : "";
    const mark = i < state.step ? "✓ " : "";
    return `<li class="${cls}">${mark}${s.label}</li>`;
  }).join("");
}

function renderTemplateSelect() {
  const sel = $("#templateSelect");
  sel.innerHTML = TEMPLATES.map(
    (t) => `<option value="${t.id}" ${t.id === state.templateId ? "selected" : ""}>${t.name}</option>`
  ).join("");
  sel.onchange = () => {
    state.templateId = sel.value;
    updatePreview();
  };
}

function readiness() {
  const items = [
    { ok: !!state.churchName, label: "Church name" },
    { ok: !!state.pastorName, label: "Pastor name" },
    { ok: !!state.about && !state.about.includes("[default]"), label: "About content (not default)" },
    { ok: state.pages.includes("Give") ? !!state.giveUrl : true, label: "Giving link (if Give page selected)" },
    { ok: state.pages.includes("Watch Live") ? !!state.liveUrl : true, label: "Watch Live link (if selected)" },
    { ok: state.emailOptIn, label: "Email opt-in" },
    { ok: state.path !== "easy" || state.ownUrlConfirmed, label: "Easy Button ownership confirmed" },
  ];
  return items;
}

function mockScrape(url) {
  // Fake "AI scrape" — maps URL host into sample church content for the POC
  let host = "Grace Community";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").split(".")[0];
    host = host.replace(/-/g, " ");
    host = host.replace(/\b\w/g, (c) => c.toUpperCase());
  } catch (_) {}
  state.churchName = state.churchName || `${host} Church`;
  state.pastorName = state.pastorName || "Pastor Jordan Lee";
  state.city = state.city || "Your City";
  state.serviceTimes = "Sunday 10:00 AM & 6:00 PM";
  state.about =
    state.about ||
    `Welcome to ${state.churchName}. We are a faith community dedicated to worship, discipleship, and serving our neighbors. (Content mocked from Easy Button scrape of ${url})`;
  state.ministries = state.ministries || "Youth · Worship · Outreach · Small Groups";
  state.giveUrl = state.giveUrl || "https://example.com/give";
  state.liveUrl = state.liveUrl || "https://youtube.com/@example";
  state.scraped = true;
}

function viewAccount() {
  return `
    <h1>Create your account</h1>
    <p class="sub">MVP: Cognito auth · email opt-in required · SMS optional</p>
    <label>Work email</label>
    <input type="text" id="email" value="${escapeAttr(state.email)}" placeholder="you@church.org" />
    <div class="check-list">
      <label><input type="checkbox" id="emailOpt" ${state.emailOptIn ? "checked" : ""} /> I agree to receive emails from Faithocity (required)</label>
      <label><input type="checkbox" id="smsOpt" ${state.smsOptIn ? "checked" : ""} /> Opt in to SMS / push (optional)</label>
    </div>
    <div class="actions">
      <button id="next">Continue</button>
    </div>`;
}

function viewChurch() {
  return `
    <h1>Tell us about your church</h1>
    <p class="sub">Ask AWWA exactly: average weekly in-person worship attendees</p>
    <label>Church name</label>
    <input type="text" id="churchName" value="${escapeAttr(state.churchName)}" />
    <div class="row">
      <div>
        <label>City</label>
        <input type="text" id="city" value="${escapeAttr(state.city)}" />
      </div>
      <div>
        <label>Average weekly in-person worship attendees</label>
        <input type="number" id="awwa" value="${escapeAttr(state.awwa)}" min="0" placeholder="e.g. 120" />
      </div>
    </div>
    <label>Service times</label>
    <input type="text" id="serviceTimes" value="${escapeAttr(state.serviceTimes)}" />
    <label>Senior pastor name</label>
    <input type="text" id="pastorName" value="${escapeAttr(state.pastorName)}" />
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button id="next">Continue</button>
    </div>`;
}

function viewPath() {
  return `
    <h1>How do you want to start?</h1>
    <p class="sub">Hybrid onboarding — guided questions or Easy Button</p>
    <div class="check-list">
      <label><input type="radio" name="path" value="guided" ${state.path === "guided" ? "checked" : ""} /> Guided setup (step-by-step)</label>
      <label><input type="radio" name="path" value="easy" ${state.path === "easy" ? "checked" : ""} /> Easy Button — import from our current website (AI)</label>
    </div>
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button id="next">Continue</button>
    </div>`;
}

function viewEasy() {
  return `
    <h1>Easy Button</h1>
    <p class="sub">POC mock: we fake-scrape the URL into structured fields (real MVP uses AI + mapping)</p>
    <div class="banner">Enter <strong>your</strong> church site only. Copying another church’s site is not allowed.</div>
    <label>Existing website URL</label>
    <input type="url" id="existingUrl" value="${escapeAttr(state.existingUrl)}" placeholder="https://mychurch.org" />
    <div class="check-list">
      <label><input type="checkbox" id="ownUrl" ${state.ownUrlConfirmed ? "checked" : ""} /> I confirm this URL belongs to our church (not another ministry)</label>
    </div>
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button class="gold" id="scrape">Run Easy Button</button>
      <button id="next" ${state.scraped ? "" : "disabled"}>Continue with imported content</button>
    </div>`;
}

function viewTemplate() {
  return `
    <h1>Choose a template</h1>
    <p class="sub">MVP: 4–6 faith-themed templates · switch anytime after build</p>
    <div class="check-list">
      ${TEMPLATES.map(
        (t) =>
          `<label><input type="radio" name="tpl" value="${t.id}" ${
            state.templateId === t.id ? "checked" : ""
          } /> ${t.name}</label>`
      ).join("")}
    </div>
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button id="next">Continue</button>
    </div>`;
}

function viewPages() {
  return `
    <h1>Select pages</h1>
    <p class="sub">Church-specific defaults · custom pages capped by tier (TBD)</p>
    <div class="check-list">
      ${DEFAULT_PAGES.map(
        (p) =>
          `<label><input type="checkbox" class="page" value="${p}" ${
            state.pages.includes(p) ? "checked" : ""
          } /> ${p}</label>`
      ).join("")}
    </div>
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button id="next">Continue</button>
    </div>`;
}

function viewContent() {
  return `
    <h1>Content</h1>
    <p class="sub">Simple editing · AI fill belongs here in real product</p>
    <label>About</label>
    <textarea id="about">${escapeHtml(state.about || "[default] Tell your church story…")}</textarea>
    <label>Ministries (short)</label>
    <input type="text" id="ministries" value="${escapeAttr(state.ministries)}" />
    <label>Online giving URL (outbound)</label>
    <input type="url" id="giveUrl" value="${escapeAttr(state.giveUrl)}" placeholder="https://pushpay.com/..." />
    <label>Watch Live / YouTube URL</label>
    <input type="url" id="liveUrl" value="${escapeAttr(state.liveUrl)}" placeholder="https://youtube.com/..." />
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button id="next">Continue</button>
    </div>`;
}

function viewReady() {
  const items = readiness();
  const allOk = items.every((i) => i.ok);
  return `
    <h1>Website readiness</h1>
    <p class="sub">Block publish while defaults / required items remain</p>
    <ul class="ready">
      ${items
        .map((i) => `<li class="${i.ok ? "ok" : "bad"}">${i.ok ? "✓" : "○"} ${i.label}</li>`)
        .join("")}
    </ul>
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button id="next" ${allOk ? "" : "disabled"}>${allOk ? "Go to publish" : "Fix items to continue"}</button>
    </div>`;
}

function viewPublish() {
  const sub = state.subdomain || slugify(state.churchName || "your-church");
  return `
    <h1>${state.published ? "Published (mock)" : "Publish"}</h1>
    <p class="sub">MVP hosting: AWS Amplify · SSL · subdomain (CNAME for custom domains)</p>
    <label>Platform URL</label>
    <input type="text" id="subdomain" value="${escapeAttr(sub)}.faithocity.com" />
    <p class="sub" style="margin-top:0.75rem;">Custom domain later: point CNAME to this host — not a subfolder.</p>
    <div class="actions">
      <button class="secondary" id="back">Back</button>
      <button class="gold" id="publish">${state.published ? "Already published" : "Publish website"}</button>
    </div>
    ${
      state.published
        ? `<div class="banner" style="margin-top:1rem;">Mock live at <strong>https://${sub}.faithocity.com</strong> — return anytime to edit (CMS).</div>`
        : ""
    }`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "your-church";
}

function bindCommon() {
  const back = $("#back");
  const next = $("#next");
  if (back)
    back.onclick = () => {
      saveCurrent();
      // skip easy step when going back from template if guided
      if (STEPS[state.step].id === "template" && state.path === "guided") {
        state.step = STEPS.findIndex((s) => s.id === "path");
      } else {
        state.step = Math.max(0, state.step - 1);
      }
      render();
    };
  if (next)
    next.onclick = () => {
      if (!saveCurrent()) return;
      let nextIdx = state.step + 1;
      // skip Easy Button step if guided path
      if (STEPS[state.step].id === "path" && state.path === "guided") {
        nextIdx = STEPS.findIndex((s) => s.id === "template");
      }
      state.step = Math.min(STEPS.length - 1, nextIdx);
      render();
    };
  const scrape = $("#scrape");
  if (scrape)
    scrape.onclick = () => {
      saveCurrent();
      if (!state.existingUrl) {
        alert("Enter a website URL first.");
        return;
      }
      if (!state.ownUrlConfirmed) {
        alert("Confirm the URL belongs to your church.");
        return;
      }
      mockScrape(state.existingUrl);
      updatePreview();
      render();
    };
  const pub = $("#publish");
  if (pub)
    pub.onclick = () => {
      saveCurrent();
      state.subdomain = slugify(state.churchName);
      state.published = true;
      render();
      updatePreview();
    };
}

function saveCurrent() {
  const id = STEPS[state.step].id;
  if (id === "account") {
    state.email = $("#email")?.value.trim() || "";
    state.emailOptIn = $("#emailOpt")?.checked;
    state.smsOptIn = $("#smsOpt")?.checked;
    if (!state.email) {
      alert("Email required.");
      return false;
    }
    if (!state.emailOptIn) {
      alert("Email opt-in is required for MVP.");
      return false;
    }
  }
  if (id === "church") {
    state.churchName = $("#churchName")?.value.trim() || "";
    state.city = $("#city")?.value.trim() || "";
    state.awwa = $("#awwa")?.value.trim() || "";
    state.serviceTimes = $("#serviceTimes")?.value.trim() || "";
    state.pastorName = $("#pastorName")?.value.trim() || "";
  }
  if (id === "path") {
    const r = document.querySelector('input[name="path"]:checked');
    state.path = r ? r.value : "guided";
  }
  if (id === "easy") {
    state.existingUrl = $("#existingUrl")?.value.trim() || "";
    state.ownUrlConfirmed = $("#ownUrl")?.checked;
  }
  if (id === "template") {
    const r = document.querySelector('input[name="tpl"]:checked');
    if (r) state.templateId = r.value;
    $("#templateSelect").value = state.templateId;
  }
  if (id === "pages") {
    state.pages = [...document.querySelectorAll(".page:checked")].map((el) => el.value);
    if (!state.pages.includes("Home")) state.pages.unshift("Home");
  }
  if (id === "content") {
    state.about = $("#about")?.value || "";
    state.ministries = $("#ministries")?.value || "";
    state.giveUrl = $("#giveUrl")?.value.trim() || "";
    state.liveUrl = $("#liveUrl")?.value.trim() || "";
  }
  if (id === "publish") {
    const raw = $("#subdomain")?.value || "";
    state.subdomain = slugify(raw.replace(/\.faithocity\.com$/i, ""));
  }
  updatePreview();
  return true;
}

function updatePreview() {
  const tpl = TEMPLATES.find((t) => t.id === state.templateId) || TEMPLATES[0];
  const dark = !!tpl.dark;
  const name = state.churchName || "Your Church Name";
  const pastor = state.pastorName || "Pastor Name";
  const about = (state.about || "Your about text will appear here.").replace(/</g, "&lt;");
  const mins = state.ministries || "Ministries";
  const pages = state.pages.join(" · ");
  const headerBg = dark ? "#0b1220" : "#1f2933";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    body{margin:0;font-family:${dark ? "system-ui,sans-serif" : "Georgia, serif"};background:${tpl.bg};color:${
    dark ? "#f2efe8" : "#1a1a1a"
  };}
    header{background:${headerBg};color:#fff;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;}
    header strong{font-size:15px;}
    nav{font-size:11px;opacity:0.95;}
    .hero{padding:32px 16px;text-align:center;background:${dark ? "#111827" : "#e8e2d8"};}
    .hero .kicker{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${tpl.accent};font-family:system-ui;margin-bottom:8px;}
    .hero h1{font-size:22px;margin:0 0 8px;}
    .hero p{margin:0;opacity:0.85;font-size:13px;}
    .cta{display:inline-block;margin-top:12px;background:${tpl.accent};color:${
    dark ? "#04120f" : "#fff"
  };padding:8px 12px;border-radius:4px;font-size:12px;text-decoration:none;font-family:system-ui;font-weight:600;}
    .cta.outline{background:transparent;border:1px solid ${dark ? "#fff" : tpl.accent};color:${dark ? "#fff" : tpl.accent};margin-left:6px;}
    .icons{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:12px 10px;background:${
      dark ? "#0f172a" : "#fff"
    };font-family:system-ui;font-size:9px;text-align:center;color:${dark ? "#cbd5e1" : "#445"};}
    section{padding:16px;border-top:1px solid ${dark ? "#2a3344" : "#e5e0d8"};}
    h2{font-size:14px;color:${tpl.accent};margin:0 0 6px;font-family:system-ui;}
    p,li{font-size:12px;line-height:1.45;}
    .band{background:${tpl.accent};color:${dark ? "#04120f" : "#fff"};padding:14px 16px;text-align:center;font-family:system-ui;font-size:12px;}
    footer{padding:12px 16px;font-size:10px;opacity:0.75;font-family:system-ui;background:${headerBg};color:#fff;}
  </style></head><body>
  <header><strong>${name}</strong><nav>${pages}</nav></header>
  <div class="hero">
    <div class="kicker">Sanctuary · ${tpl.name}</div>
    <h1>${dark ? "Real faith. Real people." : "Real People. A Deeper Faith."}</h1>
    <p>${state.serviceTimes || "Service times"} · ${state.city || "City"}</p>
    <a class="cta" href="#">Plan a Visit</a>
    ${state.pages.includes("Watch Live") ? `<a class="cta outline" href="${state.liveUrl || "#"}">Watch Online</a>` : ""}
    ${state.pages.includes("Give") ? `<a class="cta outline" href="${state.giveUrl || "#"}">Give</a>` : ""}
  </div>
  <div class="icons"><div>Plan a Visit</div><div>Watch Online</div><div>Find Community</div><div>Make a Difference</div></div>
  <section><h2>About</h2><p>${about}</p></section>
  <section><h2>Our Pastor</h2><p>${pastor}</p></section>
  <section><h2>Ministries</h2><p>${mins}</p></section>
  <section><h2>Events</h2><p>Upcoming events (Google Calendar integration in MVP)</p></section>
  <div class="band">There's a place for you here. Take your next step.</div>
  <footer>${name}${state.published ? " · Published (mock)" : " · Draft"} · Template: Sanctuary ${tpl.name} · Powered by The Church Online</footer>
  </body></html>`;
  const frame = $("#frame");
  frame.srcdoc = html;
}

function renderView() {
  const id = STEPS[state.step].id;
  const map = {
    account: viewAccount,
    church: viewChurch,
    path: viewPath,
    easy: viewEasy,
    template: viewTemplate,
    pages: viewPages,
    content: viewContent,
    ready: viewReady,
    publish: viewPublish,
  };
  $("#view").innerHTML = map[id]();
  bindCommon();
}

function render() {
  renderSteps();
  renderView();
  updatePreview();
}

renderTemplateSelect();
render();
