// chat-luong.js — các bước bảo đảm chất lượng lộ trình (kế hoạch sửa 21/11/2026).
// Vòng khép kín: mục tiêu đo được (Hợp đồng đầu ra) → bản đồ kỹ năng chung → đo đầu vào → lộ trình có bài đo cuối,
// tự soát + code kiểm → AI thứ hai kiểm nguồn, kiểm đáp án → nộp thực hành → đo cuối chặng, cuối lộ trình → hỏi lại sau 2 tuần.
// Dùng chung biến, hàm của app.js (S, api, tai, man, noi, esc, hoiJSON, hopChon...). Luật kiểm giống app/server.py.

const BAC_CAP = { nhanh: 1, 'can-doi': 2, can_doi: 2, 'chuyen-sau': 3, chuyen_sau: 3 };
const KN = () => S.muc_tieu?.ky_nang || [];
const HD = () => S.muc_tieu?.hop_dong || [];
const tenKN = ma => KN().find(x => x.ma === ma)?.ten || ma;
// Tên AI đã dùng, ghi vào mỗi kết quả để chạy thử biết AI nào cho ra kết quả nào
function tenModel() {
  const a = S.ai || {}, m = a.model && typeof a.model === 'object' ? a.model[a.cach_noi] : '';
  if (a.cach_noi === 'openrouter') return `OpenRouter · ${a.model_openrouter || 'openrouter/free'}`;
  if (!a.cach_noi || a.cach_noi === 'sao-chep') return 'AI ngoài (sao chép, dán)';
  return `${a.cach_noi}${m ? ` · ${m}` : ''}`;
}
const luu = (ten, du_lieu) => api('/api/luu', { ten, du_lieu });
// Việc làm thật trong buổi (nói to, ghi âm, gõ thật trên thiết bị) + bảng tự kiểm, hiện ở phần làm thử
function theViecThat(lt) {
  if (!lt?.viec_that) return '';
  return `<div class="the"><h3>${ic('co')} Làm thật luôn (1–3 phút)</h3><p>${esc(lt.viec_that)}</p>
    ${(lt.bang_kiem || []).length ? `<p class="mo">Làm xong tự kiểm:</p>${lt.bang_kiem.map(x => `<label style="display:flex;gap:8px;align-items:flex-start;margin:4px 0"><input type="checkbox"> <span>${esc(x)}</span></label>`).join('')}` : ''}</div>`;
}
function docTo(chu) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(chu);
    u.lang = /[ăâđêôơưáàảãạéèẻẽẹíìỉĩịóòỏõọúùủũụýỳỷỹỵ]/i.test(chu) ? 'vi-VN' : 'en-US';
    u.rate = 0.9;
    speechSynthesis.speak(u);
  } catch { baoNho('Trình duyệt này chưa đọc to được. Bạn thử Chrome hoặc Edge nha.'); }
}

