/* Sulaimon Qudus | site interactions (no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var WA = "2347052763487";
  var EMAIL = "hello@sulaimonqudus.com";

  /* ---------- Page load ---------- */
  function loaded() { requestAnimationFrame(function () { body.classList.add("is-loaded"); }); }
  if (document.readyState === "complete") loaded(); else window.addEventListener("load", loaded);
  setTimeout(loaded, 1800); // safety net if an image is slow

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header + progress + mobile bar ---------- */
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress");
  var mobileBar = document.querySelector(".mobile-bar");
  var lastY = 0, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    var max = doc.scrollHeight - window.innerHeight;
    if (header) {
      header.classList.toggle("scrolled", y > 30);
      header.classList.toggle("hide", y > 500 && y > lastY && !body.classList.contains("menu-open"));
    }
    if (progress) progress.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
    if (mobileBar) mobileBar.classList.toggle("show", y > window.innerHeight * 0.7 && y < max - 300);
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-btn");
  if (menuBtn) {
    var setMenu = function (open) {
      body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuBtn.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- Split headings into words ---------- */
  document.querySelectorAll("[data-split]").forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var outer = document.createElement("span"); outer.className = "split-word";
            var inner = document.createElement("span"); inner.textContent = part;
            outer.appendChild(inner); frag.appendChild(outer);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1) { walk(child); }
      });
    };
    walk(el);
    el.querySelectorAll(".split-word > span").forEach(function (s, i) { s.style.transitionDelay = (i * 0.045) + "s"; });
    el.classList.add("reveal-split");
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-img, .stagger, .reveal-split");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Scroll-lit statement ---------- */
  var statement = document.querySelector(".statement");
  if (statement) {
    var text = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = text.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var words = statement.querySelectorAll(".w");
    var lightUp = function () {
      var r = statement.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      var n = Math.round(p * words.length);
      words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    };
    if (reduce) words.forEach(function (w) { w.classList.add("on"); });
    else { window.addEventListener("scroll", lightUp, { passive: true }); lightUp(); }
  }

  /* ---------- Counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = parseFloat(el.getAttribute("data-count")), suffix = el.getAttribute("data-suffix") || "";
        co.unobserve(el);
        if (reduce) { el.textContent = end.toLocaleString() + suffix; return; }
        var start = null, dur = 1800;
        var step = function (t) {
          if (!start) start = t;
          var k = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - k, 4);
          el.textContent = Math.round(end * eased).toLocaleString() + suffix;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* ---------- Process line ---------- */
  var processEl = document.querySelector(".process");
  if (processEl) {
    var line = processEl.querySelector(".process-line i");
    var steps = processEl.querySelectorAll(".step");
    var drawProcess = function () {
      var r = processEl.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      if (line) line.style.transform = "scaleY(" + p + ")";
      steps.forEach(function (s) { s.classList.toggle("on", s.getBoundingClientRect().top < window.innerHeight * 0.6); });
    };
    window.addEventListener("scroll", drawProcess, { passive: true }); drawProcess();
  }

  /* ---------- Sticky stacking work cards ---------- */
  var workItems = document.querySelectorAll(".work-item");
  if (workItems.length && !reduce) {
    var stack = function () {
      if (window.innerWidth <= 860) { workItems.forEach(function (w) { w.firstElementChild.style.transform = ""; }); return; }
      workItems.forEach(function (item, i) {
        var next = workItems[i + 1];
        var card = item.firstElementChild;
        if (!next) { card.style.transform = ""; return; }
        var nr = next.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = Math.min(1, Math.max(0, 1 - (nr.top - 120) / (vh * 0.8)));
        card.style.transform = "scale(" + (1 - p * 0.06) + ")";
        card.style.filter = "brightness(" + (1 - p * 0.35) + ")";
      });
    };
    window.addEventListener("scroll", stack, { passive: true }); window.addEventListener("resize", stack); stack();
  }

  /* ---------- Hero book fan tilt ---------- */
  var stage = document.querySelector(".book-stage");
  if (stage && finePointer && !reduce) {
    var fan = stage.querySelector(".book-fan");
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) / r.width;
      var y = (e.clientY - (r.top + r.height / 2)) / r.height;
      fan.style.transform = "rotateY(" + (x * 14) + "deg) rotateX(" + (-y * 10) + "deg)";
    });
    hero.addEventListener("mouseleave", function () { fan.style.transform = ""; });
  }

  /* ---------- Spotlight on service cards ---------- */
  document.querySelectorAll(".service").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- Custom cursor ---------- */
  if (finePointer && !reduce) {
    var cur = document.createElement("div");
    cur.className = "cursor"; cur.setAttribute("aria-hidden", "true");
    cur.innerHTML = '<span class="lbl">View</span>';
    body.appendChild(cur);
    var cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add("on"); }, { passive: true });
    document.addEventListener("mouseleave", function () { cur.classList.remove("on"); });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("[data-cursor='view']").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("view"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("view"); });
    });
    document.querySelectorAll("a:not([data-cursor]), button:not([data-cursor]), summary").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("big"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("big"); });
    });
  }

  /* ---------- FAQ: one open at a time ---------- */
  var faqs = document.querySelectorAll(".faq-item");
  faqs.forEach(function (d) {
    d.addEventListener("toggle", function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------- Lightbox ---------- */
  var shots = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (shots.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Image viewer");
    lb.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-nav lb-prev" aria-label="Previous image">&#8592;</button><figure style="margin:0"><img alt=""><p></p></figure><button class="lb-nav lb-next" aria-label="Next image">&#8594;</button>';
    body.appendChild(lb);
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("p"), idx = 0, lastFocus = null;
    var show = function (i) {
      idx = (i + shots.length) % shots.length;
      var s = shots[idx];
      lbImg.src = s.getAttribute("data-lightbox");
      lbImg.alt = s.querySelector("img") ? s.querySelector("img").alt : "";
      lbCap.textContent = s.getAttribute("data-caption") || "";
    };
    var open = function (i) { lastFocus = document.activeElement; show(i); lb.classList.add("open"); body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); };
    var close = function () { lb.classList.remove("open"); body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    shots.forEach(function (s, i) { s.addEventListener("click", function () { open(i); }); });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + 1);
      if (e.key === "ArrowLeft") show(idx - 1);
    });
  }

  /* ---------- Project brief form: sends via WhatsApp or email ---------- */
  var form = document.getElementById("brief-form");
  if (form) {
    var err = form.querySelector(".form-error");
    var compose = function () {
      var f = new FormData(form);
      var services = f.getAll("services");
      var name = (f.get("name") || "").toString().trim();
      var email = (f.get("email") || "").toString().trim();
      if (!name || !email || !/^\S+@\S+\.\S+$/.test(email)) {
        err.textContent = "Please add your name and a valid email so I can reply.";
        (!name ? form.elements["name"] : form.elements["email"]).focus();
        return null;
      }
      err.textContent = "";
      var lines = [
        "Hi Sulaimon, I'd like to talk about my book.",
        "",
        "Name: " + name,
        "Email: " + email,
        f.get("title") ? "Book title: " + f.get("title") : "",
        f.get("genre") ? "Genre: " + f.get("genre") : "",
        services.length ? "I need: " + services.join(", ") : "",
        f.get("stage") ? "Where I am now: " + f.get("stage") : "",
        f.get("message") ? "\nMore details: " + f.get("message") : ""
      ].filter(function (l) { return l !== ""; });
      return lines.join("\n");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = compose(); if (!msg) return;
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    });
    var mailBtn = form.querySelector("[data-send-email]");
    if (mailBtn) mailBtn.addEventListener("click", function () {
      var msg = compose(); if (!msg) return;
      var tv = form.elements["title"].value.trim(); var title = tv ? " for \"" + tv + "\"" : "";
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("New book project" + title) + "&body=" + encodeURIComponent(msg);
    });
  }
})();
