/*
  category-badge.js
  掃描頁面上所有指向考卷的 <a> 連結，
  比對 exam_completion_registry，
  把「已完成」的連結加上徽章（含日期）＋淡化樣式。
*/
(function () {
  "use strict";

  function loadRegistry() {
    try {
      var raw = localStorage.getItem(window.EXAM_COMPLETION_REGISTRY_KEY || "exam_completion_registry");
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function isCategoryOrIndexLink(filename) {
    return /^index\.html?$/i.test(filename) || /^category_.*\.html?$/i.test(filename);
  }

  function isExternalLink(href) {
    return /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || href.indexOf("#") === 0;
  }

  function fileKeyFromHref(href) {
    var clean = href.split("?")[0].split("#")[0];
    var parts = clean.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "");
  }

  function formatDateShort(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
  }

  function formatBadgeText(record) {
    var date = formatDateShort(record.ts);
    if (record.score !== null && record.total !== null) {
      return "已完成 · " + record.score + "分" + (date ? " · " + date : "");
    }
    return "已完成" + (date ? " · " + date : "");
  }

  function buildBadgeEl(record) {
    var badge = document.createElement("span");
    badge.className = "exam-done-badge";
    badge.setAttribute("title", record.tsLabel ? ("完成時間：" + record.tsLabel) : "已完成");

    var seal = document.createElement("span");
    seal.className = "exam-done-badge-seal";
    seal.setAttribute("aria-hidden", "true");
    seal.textContent = "\u2713";

    var label = document.createElement("span");
    label.textContent = formatBadgeText(record);

    badge.appendChild(seal);
    badge.appendChild(label);
    return badge;
  }

  function injectStylesOnce() {
    if (document.getElementById("exam-done-badge-style")) return;
    var style = document.createElement("style");
    style.id = "exam-done-badge-style";
    style.textContent =
      ".exam-link-done{opacity:.6;background-color:#F1EFE8 !important;}" +
      ".exam-link-done:hover{opacity:.85;}" +
      ".exam-link-done .exam-link-title{color:inherit;}" +
      ".exam-done-badge{display:inline-flex;align-items:center;gap:6px;" +
      "margin-left:auto;padding:4px 12px;border:1px solid #DCD9D4;" +
      "border-radius:999px;font-size:11px;letter-spacing:.5px;" +
      "color:#8C7B5A;background-color:#FFFFFF;white-space:nowrap;" +
      "flex-shrink:0;}" +
      ".exam-done-badge-seal{display:inline-flex;align-items:center;" +
      "justify-content:center;width:14px;height:14px;border-radius:50%;" +
      "border:1px solid #8C7B5A;font-size:9px;line-height:1;color:#8C7B5A;}" +
      ".exam-link-title{flex:1;}";
    document.head.appendChild(style);
  }

  function applyBadges() {
    var registry = loadRegistry();
    var links = document.querySelectorAll("ul a[href]");

    links.forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || isExternalLink(href)) return;

      var key = fileKeyFromHref(href);
      if (!key || isCategoryOrIndexLink(key)) return;

      var record = registry[key];
      if (!record || !record.done) return;

      if (!a.querySelector(".exam-link-title")) {
        var wrapper = document.createElement("span");
        wrapper.className = "exam-link-title";
        while (a.firstChild) wrapper.appendChild(a.firstChild);
        a.appendChild(wrapper);
      }

      a.classList.add("exam-link-done");

      if (!a.querySelector(".exam-done-badge")) {
        a.appendChild(buildBadgeEl(record));
      }
    });
  }

  function init() {
    injectStylesOnce();
    applyBadges();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
