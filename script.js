/* ==========================================================================
   AMMAR Dairy Farm — Main JavaScript
   Vanilla JS — no dependencies
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Sticky header ---------- */
  const header = $(".site-header");
  const onScroll = () => {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");

    const btt = $(".back-to-top");
    if (btt) {
      if (window.scrollY > 500) btt.classList.add("show");
      else btt.classList.remove("show");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const hamburger = $(".hamburger");
  const mobileMenu = $(".mobile-menu");
  const overlay = $(".menu-overlay");

  function toggleMenu(open) {
    if (!hamburger || !mobileMenu) return;
    const willOpen = open !== undefined ? open : !mobileMenu.classList.contains("open");
    hamburger.classList.toggle("open", willOpen);
    mobileMenu.classList.toggle("open", willOpen);
    if (overlay) overlay.classList.toggle("open", willOpen);
    document.body.style.overflow = willOpen ? "hidden" : "";
  }

  if (hamburger) hamburger.addEventListener("click", () => toggleMenu());
  if (overlay) overlay.addEventListener("click", () => toggleMenu(false));
  if (mobileMenu) {
    $$("a", mobileMenu).forEach((a) =>
      a.addEventListener("click", () => toggleMenu(false))
    );
  }

  /* ---------- Smooth scrolling for anchor links ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---------- Hero slider ---------- */
  const slides = $$(".hero-slide");
  const dots = $$(".hero-dot");
  let slideIndex = 0;
  let slideTimer;

  function showSlide(idx) {
    if (slides.length === 0) return;
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
    slideIndex = idx;
  }

  function nextSlide() {
    showSlide((slideIndex + 1) % slides.length);
  }

  function prevSlide() {
    showSlide((slideIndex - 1 + slides.length) % slides.length);
  }

  function startSlider() {
    if (slides.length === 0) return;
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 6000);
  }

  $$(".hero-arrow--next").forEach((b) => b.addEventListener("click", () => { nextSlide(); startSlider(); }));
  $$(".hero-arrow--prev").forEach((b) => b.addEventListener("click", () => { prevSlide(); startSlider(); }));
  dots.forEach((d, i) => d.addEventListener("click", () => { showSlide(i); startSlider(); }));

  if (slides.length > 0) {
    showSlide(0);
    startSlider();
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const revealEls = $$(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Animated counters ---------- */
  const counters = $$("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const cIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          const dur = 1800;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          cIO.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => cIO.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    });
  }

  /* ---------- Product filtering ---------- */
  const filterBtns = $$(".filter-btn");
  const productCards = $$(".product-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.filter;
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      productCards.forEach((card) => {
        const show = cat === "all" || card.dataset.category === cat;
        card.classList.toggle("hide", !show);
      });
    });
  });

  /* ---------- FAQ accordion ---------- */
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    const q = $(".faq-question", item);
    const a = $(".faq-answer", item);
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      faqItems.forEach((fi) => {
        fi.classList.remove("open");
        const fa = $(".faq-answer", fi);
        if (fa) fa.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Stockist search ---------- */
  const stockistSearch = $("#stockistSearch");
  const stockistCards = $$(".stockist-card");
  const noResults = $(".no-results");

  if (stockistSearch) {
    stockistSearch.addEventListener("input", () => {
      const term = stockistSearch.value.toLowerCase().trim();
      let visible = 0;
      stockistCards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const match = text.includes(term);
        card.classList.toggle("hide", !match);
        if (match) visible++;
      });
      if (noResults) noResults.style.display = visible === 0 ? "block" : "none";
    });
  }

  /* ---------- Gallery lightbox ---------- */
  const galleryItems = $$(".mitem");
  const lightbox = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCaption = $("#lightboxCaption");
  let lbIndex = 0;
  let lbImages = [];

  if (galleryItems.length && lightbox) {
    lbImages = galleryItems.map((item) => {
      const img = $("img", item);
      return {
        src: img.src,
        alt: img.alt || "",
        caption: $(".mcaption", item) ? $(".mcaption", item).textContent : "",
      };
    });

    function openLightbox(i) {
      lbIndex = i;
      updateLightbox();
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
    }

    function updateLightbox() {
      const item = lbImages[lbIndex];
      if (!item) return;
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbCaption.textContent = item.caption;
    }

    function lbNext() {
      lbIndex = (lbIndex + 1) % lbImages.length;
      updateLightbox();
    }

    function lbPrev() {
      lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length;
      updateLightbox();
    }

    galleryItems.forEach((item, i) =>
      item.addEventListener("click", () => openLightbox(i))
    );

    const lbClose = $("#lightboxClose", lightbox);
    const lbNextBtn = $("#lightboxNext", lightbox);
    const lbPrevBtn = $("#lightboxPrev", lightbox);
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbNextBtn) lbNextBtn.addEventListener("click", lbNext);
    if (lbPrevBtn) lbPrevBtn.addEventListener("click", lbPrev);

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") lbNext();
      if (e.key === "ArrowLeft") lbPrev();
    });
  }

  /* ---------- Contact form validation ---------- */
  const contactForm = $("#contactForm");
  if (contactForm) {
    const showError = (group, msg) => {
      group.classList.add("error");
      const err = $(".form-error", group);
      if (err) {
        err.textContent = msg;
        err.style.display = "block";
      }
    };
    const clearError = (group) => {
      group.classList.remove("error");
      const err = $(".form-error", group);
      if (err) err.style.display = "none";
    };

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      const fields = [
        { id: "name", msg: "Please enter your name." },
        { id: "email", msg: "Please enter a valid email address.", email: true },
        { id: "phone", msg: "Please enter your phone number." },
        { id: "subject", msg: "Please enter a subject." },
        { id: "message", msg: "Please enter your message." },
      ];

      fields.forEach((f) => {
        const input = $("#" + f.id, contactForm);
        const group = input ? input.closest(".form-group") : null;
        if (!group) return;
        const val = input.value.trim();
        if (!val) {
          showError(group, f.msg);
          valid = false;
        } else if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          showError(group, f.msg);
          valid = false;
        } else {
          clearError(group);
        }
      });

      if (valid) {
        const success = $(".form-success", contactForm);
        if (success) {
          success.classList.add("show");
          contactForm.reset();
          setTimeout(() => success.classList.remove("show"), 5000);
        }
      }
    });

    $$(".form-group input, .form-group textarea", contactForm).forEach((input) => {
      input.addEventListener("input", () => {
        const group = input.closest(".form-group");
        if (group) clearError(group);
      });
    });
  }

  /* ---------- Newsletter validation ---------- */
  const newsletterForm = $("#newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input[type=email]", newsletterForm);
      const msg = $(".newsletter-msg", newsletterForm.parentElement) || $(".newsletter-msg");
      const val = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        if (msg) {
          msg.textContent = "Please enter a valid email address.";
          msg.className = "newsletter-msg show err";
        }
        return;
      }
      if (msg) {
        msg.textContent = "Thank you for subscribing to our farm news!";
        msg.className = "newsletter-msg show ok";
      }
      newsletterForm.reset();
      setTimeout(() => { if (msg) msg.classList.remove("show"); }, 4000);
    });
  }

  /* ---------- Back to top ---------- */
  const btt = $(".back-to-top");
  if (btt) {
    btt.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
  }

  /* ---------- Set active nav link ---------- */
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  $$("[data-nav]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "index.html" && href === "index.html")) {
      link.classList.add("active");
    }
  });
})();