// ---------- Bước 3. Làm rõ mục tiêu: Hợp đồng đầu ra + bản đồ kỹ năng chung ----------
function moTaMucTieu() {
  if (!S.muc_tieu?.xac_nhan) return '';
  return `
Hợp đồng đầu ra (người học đã xác nhận; học xong cấp nào phải làm được các việc từ cấp đó trở xuống):
${HD().map(d => `- ${d.ma} [từ cấp ${tenCap(d.cap)}]: ${d.lam_duoc} · đo bằng: ${d.cach_do}`).join('\n')}
Khung chuẩn: ${S.muc_tieu.khung?.ten || ''}${S.muc_tieu.khung?.van_ban ? ` (${S.muc_tieu.khung.van_ban})` : ''}
Bản đồ kỹ năng con (dùng ĐÚNG các mã này, không tự đặt mã khác):
${KN().map(k => `- ${k.ma}: ${k.ten} (từ cấp ${tenCap(k.cap)}${(k.can_truoc || []).length ? `; học sau ${k.can_truoc.join(', ')}` : ''}; phục vụ ${(k.phuc_vu || []).join(', ')})`).join('\n')}`;
}
function loiDanMucTieu(gopY = '') {
  const cu = gopY && S.muc_tieu ? `\nBản trước (sửa theo góp ý, giữ phần không bị góp ý):\n\`\`\`json\n${JSON.stringify({ hop_dong: S.muc_tieu.hop_dong, ky_nang: S.muc_tieu.ky_nang })}\n\`\`\`\nGóp ý của người học: ${gopY}\n` : '';
  return `Bạn là nhà thiết kế chương trình học trong app "Học cùng Noe". Việc của bạn: biến mục đích của người học thành HỢP ĐỒNG ĐẦU RA đo được, và vẽ BẢN ĐỒ KỸ NĂNG CON dùng chung cho bài kiểm tra đầu vào, tìm nguồn và lộ trình.${ngonNgu()}

Người học:
${moTaNguoiHoc()}
${cu}
Ba cấp:
${DINH_NGHIA_CAP}

Bước 1. Đọc mục đích. Nếu mơ hồ (ví dụ "giỏi tiếng Anh", "biết AI"), hiểu nó thành những việc cụ thể hợp với lĩnh vực, cấp đã chọn, tuổi, công việc và hoàn cảnh của người học. Ghi cách hiểu vào "lam_ro" (1–2 câu, để người học sửa nếu hiểu sai). Nếu có nhiều cách hiểu khác hẳn nhau (ví dụ "giỏi tiếng Anh" của học sinh: giao tiếp, thi tốt nghiệp THPT, IELTS), ghi 2–4 cách vào "cach_hieu_khac" để người học chọn; với học sinh, sinh viên thì nghĩ tới cả điểm thi ở trường. Mục đích đã rõ thì để trống cả hai.
Bước 2. Viết 3–6 việc trong hợp đồng đầu ra:
- "lam_duoc": bắt đầu bằng động từ làm được (tự làm, viết, nói, tính, dùng ... để ...), cụ thể, có bối cảnh của chính người học. Cấm "biết", "hiểu", "nắm được".
- "cach_do": bài đo cụ thể người học tự làm để chứng minh, làm được trên thiết bị người học có, ai cũng chấm được đạt hay chưa.
- "cap": cấp thấp nhất cần đạt việc này ("nhanh", "can-doi", "chuyen-sau"). Có ít nhất 2 việc ở cấp "nhanh". Các việc tới cấp người học đã chọn phải phủ đủ mục đích của họ.
Bước 3. Chọn khung chuẩn của ngành (Việt Nam: Khung trình độ quốc gia theo QĐ 39/2026/QĐ-TTg, Khung năng lực ngoại ngữ 6 bậc theo TT 01/2014/TT-BGDĐT, Chuẩn kỹ năng CNTT theo TT 03/2014/TT-BTTTT; quốc tế: CEFR, CS2023, SFIA, ESCO, O*NET). Không chắc số văn bản thì để trống "van_ban", không bịa.
Bước 4. Vẽ 6–14 kỹ năng con từ khung, chỉ những kỹ năng cần cho hợp đồng: "ma" KN1, KN2…; "ten" ngắn, dễ hiểu; "cap" thấp nhất cần; "can_truoc": mã kỹ năng phải học trước; "phuc_vu": mã việc (D1…) nó phục vụ. Người học thiếu kỹ năng nền (dùng thiết bị, đọc chữ, gõ phím...) thì thêm kỹ năng nền ở cấp "nhanh". Thêm kỹ năng SẴN SÀNG khi việc cần: cài ứng dụng, tài khoản (người học tự nhập mật khẩu), lưu và sao lưu để không mất sản phẩm. Việc nào cũng có ít nhất 1 kỹ năng phục vụ; một kỹ năng phục vụ nhiều việc thì ghi đủ. Tiêu chí đo phải đo được (cấm "phát âm chuẩn", ghi "người nghe hiểu được 4/5 câu").
Bước 5. Tự soát rồi mới trả lời: không việc nào dùng động từ không đo được; việc nào cũng có cách đo làm được trên thiết bị người học có; kỹ năng nào cũng phục vụ ít nhất 1 việc; không có vòng "học trước" lẩn quẩn.

Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"lam_ro":"","cach_hieu_khac":[],"hop_dong":[{"ma":"D1","lam_duoc":"...","cach_do":"...","cap":"nhanh"}],"khung":{"ten":"...","van_ban":""},
 "ky_nang":[{"ma":"KN1","ten":"...","cap":"nhanh","can_truoc":[],"phuc_vu":["D1"]}]}
\`\`\``;
}
const hopLeMucTieu = d => d && Array.isArray(d.hop_dong) && d.hop_dong.length >= 2 && Array.isArray(d.ky_nang) && d.ky_nang.length >= 2;
// Lỗi code tự kiểm được ở hợp đồng đầu ra
function kiemMucTieu(d) {
  const loi = [], ma = new Set((d.hop_dong || []).map(x => x.ma));
  (d.hop_dong || []).forEach(x => {
    if (/^\s*(biết|hiểu|nắm|làm quen|tìm hiểu)/i.test(x.lam_duoc || '')) loi.push(`${x.ma} dùng động từ không đo được`);
    if (!String(x.cach_do || '').trim()) loi.push(`${x.ma} thiếu cách đo`);
  });
  if ((d.hop_dong || []).filter(x => x.cap === 'nhanh').length < 2) loi.push('cần ít nhất 2 việc ở cấp Sơ cấp');
  const phuc = new Set((d.ky_nang || []).flatMap(k => k.phuc_vu || []));
  [...ma].filter(x => !phuc.has(x)).forEach(x => loi.push(`${x} chưa có kỹ năng nào phục vụ`));
  return loi;
}
async function soanMucTieu(nk, gopY = '') {
  let d = await hoiJSON(loiDanMucTieu(gopY), { viec: 'viết hợp đồng đầu ra và bản đồ kỹ năng', nhatKy: nk }, hopLeMucTieu);
  const loi = kiemMucTieu(d);
  if (loi.length && noiTuDong()) {
    try {
      const d2 = await hoiJSON(`${loiDanMucTieu(gopY)}\n\nBẢN NHÁP BẠN VỪA VIẾT:\n\`\`\`json\n${JSON.stringify(d)}\n\`\`\`\nCode kiểm phát hiện: ${loi.join('; ')}. Sửa đúng các lỗi này, giữ phần đúng, trả lại MỘT khối \`\`\`json cùng mẫu.`, { viec: 'sửa hợp đồng đầu ra', nhatKy: nk }, hopLeMucTieu);
      if (kiemMucTieu(d2).length <= loi.length) d = d2;
    } catch { /* giữ bản đầu */ }
  }
  return d;
}
// Trả true khi người học đã xác nhận hợp đồng đầu ra (có rồi thì qua luôn); false nếu người học rời đi.
async function damBaoMucTieu(quayLai) {
  if (S.muc_tieu?.xac_nhan) return true;
  const luot = LUOT;
  man.innerHTML = `${noi('suy-nghi', '<b>Noe đang biến mục đích của bạn thành những việc làm được, đo được…</b><p class="mo">Để cuối khoá biết chắc bạn đã đạt chưa.</p>')}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
  let d;
  try { d = await soanMucTieu($('#nk')); } catch (e) { if (luot === LUOT) { if (e.message !== 'huy') await baoNho('Câu trả lời của AI chưa đúng mẫu, thử lại nhé.'); quayLai?.(); } return false; }
  while (luot === LUOT) {
    const kq = await xacNhanMucTieu(d);
    if (kq === 'roi') { quayLai?.(); return false; }
    if (kq.ok) {
      await luu('muc-tieu', { ...kq.d, xac_nhan: NGAY(), ai: tenModel() });
      await tai();
      return true;
    }
    man.innerHTML = `${noi('suy-nghi', '<b>Noe đang viết lại theo góp ý của bạn…</b>')}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
    try { S.muc_tieu = kq.d; d = await soanMucTieu($('#nk'), kq.gopY); } catch (e) { if (e.message !== 'huy') await baoNho('Chưa viết lại được, Noe giữ bản cũ nha.'); d = kq.d; }
  }
  return false;
}
function xacNhanMucTieu(d) {
  return new Promise(ok => {
    const dong = (x, i) => `<li class="hd-viec" data-ma="${esc(x.ma)}"><p class="nhan-o">Việc ${i + 1} <span class="mo">· cần đạt từ cấp ${esc(tenCap(x.cap))}</span></p>
        <input type="text" class="hdLam" value="${esc(x.lam_duoc)}" aria-label="Việc ${i + 1}: làm được gì">
        <p class="mo">Đo bằng cách</p><input type="text" class="hdDo" value="${esc(x.cach_do)}" aria-label="Việc ${i + 1}: đo bằng cách nào"></li>`;
    man.innerHTML = `
      ${noi('vui', `<h2>Học xong, bạn sẽ làm được những việc này</h2><p>Đây là "hợp đồng" giữa bạn và Noe: cuối khoá mình đo đúng các việc này. Sửa thoải mái cho đúng ý bạn.</p>${d.lam_ro ? `<p class="mo">Noe hiểu mục đích của bạn là: ${esc(d.lam_ro)}</p>` : ''}`)}
      ${(d.cach_hieu_khac || []).length ? `<div class="the"><p><b>Bạn muốn theo hướng nào hơn?</b> <span class="mo">Bấm để Noe viết lại theo hướng đó</span></p><div class="chip-chon">${d.cach_hieu_khac.map((x, i) => `<button type="button" class="chip" data-huong="${i}">${esc(x)}</button>`).join('')}</div></div>` : ''}
      <div class="the"><ul class="ds-hd" style="list-style:none;padding:0;display:flex;flex-direction:column;gap:14px">${(d.hop_dong || []).map(dong).join('')}</ul></div>
      <details class="the"><summary><b>Những kỹ năng sẽ học (${(d.ky_nang || []).length})</b> · khung: ${esc(d.khung?.ten || '')}</summary>
        <ol class="huong-dan">${(d.ky_nang || []).map(k => `<li><b>${esc(k.ten)}</b> <span class="mo">· ${esc(tenCap(k.cap))}${(k.can_truoc || []).length ? ` · học sau ${k.can_truoc.map(tenKNTrong(d)).join(', ')}` : ''}</span></li>`).join('')}</ol></details>
      <div class="the"><label class="cau">Muốn Noe viết lại chỗ nào? <span class="goi-y">Ví dụ: tôi chỉ cần tính tổng, không cần biểu đồ</span><textarea id="gopMT"></textarea></label></div>
      <div class="hang"><button class="chinh" id="mtOk">Đúng rồi, tiếp tục</button><button id="mtSua">Nhờ Noe viết lại</button></div>`;
    const docSua = () => ({ ...d, hop_dong: (d.hop_dong || []).map((x, i) => ({ ...x, lam_duoc: man.querySelectorAll('.hdLam')[i]?.value.trim() || x.lam_duoc, cach_do: man.querySelectorAll('.hdDo')[i]?.value.trim() || x.cach_do })) });
    $('#mtOk').onclick = () => ok({ ok: true, d: docSua() });
    man.querySelectorAll('[data-huong]').forEach(b => b.onclick = () => ok({ ok: false, d: docSua(), gopY: `Mục đích chính của tôi là: ${d.cach_hieu_khac[+b.dataset.huong]}. Viết lại hợp đồng theo hướng này.` }));
    $('#mtSua').onclick = () => { const g = $('#gopMT').value.trim(); if (!g) return baoNho('Bạn ghi muốn sửa gì vào ô trước nhé.'); ok({ ok: false, d: docSua(), gopY: g }); };
    const luot = LUOT; const t = setInterval(() => { if (luot !== LUOT) { clearInterval(t); ok('roi'); } }, 500);
  });
}
const tenKNTrong = d => ma => (d.ky_nang || []).find(x => x.ma === ma)?.ten || ma;

