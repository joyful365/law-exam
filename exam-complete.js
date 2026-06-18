/*
  exam-complete.js
  ------------------------------------------------------------------
  共用小工具：考卷頁（第三層）在「交卷算分」時呼叫 reportExamComplete()，
  會把完成紀錄寫進一個跨頁共用的 localStorage registry，
  讓分類頁（第二層）可以讀取並顯示「已完成」徽章。

  使用方式（在考卷頁的交卷邏輯裡呼叫一次）：

      reportExamComplete({
        score: 86,          // 本次得分（必填）
        total: 80,           // 總題數（必填）
        correctCount: 43     // 答對題數（選填，沒有就不會顯示在徽章細節）
      });

  資料會以「目前頁面的檔名」當作 key 存進去，例如：
      "114司律一試_民法、民訴.html"
  所以分類頁裡的 <a href="114司律一試_民法、民訴.html"> 才能對應得上。

  如果同一份考卷重複交卷，只會覆蓋同一筆紀錄（不會疊加）。
------------------------------------------------------------------
*/
(function (global) {
  "use strict";

  var REGISTRY_KEY = "exam_completion_registry";

  function loadRegistry() {
    try {
      var raw = localStorage.getItem(REGISTRY_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveRegistry(reg) {
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
    } catch (e) {
      /* localStorage 不可用時靜默失敗，不影響考卷本身功能 */
    }
  }

  function currentFileKey() {
    // 取出目前頁面的檔名（不含路徑），例如：
    // ".../114司律一試_民法、民訴.html" -> "114司律一試_民法、民訴.html"
    var path = global.location.pathname;
    var parts = path.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "");
  }

  function reportExamComplete(info) {
    info = info || {};
    var key = currentFileKey();
    if (!key) return null;

    var reg = loadRegistry();
    var now = new Date();
    var tsLabel =
      now.getFullYear() + "/" +
      String(now.getMonth() + 1).padStart(2, "0") + "/" +
      String(now.getDate()).padStart(2, "0") + " " +
      String(now.getHours()).padStart(2, "0") + ":" +
      String(now.getMinutes()).padStart(2, "0");

    reg[key] = {
      done: true,
      score: typeof info.score === "number" ? info.score : null,
      total: typeof info.total === "number" ? info.total : null,
      correctCount: typeof info.correctCount === "number" ? info.correctCount : null,
      ts: now.getTime(),
      tsLabel: tsLabel
    };

    saveRegistry(reg);
    return reg[key];
  }

  function clearExamComplete(fileKey) {
    var key = fileKey || currentFileKey();
    var reg = loadRegistry();
    if (reg[key]) {
      delete reg[key];
      saveRegistry(reg);
    }
  }

  function getExamComplete(fileKey) {
    var key = fileKey || currentFileKey();
    var reg = loadRegistry();
    return reg[key] || null;
  }

  // 對外公開的全域函式
  global.reportExamComplete = reportExamComplete;
  global.clearExamComplete = clearExamComplete;
  global.getExamComplete = getExamComplete;
  global.EXAM_COMPLETION_REGISTRY_KEY = REGISTRY_KEY;

})(window);
