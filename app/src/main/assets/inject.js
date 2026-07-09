(function () {
  if (window.__szerpBridgeInstalled) return;
  window.__szerpBridgeInstalled = true;

  var SCAN_CSS =
    "#jsontb{display:none !important;}" +
    "#szerpScanBox{position:sticky;top:0;left:0;right:0;z-index:99999;" +
    "background:#0a7d3a;padding:10px;font-family:sans-serif;}" +
    "#szerpScanInput{width:65%;font-size:24px;padding:8px;border-radius:6px;border:0;}" +
    "#szerpScanCount{color:#fff;font-size:14px;margin-left:8px;}" +
    "#szerpScanResult{padding:8px 10px;font-size:16px;background:#eef;min-height:20px;" +
    "font-family:sans-serif;}" +
    "#szerpScanResult.ok{background:#dcffdc;}" +
    "#szerpScanResult.err{background:#ffdcdc;}";

  // Thu thập toàn bộ frame con (đệ quy), kèm theo phần tử <iframe> DOM (nếu có)
  // để có thể chỉnh CSS phóng to khi bật "Quét nhanh".
  function collectFrames(win, out, frameEl) {
    out.push({ win: win, frameEl: frameEl || null });
    try {
      var doc = win.document;
      var iframes = doc.getElementsByTagName("iframe");
      for (var i = 0; i < iframes.length; i++) {
        try {
          collectFrames(iframes[i].contentWindow, out, iframes[i]);
        } catch (e) {}
      }
      // một số khung dùng <frame> (frameset cũ) thay vì <iframe>
      var frames2 = doc.getElementsByTagName("frame");
      for (var j = 0; j < frames2.length; j++) {
        try {
          collectFrames(frames2[j].contentWindow, out, frames2[j]);
        } catch (e) {}
      }
    } catch (e) {}
  }

  var patchedListFrameEl = null;

  function tryApply() {
    var all = [];
    try {
      collectFrames(window, all, null);
    } catch (e) {}
    for (var i = 0; i < all.length; i++) {
      var w = all[i].win;
      try {
        if (!w || w.__szerpListPatched) continue;
        var doc = w.document;
        if (!doc || !doc.location) continue;
        var loc = String(doc.location.href || "");
        if (loc.indexOf("newclothoutlib") === -1) continue;
        var tbl = doc.getElementById("jsontb");
        if (!tbl) continue;
        patchListFrame(w, doc);
        w.__szerpListPatched = true;
        patchedListFrameEl = all[i].frameEl;
      } catch (e) {}
    }
  }

  function patchListFrame(w, doc) {
    var style = doc.createElement("style");
    style.textContent = SCAN_CSS;
    doc.head.appendChild(style);

    var box = doc.createElement("div");
    box.id = "szerpScanBox";
    box.innerHTML =
      '<input id="szerpScanInput" type="text" placeholder="Quét mã pallet..." autocomplete="off"/>' +
      '<span id="szerpScanCount"></span>' +
      '<div id="szerpScanResult"></div>';
    doc.body.insertBefore(box, doc.body.firstChild);

    var input = doc.getElementById("szerpScanInput");
    var resultDiv = doc.getElementById("szerpScanResult");

    function setResult(msg, cls) {
      resultDiv.textContent = msg;
      resultDiv.className = cls || "";
    }

    function updateCount() {
      try {
        var n = doc.querySelectorAll("#jsontb tr[class*='list_row']").length;
        var c = doc.getElementById("szerpScanCount");
        if (c) c.textContent = "(" + n + " pallet đang chờ)";
      } catch (e) {}
      if (input && doc.activeElement !== input) {
        setTimeout(function () {
          input.focus();
        }, 200);
      }
    }
    updateCount();

    input.addEventListener("keydown", function (ev) {
      if (ev.keyCode !== 13) return;
      ev.preventDefault();
      var code = w.jQuery.trim(input.value);
      input.value = "";
      if (!code) return;

      var rows = doc.querySelectorAll("#jsontb tr[class*='list_row']");
      var found = null;
      for (var i = 0; i < rows.length; i++) {
        var id = rows[i].id;
        if (!id || id.indexOf("row") === -1) continue;
        var n = id.split("row")[1];
        var traynoInput = doc.getElementById("TRAYNO" + n);
        if (traynoInput && w.jQuery.trim(traynoInput.value) === code) {
          found = rows[i];
          break;
        }
      }

      if (found) {
        setResult("Tìm thấy pallet " + code + " - đang mở chi tiết...", "ok");
        // Kích hoạt lại đúng hàm xử lý click gốc của ERP (không viết lại logic)
        w.jQuery(found).trigger("click");
      } else {
        setResult(
          "Không thấy pallet '" +
            code +
            "' trong danh sách hiện tại. Có thể chưa đồng bộ lên hệ thống, đợi vài giây rồi quét lại.",
          "err"
        );
      }
    });

    setTimeout(function () {
      input.focus();
    }, 300);

    try {
      var mo = new w.MutationObserver(function () {
        updateCount();
      });
      mo.observe(doc.getElementById("jsontb"), {
        childList: true,
        subtree: true,
      });
    } catch (e) {}
  }

  setInterval(tryApply, 800);
  tryApply();

  // Gọi từ Android: bật/tắt chế độ "Quét nhanh" (phóng to khung danh sách pallet
  // đã được đơn giản hoá thành toàn màn hình, tạm ẩn phần layout ERP gốc).
  window.szerpToggleScan = function () {
    if (!patchedListFrameEl) {
      tryApply();
    }
    if (!patchedListFrameEl) return "chua_san_sang";
    var el = patchedListFrameEl;
    if (el.getAttribute("data-szerp-full") === "1") {
      el.removeAttribute("style");
      el.removeAttribute("data-szerp-full");
      return "off";
    } else {
      el.setAttribute("data-szerp-full", "1");
      el.setAttribute(
        "style",
        "position:fixed !important;top:0 !important;left:0 !important;" +
          "width:100% !important;height:100% !important;z-index:999999 !important;" +
          "background:#fff !important;"
      );
      return "on";
    }
  };
})();