// ---------- Bước 6. AI thứ hai kiểm nội dung nguồn ----------
function loiDanKiemNguon(ds) {
  return `Bạn là người KIỂM NGUỒN ĐỘC LẬP cho app học "Học cùng Noe". Một AI khác đã tìm các nguồn dưới đây; bạn không tin lời mô tả, hãy MỞ TỪNG TRANG trên mạng và kiểm:
1. Đúng là trang chính chủ của tổ chức ghi trong ngoặc (không phải trang đăng lại, trang lậu).
2. Nội dung trang đúng chủ đề người học cần ("${S.ho_so.linh_vuc}").
3. Đúng ngôn ngữ ghi (vi = tiếng Việt, en = tiếng Anh).
4. Phí đúng như ghi (ghi miễn phí thì phải học được miễn phí).
5. Hợp cấp ghi (không phải tài liệu quá cao hoặc quá thấp).
Sai MỘT điều là "dung": false, ghi rõ sai gì vào "sai". Không mở được trang (bị chặn) thì "dung": null, không kết luận. Không bịa.

Nguồn cần kiểm:
${ds}

Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"kq":[{"ma":"N1","dung":true,"sai":""}]}
\`\`\``;
}
// Chạy ở app (cách sao chép và dán / nối tự động không qua máy chủ nghiên cứu)
async function kiemNoiDungNguon(nk) {
  const can = nguonDung().sort((a, b) => (+b.diem || 0) - (+a.diem || 0)).slice(0, 12);
  if (!can.length) return;
  const kq = await hoiJSON(loiDanKiemNguon(can.map(dongNguon).join('\n')), { web: true, viec: 'kiểm nội dung nguồn', nhatKy: nk }, d => Array.isArray(d.kq));
  const theo = Object.fromEntries(kq.kq.map(x => [String(x.ma), x]));
  (S.nguon.nguon || []).forEach(n => {
    const x = theo[n.ma]; if (!x) return;
    if (x.dung === false) { n.bo = true; n.ly_do_bo = x.sai || 'AI kiểm thấy không đúng mô tả'; }
    else if (x.dung === true) n.kiem_noi_dung = NGAY();
  });
  await api('/api/nguon', S.nguon); await tai();
}

