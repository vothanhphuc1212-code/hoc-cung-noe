// Bộ dịch giao diện: khi người học chọn English, mọi chữ tiếng Việt hiện trên trang được thay bằng
// tiếng Anh theo từ điển window.DICH_EN (dich-en.js), ngay lúc chữ được vẽ ra (kể cả hộp thoại, thông báo).
// Chữ do AI soạn (bài học, lộ trình) đã theo ngôn ngữ người học nên không cần dịch.
(function () {
  const chuan = s => s.replace(/\s+/g, ' ').trim();
  const thoat = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let dung = new Map(), mau = [];

  function napTuDien(D) {
    dung = new Map(); mau = [];
    for (const [k, v] of Object.entries(D || {})) {
      if (k.includes('{}')) mau.push([new RegExp('^' + k.split('{}').map(x => thoat(chuan(x) === '' ? x : x)).join('(.*?)') + '$'), v, k.replace(/\{\}/g, '').length]);
      else dung.set(chuan(k), v);
    }
    mau.sort((a, b) => b[2] - a[2]); // mẫu nhiều chữ cố định nhất thử trước
  }

  function dich(s, sau = 0) {
    const t = chuan(s);
    if (!t) return null;
    if (dung.has(t)) return dung.get(t);
    if (sau > 2) return null;
    // Chữ ghép nhiều mảnh bằng " · " (ví dụ "Module 1 · học ngày ... · tốt nhất 2/3 câu"): dịch từng mảnh
    if (t.includes(' · ')) {
      const manh = t.split(' · ');
      const ds = manh.map(x => dich(x, sau + 1));
      if (ds.some(x => x != null)) return manh.map((x, i) => ds[i] ?? x).join(' · ');
    }
    for (const [re, v] of mau) {
      const m = t.match(re);
      if (!m) continue;
      let i = 1;
      return v.replace(/\{\}/g, () => { const g = m[i++] || ''; const gd = dich(g, sau + 1); return gd ?? g; });
    }
    return null;
  }

  const BO_QUA = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE', 'PRE', 'svg', 'SVG']);
  function boQua(el) {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      if (BO_QUA.has(e.tagName) || e.classList?.contains('khong-dich')) return true;
    }
    return false;
  }
  function dichNut(n) {
    if (n.nodeType === 3) {
      if (!n.parentElement || boQua(n.parentElement)) return;
      const m = n.data.match(/^(\s*)([\s\S]*?)(\s*)$/);
      const d = m && dich(m[2]);
      if (d != null && d !== m[2]) n.data = m[1] + d + m[3];
      return;
    }
    if (n.nodeType !== 1 || boQua(n)) return;
    for (const a of ['placeholder', 'title', 'aria-label']) {
      const v = n.getAttribute(a);
      if (v) { const d = dich(v); if (d != null) n.setAttribute(a, d); }
    }
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    let x;
    while ((x = w.nextNode())) {
      if (x.nodeType === 3) dichNut(x);
      else if (!boQua(x)) for (const a of ['placeholder', 'title', 'aria-label']) {
        const v = x.getAttribute(a);
        if (v) { const d = dich(v); if (d != null) x.setAttribute(a, d); }
      }
    }
  }

  let quan = null;
  window.batDich = function (nn) {
    if (quan) { quan.disconnect(); quan = null; }
    if (nn !== 'en' || !window.DICH_EN) return;
    napTuDien(window.DICH_EN);
    dichNut(document.body);
    quan = new MutationObserver(ds => {
      for (const d of ds) {
        if (d.type === 'characterData') dichNut(d.target);
        else d.addedNodes.forEach(dichNut);
      }
    });
    quan.observe(document.body, { childList: true, subtree: true, characterData: true });
  };
  window.dichChu = s => dich(s) ?? s; // cho mã khác dùng khi cần (ví dụ hộp confirm)
})();
