/* INHOUZ Instagram-style preview mockup. Vanilla JS, no frameworks. */
(function () {
  "use strict";

  const els = {
    banner: document.querySelector(".preview-banner"),
    headerHandle: document.getElementById("header-handle"),
    avatar: document.getElementById("avatar"),
    navAvatar: document.getElementById("nav-avatar"),
    posts: document.getElementById("stat-posts"),
    followers: document.getElementById("stat-followers"),
    following: document.getElementById("stat-following"),
    name: document.getElementById("profile-name"),
    category: document.getElementById("profile-category"),
    bio: document.getElementById("profile-bio"),
    website: document.getElementById("profile-website"),
    highlights: document.getElementById("highlights"),
    grid: document.getElementById("grid"),
    toggle: document.getElementById("toggle-new"),
    sourcesBtn: document.getElementById("sources-btn"),
    sourcesPanel: document.getElementById("sources-panel"),
    sourcesList: document.getElementById("sources-list"),
    gridRef: document.getElementById("grid-ref"),
    gridPreviewLink: document.getElementById("grid-preview-link"),
    toggleDock: document.getElementById("toggle-dock"),
    detail: document.getElementById("detail"),
    detailClose: document.getElementById("detail-close"),
    detailAvatar: document.getElementById("detail-avatar"),
    detailHandle: document.getElementById("detail-handle"),
    detailMedia: document.getElementById("detail-media"),
    detailLikes: document.getElementById("detail-likes"),
    detailCaptionHandle: document.getElementById("detail-caption-handle"),
    detailCaption: document.getElementById("detail-caption"),
    detailComments: document.getElementById("detail-comments"),
  };

  const state = {
    profile: null,
    posts: null,
    byId: {},
    showNew: true,
    openId: null,
  };

  const ICONS = {
    carousel:
      '<svg class="tile-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="6" width="13" height="13" rx="1.5" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M5 16V5.8A1.8 1.8 0 0 1 6.8 4H16" fill="none" stroke="#fff" stroke-width="1.7"/></svg>',
    reel:
      '<svg class="tile-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="3" fill="none" stroke="#fff" stroke-width="1.7"/><path d="M10 9.5 16 12l-6 2.5z" fill="#fff"/></svg>',
  };

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatCount(n) {
    if (n == null || n === "") return "—";
    if (typeof n === "string") {
      const cleaned = n.replace(/,/g, "").trim();
      const parsed = Number(cleaned);
      if (!Number.isFinite(parsed)) return n;
      n = parsed;
    }
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    if (v >= 10000) return (v / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return v.toLocaleString("en-US");
  }

  function observedPosts(profile) {
    const raw = profile.posts_count_observed ?? profile.posts ?? profile.post_count;
    const v = Number(String(raw == null ? "" : raw).replace(/,/g, ""));
    return Number.isFinite(v) ? v : null;
  }

  function pathOf(url) {
    if (!url) return "";
    return String(url);
  }

  function imageTag(opts) {
    const src = pathOf(opts.src);
    const srcset = opts.srcset ? pathOf(opts.srcset) : "";
    const sizes = opts.sizes || "100vw";
    const w = opts.width || 400;
    const h = opts.height || 400;
    const alt = escapeHtml(opts.alt || "");
    const loading = opts.eager ? "eager" : "lazy";
    const cls = opts.className ? ` class="${opts.className}"` : "";
    const id = opts.id ? ` id="${opts.id}"` : "";
    const parts = [
      `src="${escapeHtml(src)}"`,
      srcset ? `srcset="${escapeHtml(srcset)}" sizes="${escapeHtml(sizes)}"` : "",
      `width="${w}"`,
      `height="${h}"`,
      `alt="${alt}"`,
      `loading="${loading}"`,
      `decoding="async"`,
    ];
    return `<img${id}${cls} ${parts.filter(Boolean).join(" ")}>`;
  }

  function syncChromeOffset() {
    if (els.banner) {
      document.documentElement.style.setProperty(
        "--banner-total",
        els.banner.offsetHeight + "px"
      );
    }
    if (els.toggleDock) {
      document.documentElement.style.setProperty(
        "--toggle-space",
        els.toggleDock.offsetHeight + "px"
      );
    }
  }

  function setPreload(href) {
    let link = document.getElementById("preload-avatar");
    if (!link) {
      link = document.createElement("link");
      link.id = "preload-avatar";
      link.rel = "preload";
      link.as = "image";
      document.head.appendChild(link);
    }
    if (href) {
      if (href.endsWith(".webp")) link.type = "image/webp";
      link.href = href;
    }
  }

  function applyAvatar(img, profile, eager) {
    const src = profile.avatar_thumb || profile.avatar || "assets/avatar.jpg";
    img.src = src;
    if (profile.avatar_srcset) {
      img.srcset = profile.avatar_srcset;
      img.sizes = "86px";
    }
    img.width = profile.avatar_width || 86;
    img.height = profile.avatar_height || 86;
    img.decoding = "async";
    img.loading = eager ? "eager" : "lazy";
    img.alt = (profile.display_name || profile.name || "INHOUZ") + " profile avatar";
  }

  function renderProfile(profile, posts) {
    const handle = (profile.handle || "inhouz.in").replace(/^@/, "");
    els.headerHandle.textContent = handle;
    applyAvatar(els.avatar, profile, true);
    applyAvatar(els.navAvatar, profile, false);
    applyAvatar(els.detailAvatar, profile, false);
    setPreload(profile.avatar_thumb || profile.avatar);

    const shown = (posts.visible_new_count || 0) + (posts.existing_count || 0);
    const base = observedPosts(profile);
    const displayPosts = base != null ? base + (state.showNew ? posts.visible_new_count || 0 : 0) : shown;
    els.posts.textContent = formatCount(displayPosts);
    els.posts.parentElement.classList.toggle("stat-placeholder", !!state.showNew && (posts.visible_new_count || 0) > 0);
    els.followers.textContent = formatCount(profile.followers);
    els.following.textContent = formatCount(profile.following);
    els.name.textContent = profile.display_name || profile.name || "INHOUZ";
    els.category.textContent = profile.category || "";
    els.bio.textContent = profile.bio || "";
    const site = profile.website || profile.website_url || "https://www.inhouz.in/";
    els.website.href = site;
    els.website.textContent = (profile.website_label || site.replace(/^https?:\/\//, "").replace(/\/$/, ""));
    els.detailHandle.textContent = handle;
    els.detailCaptionHandle.textContent = handle;

    renderHighlights(profile.highlights || []);
    renderSources(profile);
    const preview = posts.grid_preview;
    if (preview && els.gridPreviewLink) {
      els.gridPreviewLink.hidden = false;
      els.gridPreviewLink.href = preview;
      if (els.gridRef) els.gridRef.hidden = false;
    } else {
      if (els.gridPreviewLink) els.gridPreviewLink.hidden = true;
      if (els.gridRef) els.gridRef.hidden = true;
    }
  }

  function renderHighlights(list) {
    els.highlights.innerHTML = list
      .map((h, i) => {
        const img = imageTag({
          src: h.cover,
          width: h.cover_width || 64,
          height: h.cover_height || 64,
          alt: h.name || "",
          eager: i < 4,
          sizes: "64px",
        });
        return `<div class="highlight"><div class="highlight-ring">${img}</div><span>${escapeHtml(h.name || "")}</span></div>`;
      })
      .join("");
  }

  function renderSources(profile) {
    const sources = profile.field_sources || {};
    const rows = Object.keys(sources)
      .map((key) => {
        const s = sources[key] || {};
        const real = s.real ? "Real" : "Placeholder";
        return `<div class="source-row"><dt>${escapeHtml(key)}</dt><dd><em>${real}.</em> ${escapeHtml(s.note || s.source || "")}</dd></div>`;
      })
      .join("");
    els.sourcesList.innerHTML = `<dl>${rows}</dl>`;
  }

  function tileHtml(post, index) {
    const newBadge = post.is_new ? '<span class="badge-new">NEW</span>' : "";
    if (post.kind === "slot") {
      const label = post.format === "reel" ? "Reel" : post.format === "carousel" ? "Carousel" : "4:5 still";
      return `<div class="tile tile-slot" data-id="${escapeHtml(post.id)}">
        <span class="slot-plus">+</span>
        <span class="slot-label">${escapeHtml(label)} · ${escapeHtml(post.title || "Post " + post.slot)}</span>
        ${newBadge}
      </div>`;
    }
    const cover = post.cover || post.thumb || post.src;
    const eager = index < 6;
    const img = imageTag({
      src: cover,
      srcset: post.srcset,
      width: post.width || 400,
      height: post.height || 400,
      alt: post.title || "",
      eager,
      sizes: "(max-width: 430px) 33vw, 130px",
    });
    let icon = "";
    if (post.is_carousel) icon = ICONS.carousel;
    else if (post.is_reel) icon = ICONS.reel;
    return `<button type="button" class="tile" data-id="${escapeHtml(post.id)}" aria-label="Open post">
      ${img}${icon}${newBadge}
    </button>`;
  }

  function visiblePosts() {
    const incoming = state.posts || {};
    const news = incoming.new_posts || [];
    const existing = incoming.existing_posts || [];
    return state.showNew ? news.concat(existing) : existing;
  }

  function renderGrid() {
    const list = visiblePosts();
    els.grid.innerHTML = list.map((p, i) => tileHtml(p, i)).join("");
  }

  function indexPosts() {
    state.byId = {};
    const incoming = state.posts || {};
    (incoming.new_posts || []).concat(incoming.existing_posts || []).forEach((p) => {
      if (p && p.id) state.byId[p.id] = p;
    });
  }

  function padSlot(n) {
    return String(n).padStart(2, "0");
  }

  function postHash(post) {
    if (post && post.is_new && post.slot) return "#/p/" + padSlot(post.slot);
    if (post && post.id) return "#/p/x/" + encodeURIComponent(post.id);
    return "";
  }

  function parseRoute() {
    const h = location.hash || "";
    let m = h.match(/^#\/p\/(\d+)\/?$/i);
    if (m) return { kind: "new", slot: parseInt(m[1], 10) };
    m = h.match(/^#\/p\/x\/([^/]+)\/?$/i);
    if (m) return { kind: "existing", id: decodeURIComponent(m[1]) };
    m = h.match(/^#\/post\/(.+)$/i);
    if (m) return { kind: "legacy", raw: decodeURIComponent(m[1]) };
    return { kind: "profile" };
  }

  function postForRoute(route) {
    if (!route || route.kind === "profile") return null;
    if (route.kind === "new") {
      return (state.posts.new_posts || []).find((p) => p.slot === route.slot) || null;
    }
    if (route.kind === "existing") return state.byId[route.id] || null;
    if (route.kind === "legacy") {
      const raw = route.raw;
      if (state.byId[raw]) return state.byId[raw];
      const num = parseInt(raw.replace(/^new-/, ""), 10);
      if (Number.isFinite(num)) {
        return (state.posts.new_posts || []).find((p) => p.slot === num) || null;
      }
    }
    return null;
  }

  function profileURL() {
    return location.pathname + location.search;
  }

  function renderDetailMedia(post) {
    const slides = (post.slides && post.slides.length ? post.slides : [{ src: post.src, media_type: post.media_type }]).filter(Boolean);
    if (post.is_reel && slides[0] && slides[0].media_type === "video") {
      const s = slides[0];
      els.detailMedia.className = "detail-media is-reel";
      els.detailMedia.innerHTML = `<div class="still-frame reel-frame"><video src="${escapeHtml(s.src)}" controls playsinline preload="metadata" width="${s.detail_width || 1080}" height="${s.detail_height || 1920}"></video></div>`;
      return;
    }
    if (post.is_carousel && slides.length > 1) {
      const frames = slides
        .map((s, i) => {
          const src = s.detail || s.src;
          const img = imageTag({
            src,
            srcset: s.srcset,
            width: s.detail_width || s.width || 1080,
            height: s.detail_height || s.height || 1350,
            alt: (post.title || "Post") + " slide " + (i + 1),
            eager: i === 0,
            sizes: "(max-width: 430px) 100vw, 390px",
          });
          return `<div class="carousel-slide still-frame" data-index="${i}">${img}</div>`;
        })
        .join("");
      const dots = slides.map((_, i) => `<button type="button" class="carousel-dot${i === 0 ? " is-active" : ""}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`).join("");
      els.detailMedia.className = "detail-media is-still";
      els.detailMedia.innerHTML = `
        <div class="carousel-wrap">
          <div class="carousel" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Post slides">
            ${frames}
          </div>
          <button type="button" class="carousel-nav prev" aria-label="Previous slide">‹</button>
          <button type="button" class="carousel-nav next" aria-label="Next slide">›</button>
          <div class="carousel-dots">${dots}</div>
        </div>`;
      bindCarousel(els.detailMedia.querySelector(".carousel"), els.detailMedia);
      return;
    }
    const s = slides[0] || {};
    const src = s.detail || s.src || post.detail || post.src;
    const img = imageTag({
      src,
      srcset: s.srcset || post.srcset,
      width: s.detail_width || post.detail_width || 1080,
      height: s.detail_height || post.detail_height || 1350,
      alt: post.title || "Post",
      eager: true,
      sizes: "(max-width: 430px) 100vw, 390px",
    });
    els.detailMedia.className = "detail-media is-still";
    els.detailMedia.innerHTML = `<div class="still-frame">${img}</div>`;
  }

  function bindCarousel(scroller, root) {
    if (!scroller) return;
    const slides = Array.from(scroller.querySelectorAll(".carousel-slide"));
    const dots = Array.from(root.querySelectorAll(".carousel-dot"));
    const prev = root.querySelector(".carousel-nav.prev");
    const next = root.querySelector(".carousel-nav.next");
    let index = 0;

    function go(i, smooth) {
      index = (i + slides.length) % slides.length;
      const left = scroller.clientWidth * index;
      scroller.scrollTo({ left, behavior: smooth === false ? "auto" : "smooth" });
      dots.forEach((d, n) => d.classList.toggle("is-active", n === index));
    }

    function syncFromScroll() {
      const w = scroller.clientWidth || 1;
      const nextIndex = Math.round(scroller.scrollLeft / w);
      if (nextIndex !== index && nextIndex >= 0 && nextIndex < slides.length) {
        index = nextIndex;
        dots.forEach((d, n) => d.classList.toggle("is-active", n === index));
      }
    }

    scroller.addEventListener("scroll", syncFromScroll, { passive: true });
    dots.forEach((d) => d.addEventListener("click", () => go(Number(d.dataset.index))));
    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));
    scroller.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
    });

    // Pointer swipe fallback for browsers that don't honour native overflow swipe well
    let startX = 0, startY = 0, startLeft = 0, tracking = false, axis = null;
    scroller.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.buttons !== 1) return;
      tracking = true;
      axis = null;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = scroller.scrollLeft;
      scroller.style.scrollBehavior = "auto";
      try { scroller.setPointerCapture(e.pointerId); } catch (_) {}
    });
    scroller.addEventListener("pointermove", (e) => {
      if (!tracking) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis === "x") {
        e.preventDefault();
        scroller.scrollLeft = startLeft - dx;
      }
    });
    function endPointer(e) {
      if (!tracking) return;
      tracking = false;
      scroller.style.scrollBehavior = "";
      const w = scroller.clientWidth || 1;
      const dx = e.clientX - startX;
      let target = Math.round(scroller.scrollLeft / w);
      if (dx < -40) target = index + 1;
      else if (dx > 40) target = index - 1;
      go(target);
    }
    scroller.addEventListener("pointerup", endPointer);
    scroller.addEventListener("pointercancel", endPointer);
    scroller._go = go;
  }

  function openPost(post, opts) {
    if (!post || post.kind === "slot") return;
    const push = !opts || opts.push !== false;
    state.openId = post.id;
    renderDetailMedia(post);
    const likes = post.likes != null ? post.likes : 128;
    const comments = post.comments || [];
    els.detailLikes.textContent = formatCount(likes) + " likes";
    els.detailCaption.textContent = post.caption || post.title || "";
    els.detailComments.innerHTML = comments
      .map((c) => `<p><strong>${escapeHtml(c.author || "guest")}</strong> ${escapeHtml(c.text || "")}</p>`)
      .join("");
    els.detail.hidden = false;
    document.body.style.overflow = "hidden";
    const hash = postHash(post);
    if (push && location.hash !== hash) {
      history.pushState({ view: "post", id: post.id }, "", hash);
    }
    els.detailClose.focus();
  }

  function closePost(opts) {
    const fromPop = opts && opts.fromPop;
    els.detail.hidden = true;
    els.detailMedia.innerHTML = "";
    state.openId = null;
    document.body.style.overflow = "";
    if (!fromPop && location.hash.indexOf("#/p/") === 0) {
      if (history.state && history.state.view === "post") {
        history.back();
        return;
      }
      history.pushState({ view: "profile" }, "", profileURL());
    }
  }

  function requestClose() {
    if (history.state && history.state.view === "post") {
      history.back();
      return;
    }
    closePost({ fromPop: true });
    history.replaceState({ view: "profile" }, "", profileURL());
  }

  function applyRoute(push) {
    const route = parseRoute();
    const post = postForRoute(route);
    if (post && post.kind !== "slot") {
      openPost(post, { push: !!push });
    } else {
      closePost({ fromPop: true });
    }
  }

  function onFirstLoadRoute() {
    const route = parseRoute();
    const post = postForRoute(route);
    const path = profileURL();
    if (post && post.kind !== "slot") {
      history.replaceState({ view: "profile" }, "", path);
      history.pushState({ view: "post", id: post.id }, "", postHash(post));
      openPost(post, { push: false });
    } else {
      history.replaceState({ view: "profile" }, "", path + (route.kind === "profile" ? (location.hash || "") : ""));
    }
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(url + " " + res.status);
    return res.json();
  }

  function dataBase() {
    const raw = document.documentElement.getAttribute("data-base") || "";
    if (raw) return raw.endsWith("/") ? raw : raw + "/";
    return "";
  }

  async function loadData() {
    const prefix = dataBase();
    if (prefix) {
      const [profile, posts] = await Promise.all([
        fetchJSON(prefix + "data/profile.json"),
        fetchJSON(prefix + "data/posts.json"),
      ]);
      return { profile, posts };
    }
    try {
      const [profile, posts] = await Promise.all([fetchJSON("/api/profile"), fetchJSON("/api/posts")]);
      return { profile, posts };
    } catch (_) {
      const [profile, posts] = await Promise.all([
        fetchJSON("./data/profile.json"),
        fetchJSON("./data/posts.json"),
      ]);
      return { profile, posts };
    }
  }

  async function boot() {
    syncChromeOffset();
    const data = await loadData();
    state.profile = data.profile;
    state.posts = data.posts;
    indexPosts();
    renderProfile(state.profile, state.posts);
    renderGrid();
    syncChromeOffset();
    onFirstLoadRoute();
  }

  els.grid.addEventListener("click", (e) => {
    const tile = e.target.closest("[data-id]");
    if (!tile) return;
    const post = state.byId[tile.getAttribute("data-id")];
    if (post && post.kind !== "slot") openPost(post, { push: true });
  });

  els.detailClose.addEventListener("click", requestClose);
  els.detail.addEventListener("click", (e) => {
    if (e.target === els.detail) requestClose();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.openId) requestClose();
  });

  window.addEventListener("popstate", () => {
    applyRoute(false);
  });

  els.toggle.addEventListener("click", () => {
    state.showNew = !state.showNew;
    els.toggle.setAttribute("aria-pressed", state.showNew ? "true" : "false");
    els.toggle.classList.toggle("is-off", !state.showNew);
    els.toggle.querySelector(".toggle-label").textContent = state.showNew ? "New posts on" : "New posts off";
    renderGrid();
    renderProfile(state.profile, state.posts);
  });

  els.sourcesBtn.addEventListener("click", () => {
    const open = els.sourcesPanel.hidden;
    els.sourcesPanel.hidden = !open;
    els.sourcesBtn.setAttribute("aria-expanded", open ? "true" : "false");
    syncChromeOffset();
  });

  window.addEventListener("resize", syncChromeOffset);

  boot().catch((err) => {
    console.error(err);
    els.grid.innerHTML = '<p class="load-error">Could not load the preview.</p>';
  });
})();