// ---------- Bước 7. Code kiểm lộ trình (cùng luật kiem_lo_trinh trong server.py) ----------
function kiemLoTrinh(lt, k) {
  const loi = [], bac = BAC_CAP[k] || 2, mods = (lt.chang || []).flatMap(c => c.module || []);
  (lt.chang || []).forEach(c => { if (!String(c.xong_khi || '').trim()) loi.push(`Chặng "${c.ten}" thiếu xong_khi (sản phẩm thật).`); });
  mods.forEach(m => {
    if (!String(m.dau_ra || '').trim()) loi.push(`Module "${m.ten}" thiếu đầu ra.`);
    if (!String(m.thuc_hanh || '').trim()) loi.push(`Module "${m.ten}" thiếu thực hành cuối module.`);
    if (/^\s*(biết|nắm|hiểu biết|làm quen|tìm hiểu)/i.test(m.dau_ra || '')) loi.push(`Module "${m.ten}": đầu ra dùng động từ không đo được ("biết", "nắm"…).`);
  });
  if (S.muc_tieu?.xac_nhan) {
    const co = new Set(mods.flatMap(m => m.ky_nang || []));
    const thieu = KN().filter(x => (BAC_CAP[x.cap] || 1) <= bac && !co.has(x.ma)).map(x => x.ma);
    if (thieu.length) loi.push(`Chưa module nào dạy các kỹ năng: ${thieu.join(', ')}.`);
    const hd = HD().filter(x => (BAC_CAP[x.cap] || 1) <= bac).map(x => x.ma);
    const do_ = new Set((lt.bai_do_cuoi?.viec || []).map(v => v.hop_dong));
    if (hd.length && !do_.size) loi.push('Thiếu bai_do_cuoi (bài đo cuối lộ trình theo Hợp đồng đầu ra).');
    else if (hd.some(x => !do_.has(x))) loi.push(`Bài đo cuối chưa đo các việc: ${hd.filter(x => !do_.has(x)).join(', ')}.`);
  }
  (lt.tu_soat || []).forEach(s => { if (s && s.dat === false) loi.push(`Tự soát chưa đạt: ${s.muc} (${s.ghi_chu || ''}).`); });
  const ghiBuoi = String(lt.thoi_gian || '').match(/(\d+)\s*buổi/i), tong = mods.reduce((t, m) => t + (+m.so_buoi || (m.buoi || []).length || 0), 0);
  if (ghiBuoi && +ghiBuoi[1] !== tong) loi.push(`"thoi_gian" ghi ${ghiBuoi[1]} buổi nhưng cộng so_buoi các module được ${tong}.`);
  return loi;
}
const tomTatLT = lt => cacModule(lt).map(m => `- ${m.ten} [${(m.ky_nang || []).join(', ')}]: ${m.dau_ra}`).join('\n');
// Xếp một cấp ở app: code kiểm, có lỗi thì nhờ AI sửa đúng các lỗi đó một lần
async function xepMotCap(p, k, nk) {
  const hopLe = lt => lt && Array.isArray(lt.chang) && lt.chang.length > 0;
  const lay = r => hopLe(r) ? r : r?.[k];
  let lt = lay(await hoiJSON(p, { viec: `xếp lộ trình ${TEN_CAP_K[k]}`, nhatKy: nk }, d => hopLe(d) || hopLe(d?.[k])));
  let loi = kiemLoTrinh(lt, k); const dau = loi.length;
  if (loi.length && noiTuDong()) {
    try {
      lt = lay(await hoiJSON(`${p}\n\nBẢN NHÁP BẠN VỪA XẾP:\n\`\`\`json\n${JSON.stringify(lt).slice(0, 30000)}\n\`\`\`\nCode kiểm phát hiện các lỗi sau. Sửa ĐÚNG các lỗi này, giữ nguyên phần đúng, trả lại MỘT khối \`\`\`json cùng mẫu:\n- ${loi.join('\n- ')}`,
        { viec: `sửa lộ trình ${TEN_CAP_K[k]}`, nhatKy: nk }, d => hopLe(d) || hopLe(d?.[k])));
      loi = kiemLoTrinh(lt, k);
    } catch { /* giữ bản nháp, lỗi còn lại hiện cho người học thấy */ }
  }
  lt.kiem = { ngay: NGAY(), loi_ban_dau: dau, loi_con_lai: loi, ai: tenModel() };
  return lt;
}
// Bước 8: thẻ "Noe đã soát" ở màn lộ trình
function theDaSoat(lt) {
  const ts = (lt.tu_soat || []).filter(Boolean), dat = ts.filter(s => s.dat !== false).length, con = lt.kiem?.loi_con_lai || [];
  const viec = lt.bai_do_cuoi?.viec || [];
  return `<div class="the"><h3>${ic('tron', con.length ? '' : 'mau-xanh')} Noe đã soát lộ trình này</h3>
    <p>${ts.length ? `AI tự soát bảng kiểm: đạt <b>${dat}/${ts.length}</b> mục.` : ''} ${lt.kiem ? (con.length ? `Code kiểm còn <b>${con.length}</b> chỗ cần xem:` : `Code kiểm: <b>đạt hết</b>${lt.kiem.loi_ban_dau ? ` (đã tự sửa ${lt.kiem.loi_ban_dau} chỗ)` : ''}.`) : ''}</p>
    ${con.length ? `<ul>${con.map(x => `<li class="mo">${esc(x)}</li>`).join('')}</ul>` : ''}
    ${viec.length ? `<h3>Bài đo cuối lộ trình</h3><p class="mo">${esc(lt.bai_do_cuoi.mo_ta || '')}</p><ol class="huong-dan">${viec.map(v => `<li><b>${esc(HD().find(d => d.ma === v.hop_dong)?.lam_duoc || v.hop_dong)}</b><br><span class="mo">Bạn làm: ${esc(v.de)} · Đạt khi: ${esc(v.dat_khi)}</span></li>`).join('')}</ol>` : ''}</div>`;
}

