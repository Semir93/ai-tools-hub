// Static page: search/filter/sort + submissions + popularity all run locally in the browser.

const CLICK_KEY = "ath_clicks_v1";
const SUBMIT_KEY = "ath_submissions_v1";

const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");
const mobileFilterSort = document.getElementById("mobileFilterSort");
const emptyState = document.getElementById("emptyState");

// Submit modal
const submitModal = document.getElementById("submitModal");
const openSubmit = document.getElementById("openSubmit");
const fabSubmit = document.getElementById("fabSubmit");
const closeSubmit = document.getElementById("closeSubmit");
const cancelSubmit = document.getElementById("cancelSubmit");
const submitForm = document.getElementById("submitForm");

// How modal
const howModal = document.getElementById("howModal");
const openHow = document.getElementById("openHow");
const closeHow = document.getElementById("closeHow");
const okHow = document.getElementById("okHow");

function openHowModal() {
  howModal.classList.add("open");
  howModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeHowModal() {
  howModal.classList.remove("open");
  howModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openHow?.addEventListener("click", (e) => {
  e.preventDefault();
  openHowModal();
});

closeHow?.addEventListener("click", closeHowModal);
okHow?.addEventListener("click", closeHowModal);

howModal?.addEventListener("click", (e) => {
  if (e.target === howModal) closeHowModal();
});
// Back to top
const toTop = document.getElementById("toTop");

// Contact form

const openContact = document.getElementById("openContact");
const closeContact = document.getElementById("closeContact");
const cancelContact = document.getElementById("cancelContact");
const contactModal = document.getElementById("contactModal");
const contactForm = document.getElementById("contactForm");

openContact.addEventListener("click", (e) => {
  e.preventDefault();
  contactModal.classList.add("open");
});

[closeContact, cancelContact].forEach(btn =>
  btn.addEventListener("click", () =>
    contactModal.classList.remove("open")
  )
);

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;

  const mailto = `semir.onlinejobs@gmail.com
    ?subject=Contact from ${encodeURIComponent(name)}
    &body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;

  window.location.href = mailto;
});





function normalizeSpaces(s) {
  let out = (s || "").trim();
  while (out.includes("  ")) out = out.replace("  ", " ");
  return out;
}

function slugify(input) {
  const s = normalizeSpaces(input).toLowerCase();
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const isAZ = ch >= "a" && ch <= "z";
    const is09 = ch >= "0" && ch <= "9";
    if (isAZ || is09) out += ch;
    else if (ch === " " || ch === "-" || ch === "_") out += "-";
  }
  while (out.includes("--")) out = out.replace("--", "-");
  if (out.startsWith("-")) out = out.slice(1);
  if (out.endsWith("-")) out = out.slice(0, -1);
  return out.slice(0, 60) || "tool";
}

function getToolName(card) {
  const h3 = card.querySelector("h3");
  if (!h3) return "unknown";
  const clone = h3.cloneNode(true);
  clone.querySelectorAll(".badge").forEach((b) => b.remove());
  return normalizeSpaces(clone.textContent) || "unknown";
}

function getClicks() {
  try {
    return JSON.parse(localStorage.getItem(CLICK_KEY) || "{}");
  } catch {
    return {};
  }
}

function setClicks(map) {
  localStorage.setItem(CLICK_KEY, JSON.stringify(map));
}

function incClick(toolId) {
  const map = getClicks();
  map[toolId] = (map[toolId] || 0) + 1;
  setClicks(map);
}

function getPopularity(card) {
  const id = card.dataset.toolId;
  const map = getClicks();
  return id && map[id] ? map[id] : 0;
}

function bootstrapCards() {
  document.querySelectorAll(".card").forEach((card) => {
    if (!card.dataset.toolId) {
      const name = getToolName(card);
      card.dataset.toolName = name;
      card.dataset.toolId = slugify(name);
    }

    const nameLower = (card.dataset.toolName || "").toLowerCase();
    if (!card.dataset.bestfor) {
      if (nameLower.includes("grammarly") || nameLower.includes("quillbot") || nameLower.includes("writesonic") || nameLower.includes("jasper")) {
        card.dataset.bestfor = "Writing";
      } else if (nameLower.includes("copilot") || nameLower.includes("cursor") || nameLower.includes("replit") || nameLower.includes("deepseek")) {
        card.dataset.bestfor = "Coding";
      } else if (nameLower.includes("midjourney") || nameLower.includes("dall") || nameLower.includes("stable") || nameLower.includes("leonardo") || nameLower.includes("canva")) {
        card.dataset.bestfor = "Design";
      }
    }
  });

  // Track clicks on any Visit link
  document.querySelectorAll(".card a").forEach((link) => {
    link.setAttribute("rel", "noopener noreferrer");
    link.addEventListener("click", () => {
      const card = link.closest(".card");
      if (!card) return;
      incClick(card.dataset.toolId);
      renderAllSignals(); // update "Popular" chip
    });
  });

  // Pricing tag helper
  document.querySelectorAll(".card").forEach((card) => {
    const price = card.dataset.price;
    if (price && !card.querySelector("[data-price-tag]")) {
      const priceTag = document.createElement("div");
      priceTag.setAttribute("data-price-tag", "1");
      priceTag.style.marginTop = "0.5rem";
      priceTag.style.fontSize = "0.75rem";
      priceTag.style.color = "#9ca3af";
      priceTag.textContent = "Pricing: " + price;
      card.appendChild(priceTag);
    }
  });
}

// Quick-scan signals
function ensureSignals(card) {
  if (card.querySelector(".signals")) return;
  const container = document.createElement("div");
  container.className = "signals";
  const p = card.querySelector("p");
  if (p && p.nextSibling) p.parentNode.insertBefore(container, p.nextSibling);
  else card.appendChild(container);
}

function setSignals(card) {
  ensureSignals(card);
  const signals = card.querySelector(".signals");
  if (!signals) return;

  signals.innerHTML = "";

  const bestFor = card.dataset.bestfor;
  if (bestFor) {
    const chip = document.createElement("span");
    chip.className = "chip muted";
    chip.textContent = "🧠 Best for: " + bestFor;
    signals.appendChild(chip);
  }

  const clicks = getPopularity(card);
  if (clicks > 0) {
    const chip = document.createElement("span");
    chip.className = "chip popular";
    chip.title = "Clicked " + clicks + " time(s) on this device";
    chip.textContent = "🔥 Popular";
    signals.appendChild(chip);
  }

  if (card.dataset.nosignup === "true") {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "⚡ No signup";
    signals.appendChild(chip);
  }

  if (card.dataset.api === "true") {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "🧩 API available";
    signals.appendChild(chip);
  }

  // At most 2 chips
  const all = Array.from(signals.querySelectorAll(".chip"));
  all.slice(2).forEach((x) => x.remove());
}

function renderAllSignals() {
  document.querySelectorAll(".card").forEach(setSignals);
}

// Filter + Sort + Empty state
function getActiveFilter() {
  const desktopVisible = filterSelect && getComputedStyle(filterSelect).display !== "none";
  return desktopVisible ? filterSelect.value : (window.__ath_filter || "all");
}

function getActiveSort() {
  const desktopVisible = sortSelect && getComputedStyle(sortSelect).display !== "none";
  return desktopVisible ? sortSelect.value : (window.__ath_sort || "default");
}

function sortGrid(grid) {
  const sort = getActiveSort();
  const cards = Array.from(grid.querySelectorAll(".card"));

  const visible = cards.filter((c) => !c.classList.contains("is-hidden"));
  const hidden = cards.filter((c) => c.classList.contains("is-hidden"));

  const sorted = [...visible].sort((a, b) => {
    if (sort === "popularity") {
      const pa = getPopularity(a);
      const pb = getPopularity(b);
      if (pb !== pa) return pb - pa;
      return (a.dataset.toolName || "").localeCompare(b.dataset.toolName || "");
    }
    if (sort === "az") {
      return (a.dataset.toolName || "").localeCompare(b.dataset.toolName || "");
    }
    return 0;
  });

  [...sorted, ...hidden].forEach((c) => grid.appendChild(c));
}

function updateEmptyState() {
  if (!emptyState) return;
  const anyVisible = Array.from(document.querySelectorAll(".card")).some(
    (c) => !c.classList.contains("is-hidden")
  );
  emptyState.classList.toggle("show", !anyVisible);
}

function applyFiltersAndSort() {
  const query = (searchInput.value || "").trim().toLowerCase();
  const filter = getActiveFilter();

  document.querySelectorAll(".card").forEach((card) => {
    const text = card.innerText.toLowerCase();
    const type = card.dataset.type;
    const matchesSearch = !query || text.includes(query);
    const matchesFilter = filter === "all" || filter === type;
    card.classList.toggle("is-hidden", !(matchesSearch && matchesFilter));
  });

  document.querySelectorAll(".grid").forEach(sortGrid);
  updateEmptyState();
  renderAllSignals();
}

// Submissions (localStorage)
function openModal() {
  submitModal.classList.add("open");
  submitModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  const name = document.getElementById("toolName");
  if (name) name.focus();
}

function closeModal() {
  submitModal.classList.remove("open");
  submitModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function loadSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(SUBMIT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSubmissions(list) {
  localStorage.setItem(SUBMIT_KEY, JSON.stringify(list));
}

function createCardFromSubmission(s) {
  const card = document.createElement("div");
  card.className = "card";
  card.dataset.type = s.type;
  if (s.bestfor) card.dataset.bestfor = s.bestfor;
  if (s.price) card.dataset.price = s.price;
  if (s.nosignup) card.dataset.nosignup = "true";
  if (s.api) card.dataset.api = "true";

  const toolId = slugify(s.name);
  card.dataset.toolName = s.name;
  card.dataset.toolId = toolId;

  const typeLabel = s.type.charAt(0).toUpperCase() + s.type.slice(1);
  const typeTooltip =
    s.type === "free" ? "Completely free to use"
    : s.type === "paid" ? "Paid product"
    : "Free plan available";

  card.innerHTML =
    '<span class="badge community" data-tooltip="Community submission">Community</span>' +
    "<h3>" +
      s.name +
      '<span class="badge ' + s.type + '" data-tooltip="' + typeTooltip + '">' + typeLabel + "</span>" +
    "</h3>" +
    "<p>" + s.description + "</p>" +
    '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer">Visit →</a>';

  const link = card.querySelector("a");
  if (link) link.addEventListener("click", () => { incClick(toolId); applyFiltersAndSort(); });

  if (s.price) {
    const priceTag = document.createElement("div");
    priceTag.setAttribute("data-price-tag", "1");
    priceTag.style.marginTop = "0.5rem";
    priceTag.style.fontSize = "0.75rem";
    priceTag.style.color = "#9ca3af";
    priceTag.textContent = "Pricing: " + s.price;
    card.appendChild(priceTag);
  }

  setSignals(card);
  return card;
}

function mountSubmissions() {
  const submissions = loadSubmissions();
  submissions.forEach((s) => {
    const id = slugify(s.name);
    if (document.querySelector('.card[data-tool-id="' + id + '"]')) return;
    const grid = document.querySelector("#" + s.category + " .grid");
    if (!grid) return;
    grid.appendChild(createCardFromSubmission(s));
  });
}

// How modal
function openHowModal() {
  howModal.classList.add("open");
  howModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeHowModal() {
  howModal.classList.remove("open");
  howModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Back to top behavior
function onScroll() {
  const y = window.scrollY || document.documentElement.scrollTop;
  toTop.classList.toggle("show", y > 600);
}
toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ----------------------------
// Auto favicons (no manual icons)
// ----------------------------
function getDomainFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function fallbackIconDataUri(label) {
  const safe = (label || "?").trim().slice(0, 2).toUpperCase();
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#38bdf8"/>
          <stop offset="1" stop-color="#0ea5e9"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#g)"/>
      <text x="32" y="40" font-size="22" text-anchor="middle"
            font-family="Inter, Arial" fill="#020617" font-weight="700">${safe}</text>
    </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function applyFavicons() {
  document.querySelectorAll(".card").forEach((card) => {
    const img = card.querySelector("h3 .icon");
    const link = card.querySelector("a[href]");
    if (!img || !link) return;

    // Always derive favicon from the "Visit" link
    const domain = getDomainFromUrl(link.href);
    if (!domain) return;

    // Google's favicon service (reliable and simple)
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

    // Set favicon
    img.classList.remove("is-fallback");
    img.src = faviconUrl;

    // If it fails, fallback to a nice generated icon
    img.onerror = () => {
      const toolName = (card.dataset.toolName || "").trim() || "AI";
      img.classList.add("is-fallback");
      img.src = fallbackIconDataUri(toolName);
      img.onerror = null; // prevent loops
    };
  });
}


// Events
searchInput?.addEventListener("input", applyFiltersAndSort);
filterSelect?.addEventListener("change", applyFiltersAndSort);
sortSelect?.addEventListener("change", applyFiltersAndSort);

mobileFilterSort?.addEventListener("change", () => {
  const v = mobileFilterSort.value;
  if (!v) return;

  if (v.startsWith("filter:")) window.__ath_filter = v.replace("filter:", "");
  if (v.startsWith("sort:")) window.__ath_sort = v.replace("sort:", "");

  // reset dropdown UI
  mobileFilterSort.value = "";
  applyFiltersAndSort();
});

openSubmit?.addEventListener("click", openModal);
fabSubmit?.addEventListener("click", openModal);
closeSubmit?.addEventListener("click", closeModal);
cancelSubmit?.addEventListener("click", closeModal);

submitModal?.addEventListener("click", (e) => {
  if (e.target === submitModal) closeModal();
});

submitForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const s = {
    name: normalizeSpaces(document.getElementById("toolName").value),
    url: normalizeSpaces(document.getElementById("toolUrl").value),
    category: document.getElementById("toolCategory").value,
    type: document.getElementById("toolType").value,
    description: normalizeSpaces(document.getElementById("toolDesc").value),
    price: normalizeSpaces(document.getElementById("toolPrice").value),
    email: normalizeSpaces(document.getElementById("toolEmail").value),
    bestfor: "",
    nosignup: false,
    api: false,
  };

  const list = loadSubmissions();
  list.unshift(s);
  saveSubmissions(list);

  mountSubmissions();
  applyFiltersAndSort();
  applyFavicons(); 
  submitForm.reset();
  closeModal();
   const toast = document.getElementById("submitToast");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
});


openHow?.addEventListener("click", (e) => {
  e.preventDefault();
  openHowModal();
});
closeHow?.addEventListener("click", closeHowModal);
okHow?.addEventListener("click", closeHowModal);
howModal?.addEventListener("click", (e) => {
  if (e.target === howModal) closeHowModal();
});

// Init

bootstrapCards();
mountSubmissions();
applyFiltersAndSort();
renderAllSignals();
applyFavicons(); 
window.addEventListener("scroll", onScroll);
onScroll();
<script src="./app.js"></script>


document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (e) => {
    // Did we click a link inside a card?
    const link = e.target.closest(".card a");
    if (!link) return;

    // Prefer explicit tool name from data-tool. Fallback to href.
    const toolName = link.dataset.tool || link.href;

    // 1) Google Analytics event (gtag)
    if (typeof window.gtag === "function") {
      window.gtag("event", "affiliate_click", {
        tool: toolName
      });
    }

    // 2) Optional: local "popularity" counter in localStorage (if you use it)
    // If you already have popularity logic elsewhere, keep only ONE copy.
    const key = `popularity:${toolName}`;
    const current = Number(localStorage.getItem(key) || "0");
    localStorage.setItem(key, String(current + 1));
  });
});