// ---------- Bước 9. AI thứ hai kiểm đáp án bài học ----------
function loiDanKiemDapAn() {
  return `Bạn là người KIỂM ĐỀ ĐỘC LẬP. Một AI khác đã soạn các câu trắc nghiệm dưới đây, "dap_an" là vị trí đáp án đúng (đếm từ 0). Đừng tin đáp án ghi sẵn: tự giải từng câu rồi so.
- Đáp án ghi sai nhưng có đúng một lựa chọn khác đúng: ghi vào "sua" (phan, i = vị trí câu đếm từ 0, dap_an_dung).
- Câu có từ 2 lựa chọn cùng đúng, hoặc không lựa chọn nào đúng, hoặc đề mơ hồ: ghi vào "bo".
- Câu đúng thì không ghi gì.
Các câu (phan "lam_thu" và "cau_hoi"):
{{BAI}}
Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"sua":[{"phan":"cau_hoi","i":0,"dap_an_dung":1,"ly_do":"..."}],"bo":[{"phan":"cau_hoi","i":2,"ly_do":"..."}]}
\`\`\``;
}

// ---------- Bước 10. Nộp thực hành cuối module cho AI xem ----------
async function nopThucHanh(m) {
  vaoMan('thuc-hanh', nopThucHanh, arguments);
  const luot = LUOT, cu = (S.tien_do.module || {})[m.ma]?.thuc_hanh;
  man.innerHTML = `${noi('vui', `<h2>Thực hành cuối module</h2><p><b>${esc(m.thuc_hanh)}</b></p><p class="mo">Làm xong thì kể lại hoặc dán kết quả vào đây (chữ bạn gõ, số liệu, đường link tới file của bạn...). Noe xem rồi nhận xét, đạt là Thông tuệ tăng phần "Làm thật".</p>`)}
    <div class="the"><label class="cau">Bạn đã làm gì, kết quả ra sao?<textarea id="baiNop" rows="6">${esc(cu?.bai_nop || '')}</textarea></label>
    ${cu && !cu.dat ? `<p class="mo">Lần trước Noe góp ý: ${esc(cu.nhan_xet || '')}</p>` : ''}
    <div class="hang"><button class="chinh" id="nop">Nộp cho Noe xem</button><button id="sau">Để sau</button></div><div class="nhat-ky-tim" id="nk" hidden></div></div>`;
  $('#sau').onclick = manTrangChu;
  $('#nop').onclick = async () => {
    const bn = $('#baiNop').value.trim();
    if (bn.length < 15) return baoNho('Bạn kể kỹ hơn chút nha: đã làm những bước nào, ra kết quả gì.');
    $('#nop').disabled = true;
    const p = `Bạn là giáo viên tử tế trong app "Học cùng Noe". Người học nộp bài thực hành cuối module. Xem họ đã làm ĐÚNG việc được giao chưa, dựa trên những gì họ kể hoặc dán.${ngonNgu()}
Người học:
${moTaNguoiHoc()}
Module: ${m.ten}
Đầu ra module: ${m.dau_ra}
Bài thực hành được giao: ${m.thuc_hanh}
Bài nộp:
"""${bn.slice(0, 6000)}"""
Chấm:
- "dat": true khi bài nộp cho thấy người học đã tự làm được đúng việc được giao, ở mức của module (không đòi hoàn hảo). false khi chưa làm, làm việc khác, hoặc thiếu phần chính.
- "nhan_xet": 2–3 câu thân thiện, khen CỤ THỂ cái đã làm đúng. ${giongNoe()}
- "con_thieu": những phần còn thiếu (để trống nếu đạt). "goi_y": 1 câu nói cần làm thêm gì.
- "an_toan": false CHỈ KHI bài nộp cho thấy người học đang gặp nguy hiểm hoặc khủng hoảng.
Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"dat":true,"nhan_xet":"...","con_thieu":[],"goi_y":"","an_toan":true}
\`\`\``;
    let d;
    try { $('#nk').hidden = false; d = await hoiJSON(p, { viec: 'xem bài thực hành của bạn', nhatKy: $('#nk') }, x => typeof x?.dat === 'boolean'); }
    catch (e) { $('#nop').disabled = false; if (e.message !== 'huy') baoNho('Câu trả lời của AI chưa đúng mẫu, thử lại nhé.'); return; }
    if (luot !== LUOT) return;
    const t = S.tien_do; t.module = t.module || {};
    t.module[m.ma] = { ...(t.module[m.ma] || {}), thuc_hanh: { ngay: NGAY(), bai_nop: bn.slice(0, 2000), dat: d.dat, nhan_xet: d.nhan_xet, ai: tenModel() }, ...(d.dat ? { lam_that: true } : {}) };
    await api('/api/tien-do', t); await tai();
    if (d.an_toan === false) await hopChon(noi('suy-nghi', '<b>Noe đọc thấy bạn đang không ổn.</b><p>Bạn hãy nói chuyện ngay với người thân. Nếu bạn hoặc ai đó gặp nguy hiểm: gọi <b>115</b>. Trẻ em cần giúp: gọi <b>111</b>.</p>'), ['Mình hiểu rồi']);
    if (d.dat) { await hopChon(noi('khen', `<b>Đạt rồi!</b><p>${esc(d.nhan_xet)}</p><p>Thông tuệ tăng phần "Làm thật". Noe tự hào về bạn.</p>`), ['Tuyệt']); return manTrangChu(); }
    const c = await hopChon(noi('suy-nghi', `<b>Gần được rồi nè!</b><p>${esc(d.nhan_xet)}</p>${(d.con_thieu || []).length ? `<p>Còn thiếu: ${esc(d.con_thieu.join('; '))}</p>` : ''}${d.goi_y ? `<p class="mo">${esc(d.goi_y)}</p>` : ''}`), ['Làm thêm rồi nộp lại', 'Để sau']);
    return c === 0 ? nopThucHanh(m) : manTrangChu();
  };
}

// ---------- Bước 11. Đo đã đạt mục tiêu chưa ----------
// Làm một bộ trắc nghiệm (xáo lựa chọn, có "Tôi chưa biết"), trả về kết quả từng câu
async function lamTracNghiem(cau, tieuDe) {
  const luot = LUOT, kq = [];
  for (let i = 0; i < cau.length; i++) {
    const c = xaoLuaChon(cau[i]);
    const j = await new Promise(ok => {
      man.innerHTML = `${noi('vui', `${esc(tieuDe)} · câu ${i + 1}/${cau.length}`)}<div class="the"><h2>${esc(c.de)}</h2>
        <div style="display:flex;flex-direction:column;gap:8px">${c.lua_chon.map((l, k) => `<button class="lua-chon" data-j="${k}">${esc(l)}</button>`).join('')}<button class="lua-chon" data-j="-1">Tôi chưa biết</button></div></div>`;
      man.querySelectorAll('.lua-chon').forEach(b => b.onclick = () => ok(+b.dataset.j));
    });
    if (luot !== LUOT) return null;
    kq.push({ ...cau[i], ket_qua: j === c.dap_an ? 'dung' : j === -1 ? 'chua-biet' : 'sai' });
  }
  return kq;
}
const kyNangChang = c => [...new Set((c.module || []).flatMap(m => m.ky_nang || []))];
const changXong = c => (c.module || []).length && c.module.every(m => (m.buoi || []).length && m.buoi.every(b => daHoc(b.ma)));
const phanTram = (d, t) => t ? Math.round(d / t * 100) : 0;
// Nút và kết quả đo ở đầu mỗi chặng trên bản đồ học
function nutDoChang(c, ci) {
  if (!changXong(c)) return '';
  const r = (S.do_luong?.chang || {})[c.ma];
  if (r) return `<p class="do-chang">${ic('co')} Đo cuối chặng: ${r.truoc ? `trước <b>${phanTram(r.truoc.dung, r.truoc.tong)}%</b> → ` : ''}sau <b>${phanTram(r.sau.dung, r.sau.tong)}%</b> <button class="nho" data-do-chang="${ci}">Đo lại</button></p>`;
  return `<p class="do-chang"><button class="chinh nho" data-do-chang="${ci}">Đo cuối chặng (vài phút)</button> <span class="mo">so với lúc mới vào</span></p>`;
}
function nutDoCuoi(lt) {
  if (!(lt.chang || []).length || !lt.chang.every(changXong)) return '';
  const r = S.do_luong?.cuoi;
  return `<div class="the do-cuoi"><h3>${ic('cup')} Bài đo cuối lộ trình</h3>${r ? `<p>Ngày ${esc(r.ngay)}: đạt <b>${r.dat}/${r.tong}</b> việc trong hợp đồng.</p><button data-do-cuoi="1">Đo lại</button>` : `<p>Bạn đã học hết lộ trình! Làm bài đo để biết đã làm được những việc mình muốn chưa.</p><button class="chinh" data-do-cuoi="1">Làm bài đo cuối</button>`}</div>`;
}
async function doCuoiChang(ci) {
  const c = S.lo_trinh.chang[ci]; if (!c) return;
  vaoMan('do-chang', doCuoiChang, arguments);
  const luot = LUOT, kns = kyNangChang(c);
  // Ưu tiên làm lại đúng câu đầu vào của các kỹ năng chặng này, để so trước và sau
  let cau = (S.dau_vao?.cau || []).filter(x => kns.includes(x.ky_nang));
  const truocKQ = (S.dau_vao?.ket_qua || []).filter(x => kns.includes(x.ky_nang) && x.ket_qua !== 'bo-qua');
  if (cau.length < 3) {
    man.innerHTML = `${noi('suy-nghi', '<b>Noe đang soạn bài đo cuối chặng…</b>')}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
    try {
      const d = await hoiJSON(`Soạn 5 câu trắc nghiệm ĐO CUỐI CHẶNG cho app "Học cùng Noe".${ngonNgu()}
Người học:
${moTaNguoiHoc()}
Chặng vừa học: ${c.ten}. Xong khi: ${c.xong_khi}
Các module: ${(c.module || []).map(m => `${m.ten} (đầu ra: ${m.dau_ra})`).join('; ')}
Kỹ năng cần đo: ${kns.map(x => `${x}: ${tenKN(x)}`).join('; ') || '(theo đầu ra module)'}
Mỗi câu là một tình huống dùng kỹ năng vào việc thật của người học, 3 lựa chọn, đúng 1 đáp án, câu dưới 25 chữ, chữ tiếng Anh có nghĩa tiếng Việt. Không viết lựa chọn "Tôi chưa biết" (app tự thêm). Tự giải lại từng câu trước khi trả lời.
Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"cau":[{"ky_nang":"KN1","de":"...","lua_chon":["...","...","..."],"dap_an":0}]}
\`\`\``, { viec: 'soạn bài đo cuối chặng', nhatKy: $('#nk') }, x => Array.isArray(x?.cau) && x.cau.length >= 3);
      cau = d.cau.filter(x => Array.isArray(x.lua_chon) && Number.isInteger(x.dap_an) && x.dap_an >= 0 && x.dap_an < x.lua_chon.length);
    } catch (e) { if (luot === LUOT) { if (e.message !== 'huy') await baoNho('Chưa soạn được bài đo, thử lại nhé.'); manTrangChu(); } return; }
  }
  const kq = await lamTracNghiem(cau, `Đo cuối chặng ${ci + 1}`);
  if (!kq) return;
  const dung = kq.filter(x => x.ket_qua === 'dung').length;
  const r = { ngay: NGAY(), sau: { dung, tong: kq.length }, ...(truocKQ.length ? { truoc: { dung: truocKQ.filter(x => x.ket_qua === 'dung').length, tong: truocKQ.length } } : {}) };
  await luu('do-luong', { ...(S.do_luong || {}), chang: { ...(S.do_luong?.chang || {}), [c.ma]: r } }); await tai();
  await hopChon(noi(dung / kq.length >= 0.8 ? 'khen' : 'vui', `<b>Đo cuối chặng ${ci + 1}</b><p>${r.truoc ? `Lúc mới vào: <b>${phanTram(r.truoc.dung, r.truoc.tong)}%</b> → ` : ''}Bây giờ: <b>${phanTram(dung, kq.length)}%</b> (${dung}/${kq.length} câu).</p>
    <p class="mo">${dung / kq.length >= 0.8 ? 'Bạn tiến bộ thật rồi đó!' : 'Phần còn sai Noe sẽ đưa vào ôn ở các buổi sau nha.'}</p>`), ['Về bản đồ']);
  manTrangChu();
}
async function doCuoiLoTrinh() {
  const lt = S.lo_trinh, viec = lt?.bai_do_cuoi?.viec || [];
  const ds = viec.length ? viec.map(v => ({ ma: v.hop_dong, lam_duoc: HD().find(d => d.ma === v.hop_dong)?.lam_duoc || v.de, de: v.de, dat_khi: v.dat_khi }))
    : HD().filter(d => (BAC_CAP[d.cap] || 1) <= (BAC_CAP[lt?.cap_do] || 2)).map(d => ({ ma: d.ma, lam_duoc: d.lam_duoc, de: d.cach_do, dat_khi: '' }));
  if (!ds.length) return baoNho('Lộ trình này chưa có hợp đồng đầu ra để đo. Bạn vào Hồ sơ học để Noe viết hợp đồng nha.');
  vaoMan('do-cuoi', doCuoiLoTrinh, arguments);
  const luot = LUOT;
  man.innerHTML = `${noi('suy-nghi', '<b>Noe đang soạn bài đo cuối lộ trình…</b>')}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
  let cau;
  try {
    const d = await hoiJSON(`Soạn BÀI ĐO CUỐI LỘ TRÌNH cho app "Học cùng Noe": đo người học đã làm được các việc trong hợp đồng chưa.${ngonNgu()}
Người học:
${moTaNguoiHoc()}
Các việc cần đo:
${ds.map(v => `- ${v.ma}: ${v.lam_duoc} (bài làm: ${v.de}${v.dat_khi ? `; đạt khi: ${v.dat_khi}` : ''})`).join('\n')}
Mỗi việc 2 câu trắc nghiệm TÌNH HUỐNG khó vừa đủ (người đã làm được việc đó thì trả lời được, người chỉ học thuộc thì dễ sai), ghi "hop_dong" là mã việc. 3 lựa chọn, đúng 1 đáp án, câu dưới 30 chữ, chữ tiếng Anh có nghĩa tiếng Việt. Không viết lựa chọn "Tôi chưa biết". Tự giải lại từng câu trước khi trả lời.
Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"cau":[{"hop_dong":"D1","de":"...","lua_chon":["...","...","..."],"dap_an":0}]}
\`\`\``, { viec: 'soạn bài đo cuối lộ trình', nhatKy: $('#nk') }, x => Array.isArray(x?.cau) && x.cau.length >= ds.length);
    cau = d.cau.filter(x => Array.isArray(x.lua_chon) && Number.isInteger(x.dap_an) && x.dap_an >= 0 && x.dap_an < x.lua_chon.length);
  } catch (e) { if (luot === LUOT) { if (e.message !== 'huy') await baoNho('Chưa soạn được bài đo, thử lại nhé.'); manTrangChu(); } return; }
  const kq = await lamTracNghiem(cau, 'Bài đo cuối lộ trình');
  if (!kq) return;
  // Mỗi việc: tự làm bài thật rồi tự báo (bài làm thật là phần chính; trắc nghiệm để kiểm chéo)
  const tuBao = {};
  for (const v of ds) {
    if (luot !== LUOT) return;
    const c = await hopChon(noi('vui', `<b>${esc(v.lam_duoc)}</b><p>Bạn thử làm thật ngay bây giờ: ${esc(v.de)}</p>${v.dat_khi ? `<p class="mo">Đạt khi: ${esc(v.dat_khi)}</p>` : ''}<p>Bạn làm được chưa?</p>`), ['Làm được', 'Làm được một phần', 'Chưa làm được']);
    tuBao[v.ma] = ['duoc', 'mot-phan', 'chua'][c] || 'chua';
  }
  const theo = ds.map(v => {
    const cv = kq.filter(x => x.hop_dong === v.ma), dung = cv.filter(x => x.ket_qua === 'dung').length;
    return { ma: v.ma, lam_duoc: v.lam_duoc, trac_nghiem: `${dung}/${cv.length}`, tu_bao: tuBao[v.ma], dat: tuBao[v.ma] === 'duoc' && dung >= Math.ceil(cv.length / 2) };
  });
  const r = { ngay: NGAY(), dat: theo.filter(x => x.dat).length, tong: theo.length, theo_viec: theo, ai: tenModel() };
  await luu('do-luong', { ...(S.do_luong || {}), cuoi: r }); await tai();
  await hopChon(noi(r.dat === r.tong ? 'khen' : 'vui', `<b>Kết quả bài đo cuối</b><p>Bạn đạt <b>${r.dat}/${r.tong}</b> việc trong hợp đồng.</p><ul>${theo.map(x => `<li>${x.dat ? '✅' : '⏳'} ${esc(x.lam_duoc)} <span class="mo">· trắc nghiệm ${x.trac_nghiem}</span></li>`).join('')}</ul>
    <p class="mo">Khoảng 2 tuần nữa Noe sẽ hỏi lại xem bạn có dùng được ngoài đời không nha.</p>`), ['Về trang chủ']);
  manTrangChu();
}
// Hỏi lại sau 2 tuần: học xong có dùng được ngoài đời không (thước đo thật của chất lượng)
async function hoiLaiSauHoc() {
  const dl = S.do_luong || {}, cuoi = dl.cuoi;
  if (!cuoi || dl.hoi_lai || manHienTai?.ten !== 'trang-chu') return;
  if ((Date.now() - new Date(cuoi.ngay)) / 864e5 < 14) return;
  const tl = {};
  for (const v of cuoi.theo_viec || []) {
    const c = await hopChon(noi('chao', `<b>Noe hỏi thăm chút nha!</b><p>Hai tuần qua, bạn có tự làm được việc này ngoài đời không?</p><p><b>${esc(v.lam_duoc)}</b></p>`), ['Có, làm được', 'Làm được một phần', 'Chưa dùng tới / chưa làm được']);
    tl[v.ma] = ['duoc', 'mot-phan', 'chua'][c] || 'chua';
  }
  await luu('do-luong', { ...dl, hoi_lai: { ngay: NGAY(), tra_loi: tl } }); await tai();
  toast('Cảm ơn bạn! Noe ghi lại để làm lộ trình tốt hơn.');
}

// ---------- Nối vào các màn của app.js ----------
(() => {
  const goc = manTrangChu;
  manTrangChu = function (...a) { const r = goc.apply(this, a); setTimeout(() => hoiLaiSauHoc().catch(() => {}), 1200); return r; };
})();
