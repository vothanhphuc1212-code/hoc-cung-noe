// App Học cùng Noe (Learn Everything with AI)
// Luồng: Nối AI → Mục đích → Đang ở đâu → Noe đi tìm (nguồn + 3 lộ trình) → Trang chủ / Học mỗi ngày
const $ = s => document.querySelector(s);
const man = $('#man');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let S = null;

const api = async (duong, data) => {
  const r = await fetch(duong, data === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
};
const tai = async () => { S = await api('/api/trang-thai'); window.TEN_NGUOI_HOC = S.ho_so.ten_goi || ''; window.NOE_DO = S.noe?.dang_mac || ''; return S; };
const datChang = async c => { await api('/api/tien-do', { chang_hien_tai: c }); await tai(); dieuHuong(); };

const CHANG = [['muc-dich', 'Mục đích'], ['dang-o-dau', 'Đang ở đâu'], ['tim', 'Noe đi tìm'], ['lo-trinh', 'Lộ trình'], ['hoc', 'Học']];
function veChang(hien) {
  document.body.classList.remove('gioi-thieu');
  // Đã chọn lộ trình và vào học: bỏ dải chặng (bên dưới đã có Hồ sơ học để xem, sửa Mục đích và Đang ở đâu)
  if (S?.lo_trinh?.trang_thai === 'da-duyet') { $('#steps').innerHTML = ''; $('#steps').hidden = true; return; }
  $('#steps').hidden = false;
  const i =CHANG.findIndex(c => c[0] === hien);
  // Màu theo tiến độ thật (chặng xa nhất đã tới); chặng đã tới thì bấm được để quay lại xem
  const TEN_CU = { B: 'muc-dich', A: 'dang-o-dau', C1: 'tim', C2: 'lo-trinh' };
  const xa = Math.max(i, CHANG.findIndex(c => c[0] === (TEN_CU[S?.tien_do?.chang_hien_tai] || S?.tien_do?.chang_hien_tai)));
  const moDuoc = j => j <= xa && CHANG[j][0] !== 'tim' && !(CHANG[j][0] === 'lo-trinh' && !S.lo_trinh_3 && !S.lo_trinh) && !(CHANG[j][0] === 'hoc' && !S.lo_trinh);
  $('#steps').innerHTML = CHANG.map((c, j) => {
    const lop = [j < xa || (j === xa && j !== i) ? 'xong' : '', j === i ? 'dang' : ''].join(' ').trim();
    return `<li class="${lop}">${moDuoc(j) && j !== i ? `<button type="button" class="chang-nut" data-chang="${c[0]}">${c[1]}</button>` : c[1]}</li>`;
  }).join('');
  $('#steps').querySelectorAll('[data-chang]').forEach(b => b.onclick = () => ({ 'muc-dich': () => daVaoHoc() ? manMucDich() : taoKhoa(0), 'dang-o-dau': () => daVaoHoc() ? manDangODau() : taoKhoa(BUOC_A), 'lo-trinh': () => manLoTrinh(), 'hoc': manTrangChu })[b.dataset.chang]?.());
  // Điện thoại: dải chặng kéo ngang, tự cuộn tới chặng đang học
  const dang = $('#steps .dang'); if (dang) $('#steps').scrollLeft = dang.offsetLeft - $('#steps').offsetLeft - 16;
}
const noi = (tam, html) => `<div class="noi"><span class="noe-khung">${noe(tam)}</span><div class="bong">${html}</div></div>`;
function toast(t) {
  document.querySelectorAll('.toast').forEach(x => x.remove()); // cái mới thay cái cũ, không chồng lên nhau
  const d = document.createElement('div'); d.className = 'toast'; d.setAttribute('role', 'status'); d.textContent = t; document.body.append(d);
  setTimeout(() => d.classList.add('di'), 2900); setTimeout(() => d.remove(), 3300);
}
// Hộp thoại: con trỏ bàn phím vào hộp, Tab vòng trong hộp, Esc đóng (coi như nút cuối: "Thôi", "Được"), đóng thì trả con trỏ về chỗ cũ
let hopTruoc = null, hopHuy = null;
function hienHop(html) {
  const h = $('#hop');
  if (h.hidden) hopTruoc = document.activeElement;
  h.innerHTML = `<div role="dialog" aria-modal="true">${html}</div>`; h.hidden = false;
  // hộp tự dựng (Mở trên điện thoại, Sao chép và dán...): Esc / Back bấm đúng nút đóng của hộp nếu có (hopChon tự đặt lại hopHuy)
  hopHuy = () => { const n = [...h.querySelectorAll('button')].find(b => /^(đóng|huỷ|hủy|thôi|để sau|close|cancel)/i.test(b.textContent.trim())); if (n) n.click(); };
  setTimeout(() => { const n = h.querySelector('button.chinh, button, input, textarea, select'); if (n && !h.hidden) n.focus({ preventScroll: true }); }, 30);
}
function dongHop() { $('#hop').hidden = true; $('#hop').innerHTML = ''; hopHuy = null; try { hopTruoc?.focus?.({ preventScroll: true }); } catch { /* bỏ qua */ } hopTruoc = null; }
document.addEventListener('keydown', e => {
  const h = $('#hop'); if (!h || h.hidden) return;
  if (e.key === 'Escape' && hopHuy) { e.preventDefault(); hopHuy(); return; }
  if (e.key !== 'Tab') return;
  const ds = [...h.querySelectorAll('button, a[href], input, textarea, select')].filter(x => !x.disabled && x.offsetParent !== null);
  if (!ds.length) return;
  const dau = ds[0], cuoi = ds[ds.length - 1];
  if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
  else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
  else if (!h.contains(document.activeElement)) { e.preventDefault(); dau.focus(); }
});
function hopChon(html, nut) {
  return new Promise(ok => {
    hienHop(html + `<div class="hang">${nut.map((n, i) => `<button class="${i ? '' : 'chinh'}" data-i="${i}">${n}</button>`).join('')}</div>`);
    $('#hop').querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { dongHop(); ok(+b.dataset.i); });
    // Esc / nút Back = chọn nút AN TOÀN (Thôi, Để sau, Ở lại...), KHÔNG BAO GIỜ là nút xoá/thoát.
    // Hộp không có nút an toàn thì Esc không làm gì (sửa lỗi 24/11/2026: Esc 2 lần từng xoá tài khoản).
    const chuNut = n => String(n).replace(/<[^>]*>/g, '').trim();
    const AN_TOAN = /^(thôi|để sau|đóng|ở lại|được|huỷ|hủy|không|chưa|giữ|quay lại)/i, NGUY = /xoá|xóa|thoát|bỏ|vĩnh viễn|đổi mã/i;
    const iAn = nut.findIndex(n => AN_TOAN.test(chuNut(n)) && !NGUY.test(chuNut(n).replace(/^thôi, giữ lại$/i, '')));
    const iHuy = iAn >= 0 ? iAn : (nut.length === 1 && !NGUY.test(chuNut(nut[0])) ? 0 : -1); // hộp một nút ("Mình hiểu rồi"...): Esc chọn nút đó
    hopHuy = iHuy < 0 ? null : () => { dongHop(); ok(iHuy); };
  });
}
const baoNho = t => hopChon(noi('ngac-nhien', esc(t)), ['Được']);

// ---------- Nút Quay lại và Trang chính ----------
// Mỗi màn chính gọi vaoMan() lúc vẽ để app nhớ đường đã đi. "Quay lại" về màn trước đó;
// mở lại app (chưa có đường đi) thì về bước liền trước trong luồng học. "Trang chính" về trang giới thiệu.
// Màn đang chạy việc (Noe đi tìm, buổi học) không vẽ lại khi quay lại, để không chạy lại việc đó.
const LICH_SU = [];
let manHienTai = null, LUOT = 0, dangHocBuoi = false;
const KHONG_VE_LAI = new Set(['tim', 'buoi-hoc', 'dau-vao']);
// Mỗi lần sang màn mới (hoặc sang câu mới khi tạo khoá) thì ghi một bước vào lịch sử trình duyệt,
// để nút quay lại của điện thoại / trình duyệt cũng về màn trước, không thoát khỏi app.
let dangLui = false;
function vaoMan(ten, fn, args = []) {
  const cauMoi = ten === 'tao-khoa' && manHienTai?.ten === ten && manHienTai.args[0] !== args[0];
  const sangMan = !!manHienTai && (manHienTai.ten !== ten || cauMoi);
  if (manHienTai && manHienTai.ten !== ten) LICH_SU.push(manHienTai);
  if (LICH_SU.length > 30) LICH_SU.shift();
  manHienTai = { ten, fn, args: [...args] };
  if (sangMan || cauMoi) { const m = $('#man'); m.classList.remove('vao'); void m.offsetWidth; m.classList.add('vao'); clearTimeout(vaoMan.hen); vaoMan.hen = setTimeout(() => m.classList.remove('vao'), 700); }
  if (sangMan && !dangLui) { try { history.pushState({ noe: Date.now() }, ''); } catch { /* bỏ qua */ } }
  if (ten !== 'buoi-hoc') dangHocBuoi = false;
  const nav = $('#dieuHuong');
  if (nav) nav.hidden = ten === 'gioi-thieu';
}
function manTruocTrongLuong(ten) {
  const hoc = (S.tien_do?.chang_hien_tai || '') === 'hoc' && S.lo_trinh;
  const cha = { 'dang-o-dau': manMucDich, 'tim': manDangODau, 'dau-vao': manDangODau, 'lo-trinh': hoc ? manTrangChu : manDangODau, 'hom-nay': manTrangChu,
    'buoi-hoc': manHomNay, 'lich': manTrangChu, 'dien-thoai': manTrangChu, 'cua-hang': manTrangChu }[ten];
  return cha || manGioiThieu;
}
async function roiManDangLam() {
  if (!dangHocBuoi) return true;
  const c = await hopChon(noi('suy-nghi', '<b>Thoát buổi học đang làm?</b><p>Phần đã làm của buổi này chưa được lưu. Lần sau bạn học lại buổi này từ đầu nhé.</p>'), ['Ở lại học tiếp', 'Thoát']);
  return c === 1;
}
async function quayLai() {
  if (!$('#hop').hidden) { if (hopHuy) hopHuy(); return false; } // đang mở hộp: Back chỉ đóng hộp (bằng nút an toàn), không lùi màn
  if (!(await roiManDangLam())) return false;
  LUOT++;
  const ten = manHienTai?.ten;
  // Đang tạo khoá: quay lại câu trước (câu đầu thì mới ra màn trước đó). Câu trả lời đã lưu, không mất gì.
  if (ten === 'tao-khoa' && +manHienTai.args[0] > 0) return taoKhoa(+manHienTai.args[0] - 1);
  let truoc = LICH_SU.pop();
  while (truoc && KHONG_VE_LAI.has(truoc.ten)) truoc = LICH_SU.pop();
  manHienTai = null;
  if (truoc) return truoc.fn(...truoc.args);
  manTruocTrongLuong(ten)();
}
async function veTrangChinh() {
  if (!(await roiManDangLam())) return;
  LUOT++;
  manGioiThieu();
}
const gioChao = () => { const h = new Date().getHours(); return h < 11 ? 'Chào buổi sáng' : h < 14 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : h < 23 ? 'Chào buổi tối' : 'Khuya rồi nè'; };
const goiTen = () => S.ho_so.ten_goi ? ` ${esc(S.ho_so.ten_goi)}` : '';
const ngonNgu = () => S.ho_so.ngon_ngu && S.ho_so.ngon_ngu !== 'vi' ? `\nViết toàn bộ nội dung bằng ngôn ngữ của người học: ${S.ho_so.ngon_ngu}.` : '\nViết bằng tiếng Việt dễ hiểu, thuật ngữ thì giải thích trong ngoặc.';

// ---------- AI ----------
function layJSON(vb) {
  vb = String(vb || '').replace(/^﻿/, '');
  const m = vb.match(/```(?:json)?\s*([\s\S]*?)```/);
  let t = m ? m[1] : vb.slice(vb.indexOf('{'), vb.lastIndexOf('}') + 1);
  try { return JSON.parse(t); } catch { /* sửa lỗi hay gặp của AI rồi thử lại */ }
  t = t.replace(/[“”]/g, '"').replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(t);
}

// Hỏi AI và đòi đúng mẫu JSON. AI (nhất là model miễn phí) trả sai mẫu thì tự nhờ nó sửa lại một lần.
async function hoiJSON(prompt, opts, kiem = () => true) {
  const vb = await hoiAI(prompt, opts);
  try { const d = layJSON(vb); if (kiem(d)) return d; } catch { /* thử sửa bên dưới */ }
  if (opts.saoChep || !S.ai.cach_noi || S.ai.cach_noi === 'sao-chep') throw new Error('mau');
  if (opts.nhatKy) opts.nhatKy.insertAdjacentHTML('beforeend', `<div class="tim"><span>${new Date().toTimeString().slice(0, 8)}</span>AI trả lời chưa đúng mẫu, Noe nhờ nó sửa lại…</div>`);
  const sua = `Câu trả lời dưới đây phải là MỘT khối \`\`\`json hợp lệ theo đúng mẫu đã yêu cầu, nhưng đang sai hoặc thiếu. Hãy trả lại đúng MỘT khối \`\`\`json đã sửa, giữ nguyên nội dung, không viết gì thêm.

Yêu cầu gốc (để biết mẫu):
${prompt.slice(-2500)}

Câu trả lời cần sửa:
${String(vb).slice(0, 12000)}`;
  const vb2 = await hoiAI(sua, { viec: 'sửa lại câu trả lời cho đúng mẫu', nhatKy: opts.nhatKy });
  const d2 = layJSON(vb2);
  if (!kiem(d2)) throw new Error('mau');
  return d2;
}

// Dòng "đang chờ": cho học viên biết AI vẫn đang làm, đã chờ bao lâu, cần chờ thêm.
// Có nhật ký thì hiện ngay dưới nhật ký; không có thì hiện hộp nổi giữa màn hình.
class DongCho {
  constructor(viec, nhatKy) {
    this.bd = Date.now();
    this.el = document.createElement('div');
    this.el.className = 'dang-cho';
    this.el.setAttribute('role', 'status');
    if (nhatKy) { nhatKy.after(this.el); this.hop = false; }
    else { hienHop(`<h2>Noe đang nhờ AI ${esc(viec)}</h2>`); $('#hop > div').append(this.el); this.hop = true; }
    this.ve();
    this.t = setInterval(() => this.ve(), 1000);
  }
  ve() {
    const s = Math.round((Date.now() - this.bd) / 1000), phut = Math.floor(s / 60), giay = s % 60;
    const da = phut ? `${phut} phút ${giay} giây` : `${giay} giây`;
    const loi = s < 20 ? 'Noe đang hỏi AI, chờ mình xíu nha…'
      : s < 60 ? 'AI đang suy nghĩ và tìm, bạn chờ thêm chút nha.'
      : s < 180 ? 'Việc này hơi lâu (AI miễn phí thường mất 1–5 phút). Bạn cứ để trang mở, đừng tắt hay tải lại trang nha.'
      : 'Lâu quá ha, nhưng AI vẫn đang làm. Muốn nhanh hơn thì lần sau vào Cài đặt AI chọn model khác.';
    if (!this.chu) {
      // Noe suy nghĩ (3 chấm nhún trên đầu) vẽ một lần, chỉ cập nhật chữ mỗi giây để Noe chạy mượt
      this.el.innerHTML = `<span class="noe-nho" aria-hidden="true">${noe('suy-nghi')}</span><div class="chu-cho"></div>`;
      this.chu = this.el.querySelector('.chu-cho');
    }
    this.chu.innerHTML = `<b>Đang chờ AI · ${da}</b><br><span class="mo">${loi}</span>`;
  }
  xong() { clearInterval(this.t); this.el.remove(); if (this.hop) dongHop(); }
}

// nhatKy: phần tử để hiện từng bước AI đang tìm (nếu có)
async function hoiAI(prompt, { web = false, viec = 'việc này', nhatKy = null, saoChep = false } = {}) {
  const cach = S.ai.cach_noi;
  if (saoChep || !cach || cach === 'sao-chep') return saoChepDan(prompt, web, viec);
  const { id } = await api('/api/ai/bat-dau', { prompt, web, viec });
  const dongCho = new DongCho(viec, nhatKy);
  let tu = 0, loiMang = 0;
  while (true) {
    await new Promise(r => setTimeout(r, 1200));
    let v;
    try { v = await api(`/api/ai/viec?id=${id}&tu=${tu}`); loiMang = 0; }
    catch (e) { if (++loiMang < 6) continue; dongCho.xong(); throw e; } // mạng chập chờn: thử lại vài lần rồi mới báo lỗi
    if (v?.loi === 'khong-thay' || !Array.isArray(v?.su_kien)) { dongCho.xong(); throw new Error('Việc này bị gián đoạn (máy chủ Noe vừa cập nhật). Bạn bấm làm lại nhé.'); }
    tu += v.su_kien.length;
    if (nhatKy && v.su_kien.length) nhatKy.hidden = false;
    if (nhatKy) v.su_kien.forEach(e => { nhatKy.insertAdjacentHTML('beforeend', `<div class="${esc(e.loai)}"><span>${esc(e.luc)}</span>${esc(e.chu)}</div>`); nhatKy.scrollTop = nhatKy.scrollHeight; });
    if (!v.xong) continue;
    dongCho.xong();
    if (!v.loi) return v.van_ban;
    const huong = {
      'chua-dang-nhap': laMayTinh()
        ? 'Claude Code trên máy chưa đăng nhập. Mở Terminal, gõ <code>claude</code>, gõ <code>/login</code>, đăng nhập tài khoản Claude một lần.'
        : 'Claude Code chạy trên <b>máy tính</b> của bạn và chưa đăng nhập, nên điện thoại chưa dùng được. Khi ngồi ở máy tính: mở Terminal, gõ <code>claude</code>, gõ <code>/login</code>, đăng nhập tài khoản Claude một lần là xong.',
      'khoa-sai': esc(v.thong_bao) + ' Vào Cài đặt AI để nối lại.',
      'het-tien': esc(v.thong_bao),
      'thieu-thu-vien': esc(v.thong_bao),
    }[v.loi] || `AI báo lỗi: ${esc(v.thong_bao)}`;
    if (v.loi === 'het-tien' && cach === 'openrouter') {
      const c2 = await hopChon(noi('buon', huong), ['Dùng model miễn phí', 'Dùng sao chép và dán', 'Để sau']);
      if (c2 === 0) { await api('/api/ai/cach-noi', { cach_noi: 'openrouter', model_openrouter: 'openrouter/free' }); await tai(); return hoiAI(prompt, { web, viec, nhatKy }); }
      if (c2 === 1) return saoChepDan(prompt, web, viec);
      throw new Error('huy');
    }
    if (v.loi === 'chua-dang-nhap') {
      const c3 = await hopChon(noi('buon', 'Claude Code trên máy tính chưa đăng nhập. Bạn đăng nhập Claude ngay tại đây được, kể cả trên điện thoại: chỉ mất khoảng 1 phút.'), ['Đăng nhập Claude ngay', 'Dùng sao chép và dán', 'Để sau']);
      if (c3 === 0 && await dangNhapClaude()) return hoiAI(prompt, { web, viec, nhatKy });
      if (c3 === 1) return saoChepDan(prompt, web, viec);
      throw new Error('huy');
    }
    const chon = await hopChon(noi('buon', huong + '<br><span class="mo">Bạn có thể dùng tạm cách sao chép và dán.</span>'), ['Dùng sao chép và dán', 'Để sau']);
    if (chon !== 0) throw new Error('huy');
    return saoChepDan(prompt, web, viec);
  }
}

function saoChepDan(prompt, web, viec) {
  return new Promise((ok, huy) => {
    hienHop(`
      <h2>Nhờ AI của bạn: ${esc(viec)}</h2>
      <ol class="huong-dan">
        <li>Bấm <b>Sao chép câu hỏi</b>.</li>
        <li>Mở AI chat bạn hay dùng: <a href="https://claude.ai/new" target="_blank" rel="noopener">Claude</a>, <a href="https://chatgpt.com" target="_blank" rel="noopener">ChatGPT</a> hoặc <a href="https://gemini.google.com" target="_blank" rel="noopener">Gemini</a>.${web ? ' Bật <b>tìm kiếm web</b> nếu có nút đó.' : ''}</li>
        <li>Dán vào ô chat và gửi. Chờ AI trả lời xong.</li>
        <li>Sao chép <b>toàn bộ</b> câu trả lời, dán vào ô dưới, bấm <b>Xong</b>.</li>
      </ol>
      <pre class="prompt" id="pr">${esc(prompt)}</pre>
      <div class="hang"><button class="chinh" id="cp">Sao chép câu hỏi</button><span class="mo" id="cpok"></span></div>
      <label class="cau">Câu trả lời của AI<textarea id="tl" placeholder="Dán câu trả lời vào đây"></textarea></label>
      <p class="loi" id="tlloi" hidden></p>
      <div class="hang"><button class="chinh" id="xong">Xong</button><button id="huy">Huỷ</button></div>`);
    $('#cp').onclick = async () => {
      try { await navigator.clipboard.writeText(prompt); $('#cpok').textContent = 'Đã sao chép.'; }
      catch { const r = document.createRange(); r.selectNodeContents($('#pr')); getSelection().removeAllRanges(); getSelection().addRange(r); $('#cpok').textContent = 'Bấm Ctrl+C để sao chép phần đã chọn.'; }
    };
    $('#huy').onclick = () => { dongHop(); huy(new Error('huy')); };
    // Bấm mở Claude/ChatGPT/Gemini là câu hỏi được sao chép sẵn, sang đó chỉ việc dán (tiện trên điện thoại)
    $('#hop').querySelectorAll('.huong-dan a[target=_blank]').forEach(a => a.addEventListener('click', () => {
      try { navigator.clipboard.writeText(prompt); $('#cpok').textContent = 'Đã sao chép.'; } catch { /* trình duyệt chặn: người học bấm nút Sao chép */ }
    }));
    $('#xong').onclick = () => {
      const v = $('#tl').value.trim();
      try { layJSON(v); } catch { $('#tlloi').hidden = false; $('#tlloi').textContent = 'Chưa đọc được câu trả lời. Hãy dán toàn bộ câu trả lời, có phần nằm giữa dấu ``` json.'; return; }
      dongHop(); ok(v);
    };
  });
}

// Đăng nhập Claude Code (chạy trên máy tính) bằng tài khoản Claude, làm được ngay trên điện thoại:
// app xin Claude Code một đường link đăng nhập → người học mở link, đăng nhập, sao chép mã → dán về app.
function dangNhapClaude() {
  return new Promise(async xong => {
    hienHop(`<h2>Đăng nhập Claude</h2>${noi('suy-nghi', 'Noe đang xin đường link đăng nhập từ Claude Code trên máy tính…')}`);
    let r;
    try { r = await api('/api/claude-dang-nhap/bat-dau', {}); } catch { r = { ok: false, thong_bao: 'Không kết nối được với app.' }; }
    if (!r.ok) { dongHop(); await baoNho(r.thong_bao || 'Chưa lấy được đường link đăng nhập.'); return xong(false); }
    hienHop(`<h2>Đăng nhập Claude</h2>
      <ol class="huong-dan">
        <li>Bấm <b>Mở trang đăng nhập Claude</b>. Đăng nhập tài khoản Claude của bạn (cùng tài khoản dùng app Claude). Trang hỏi cho Claude Code dùng tài khoản: bấm nút đồng ý màu đậm (tiếng Anh là <b>Authorize</b>, tiếng Việt là <b>Ủy quyền</b> hoặc <b>Cho phép</b>).</li>
        <li>Trang tiếp theo hiện một <b>dãy mã dài</b> (Authentication Code / Mã xác thực) kèm nút sao chép (biểu tượng hai ô vuông chồng nhau, hoặc chữ Copy / Sao chép). Bấm để sao chép.</li>
        <li>Quay lại đây, dán mã vào ô dưới, bấm <b>Xong</b>.</li>
      </ol>
      <p><a class="nut" href="${esc(r.url)}" target="_blank" rel="noopener">Mở trang đăng nhập Claude</a></p>
      <label class="cau">Mã đăng nhập<input id="maClaude" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Dán mã vào đây"></label>
      <p class="loi" id="maLoi" hidden></p>
      <div class="hang"><button class="chinh" id="maXong">Xong</button><button id="maHuy">Huỷ</button></div>
      <p class="mo">Mã chỉ dùng một lần, app chuyển thẳng cho Claude Code trên máy tính, không lưu lại. Lưu ý: dùng gói Claude qua Claude Code là cho việc học của riêng bạn.</p>`);
    $('#maHuy').onclick = () => { dongHop(); xong(false); };
    $('#maXong').onclick = async () => {
      const ma = $('#maClaude').value.trim();
      if (!ma) return;
      $('#maXong').disabled = true; $('#maXong').textContent = 'Đang kiểm tra…';
      const k = await api('/api/claude-dang-nhap/ma', { ma }).catch(() => ({ ok: false, thong_bao: 'Không kết nối được với app.' }));
      if (k.ok) { dongHop(); toast('Đã đăng nhập Claude Code!'); return xong(true); }
      $('#maXong').disabled = false; $('#maXong').textContent = 'Xong';
      $('#maLoi').hidden = false; $('#maLoi').textContent = k.thong_bao;
    };
  });
}

// ---------- 1. Nối AI ----------
// Hỏi một câu "Bạn đang có gì?", rồi dẫn từng bước theo đúng trường hợp.
const HANG_INFO = {
  gemini: { ten: 'Google Gemini', tag: ['Có bản miễn phí', ''], lay: 'https://aistudio.google.com/apikey', buoc: 'Vào Google AI Studio, đăng nhập Gmail, bấm <b>Create API key</b>, sao chép.', mo: 'Bản miễn phí giới hạn số lượt mỗi ngày (theo trang của Google, có thể đổi).' },
  groq: { ten: 'Groq', tag: ['Có bản miễn phí', ''], lay: 'https://console.groq.com/keys', buoc: 'Vào Groq Console, đăng nhập, bấm <b>Create API Key</b>, sao chép.', mo: 'Trả lời rất nhanh. Bản miễn phí giới hạn lượt dùng.' },
  openai: { ten: 'OpenAI (ChatGPT)', tag: ['Trả phí', 'xam'], lay: 'https://platform.openai.com/api-keys', buoc: 'Vào OpenAI Platform, nạp tiền ở <b>Billing</b>, rồi <b>Create new secret key</b>.', mo: 'Khoá API khác với gói ChatGPT Plus: phải nạp tiền riêng.' },
  deepseek: { ten: 'DeepSeek', tag: ['Trả phí, rẻ', 'xam'], lay: 'https://platform.deepseek.com/api_keys', buoc: 'Vào DeepSeek Platform, nạp tiền, tạo API key.', mo: '' },
  ollama: { ten: 'Ollama', tag: ['Miễn phí, chạy trên máy', ''], lay: 'https://ollama.com/download', buoc: 'Tải và cài Ollama. Mở Terminal gõ <code>ollama pull gemma3</code> (hoặc model khác) để tải một model về máy.', mo: 'Không cần mạng khi học, không tốn tiền. Cần máy khá mạnh (RAM 16GB trở lên là tốt).' },
  lmstudio: { ten: 'LM Studio', tag: ['Miễn phí, chạy trên máy', ''], lay: 'https://lmstudio.ai', buoc: 'Tải LM Studio, tải một model trong app, vào tab <b>Developer</b> bấm <b>Start Server</b>.', mo: 'Có giao diện dễ dùng hơn Ollama. Cũng cần máy khá mạnh.' },
};
const TEN_CACH = { openrouter: 'OpenRouter', anthropic: 'Claude (khoá API)', 'claude-code': 'Claude Code trên máy', 'sao-chep': 'Sao chép và dán', gemini: 'Google Gemini', groq: 'Groq', openai: 'OpenAI', deepseek: 'DeepSeek', ollama: 'Ollama trên máy', lmstudio: 'LM Studio trên máy' };
const modelDangDung = () => { const a = S.ai, c = a.cach_noi; return c === 'openrouter' ? (a.model_openrouter === 'openrouter/free' ? 'miễn phí' : a.model_openrouter) : (a.model?.[c] || ''); };

async function chonCach(cach, them = {}) { await api('/api/ai/cach-noi', { cach_noi: cach, ...them }); await tai(); }

function thanhDangNoi(tuCaiDat) {
  const a = S.ai;
  if (!a.cach_noi) return '';
  const m = modelDangDung();
  return `<div class="the dang-noi"><div><span class="nhan">Đang nối</span> <b>${esc(TEN_CACH[a.cach_noi] || a.cach_noi)}</b>${m ? ` <span class="mo">· model ${esc(m)}</span>` : ''}</div>
    <div class="hang"><button class="chinh" id="tiep">${tuCaiDat ? 'Xong' : 'Nối xong, tạo khoá học →'}</button>${a.cach_noi !== 'sao-chep' ? '<button id="thuNoi">Thử kết nối</button>' : ''}</div><p class="mo" id="kqThu" aria-live="polite"></p></div>`;
}
function ganThanhDangNoi(tuCaiDat) {
  if ($('#tiep')) $('#tiep').onclick = () => (tuCaiDat && S.lo_trinh?.trang_thai === 'da-duyet') ? manTrangChu() : dieuHuong(true); // đang tạo khoá: quay lại đúng bước
  if ($('#thuNoi')) $('#thuNoi').onclick = async () => {
    $('#kqThu').textContent = 'Noe đang hỏi thử AI một câu ngắn…'; $('#thuNoi').disabled = true;
    const r = await api('/api/ai/thu', {});
    $('#thuNoi').disabled = false;
    $('#kqThu').innerHTML = r.ok ? '<b>Nối được rồi!</b> AI đã trả lời.' : `<b>Chưa được:</b> ${esc(r.thong_bao)}`;
  };
}

const NHOM = [
  ['mien-phi', 'Mình chưa có gì, muốn dùng miễn phí', 'Liên kết OpenRouter một nút, hoặc lấy khoá miễn phí của Gemini, Groq.', ['Miễn phí', '']],
  ['chat', 'Mình đang dùng ChatGPT, Claude hoặc Gemini trên web, điện thoại', 'Dùng luôn tài khoản đó bằng cách sao chép và dán. Không tốn thêm tiền.', ['Miễn phí', '']],
  ['khoa', 'Mình có (hoặc muốn tạo) khoá API', 'Claude, OpenAI, Gemini, DeepSeek, Groq, OpenRouter. Tự động hoàn toàn.', ['Tuỳ hãng', 'xam']],
  ['may', 'Mình muốn AI chạy ngay trên máy', 'Ollama hoặc LM Studio: không cần mạng, không tốn tiền, cần máy khá mạnh.', ['Miễn phí', '']],
];

async function manNoiAI(tuCaiDat = false, nhom = null) {
  vaoMan('noi-ai', manNoiAI, arguments);
  veChang('muc-dich');
  const a = S.ai;
  if (!nhom) {
    man.innerHTML = `
      ${noi('chao', `<h1>Chào bạn, mình là Noe!</h1><p>Mình cần nối với một AI: AI sẽ hỏi, đi tìm nguồn và soạn bài, còn mình trình bày cho dễ học. <b>Bạn đang có gì?</b></p>`)}
      ${thanhDangNoi(tuCaiDat)}
      <div class="chon-nhom">${NHOM.map(n => `<button class="nhom" data-nhom="${n[0]}"><span class="nhan ${n[3][1]}">${n[3][0]}</span><b>${n[1]}</b><span class="mo">${n[2]}</span></button>`).join('')}
        ${a.co_claude_code ? '<button class="nhom" data-nhom="claude-code"><span class="nhan">Máy đã có</span><b>Mình có Claude Code</b><span class="mo">App tự gọi Claude Code đã đăng nhập trên máy.</span></button>' : ''}</div>
      <p class="mo">Không chắc chọn gì? Chọn ô thứ hai nếu bạn đang dùng ChatGPT hay Claude. Mọi thứ bạn học nằm ở <code>${esc(S.noi_luu)}</code>; khoá giữ trên máy bạn, không gửi đi đâu.</p>`;
    man.querySelectorAll('[data-nhom]').forEach(b => b.onclick = () => manNoiAI(tuCaiDat, b.dataset.nhom));
    ganThanhDangNoi(tuCaiDat);
    return;
  }
  const quay = `<button class="nho" id="quayNhom">← Chọn lại</button>`;
  const khung = (tieuDe, noiDung) => {
    man.innerHTML = `<div class="hang">${quay}</div>${noi('vui', `<h2>${tieuDe}</h2>`)}${thanhDangNoi(tuCaiDat)}<div class="luoi">${noiDung}</div>`;
    $('#quayNhom').onclick = () => manNoiAI(tuCaiDat);
    ganThanhDangNoi(tuCaiDat);
  };
  const theOR = () => `<div class="the ${a.cach_noi === 'openrouter' ? 'chon' : ''}"><span class="nhan ${a.co_openrouter ? '' : 'vang'}">${a.co_openrouter ? `Đã liên kết ${esc(a.openrouter)}` : 'Một nút'}</span><h3>OpenRouter</h3>
      <ol class="huong-dan"><li>Bấm <b>Liên kết OpenRouter</b>, đăng nhập (Google cũng được), bấm <b>Authorize</b>.</li><li>Tự quay về đây. Chọn model <b>Miễn phí</b> nếu chưa nạp tiền.</li></ol>
      ${a.co_openrouter ? `<label class="cau">Model<select id="modelOR">
        <option value="openrouter/free" ${a.model_openrouter === 'openrouter/free' ? 'selected' : ''}>Miễn phí (không tìm web, đôi khi chậm)</option>
        <option value="openrouter/auto" ${a.model_openrouter === 'openrouter/auto' ? 'selected' : ''}>Tốt nhất, có tìm web (cần nạp tiền)</option>
        ${!['openrouter/free', 'openrouter/auto'].includes(a.model_openrouter) ? `<option selected>${esc(a.model_openrouter)}</option>` : ''}</select></label>` : ''}
      <div class="hang"><a class="nut" href="/api/ket-noi/openrouter">${a.co_openrouter ? 'Liên kết lại' : 'Liên kết OpenRouter'}</a>${a.co_openrouter && a.cach_noi !== 'openrouter' ? '<button data-dung="openrouter">Dùng OpenRouter</button>' : ''}</div></div>`;
  const theHang = loai => {
    const h = HANG_INFO[loai], coKhoa = !!a.khoa?.[loai], canKhoa = !['ollama', 'lmstudio'].includes(loai);
    return `<div class="the ${a.cach_noi === loai ? 'chon' : ''}" data-hang="${loai}"><span class="nhan ${h.tag[1]}">${coKhoa ? `Đã có khoá ${esc(a.khoa[loai])}` : h.tag[0]}</span><h3>${h.ten}</h3>
      <ol class="huong-dan"><li><a href="${h.lay}" target="_blank" rel="noopener">${canKhoa ? 'Mở trang lấy khoá' : 'Mở trang tải về'}</a>. ${h.buoc}</li>${canKhoa ? '<li>Dán khoá vào ô dưới, bấm <b>Lưu khoá</b>.</li>' : ''}<li>Chọn model trong danh sách, bấm <b>Dùng</b>.</li></ol>
      ${h.mo ? `<p class="mo">${h.mo}</p>` : ''}
      ${canKhoa ? `<input type="password" placeholder="Dán khoá API vào đây" autocomplete="off" aria-label="Khoá API ${h.ten}" class="o-khoa"><div class="hang"><button class="luu-khoa">Lưu khoá</button>${coKhoa ? '<button class="xoa-khoa nho">Xoá khoá</button>' : ''}</div>` : ''}
      ${!canKhoa || coKhoa ? `<label class="cau">Model<select class="ds-model"><option>Đang tải danh sách…</option></select></label><div class="hang"><button class="chinh dung-hang">Dùng ${h.ten}</button></div>` : ''}</div>`;
  };
  const theClaude = () => `<div class="the ${a.cach_noi === 'anthropic' ? 'chon' : ''}"><span class="nhan ${a.co_anthropic ? '' : 'xam'}">${a.co_anthropic ? `Đã có khoá ${esc(a.anthropic)}` : 'Trả phí'}</span><h3>Claude (Anthropic)</h3>
      <ol class="huong-dan"><li>Vào <a href="https://platform.claude.com" target="_blank" rel="noopener">platform.claude.com</a>, nạp tiền ở <b>Billing</b>, đặt mức chi tối đa ở <b>Limits</b>.</li><li><b>API Keys</b> → <b>Create Key</b>, dán vào ô dưới.</li></ol>
      <p class="mo">Mạnh nhất cho việc tìm nguồn: Noe hiện được từng câu Claude đang tìm. Gói Claude Pro trên claude.ai không dùng được ở đây (Anthropic không cho), phải dùng khoá API.</p>
      <input type="password" id="khoaA" placeholder="sk-ant-..." autocomplete="off" aria-label="Khoá API Claude"><div class="hang"><button id="luuA">Lưu khoá</button>${a.co_anthropic ? `<button id="xoaA" class="nho">Xoá khoá</button>${a.cach_noi !== 'anthropic' ? '<button class="chinh" data-dung="anthropic">Dùng Claude</button>' : ''}` : ''}</div>
      ${a.co_thu_vien_anthropic ? '' : '<p class="mo">Lần đầu dùng, tắt app rồi mở lại bằng MO-APP.bat để máy cài thư viện của Claude.</p>'}</div>`;

  if (nhom === 'mien-phi') khung('Dùng miễn phí', theOR() + theHang('gemini') + theHang('groq'));
  else if (nhom === 'chat') {
    khung('Dùng ChatGPT, Claude, Gemini bạn đang có', `<div class="the ${a.cach_noi === 'sao-chep' ? 'chon' : ''}"><h3>Sao chép và dán</h3>
      <ol class="huong-dan"><li>Khi cần AI, app hiện sẵn một câu hỏi và nút <b>Sao chép</b>.</li><li>Bạn dán vào ChatGPT, Claude hay Gemini (web hoặc app điện thoại), gửi đi.</li><li>Sao chép câu trả lời, dán lại vào app. Xong.</li></ol>
      <p class="mo">Ưu điểm: miễn phí, AI của bạn tìm được trên mạng và nhớ bạn là ai. Nhược điểm: mỗi lần phải sao chép qua lại.</p>
      <div class="hang"><button class="chinh" data-dung="sao-chep">Dùng cách này</button></div></div>`);
  } else if (nhom === 'khoa') khung('Dùng khoá API', theClaude() + theOR() + ['openai', 'gemini', 'deepseek', 'groq'].map(theHang).join(''));
  else if (nhom === 'may') khung('AI chạy ngay trên máy', theHang('ollama') + theHang('lmstudio'));
  else if (nhom === 'claude-code') khung('Claude Code trên máy', `<div class="the"><p class="mo" id="ccTrangThai">Đang kiểm tra Claude Code đã đăng nhập chưa…</p><ol class="huong-dan"><li>Bấm <b>Đăng nhập Claude</b> (làm được cả trên điện thoại), đăng nhập tài khoản Claude của bạn, dán mã về app.</li><li>Bấm <b>Dùng Claude Code</b>.</li></ol><div class="hang"><button class="chinh" id="ccDangNhap">Đăng nhập Claude</button><button data-dung="claude-code">Dùng Claude Code</button></div></div>`);

  // gắn nút
  if ($('#ccDangNhap')) {
    $('#ccDangNhap').onclick = async () => { if (await dangNhapClaude()) { await chonCach('claude-code'); manNoiAI(tuCaiDat, nhom); } };
    api('/api/claude-dang-nhap/trang-thai', {}).then(t => {
      const el = $('#ccTrangThai'); if (!el) return;
      el.innerHTML = t.da_dang_nhap ? '✅ Claude Code đã đăng nhập. Bấm <b>Dùng Claude Code</b> là xong.' : 'Claude Code trên máy tính <b>chưa đăng nhập</b>.';
      if (t.da_dang_nhap) $('#ccDangNhap').textContent = 'Đăng nhập lại';
    }).catch(() => {});
  }
  man.querySelectorAll('[data-dung]').forEach(b => b.onclick = async () => { await chonCach(b.dataset.dung); toast(`Đã chọn ${TEN_CACH[b.dataset.dung]}.`); manNoiAI(tuCaiDat, nhom); });
  if ($('#modelOR')) $('#modelOR').onchange = async e => { await chonCach('openrouter', { model_openrouter: e.target.value }); toast('Đã đổi model OpenRouter.'); manNoiAI(tuCaiDat, nhom); };
  if ($('#luuA')) $('#luuA').onclick = async () => {
    const r = await api('/api/ai/khoa', { loai: 'anthropic', khoa: $('#khoaA').value });
    if (!r.ok) return baoNho(r.thong_bao || 'Khoá chưa đúng.');
    toast('Đã lưu khoá Claude trên máy bạn.'); await tai(); manNoiAI(tuCaiDat, nhom);
  };
  if ($('#xoaA')) $('#xoaA').onclick = async () => { await api('/api/ai/xoa-khoa', { loai: 'anthropic' }); await tai(); manNoiAI(tuCaiDat, nhom); };
  man.querySelectorAll('[data-hang]').forEach(async the => {
    const loai = the.dataset.hang;
    const luu = the.querySelector('.luu-khoa'), xoa = the.querySelector('.xoa-khoa'), sel = the.querySelector('.ds-model'), dung = the.querySelector('.dung-hang');
    if (luu) luu.onclick = async () => {
      const r = await api('/api/ai/khoa', { loai, khoa: the.querySelector('.o-khoa').value });
      if (!r.ok) return baoNho(r.thong_bao || 'Khoá chưa đúng.');
      toast(`Đã lưu khoá ${HANG_INFO[loai].ten}. Chọn model rồi bấm Dùng.`); await tai(); manNoiAI(tuCaiDat, nhom);
    };
    if (xoa) xoa.onclick = async () => { await api('/api/ai/xoa-khoa', { loai }); await tai(); manNoiAI(tuCaiDat, nhom); };
    if (!sel) return;
    const r = await api(`/api/ai/models?loai=${loai}`);
    if (!r.ok) { sel.outerHTML = `<p class="loi">${esc(r.thong_bao)}</p>`; if (dung) dung.disabled = true; return; }
    const daChon = r.ds.includes(a.model?.[loai]) ? a.model[loai] : r.goi_y;
    sel.innerHTML = r.ds.map(m => `<option ${m === daChon ? 'selected' : ''}>${esc(m)}${m === r.goi_y ? ' (nên dùng)' : ''}</option>`).join('');
    [...sel.options].forEach(o => { o.value = o.textContent.replace(' (nên dùng)', ''); });
    if (dung) dung.onclick = async () => { await chonCach(loai, { model: sel.value }); toast(`Đã chọn ${HANG_INFO[loai].ten} · ${sel.value}. Bấm Thử kết nối để kiểm tra.`); manNoiAI(tuCaiDat, nhom); };
  });
}

// ---------- 2. Mục đích ----------
const CAP = [
  ['nhanh', 'Sơ cấp', 'Xài được', 'Biết thuật ngữ, hiểu nguyên lý cơ bản, vận dụng nhanh.'],
  ['can-doi', 'Trung cấp', 'Xài tốt', 'Cân đối hiểu và làm: làm được kỹ năng, việc của nghề ở mức cơ bản.'],
  ['chuyen-sau', 'Chuyên sâu', 'Cấp chuyên gia', 'Như đào tạo đại học: nhiều module, nhiều giáo trình, nắm hết nguyên lý.'],
];
// Định nghĩa 3 cấp (theo chủ dự án, 19/11/2026), dùng chung cho mọi lời dặn AI. Mã giữ nguyên để dữ liệu cũ đọc được.
const DINH_NGHIA_CAP = `- "nhanh" = SƠ CẤP, xài được: biết thuật ngữ, thông tin cơ bản, hiểu nguyên lý để vận dụng nhanh. Ví dụ IT: biết IT là gì, ở đâu, các thuật ngữ cơ bản. Ví dụ ứng dụng AI: hiểu thuật ngữ, làm được việc cơ bản với AI.
- "can_doi" = TRUNG CẤP, xài tốt: cân đối giữa hiểu và làm; làm được một kỹ năng, một việc của nghề ở mức cơ bản, xài ở mức sâu hơn. Ví dụ IT: bắt đầu tự làm, xài được công cụ cơ bản.
- "chuyen_sau" = CHUYÊN SÂU, cấp chuyên gia: ngang đào tạo đại học; nhiều module, nhiều giáo trình, đào sâu mọi thứ liên quan tới ngành, ghép nối toàn bộ nguyên lý thành một lộ trình. Ví dụ IT: học xong lập trình được. Ví dụ ứng dụng AI: trở thành chuyên gia.`;
const tenCap = c => (CAP.find(x => x[0] === String(c || '').replace(/_/g, '-')) || [, c || ''])[1]; // AI có khi ghi can_doi thay vì can-doi

// Đã có lộ trình và đang học: Mục đích, Đang ở đâu mở ở chế độ XEM VÀ SỬA (lưu xong về chỗ cũ, không chạy lại luồng)
const daVaoHoc = () => !!(S.lo_trinh || S.lo_trinh_3) && ['lo-trinh', 'hoc'].includes(S.tien_do.chang_hien_tai);
async function sauKhiSuaHoSo() {
  await tai();
  const c = await hopChon(noi('khen', '<b>Đã lưu thay đổi.</b><p>Lộ trình đang học vẫn giữ nguyên. Muốn Noe tìm nguồn và xếp lại lộ trình theo thông tin mới không?</p>'), ['Giữ lộ trình', 'Xếp lại lộ trình']);
  if (c === 1) {
    const ok = await hopChon(noi('suy-nghi', '<b>Xếp lại lộ trình?</b><p>Noe sẽ nhờ AI tìm nguồn và xếp lại 3 lộ trình. Các buổi đã học vẫn được ghi trong nhật ký.</p>'), ['Xếp lại ngay', 'Thôi']);
    // mục đích có thể đã đổi: viết lại Hợp đồng đầu ra + bản đồ kỹ năng trước khi tìm nguồn
    if (ok === 0) { await api('/api/luu', { ten: 'muc-tieu', du_lieu: {} }); await tai(); if (!(await damBaoMucTieu(manTrangChu))) return; return manTim(); }
  }
  return S.tien_do.chang_hien_tai === 'hoc' ? manTrangChu() : manLoTrinh();
}
function manMucDich() {
  vaoMan('muc-dich', manMucDich, arguments);
  veChang('muc-dich');
  const h = S.ho_so, sua = daVaoHoc();
  const mucDich = (h.muc_dich && h.muc_dich.length ? h.muc_dich : (h.muc_tieu ? [h.muc_tieu] : [''])).filter((x, i, a) => x || a.length === 1);
  const cap = h.cap_do === 'nen-tang' ? 'can-doi' : (h.cap_do || 'can-doi');
  man.innerHTML = `
    ${sua ? noi('vui', `<h2>${ic('dich', 'mau-do')} Mục đích học của bạn</h2>` + '<p>Xem lại, sửa nếu muốn. Tiến độ học giữ nguyên.</p>')
      : noi('vui', `<h2>${gioChao()}${goiTen()}! Bạn muốn học gì?</h2><p>Ghi ngắn thôi. Mục đích nào cũng được, nhiều mục đích cũng được.</p>`)}
    <form class="the" id="fM">
      <label class="cau">Bạn muốn học gì?<span class="goi-y">Ví dụ: công nghệ nền tảng, tiếng Anh giao tiếp, làm web bán hàng</span><input type="text" id="linh_vuc" value="${esc(h.linh_vuc)}" required></label>
      <div class="cau"><b>Học xong bạn muốn đạt được gì?</b><span class="mo">Mỗi dòng một mục đích.</span>
        <div id="dsMD" style="display:flex;flex-direction:column;gap:8px">${mucDich.map(m => `<div class="muc-dich"><input type="text" value="${esc(m)}" aria-label="Mục đích"><button type="button" class="nho xoa" aria-label="Bỏ mục đích này">Bỏ</button></div>`).join('')}</div>
        <button type="button" class="nho" id="themMD" style="width:fit-content">+ Thêm mục đích</button></div>
      <div class="cau"><b>Bạn muốn học tới mức nào?</b><span class="mo">Noe sẽ soạn sẵn cả 3 lộ trình, bạn đổi lúc nào cũng được.</span>
        <div class="cap">${CAP.map(c => `<label><input type="radio" name="cap" value="${c[0]}" ${cap === c[0] ? 'checked' : ''}><b>${c[1]}</b><span>${c[2]}</span><span>${c[3]}</span></label>`).join('')}</div></div>
      <details><summary><b>Thời gian và điều kiện</b> <span class="mo">(${esc(h.phut_moi_ngay || 60)} phút/buổi, ${esc(h.ngay_moi_tuan || '3-4')} buổi/tuần, ${h.ngan_sach === 'mien-phi' ? 'chỉ nguồn miễn phí' : 'có thể trả phí'})</span></summary>
        <div class="luoi" style="margin-top:12px">
          <label class="cau">Mỗi buổi bao nhiêu phút?<input type="number" id="phut" min="10" max="600" step="5" value="${esc(h.phut_moi_ngay || 60)}"></label>
          <label class="cau">Mấy buổi mỗi tuần?<select id="ngay">${['1-2', '3-4', '5', '6', '7'].map(v => `<option ${h.ngay_moi_tuan == v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label class="cau">Học lúc mấy giờ?<input type="time" id="gio" value="${esc(h.gio_hoc || '20:00')}"></label>
          <label class="cau">Ngân sách<select id="ngan_sach">${[['mien-phi', 'Chỉ miễn phí'], ['duoi-300k', 'Dưới 300 nghìn/tháng'], ['300k-1tr', '300 nghìn – 1 triệu/tháng'], ['tren-1tr', 'Trên 1 triệu/tháng']].map(v => `<option value="${v[0]}" ${h.ngan_sach === v[0] ? 'selected' : ''}>${v[1]}</option>`).join('')}</select></label>
          <label class="cau">Đọc tiếng Anh tới đâu?<select id="tieng_anh">${['Chưa đọc được', 'Đọc được câu đơn giản', 'Đọc tốt'].map(v => `<option ${h.tieng_anh === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
          <label class="cau">Học trên thiết bị nào?<select id="thiet_bi">${[['ca-hai', 'Máy tính và điện thoại'], ['may-tinh', 'Chỉ máy tính'], ['dien-thoai', 'Chỉ điện thoại']].map(v => `<option value="${v[0]}" ${String(h.thiet_bi || 'ca-hai') === v[0] ? 'selected' : ''}>${v[1]}</option>`).join('')}</select></label>
        </div></details>
      <details><summary><b>Thêm về mục đích</b> <span class="mo">(không bắt buộc, giúp Noe xếp lộ trình sát hơn)</span></summary>
        <div class="luoi" style="margin-top:12px">
          <label class="cau" style="grid-column:1/-1">Vì sao bạn muốn học lúc này?<span class="goi-y">Ví dụ: để đổi việc, để dạy con, vì thích</span><textarea id="ly_do">${esc(h.ly_do)}</textarea></label>
          <label class="cau">Có hạn chót không?<span class="goi-y">Ví dụ: ngày thi, ngày đi làm</span><input type="date" id="han_chot" value="${esc(h.han_chot)}"></label>
          <label class="cau">Cần bằng hay chứng chỉ nào không?<span class="goi-y">Bỏ trống nếu không cần</span><input type="text" id="chung_chi" value="${esc(h.chung_chi)}"></label>
        </div></details>
      <div class="hang"><button class="chinh" type="submit">${sua ? 'Lưu thay đổi' : 'Tiếp: bạn đang ở đâu'}</button><button type="button" id="caiAI" class="nho">Cài đặt AI</button></div>
    </form>`;
  const dong = () => `<div class="muc-dich"><input type="text" aria-label="Mục đích"><button type="button" class="nho xoa" aria-label="Bỏ mục đích này">Bỏ</button></div>`;
  $('#themMD').onclick = () => { $('#dsMD').insertAdjacentHTML('beforeend', dong()); $('#dsMD').lastElementChild.querySelector('input').focus(); };
  $('#dsMD').onclick = e => { if (e.target.classList.contains('xoa') && $('#dsMD').children.length > 1) e.target.parentElement.remove(); };
  $('#caiAI').onclick = () => manNoiAI(true);
  $('#fM').onsubmit = async e => {
    e.preventDefault();
    const md = [...$('#dsMD').querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean);
    const truong = {
      linh_vuc: $('#linh_vuc').value.trim(), muc_dich: md, muc_tieu: md[0] || '', cap_do: man.querySelector('input[name=cap]:checked').value,
      phut_moi_ngay: $('#phut').value, ngay_moi_tuan: $('#ngay').value, gio_hoc: $('#gio').value, ngan_sach: $('#ngan_sach').value, tieng_anh: $('#tieng_anh').value,
      thiet_bi: $('#thiet_bi').value, ly_do: $('#ly_do').value.trim(), han_chot: $('#han_chot').value, chung_chi: $('#chung_chi').value.trim(),
    };
    const tomTat = `- Muốn học: ${truong.linh_vuc}\n- Mục đích:\n${md.map(m => `  - ${m}`).join('\n') || '  - (chưa nói)'}\n- Mức học: ${tenCap(truong.cap_do)}\n- Thời gian: ${truong.phut_moi_ngay} phút/buổi, ${truong.ngay_moi_tuan} buổi/tuần, lúc ${truong.gio_hoc}\n- Tiếng Anh: ${truong.tieng_anh} · Ngân sách: ${$('#ngan_sach').selectedOptions[0].text} · Thiết bị: ${$('#thiet_bi').selectedOptions[0].text}${truong.ly_do ? `\n- Vì sao học: ${truong.ly_do}` : ''}${truong.han_chot ? `\n- Hạn chót: ${truong.han_chot}` : ''}${truong.chung_chi ? `\n- Cần chứng chỉ: ${truong.chung_chi}` : ''}`;
    await api('/api/ho-so', { truong, muc: { 'Đích đến (B)': tomTat } });
    await api('/api/khoa-hoc', { ten_hien_tai: truong.linh_vuc }); // chỉ đặt tên khoá đang học, giữ nguyên các khoá khác
    if (sua) return sauKhiSuaHoSo();
    datChang('dang-o-dau');
  };
}

// ---------- 3. Đang ở đâu ----------
const NHOM_TUOI = ['Dưới 16', '16–17', '18–24', '25–39', '40–59', 'Từ 60'];

// ---------- Tạo khoá học: mỗi trang MỘT câu, thanh tiến độ đầy dần, Noe ghi sổ tay ----------
// Theo docs/tieu-chuan-thong-tin-hoc-vien.md: đủ các trường Bắt buộc mới đi tìm nguồn; câu không bắt buộc có nút Bỏ qua.
// Mỗi lần bấm Tiếp tục là lưu ngay, nên tắt app giữa chừng thì lần sau làm tiếp đúng câu đang dở (tien_do.buoc_tao).
const chip = (ten, ds, chon) => `<div class="chip-chon" data-ten="${ten}">${ds.map(([v, t]) => `<button type="button" class="chip ${String(chon) === String(v) ? 'chon' : ''}" data-v="${esc(v)}">${t}</button>`).join('')}</div>`;
const chipChon = ten => man.querySelector(`.chip-chon[data-ten="${ten}"] .chip.chon`)?.dataset.v || '';
const phanA = () => { const t = S.ho_so_than; return { ve_ban: lay(t, 'Về bạn'), da_biet: lay(t, 'Đã biết, đã làm'), manh_yeu: lay(t, 'Điểm mạnh, khó khăn'), bo_sung: lay(t, 'Bổ sung') }; };
const mucA = a => ({ 'Điểm xuất phát (A)': `### Về bạn\n${a.ve_ban || ''}\n\n### Đã biết, đã làm\n${a.da_biet || ''}\n\n### Điểm mạnh, khó khăn\n${a.manh_yeu || ''}\n\n### Bổ sung\n${a.bo_sung || ''}` });
const TEN_PHI = { 'mien-phi': 'chỉ miễn phí', 'duoi-300k': 'dưới 300 nghìn/tháng', '300k-1tr': '300 nghìn – 1 triệu/tháng', 'tren-1tr': 'trên 1 triệu/tháng' };
const TEN_TB = { 'ca-hai': 'máy tính và điện thoại', 'may-tinh': 'máy tính', 'dien-thoai': 'điện thoại' };
const CAU_TAO = [
  { hoi: () => 'Bạn muốn học gì?', goi_y: 'Ghi ngắn thôi. Bấm một gợi ý cũng được.', bat_buoc: true,
    ve: h => `<input type="text" id="t1" value="${esc(h.linh_vuc)}" placeholder="Mình muốn học…" aria-label="Bạn muốn học gì">
      <div class="chip-chon">${['Tiếng Anh giao tiếp', 'Ứng dụng AI', 'Excel văn phòng', 'Lập trình web', 'Thiết kế đồ hoạ', 'Bán hàng online'].map(x => `<button type="button" class="chip" data-dien="${esc(x)}">${x}</button>`).join('')}</div>`,
    gan: () => man.querySelectorAll('[data-dien]').forEach(b => b.onclick = () => { $('#t1').value = b.dataset.dien; }),
    lay: () => ({ truong: { linh_vuc: $('#t1').value.trim() } }), du: x => !!x.truong.linh_vuc,
    ghi: h => h.linh_vuc && `Muốn học: ${h.linh_vuc}` },
  { hoi: h => `Học xong ${h.linh_vuc ? `"${h.linh_vuc}"` : ''}, bạn muốn làm được gì?`, goi_y: 'Càng cụ thể càng tốt. Ví dụ: tự giới thiệu và hỏi đường bằng tiếng Anh khi đi du lịch.', bat_buoc: true,
    ve: h => { const ds = (h.muc_dich && h.muc_dich.length ? h.muc_dich : [h.muc_tieu || '']); return `<div id="dsMD" class="ds-md">${ds.map(m => `<input type="text" value="${esc(m)}" aria-label="Mục đích">`).join('')}</div><button type="button" class="nho" id="themMD">+ Thêm mục đích</button>
      <p class="nhan-o">Vì sao bạn học lúc này? <span class="mo">(không bắt buộc, Noe nhắc lại khi bạn nản)</span></p><input type="text" id="lyDo" value="${esc(h.ly_do || '')}" placeholder="Ví dụ: để tự quản lý sổ sách tiệm" aria-label="Vì sao học lúc này">`; },
    gan: () => { $('#themMD').onclick = () => { $('#dsMD').insertAdjacentHTML('beforeend', '<input type="text" aria-label="Mục đích">'); $('#dsMD').lastElementChild.focus(); }; },
    lay: () => { const md = [...$('#dsMD').querySelectorAll('input')].map(i => i.value.trim()).filter(Boolean); return { truong: { muc_dich: md, muc_tieu: md[0] || '', ly_do: $('#lyDo').value.trim() } }; },
    du: x => x.truong.muc_dich.length > 0, ghi: h => (h.muc_dich || []).length && `Mục đích: ${h.muc_dich.join('; ')}` },
  { hoi: () => 'Bạn muốn học tới cấp nào?', goi_y: 'Noe soạn sẵn cả 3 cấp, bạn đổi qua lại lúc nào cũng được.', bat_buoc: true,
    ve: h => { const cap = h.cap_do === 'nen-tang' ? 'can-doi' : (h.cap_do || 'can-doi'); return `<div class="cap">${CAP.map(c => `<label><input type="radio" name="cap" value="${c[0]}" ${cap === c[0] ? 'checked' : ''}><b>${c[1]}</b><span>${c[2]}</span><span>${c[3]}</span></label>`).join('')}</div>`; },
    lay: () => ({ truong: { cap_do: man.querySelector('input[name=cap]:checked')?.value || 'can-doi' } }), du: () => true, ghi: h => h.cap_do && `Cấp: ${tenCap(h.cap_do)}` },
  { hoi: () => 'Bạn học được bao nhiêu thời gian?', goi_y: 'Chọn sát với thực tế, lỡ thì Noe dời lịch giúp.', bat_buoc: true,
    ve: h => `<p class="nhan-o">Mỗi buổi</p>${chip('phut', [[15, '15 phút'], [30, '30 phút'], [45, '45 phút'], [60, '1 giờ'], [90, '1 giờ rưỡi'], [120, '2 giờ']], h.phut_moi_ngay || 60)}
      <p class="nhan-o">Mỗi tuần</p>${chip('ngay', [['1-2', '1–2 buổi'], ['3-4', '3–4 buổi'], ['5', '5 buổi'], ['6', '6 buổi'], ['7', 'Mỗi ngày']], h.ngay_moi_tuan || '3-4')}
      <p class="nhan-o">Học lúc</p><input type="time" id="t1" value="${esc(h.gio_hoc || '20:00')}" aria-label="Giờ học">`,
    lay: () => ({ truong: { phut_moi_ngay: chipChon('phut') || '60', ngay_moi_tuan: chipChon('ngay') || '3-4', gio_hoc: $('#t1').value || '20:00' } }), du: () => true,
    ghi: h => h.phut_moi_ngay && `Thời gian: ${h.phut_moi_ngay} phút/buổi, ${h.ngay_moi_tuan} buổi/tuần, lúc ${h.gio_hoc || '20:00'}` },
  { hoi: () => 'Bạn đọc tiếng Anh tới đâu?', goi_y: 'Để Noe chọn nguồn học đúng tiếng cho bạn.', bat_buoc: true,
    ve: h => chip('tieng_anh', ['Chưa đọc được', 'Đọc được câu đơn giản', 'Đọc tốt'].map(x => [x, x]), h.tieng_anh || 'Đọc được câu đơn giản'),
    lay: () => ({ truong: { tieng_anh: chipChon('tieng_anh') || 'Đọc được câu đơn giản' } }), du: () => true,
    ghi: h => h.tieng_anh && `Tiếng Anh: ${h.tieng_anh}` },
  { hoi: () => 'Noe gọi bạn là gì?', goi_y: 'Và bạn thuộc nhóm tuổi nào, để Noe chọn ví dụ hợp với bạn.', bat_buoc: true,
    ve: h => `<input type="text" id="t1" value="${esc(h.ten_goi)}" placeholder="Tên của bạn" aria-label="Tên gọi"><p class="nhan-o">Nhóm tuổi</p>${chip('nhom_tuoi', NHOM_TUOI.map(x => [x, x]), h.nhom_tuoi)}
      <p class="nhan-o">Bạn tự tin học được tới đâu?</p>${chip('tu_tin', [['1', '1 · Lo lắm'], ['2', '2 · Hơi lo'], ['3', '3 · Bình thường'], ['4', '4 · Khá tự tin'], ['5', '5 · Rất tự tin']], h.tu_tin || '3')}`,
    lay: () => ({ truong: { ten_goi: $('#t1').value.trim(), nhom_tuoi: chipChon('nhom_tuoi'), tu_tin: chipChon('tu_tin') || '3' } }), du: x => !!(x.truong.ten_goi && x.truong.nhom_tuoi),
    ghi: h => h.ten_goi && `Tên: ${h.ten_goi}${h.nhom_tuoi ? ` · ${h.nhom_tuoi} tuổi` : ''}` },
  { hoi: h => `Bạn đã biết gì về "${h.linh_vuc || 'lĩnh vực này'}"?`, goi_y: 'Kể ngắn thôi, chưa biết gì cũng được. Muốn đỡ gõ thì nhờ AI của bạn kể giúp.', bat_buoc: true,
    ve: () => { const a = phanA(); return `<textarea id="t1" placeholder="Ví dụ: đã dùng Excel cộng trừ đơn giản">${esc(a.da_biet)}</textarea>
      <div class="chip-chon"><button type="button" class="chip" data-dien="Chưa biết gì, bắt đầu từ đầu">Chưa biết gì</button></div>
      <button type="button" id="layAI" class="nho">Lấy dữ liệu từ AI của tôi</button>`; },
    gan: () => {
      man.querySelectorAll('[data-dien]').forEach(b => b.onclick = () => { $('#t1').value = b.dataset.dien; });
      $('#layAI').onclick = async () => {
        const h = S.ho_so;
        const p = `Tôi đang dùng app học "Học cùng Noe". Dựa trên những gì bạn nhớ và biết về tôi qua các cuộc trò chuyện, hãy kể lại mọi thứ liên quan tới việc học "${h.linh_vuc}" của tôi.
Chỉ ghi điều bạn thật sự biết, không đoán, không bịa. Chỗ nào không biết thì để trống. Không ghi giấy tờ cá nhân, số tài khoản.
Trả lời bằng đúng MỘT khối \`\`\`json theo mẫu:
\`\`\`json
{"ve_ban":"công việc, học vấn, hoàn cảnh","da_biet":"tôi đã biết gì, đã làm được gì liên quan","manh_yeu":"điểm mạnh và khó khăn khi học"}
\`\`\``;
        let vb; try { vb = await hoiAI(p, { viec: 'kể những gì nó biết về bạn', saoChep: true }); } catch { return; }
        let d; try { d = layJSON(vb); } catch { return baoNho('Câu trả lời chưa đúng mẫu, bạn thử lại nhé.'); }
        if (d.da_biet) $('#t1').value = d.da_biet;
        if (d.ve_ban || d.manh_yeu) await api('/api/ho-so', { muc: mucA({ ...phanA(), ...(d.ve_ban ? { ve_ban: d.ve_ban } : {}), ...(d.manh_yeu ? { manh_yeu: d.manh_yeu } : {}) }) });
        toast('Noe đã điền giúp bạn. Xem lại rồi bấm Tiếp tục nha!');
      };
    },
    lay: () => ({ a: { da_biet: $('#t1').value.trim() } }), du: x => !!x.a.da_biet,
    ghi: () => phanA().da_biet && `Đã biết: ${phanA().da_biet}` },
  { hoi: () => 'Làm bài kiểm tra đầu vào nhé?', goi_y: '5–8 câu, khoảng 5 phút, để Noe bỏ qua phần bạn đã biết. Không có điểm đậu rớt.',
    ve: () => `${S.dau_vao?.tom_tat ? `<p>${ic('tron', 'mau-xanh')} Đã làm: ${esc(S.dau_vao.tom_tat)}</p>` : ''}<button type="button" id="lamDV" class="chinh">${S.dau_vao?.tom_tat ? 'Làm lại' : 'Làm ngay'}</button>`,
    // Trước bài đầu vào: chốt Hợp đồng đầu ra + bản đồ kỹ năng chung (chat-luong.js), để bài đo dùng đúng các kỹ năng đó
    gan: i => { $('#lamDV').onclick = async () => { if (await damBaoMucTieu(() => taoKhoa(i))) kiemTraDauVao(() => taoKhoa(i)); }; },
    lay: () => ({}), ghi: () => S.dau_vao?.tom_tat && `Kiểm tra đầu vào: ${S.dau_vao.tom_tat.split('.')[0]}` },
];
const BUOC_A = CAU_TAO.findIndex(c => /Noe gọi bạn/.test(c.hoi({}))); // câu đầu của phần "Đang ở đâu"
async function taoKhoa(i = 0, vuaGhi = false) {
  // Chưa nối AI thì nối trước (AI là thứ đi tìm nguồn, soạn bài), nối xong mới vào tạo khoá
  if (!S.ai.cach_noi) return manNoiAI();
  vaoMan('tao-khoa', taoKhoa, [i]);
  veChang(i < BUOC_A ? 'muc-dich' : 'dang-o-dau');
  const h = S.ho_so, tong = CAU_TAO.length, cuoi = i >= tong;
  const notes = CAU_TAO.slice(0, Math.min(i, tong)).map(c => c.ghi(h)).filter(Boolean);
  const pt = Math.round(Math.min(i, tong) / tong * 100);
  const c = CAU_TAO[i];
  man.innerHTML = `
    <div class="tao-tien-do"><div class="thanh"><i style="width:${pt}%"></i></div><span>${cuoi ? 'Xong!' : `${i + 1}/${tong}`}</span></div>
    <div class="tao-khoa">
      <div class="tao-cau">
        ${noi(cuoi ? 'khen' : 'vui', cuoi ? `<h2>Xong rồi${goiTen()}!</h2><p>Noe đã ghi đủ vào sổ tay. Giờ Noe đi tìm nguồn và xếp 3 lộ trình cho bạn nha.</p>` : `<h2>${esc(c.hoi(h))}</h2><p class="mo">${esc(c.goi_y)}</p>`)}
        ${cuoi ? `<div class="hang"><button class="chinh" id="tTim">Noe đi tìm nguồn</button><button id="tLui">← Câu trước</button></div>`
          : `<form class="the" id="fTao">${c.ve(h)}
            <div class="hang tao-nut"><button class="chinh" type="submit">Tiếp tục</button>${c.bat_buoc ? '' : '<button type="button" id="tBo">Bỏ qua</button>'}${i ? '<button type="button" id="tLui" class="nho">← Câu trước</button>' : ''}</div></form>`}
      </div>
      <aside class="so-tay" aria-label="Sổ tay của Noe"><div class="so-tay-dau"><span class="noe-but">${noe(vuaGhi ? 'khen' : 'suy-nghi')}</span><b>📝 Sổ tay của Noe</b></div>
        ${notes.length ? `<ol>${notes.map((n, j) => `<li class="${vuaGhi && j === notes.length - 1 ? 'moi' : ''}">${esc(n)}</li>`).join('')}</ol>` : '<p class="mo">Bạn trả lời tới đâu, Noe ghi tới đó.</p>'}</aside>
    </div>`;
  // Dòng mới nhất được "gõ" ra từng chữ, như Noe đang ghi
  const moi = man.querySelector('.so-tay li.moi');
  if (moi) { const t = moi.textContent; moi.textContent = ''; let k = 0; const go = () => { if (!moi.isConnected) return; moi.textContent = t.slice(0, ++k); if (k < t.length) setTimeout(go, 18); }; go(); }
  man.querySelectorAll('.chip-chon[data-ten] .chip').forEach(b => b.onclick = () => { b.parentElement.querySelectorAll('.chip').forEach(x => x.classList.remove('chon')); b.classList.add('chon'); });
  if ($('#tLui')) $('#tLui').onclick = () => taoKhoa(Math.max(0, i - 1));
  if (cuoi) {
    $('#tTim').onclick = async () => { xinQuyenBao(); await xongTaoKhoa(); };
    return;
  }
  c.gan?.(i + 1);
  const di = async (boQua) => {
    const x = boQua ? {} : c.lay();
    if (!boQua && c.du && !c.du({ truong: {}, a: {}, ...x })) return baoNho('Bạn trả lời câu này rồi bấm Tiếp tục nha.');
    if (x.truong) await api('/api/ho-so', { truong: x.truong });
    if (x.a) await api('/api/ho-so', { muc: mucA({ ...phanA(), ...x.a }) });
    if (i === 0 && x.truong?.linh_vuc) await api('/api/khoa-hoc', { ten_hien_tai: x.truong.linh_vuc });
    await api('/api/tien-do', { buoc_tao: i + 1, chang_hien_tai: i + 1 < BUOC_A ? 'muc-dich' : 'dang-o-dau' });
    await tai();
    taoKhoa(i + 1, !boQua);
  };
  $('#fTao').onsubmit = e => { e.preventDefault(); di(false); };
  if ($('#tBo')) $('#tBo').onclick = () => di(true);
  setTimeout(() => man.querySelector('#fTao input:not([type=radio]), #fTao textarea')?.focus({ preventScroll: true }), 50);
}
// Kiểm đủ các câu Bắt buộc, ghi tóm tắt "Đích đến (B)", rồi đi tìm nguồn
async function xongTaoKhoa() {
  const h = S.ho_so;
  const thieu = CAU_TAO.findIndex(c => c.bat_buoc && !c.ghi(h));
  if (thieu >= 0) { await baoNho('Còn một câu cần trả lời, Noe đưa bạn về câu đó nha.'); return taoKhoa(thieu); }
  const md = h.muc_dich || [];
  const tomTat = `- Muốn học: ${h.linh_vuc}\n- Mục đích:\n${md.map(m => `  - ${m}`).join('\n') || '  - (chưa nói)'}\n- Cấp: ${tenCap(h.cap_do)}\n- Thời gian: ${h.phut_moi_ngay} phút/buổi, ${h.ngay_moi_tuan} buổi/tuần, lúc ${h.gio_hoc}\n- Tiếng Anh: ${h.tieng_anh} · Ngân sách: ${TEN_PHI[h.ngan_sach] || h.ngan_sach} · Thiết bị: ${TEN_TB[h.thiet_bi] || h.thiet_bi}${h.ly_do ? `\n- Vì sao học: ${h.ly_do}` : ''}${h.han_chot ? `\n- Hạn chót: ${h.han_chot}` : ''}${h.chung_chi ? `\n- Cần chứng chỉ: ${h.chung_chi}` : ''}`;
  // Các mục không hỏi khi tạo khoá thì để mặc định; người học sửa được trong Hồ sơ học
  const macDinh = { ngon_ngu: h.ngon_ngu || ngonNguGT(), ngan_sach: h.ngan_sach || 'mien-phi', thiet_bi: (typeof h.thiet_bi === 'string' && h.thiet_bi) || 'ca-hai',
    giong_noe: h.giong_noe || 'vui-ve', tu_tin: h.tu_tin || '3' };
  await api('/api/ho-so', { truong: macDinh, muc: { 'Đích đến (B)': tomTat } });
  await api('/api/khoa-hoc', { ten_hien_tai: h.linh_vuc });
  await tai();
  if (!(await damBaoMucTieu(() => taoKhoa(CAU_TAO.length)))) return;
  manTim();
}


// Bài kiểm tra đầu vào (docs/tieu-chuan-thong-tin-hoc-vien.md mục 4): 5–8 câu dễ → khó, mỗi câu gắn một kỹ năng con,
// có "Tôi chưa biết", sai 2 câu liền ở một mức thì bỏ các câu từ mức đó trở lên. Không tính sao, không tính Thông tuệ.
// Lời dặn bản V2 (21/11/2026): sửa theo kiểm tra độc lập 4 AI (V1 chấm 2,62/5: hỏi như người đã biết,
// không hỏi thao tác trên thiết bị, chữ tiếng Anh không giải thích, kết quả không cho biết bắt đầu từ đâu).
function loiDanDauVao() {
  const h = S.ho_so;
  return `Bạn soạn BÀI KIỂM TRA ĐẦU VÀO ngắn cho app "Học cùng Noe". Mục đích DUY NHẤT: biết người học nên BẮT ĐẦU từ đâu trong lộ trình. Không phải bài thi, không có đậu rớt.${ngonNgu()}

Người học:
${moTaNguoiHoc()}

${KN().length ? `${moTaMucTieu()}

Bước 1. Dùng ĐÚNG khung và bản đồ kỹ năng con ở trên (không tự chọn khung khác). Chọn 4–6 kỹ năng nền và quan trọng nhất cho các việc từ cấp người học đã chọn trở xuống; "ky_nang" của mỗi câu ghi ĐÚNG MÃ (ví dụ "KN2").` : `Bước 1. Chọn khung chuẩn của ngành cho lĩnh vực "${h.linh_vuc}" (ngoại ngữ: Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam / CEFR; công nghệ: chuẩn kỹ năng CNTT theo Thông tư 03/2014/TT-BTTTT hoặc khung chương trình đại học). Từ khung, chọn 4–6 kỹ năng con CẦN CHO MỤC ĐÍCH của người học (không lấy kỹ năng không dùng tới mục đích), xếp theo thứ tự học trước sau.`}

Bước 2. Xếp 3 mức, đi từ thấp lên:
- Mức 1 = NỀN: kỹ năng nền CỦA NGÀNH mà người học cần trước tiên, đo trên ĐÚNG thiết bị người học có (ví dụ chỉ có điện thoại thì hỏi thao tác trong ứng dụng trên điện thoại; ngoại ngữ thì hỏi âm, từ, câu rất cơ bản). Kinh nghiệm đời thường của người học (ví dụ sổ tay thu chi) chỉ dùng làm BỐI CẢNH cho câu hỏi, không hỏi lại điều họ đã làm hằng ngày (phí câu, không đo được gì).
- Mức 2 = CƠ BẢN của ngành, gắn với việc người học muốn làm.
- Mức 3 = KHÁ: làm được việc của mục đích mà không cần hướng dẫn.
Đo 4–5 kỹ năng LIỀN NHAU theo thứ tự bản đồ, BẮT ĐẦU TỪ KỸ NĂNG ĐẦU TIÊN (bắt buộc có 2 kỹ năng đầu của bản đồ, kể cả kỹ năng thao tác thiết bị, sẵn sàng): app đi lần theo bản đồ, kỹ năng nào chưa đo thì người học phải học từ đó, nên bỏ kỹ năng đầu là bài vô dụng. MỖI kỹ năng ĐÚNG 2 câu (một dễ, một khó hơn), câu đo ĐÚNG kỹ năng ghi, không đo lấn sang kỹ năng khác: tổng 8–10 câu. "muc" theo mức của kỹ năng. Mỗi câu ghi "ky_nang" là mã kỹ năng.Câu mức 1 phải phân loại được người học: không hỏi điều ai cũng biết (như "chạm vào biểu tượng để mở ứng dụng"), mà hỏi điều người có nền thì đúng, người chưa có nền dễ sai.

Bước 3. Viết từng câu:
- Mỗi câu là MỘT TÌNH HUỐNG gần với mục đích và đời sống của người học (dùng đúng ví dụ của họ), không hỏi định nghĩa.
- Câu hỏi dưới 25 chữ, lựa chọn dưới 12 chữ. Lời nói hằng ngày, như nói với người lớn tuổi chưa rành công nghệ.
- Lựa chọn sai phải hấp dẫn với người CHƯA có kỹ năng đó (không loại được bằng lẽ thường như "bấm link lạ", "nút âm lượng"); không có lựa chọn "gần đúng" khiến người giỏi phân vân. "muc" ghi theo độ khó thật với người học này, không theo thứ tự bản đồ.
- Không dùng tên nút, tên mục, tên mặc định của ứng dụng mà người chưa từng mở ứng dụng không hình dung được (như "Book1", "mục Tệp", "thẻ trang"); cần thì tả vị trí và hình dạng ("nút hình dấu cộng ở góc trên"). Mỗi câu một bối cảnh riêng, không câu này lộ đáp án câu kia.
- Chữ tiếng Anh, tên nút, tên hàm (ví dụ SUM, Enter): chỉ dùng khi thật cần và luôn ghi nghĩa tiếng Việt trong ngoặc ngay sau, nếu người học chưa đọc được tiếng Anh.
- 3 lựa chọn, đúng 1 đáp án. Lựa chọn sai phải là cái người mới hay nhầm thật, nghe hợp lý, không vô lý (cấm kiểu "lắc điện thoại", "ô thứ 23"), không đánh đố. Đề không được tự lộ đáp án. Nghĩa tiếng Việt của chữ tiếng Anh đặt ở ĐỀ hoặc ở MỌI lựa chọn như nhau, không chỉ kèm ở đáp án đúng; các lựa chọn dài ngắn tương đương.
- Ngoại ngữ (hoặc kỹ năng có nghe): có ít nhất 3 câu NGHE, trong đó 1 câu là đoạn hội thoại 3–4 lượt nói: ghi lời cần nghe vào "nghe" (app đọc to bằng giọng máy, người học không thấy chữ), "de" chỉ hỏi về điều nghe được. Có ít nhất 1 câu PHẢN XẠ NÓI: một câu người khác nói, chọn câu đáp tự nhiên nhất. Không dùng "Cả A và B", "Tất cả các ý trên". App tự thêm nút "Tôi chưa biết" nên KHÔNG viết lựa chọn đó.
- Rải đáp án đúng ở các vị trí khác nhau (app cũng tự xáo).
- "neu_sai": nếu sai hoặc chưa biết thì cần học gì (1 câu ngắn, chỉ nói về đúng kỹ năng của câu).

Bước 4. KHÔNG viết quy tắc bắt đầu: app tự tính theo từng kỹ năng (đúng cả 2 câu của kỹ năng nào thì kỹ năng đó đã vững). Vì vậy câu phải đo ĐÚNG kỹ năng ghi trong "ky_nang".
Bước 5. Tự soát trước khi trả lời, sửa nếu có câu không đạt: đáp án đúng chắc chắn đúng và chỉ một; không còn chữ tiếng Anh chưa giải thích; người chưa biết gì làm được ít nhất 2 câu mức 1; câu nào cũng hỏi được trên thiết bị người học có.

Không chép đề thi có bản quyền. Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"khung":"tên khung chuẩn đã dùng","ky_nang":["kỹ năng con 1","..."],"cau":[{"ky_nang":"...","muc":1,"nghe":"(chỉ câu nghe) lời app đọc to","de":"...","lua_chon":["...","...","..."],"dap_an":0,"neu_sai":"..."}]}
\`\`\``;
}
async function kiemTraDauVao(sau = null) {
  const ve = () => sau ? sau() : manDangODau();
  vaoMan('dau-vao', kiemTraDauVao, arguments);
  const luot = LUOT;
  const prompt = loiDanDauVao();
  man.innerHTML = `${noi('suy-nghi', '<b>Noe đang soạn bài kiểm tra đầu vào…</b>')}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
  let de;
  try { de = await hoiJSON(prompt, { viec: 'soạn bài kiểm tra đầu vào', nhatKy: $('#nk') }, d => Array.isArray(d.cau) && d.cau.length >= 3); }
  catch (e) { if (luot === LUOT) { if (e.message !== 'huy') baoNho('Câu trả lời của AI chưa đúng mẫu, thử lại nhé.'); ve(); } return; }
  if (luot !== LUOT) return;
  const cau = de.cau.filter(c => Array.isArray(c.lua_chon) && Number.isInteger(c.dap_an) && c.dap_an >= 0 && c.dap_an < c.lua_chon.length)
    .map(c => xaoLuaChon({ ...c, muc: Math.min(3, Math.max(1, +c.muc || 1)) })).sort((a, b) => a.muc - b.muc); // xáo lựa chọn: không đoán được theo vị trí
  const kq = [], saiLien = {};
  let dungMuc = 99; // mức bắt đầu bỏ qua
  for (let i = 0; i < cau.length; i++) {
    const c = cau[i];
    if (c.muc >= dungMuc) { kq.push({ ky_nang: c.ky_nang, muc: c.muc, ket_qua: 'bo-qua' }); continue; }
    const j = await new Promise(ok => {
      man.innerHTML = `${noi('vui', `Kiểm tra đầu vào · câu ${i + 1}/${cau.length} <span class="mo">· ${esc(tenKN(c.ky_nang))}</span>`)}<div class="the">${c.nghe ? `<button type="button" class="chinh" id="docTo">🔊 Bấm để nghe</button><p class="mo">Nghe được nghe lại nhiều lần.</p>` : ''}<h2>${esc(c.de)}</h2>
        <div style="display:flex;flex-direction:column;gap:8px">${c.lua_chon.map((l, k) => `<button class="lua-chon" data-j="${k}">${esc(l)}</button>`).join('')}<button class="lua-chon" data-j="-1">Tôi chưa biết</button></div></div>`;
      man.querySelectorAll('.lua-chon').forEach(b => b.onclick = () => ok(+b.dataset.j));
      if (c.nghe) $('#docTo').onclick = () => docTo(c.nghe);
    });
    if (luot !== LUOT) return;
    const dung = j === c.dap_an;
    kq.push({ ky_nang: c.ky_nang, muc: c.muc, ket_qua: dung ? 'dung' : j === -1 ? 'chua-biet' : 'sai', ...(dung ? { neu_dung: c.neu_dung || '' } : { neu_sai: c.neu_sai || '' }) });
    // Dừng sớm theo CẢ kỹ năng: hai kỹ năng liền nhau sai hết các câu thì bỏ các câu mức cao hơn (đỡ nản, không cắt kỹ năng chưa kịp hỏi)
    const cungKN = kq.filter(x => x.ky_nang === c.ky_nang);
    if (cau.filter(x => x.ky_nang === c.ky_nang).length === cungKN.length) {
      const hong = cungKN.every(x => x.ket_qua !== 'dung');
      saiLien.kn = hong ? (saiLien.kn || 0) + 1 : 0;
      if (saiLien.kn >= 2) dungMuc = Math.min(dungMuc, c.muc + 1);
    }
  }
  const lam = kq.filter(x => x.ket_qua !== 'bo-qua'), dung = lam.filter(x => x.ket_qua === 'dung');
  // Theo từng kỹ năng: đúng TẤT CẢ câu của kỹ năng (từ 2 câu) mới tính là vững; có câu sai, chưa biết hoặc bị bỏ qua thì cần học
  const theoKN = {};
  kq.forEach(x => { const t = theoKN[x.ky_nang] ||= { dung: 0, tong: 0 }; t.tong++; if (x.ket_qua === 'dung') t.dung++; });
  const maVung = Object.keys(theoKN).filter(k => theoKN[k].tong >= 2 ? theoKN[k].dung === theoKN[k].tong : false);
  const vung = maVung.map(tenKN);
  const canHoc = Object.keys(theoKN).filter(k => !maVung.includes(k)).map(tenKN);
  // Đi lần theo bản đồ (từ nền lên, chỉ kỹ năng tới cấp đã chọn): vững thì bỏ qua; gặp kỹ năng chưa vững HOẶC chưa đo thì bắt đầu từ đó
  const bacChon = BAC_CAP[S.ho_so.cap_do] || 2;
  const knDau = KN().length ? KN().filter(k => (BAC_CAP[k.cap] || 1) <= bacChon).map(k => k.ma).find(m => !maVung.includes(m))
    : Object.keys(theoKN).find(m => !maVung.includes(m));
  // Bắt đầu từ: câu chưa đạt ở mức thấp nhất cho biết phải học gì trước (lời dặn V2 có neu_sai cho từng câu)
  const chuaDat = kq.filter(x => x.ket_qua === 'sai' || x.ket_qua === 'chua-biet').sort((a, b) => a.muc - b.muc);
  const batDau = knDau ? `kỹ năng "${tenKN(knDau)}"${theoKN[knDau] ? '' : ' (chưa đo nên học từ đây)'}${chuaDat.find(x => x.ky_nang === knDau)?.neu_sai ? ` (${chuaDat.find(x => x.ky_nang === knDau).neu_sai})` : ''}` : 'đã vững mọi kỹ năng tới cấp đã chọn';
  const tomTat = `Đúng ${dung.length}/${lam.length} câu${kq.length > lam.length ? `, bỏ qua ${kq.length - lam.length} câu khó hơn` : ''}. Đã vững: ${vung.join(', ') || '(chưa có)'}. Cần học: ${canHoc.join(', ') || '(không)'}. Bắt đầu từ: ${batDau}.${vung.length ? ` Các kỹ năng đã vững sau điểm bắt đầu được rút gọn.` : ''}`;
  // lưu cả câu hỏi: cuối mỗi chặng làm lại đúng các câu của kỹ năng đã học để so trước và sau (chat-luong.js)
  await api('/api/dau-vao', { ngay: NGAY(), khung: de.khung || '', ket_qua: kq, tom_tat: tomTat, ai: tenModel(), cau: cau.map(c => ({ ky_nang: c.ky_nang, muc: c.muc, de: c.de, lua_chon: c.lua_chon, dap_an: c.dap_an, ...(c.nghe ? { nghe: c.nghe } : {}) })), theo_ky_nang: theoKN });
  await api('/api/ho-so', { muc: { 'Kết quả kiểm tra đầu vào': `${NGAY()} · khung: ${de.khung || '(không rõ)'}\n${tomTat}` } });
  await tai();
  if (luot !== LUOT) return;
  await hopChon(noi('khen', `<b>Xong bài kiểm tra đầu vào!</b><p>${esc(tomTat)}</p><p class="mo">Noe sẽ dùng kết quả này để bỏ qua phần bạn đã biết khi xếp lộ trình.</p>`), ['Được']);
  ve();
}

const lay = (than, t) =>((than.match(new RegExp(`### ${t}\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`)) || [])[1] || '').trim();
function manDangODau() {
  vaoMan('dang-o-dau', manDangODau, arguments);
  veChang('dang-o-dau');
  const than = S.ho_so_than, h = S.ho_so, sua = daVaoHoc();
  man.innerHTML = `
    ${sua ? noi('vui', `<h2>${ic('ghim', 'mau-xanh')} Bạn đang ở đâu</h2>` + '<p>Điểm xuất phát của bạn. Xem lại, sửa hoặc làm lại bài kiểm tra đầu vào nếu muốn. Tiến độ học giữ nguyên.</p>')
      : noi('vui', `<h2>Bạn đang ở đâu?</h2><p>Bấm <b>Lấy dữ liệu từ AI của tôi</b>: AI bạn hay trò chuyện đã biết khá nhiều về bạn, nhờ nó kể lại giúp, đỡ phải gõ.</p>`)}
    <div class="the">
      <div class="hang"><button class="chinh" id="layAI">Lấy dữ liệu từ AI của tôi</button></div>
      <p class="mo">Trí nhớ của AI chỉ nằm trong khung chat của nó, chưa hãng nào cho app khác đọc thẳng. Nên bước này luôn là sao chép một câu hỏi qua AI chat của bạn rồi dán câu trả lời về, mất khoảng 30 giây.</p>
    </div>
    <form class="the" id="fA">
      <div class="luoi">
        <label class="cau">Noe gọi bạn là gì?<input type="text" id="ten_goi" value="${esc(h.ten_goi)}"></label>
        <label class="cau">Ngôn ngữ bạn dùng<input type="text" id="ngon_ngu" value="${esc(h.ngon_ngu || 'vi')}" aria-describedby="nnGoiY"><span class="goi-y" id="nnGoiY">vi = tiếng Việt, en = tiếng Anh…</span></label>
        <label class="cau">Bạn thuộc nhóm tuổi nào?<span class="goi-y">Để Noe chọn ví dụ và giọng văn hợp với bạn</span><select id="nhom_tuoi" required><option value="">Chọn nhóm tuổi</option>${NHOM_TUOI.map(v => `<option ${h.nhom_tuoi === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
        <label class="cau">Bạn tự tin học được tới đâu?<span class="goi-y">1 = rất lo, 5 = rất tự tin</span><select id="tu_tin">${['1', '2', '3', '4', '5'].map(v => `<option ${String(h.tu_tin || '3') === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      </div>
      <label class="cau">Về bạn<span class="goi-y">Công việc, học vấn</span><textarea id="ve_ban">${esc(lay(than, 'Về bạn'))}</textarea></label>
      <label class="cau">Bạn đã biết gì, đã làm được gì liên quan tới "${esc(h.linh_vuc)}"?<textarea id="da_biet">${esc(lay(than, 'Đã biết, đã làm'))}</textarea></label>
      <label class="cau">Điểm mạnh, khó khăn khi học<textarea id="manh_yeu">${esc(lay(than, 'Điểm mạnh, khó khăn'))}</textarea></label>
      <label class="cau">Tôi muốn bổ sung<span class="goi-y">Gõ thêm bất cứ điều gì AI chưa biết về bạn</span><textarea id="bo_sung">${esc(lay(than, 'Bổ sung'))}</textarea></label>
      <details><summary><b>Noe đồng hành thế nào</b> <span class="mo">(không bắt buộc)</span></summary>
        <div class="luoi" style="margin-top:12px">
          <label class="cau">Noe nói chuyện kiểu nào?<select id="giong_noe">${[['vui-ve', 'Vui vẻ'], ['nhe-nhang', 'Nhẹ nhàng'], ['ngan-gon', 'Ngắn gọn']].map(v => `<option value="${v[0]}" ${(h.giong_noe || 'vui-ve') === v[0] ? 'selected' : ''}>${v[1]}</option>`).join('')}</select></label>
          <label class="cau" style="grid-column:1/-1">Bạn cần Noe lưu ý gì riêng không?<span class="goi-y">Ví dụ: chữ to, khó tập trung lâu, khó đọc. Chỉ dùng để chỉnh bài học, bạn xoá lúc nào cũng được</span><textarea id="nhu_cau_rieng">${esc(h.nhu_cau_rieng)}</textarea></label>
        </div></details>
      <div class="the dau-vao"><h3>Bài kiểm tra đầu vào <span class="mo">(khoảng 5 phút, nên làm)</span></h3>
        <p class="mo">Vài câu ngắn để Noe biết nên bắt đầu từ đâu, bỏ qua phần bạn đã biết. Không có điểm đậu rớt, không tính sao. Câu nào chưa biết thì bấm "Tôi chưa biết".</p>
        <div id="kqDauVao">${S.dau_vao?.tom_tat ? `<p>${ic('tron', 'mau-xanh')} Đã làm ngày ${esc(S.dau_vao.ngay)}: ${esc(S.dau_vao.tom_tat)}</p>` : ''}</div>
        <div class="hang"><button type="button" id="lamDauVao">${S.dau_vao?.tom_tat ? 'Làm lại bài kiểm tra' : 'Làm bài kiểm tra'}</button></div></div>
      <div class="hang"><button class="chinh" type="submit">${sua ? 'Lưu thay đổi' : 'Nhận lộ trình của tôi'}</button><button type="button" id="quay">${sua ? 'Xem mục đích' : 'Sửa mục đích'}</button></div>
    </form>`;
  $('#quay').onclick = () => sua ? manMucDich() : datChang('muc-dich');
  $('#layAI').onclick = async () => {
    const prompt = `Tôi đang dùng app học "Học cùng Noe". Dựa trên những gì bạn nhớ và biết về tôi qua các cuộc trò chuyện, hãy kể lại mọi thứ liên quan tới việc học "${h.linh_vuc}" của tôi.
Chỉ ghi điều bạn thật sự biết, không đoán, không bịa. Chỗ nào không biết thì để trống. Không ghi mật khẩu, số tài khoản, giấy tờ cá nhân.
Trả lời bằng đúng MỘT khối \`\`\`json theo mẫu:
\`\`\`json
{"ten_goi":"tên tôi muốn được gọi","ngon_ngu":"mã ngôn ngữ tôi hay dùng, ví dụ vi","ve_ban":"công việc, học vấn, hoàn cảnh",
 "da_biet":"tôi đã biết gì, đã làm được gì liên quan","manh_yeu":"điểm mạnh và khó khăn khi học, thói quen, từng bỏ dở gì"}
\`\`\``;
    let vb; try { vb = await hoiAI(prompt, { viec: 'kể những gì nó biết về bạn', saoChep: true }); } catch { return; }
    let d; try { d = layJSON(vb); } catch { return baoNho('Câu trả lời chưa đúng mẫu, bạn thử lại nhé.'); }
    for (const k of ['ten_goi', 'ngon_ngu', 've_ban', 'da_biet', 'manh_yeu']) if (d[k]) $('#' + k).value = d[k];
    toast('Noe đã điền giúp bạn. Xem lại và bổ sung nhé!');
  };
  // Lưu những gì đã điền: dùng khi bấm Nhận lộ trình, và trước bài kiểm tra đầu vào để không mất chữ đã gõ
  const luu = async () => {
    const g = id => $('#' + id).value.trim();
    await api('/api/ho-so', { truong: { ten_goi: g('ten_goi'), ngon_ngu: g('ngon_ngu') || 'vi', nhom_tuoi: g('nhom_tuoi'), tu_tin: g('tu_tin'),
        giong_noe: g('giong_noe'), nhu_cau_rieng: g('nhu_cau_rieng') },
      muc: { 'Điểm xuất phát (A)': `### Về bạn\n${g('ve_ban')}\n\n### Đã biết, đã làm\n${g('da_biet')}\n\n### Điểm mạnh, khó khăn\n${g('manh_yeu')}\n\n### Bổ sung\n${g('bo_sung')}` } });
    await tai();
  };
  $('#lamDauVao').onclick = async () => { await luu(); if (!(await damBaoMucTieu(manDangODau))) return; kiemTraDauVao(); };
  $('#fA').onsubmit = async e => {
    e.preventDefault();
    await luu();
    if (sua) return sauKhiSuaHoSo();
    if (!(await damBaoMucTieu(manDangODau))) return; // chưa có hợp đồng đầu ra thì làm trước, không bỏ qua bước này
    manTim();
  };
}

// ---------- 4. Noe đi tìm ----------
const PHI = { 'mien-phi': 'chỉ nguồn miễn phí', 'duoi-300k': 'dưới 300 nghìn đồng/tháng', '300k-1tr': '300 nghìn – 1 triệu đồng/tháng', 'tren-1tr': 'trên 1 triệu đồng/tháng' };
// Ngôn ngữ của nguồn học đi theo ngôn ngữ người học chọn (nút 🌐): English → nguồn tiếng Anh, Tiếng Việt → nguồn tiếng Việt
const nnNguoiHoc = () => String(S.ho_so?.ngon_ngu || 'vi').toLowerCase().slice(0, 2);
function luatNgonNguNguon() {
  const n = nnNguoiHoc();
  if (n === 'vi') return `- NGÔN NGỮ NGUỒN (luật này hơn mọi ý khác về ngôn ngữ): người học chọn tiếng Việt. Ưu tiên nguồn bằng tiếng Việt (giảng bằng tiếng Việt, hoặc có phụ đề tiếng Việt): ít nhất 2/3 số nguồn có "tieng":"vi". Chỉ thêm nguồn tiếng Anh khi đó là khung chuẩn hoặc tài liệu quan trọng chưa có bản tiếng Việt tốt, ghi "tieng":"en".`;
  return `- NGÔN NGỮ NGUỒN (luật này hơn mọi ý khác về ngôn ngữ): người học chọn ngôn ngữ "${n}" (en = tiếng Anh). CHỈ đưa nguồn bằng ngôn ngữ đó, ghi "tieng":"${n}". Không đưa nguồn tiếng Việt.`;
}
// Nguồn hiện có đang theo ngôn ngữ nào (ghi lúc tìm; nguồn cũ chưa ghi thì đoán theo số đông)
function nnCuaNguon() {
  const ng = S.nguon; if (!ng?.nguon?.length) return null;
  if (ng.ngon_ngu_nguon) return ng.ngon_ngu_nguon;
  const vi = ng.nguon.filter(x => String(x.tieng || '').startsWith('vi')).length;
  return vi * 2 >= ng.nguon.length ? 'vi' : 'en';
}
function moTaNguoiHoc() {
  const h = S.ho_so, than = S.ho_so_than;
  return `- Tên gọi: ${h.ten_goi || '(chưa nói)'}; ngôn ngữ: ${h.ngon_ngu || 'vi'}
- Muốn học: ${h.linh_vuc}
- Mục đích: ${(h.muc_dich || [h.muc_tieu]).filter(Boolean).join('; ') || '(chưa nói)'}
- Mức đã chọn: ${tenCap(h.cap_do)}
- Thời gian: ${h.phut_moi_ngay} phút mỗi buổi, ${h.ngay_moi_tuan} buổi mỗi tuần
- Tiếng Anh: ${h.tieng_anh || '(chưa nói)'} (nếu chưa đọc được tiếng Anh: ưu tiên nguồn giảng tiếng Việt hoặc có phụ đề tiếng Việt)
- Ngân sách: ${PHI[h.ngan_sach] || h.ngan_sach}
- Về người học: ${lay(than, 'Về bạn') || '(trống)'}
- Đã biết, đã làm: ${lay(than, 'Đã biết, đã làm') || '(trống)'}
- Điểm mạnh, khó khăn: ${lay(than, 'Điểm mạnh, khó khăn') || '(trống)'}
- Bổ sung: ${lay(than, 'Bổ sung') || '(trống)'}${h.nhom_tuoi ? `
- Nhóm tuổi: ${h.nhom_tuoi}` : ''}${h.tu_tin ? `
- Tự tin học được (1–5): ${h.tu_tin}${+h.tu_tin <= 2 ? ' (ít tự tin: bài đầu dễ hơn, khen cụ thể, cho thắng sớm)' : ''}` : ''}${h.thiet_bi && typeof h.thiet_bi === 'string' ? `
- Thiết bị: ${{ 'ca-hai': 'máy tính và điện thoại', 'may-tinh': 'chỉ máy tính', 'dien-thoai': 'chỉ điện thoại (bài thực hành phải làm được trên điện thoại)' }[h.thiet_bi] || h.thiet_bi}` : ''}${h.ly_do ? `
- Vì sao học lúc này: ${h.ly_do}` : ''}${h.han_chot ? `
- Hạn chót: ${h.han_chot}` : ''}${h.chung_chi ? `
- Cần bằng, chứng chỉ: ${h.chung_chi}` : ''}${h.nhu_cau_rieng ? `
- Lưu ý riêng khi dạy: ${h.nhu_cau_rieng}` : ''}${S.dau_vao?.tom_tat ? `
- Kết quả kiểm tra đầu vào (${S.dau_vao.ngay}, khung ${S.dau_vao.khung || '?'}): ${S.dau_vao.tom_tat} (tin kết quả này hơn phần tự khai)` : ''}`;
}
// Nhịp học dặn AI khi soạn (docs/quy-trinh-len-lo-trinh.md mục 5). Mức độ chỉ đổi khi NGƯỜI HỌC ĐÃ ĐỒNG Ý (td.nhip);
// còn các câu sai buổi trước thì luôn được gợi lại (đó là ôn, không phải đổi mức).
function camNhanGanDay(tatCa = {}) {
  const td = S.tien_do, y = [];
  const nhip = +td.nhip || 0;
  if (nhip > 0) y.push('Người học ĐÃ ĐỒNG Ý NÂNG MỨC: đi nhanh hơn, gộp ý dễ, ví dụ khó hơn một chút, thêm một thử thách tuỳ chọn.');
  if (nhip < 0) y.push('Người học ĐÃ ĐỒNG Ý HẠ MỨC: mở đầu 5 phút gợi lại ý nền, thêm ví dụ giải sẵn từng bước, chia ý nhỏ hơn, làm thử dễ hơn một chút.');
  const cuoi = (td.buoi_da_hoc || []).at(-1);
  if (cuoi) {
    const sai = (cuoi.sai || []).map(id => tatCa[id]?.de).filter(Boolean).slice(0, 4);
    if (sai.length) y.push(`Buổi trước người học còn sai các câu: ${sai.map(x => `"${x}"`).join('; ')}. Gợi lại đúng các ý đó trong bài này.`);
  }
  return y.length ? `Điều chỉnh theo người học:\n- ${y.join('\n- ')}\n` : '';
}

// Sau mỗi buổi: app ĐÁNH GIÁ (cảm nhận dễ/vừa/khó + điểm kiểm tra, cao là đúng từ 80%), rồi HỎI người học.
// Người học đồng ý thì mới nâng hoặc hạ mức, gộp buổi, thêm buổi ôn. Trả về câu Noe nói cho người học biết sẽ chỉnh gì.
const loaiBuoi = x => (!x || !x.do_kho || x.bo_qua_kiem_tra || !x.tong) ? null : `${x.do_kho}-${x.diem / x.tong >= .8 ? 'cao' : 'thap'}`;
async function dieuChinhSauBuoi(td, m) {
  const ds = td.buoi_da_hoc, cuoi = ds.at(-1), loai = loaiBuoi(cuoi), nhip = +td.nhip || 0;
  if (!loai) return '';
  const lienTiep = (k, n) => ds.length >= n && ds.slice(-n).every(x => loaiBuoi(x) === k);
  const diem = `<b>${cuoi.diem}/${cuoi.tong}</b> câu`;
  // Đổi mức thì buổi kế tiếp đã soạn sẵn được soạn lại theo mức mới (người học đã đồng ý đổi)
  const soanLaiBuoiSau = async () => {
    const { b } = buoiTiepTheo();
    if (b && (await api(`/api/bai?ma=${encodeURIComponent(b.ma)}`)).bai) td.soan_lai = [...new Set([...(td.soan_lai || []), b.ma])];
  };
  if (loai === 'de-cao') {
    if (nhip < 1) {
      const c = await hopChon(noi('khen', `<b>Buổi này bạn thấy dễ và đúng ${diem}.</b><p>Bạn đã nắm chắc kiến thức chưa? Nếu chắc rồi, Noe nâng mức cho các buổi sau: đi nhanh hơn, ví dụ khó hơn, có thêm thử thách.</p>`), ['Đồng ý, nâng mức', 'Giữ như cũ']);
      if (c !== 0) return '';
      td.nhip = nhip + 1; await soanLaiBuoiSau();
      return td.nhip > 0 ? 'Các buổi sau Noe đi nhanh, sâu hơn một chút.' : 'Các buổi sau Noe trở lại nhịp bình thường.';
    }
    if (lienTiep('de-cao', 3) && m) {
      const con = (m.buoi || []).filter(x => !daHoc(x.ma));
      if (con.length >= 2) {
        const c = await hopChon(noi('khen', `<b>3 buổi liền bạn thấy dễ và làm đúng gần hết.</b><p>Bạn đã nắm chắc phần này chưa? Noe gộp 2 buổi kế tiếp thành 1 cho nhanh nhé?</p><p class="mo">${esc(con[0].ten)} + ${esc(con[1].ten)}</p>`), ['Đồng ý gộp', 'Giữ nguyên']);
        if (c === 0) { gopHaiBuoi(m, con[0], con[1]); await api('/api/lo-trinh', S.lo_trinh); return 'Noe đã gộp 2 buổi kế tiếp thành 1.'; }
      }
    }
    return '';
  }
  if (loai === 'de-thap') return 'Bạn thấy dễ nhưng còn sai vài câu: Noe đưa các câu đó vào ôn sớm, và gợi lại ở buổi sau nha.';
  if (loai === 'kho-cao' || loai === 'kho-thap') {
    let loi = '';
    if (nhip > -1) {
      const c = await hopChon(noi('suy-nghi', `<b>Buổi này bạn thấy khó${loai === 'kho-cao' ? `, dù làm đúng ${diem}` : ` và đúng ${diem}`}.</b><p>Noe hạ mức cho các buổi sau nhé? Mỗi buổi mở đầu bằng 5 phút gợi lại ý nền, thêm ví dụ giải sẵn, chia ý nhỏ hơn.</p>`), ['Đồng ý, hạ mức', 'Giữ như cũ']);
      if (c === 0) { td.nhip = nhip - 1; await soanLaiBuoiSau(); loi = td.nhip < 0 ? 'Các buổi sau Noe đi chậm, kỹ hơn.' : 'Các buổi sau Noe trở lại nhịp bình thường.'; }
    }
    if (loai === 'kho-thap' && lienTiep('kho-thap', 2) && m) {
      const c = await hopChon(noi('vui', '<b>2 buổi liền phần này khó với bạn.</b><p>Noe thêm 1 buổi ôn ngay sau đây để củng cố cho chắc nhé?</p>'), ['Thêm buổi ôn', 'Không cần']);
      if (c === 0) { themBuoiOn(m); await api('/api/lo-trinh', S.lo_trinh); loi += (loi ? ' ' : '') + 'Noe đã thêm 1 buổi ôn vào module này.'; }
    }
    return loi;
  }
  return '';
}
function gopHaiBuoi(m, b1, b2) {
  b1.ten = `${b1.ten} + ${String(b2.ten).replace(/^Buổi\s*\d+\s*:\s*/i, '')}`;
  b1.muc_tieu = [b1.muc_tieu, b2.muc_tieu].filter(Boolean).join('; ');
  b1.nguon = [...new Set([...(b1.nguon || []), ...(b2.nguon || [])])];
  m.buoi = m.buoi.filter(x => x !== b2);
}
function themBuoiOn(m) {
  const so = m.buoi.filter(x => /-on\d+$/.test(x.ma)).length + 1;
  const sau = m.buoi.reduce((v, x, i) => daHoc(x.ma) ? i : v, -1);
  m.buoi.splice(sau + 1, 0, { ma: `${m.ma}-on${so}`, ten: `Buổi ôn ${so}: củng cố phần còn khó`, muc_tieu: 'Gợi lại và làm thêm bài cho các ý còn sai ở các buổi trước', loi_ich: 'Chắc lại phần còn khó trước khi đi tiếp', nguon: m.nguon || [] });
}
// Giọng của Noe trong bài học (docs/quy-trinh-dong-hanh.md mục 7)
const giongNoe = () => ({ 'nhe-nhang': 'Giọng nhẹ nhàng, ấm áp.', 'ngan-gon': 'Giọng ngắn gọn, đi thẳng ý.' }[S.ho_so.giong_noe] || 'Giọng vui vẻ, thân thiện.') + ' Không dùng chữ gây áp lực như "phải", "bắt buộc", "đáng lẽ".';
const TANG = { 1: 'Tầng 1 · Khung chuẩn, đại học', 2: 'Tầng 2 · Nền tảng học lớn', 3: 'Tầng 3 · Chuyên gia, sách', 4: 'Tầng 4 · Cộng đồng' };
const tenTieng = t => esc({ vi: 'Tiếng Việt', en: 'Tiếng Anh' }[t] || t || '');
const tenPhi = p => esc({ 'mien-phi': 'Miễn phí', 'tra-phi': 'Trả phí', 'mot-phan': 'Miễn phí một phần' }[p] || p || '');

// Lời dặn AI tìm nguồn (dùng chung cho app và cho việc nghiên cứu chạy ở máy chủ)
function loiDanTimNguon() {
  return `Bạn là người tìm nguồn học cho app "Học cùng Noe". Hãy TÌM TRÊN MẠNG nguồn học uy tín, có thật.

Người học:
${moTaNguoiHoc()}
${moTaMucTieu()}
Làm ĐÚNG THỨ TỰ 7 bước (quy trình tìm nguồn của gói, docs/quy-trinh-tim-nguon.md):
1. Xác định ngành và ngành con của lĩnh vực.
2. Tìm KHUNG CHUẨN làm xương sống (tầng 1). Việt Nam: Khung trình độ quốc gia Việt Nam theo Quyết định 39/2026/QĐ-TTg (thay Quyết định 1982/QĐ-TTg); Khung năng lực ngoại ngữ 6 bậc theo Thông tư 01/2014/TT-BGDĐT; Chuẩn kỹ năng sử dụng CNTT theo Thông tư 03/2014/TT-BTTTT (văn bản có thể đã đổi: kiểm còn hiệu lực). Quốc tế: CEFR (ngoại ngữ), ACM/IEEE CS2023 (khoa học máy tính), SFIA (nghề công nghệ), ESCO, O*NET (mọi nghề), ISCED. Không có khung thì tự tổng hợp từ 2–3 chương trình đại học và ghi rõ.
3. Chương trình đại học công khai (tầng 1): đề cương của đại học Việt Nam, MIT OpenCourseWare, Harvard CS50, Stanford Online, Open Yale, OpenLearn.
4. Sách giáo khoa mở và tài liệu chính chủ (tầng 1): OpenStax, LibreTexts, Open Textbook Library, tài liệu chính thức của hãng hoặc dự án.
5. Nền tảng học lớn (tầng 2): Coursera, edX, Khan Academy, freeCodeCamp, The Odin Project, F8, FutureLearn; khoa học máy tính tự học: OSSU. Khoá trả phí chỉ khi đúng ngân sách hoặc xem miễn phí được.
6. Chuyên gia, giảng viên, sách kinh điển (tầng 3): kênh chính thức của người giảng, trang nhà xuất bản.
7. Cộng đồng (tầng 4): chỉ để phát hiện nguồn bị sót, phải lần về trang chính chủ.
Tìm 12 đến 20 nguồn (Chuyên sâu cần nhiều giáo trình hơn), đủ cho cả 3 cấp:
${DINH_NGHIA_CAP}
 Mỗi kỹ năng con của khung có ít nhất 1 nguồn tầng 1 hoặc 2.${KN().length ? ' Đã có bản đồ kỹ năng ở trên thì dùng đúng khung đó; mỗi nguồn ghi "ky_nang": các mã KN nó dạy; mã KN nào cũng phải có ít nhất 1 nguồn tầng 1 hoặc 2.' : ''}

CHẤM ĐIỂM mỗi nguồn theo 10 tiêu chí, mỗi tiêu chí 0, 1 hoặc 2 (tổng "diem" tối đa 20): chính chủ, uy tín, khớp khung chuẩn, đúng mức, đúng tiếng, đúng ngân sách, còn mới, có thực hành, giấy phép rõ, link mở được. Chỉ đưa vào nguồn từ 10 điểm.

Luật bắt buộc:
- Chỉ đưa link tới trang CHÍNH CHỦ. Không bản lậu, không bản đăng lại.
- Không bịa. Không chắc link có thật thì bỏ. Không bịa giá, thời lượng.
- Đúng ngân sách của người học.
${luatNgonNguNguon()}
- Trả lời bằng đúng MỘT khối \`\`\`json, không viết gì thêm:
\`\`\`json
{"nganh":"Ngành > ngành con","khung_chuan":{"ten":"...","link":"https://...","van_ban":"số văn bản nếu là khung của Việt Nam"},
 "nguon":[{"ma":"N1","ten":"...","link":"https://...","ai_lam":"...","tang":1,"cap":["nhanh","can-doi","chuyen-sau"],"ky_nang":["KN1"],"tieng":"vi","phi":"mien-phi","diem":17,"vi_sao":"Một câu"}]}
\`\`\``;
}
// ---------- Nghiên cứu chạy ngầm ở máy chủ (nối AI tự động) ----------
// Bắt đầu: app gửi lời dặn lên máy chủ; máy chủ tự tìm nguồn, mở thử link, xếp 3 lộ trình.
// Người học xem màn khác, đóng tab hay làm việc khác vẫn chạy tiếp; bong bóng Noe ở góc cho biết tiến độ.
function xinQuyenBao() { try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch { /* trình duyệt không hỗ trợ */ } }
async function batDauNghienCuuNgam() {
  xinQuyenBao();
  const r = await api('/api/nghien-cuu/bat-dau', {
    p1: loiDanTimNguon(),
    p_kiem_nguon: loiDanKiemNguon('{{NGUON}}'),
    p3: loiDanLoTrinh('{{NGUON}}', '{{KHUNG}}'),
    p3_cap: Object.fromEntries(['nhanh', 'can_doi', 'chuyen_sau'].map(k => [k, loiDanMotCap(k)])),
    ngon_ngu_nguon: nnNguoiHoc(), cap_chon: S.ho_so.cap_do || 'can-doi',
  });
  if (!r.ok) return baoNho(r.thong_bao || 'Chưa bắt đầu tìm được. Bạn thử lại nhé.');
  await tai();
  theoDoiNghienCuu();
  return xemNghienCuu();
}
async function xemNghienCuu() {
  vaoMan('tim', xemNghienCuu, arguments);
  const luot = LUOT;
  veChang('tim');
  anBongBong();
  man.innerHTML = `
    ${noi('suy-nghi', `<h2>Noe đi tìm đây!</h2><p>Mình nhờ AI của bạn tìm nguồn uy tín nhất cho "${esc(S.ho_so.linh_vuc)}", mở thử từng link, rồi xếp 3 lộ trình: Sơ cấp, Trung cấp, Chuyên sâu.</p>`)}
    <div class="the"><div class="vach"><span id="ncBuoc">Bước 0/3</span><div class="thanh"><i id="ncThanh" style="width:3%"></i></div><span id="ncGio"></span></div>
      <p class="mo">Việc này chạy ở máy chủ của app, mất vài phút. Bạn cứ đi xem màn khác, tắt tab hay làm việc khác, Noe vẫn tìm tiếp. Bong bóng Noe ở góc màn hình cho biết tiến độ, xong Noe báo.</p>
      <div class="hang"><button id="ncDiChoi">Làm việc khác trong lúc chờ</button></div></div>
    <div class="the"><h3>Noe đang làm</h3><div class="nhat-ky-tim" id="nk" aria-live="polite"></div></div>`;
  $('#ncDiChoi').onclick = () => { LUOT++; S.lo_trinh?.trang_thai === 'da-duyet' ? manTrangChu() : manGioiThieu(); theoDoiNghienCuu(); };
  const nk = $('#nk');
  let tu = 0;
  while (luot === LUOT) {
    const st = await api(`/api/nghien-cuu?tu=${tu}`);
    if (luot !== LUOT) return;
    (st.nhat_ky || []).forEach(e => nk.insertAdjacentHTML('beforeend', `<div class="${esc(e.loai)}"><span>${esc(e.luc)}</span>${esc(e.chu)}</div>`));
    tu += (st.nhat_ky || []).length; nk.scrollTop = nk.scrollHeight;
    const b = +st.buoc || 0;
    $('#ncBuoc').textContent = `Bước ${b}/3`;
    $('#ncThanh').style.width = `${st.trang_thai === 'xong' ? 100 : Math.max(3, (b - 1) * 33 + 10)}%`;
    if (st.bat_dau) { const s = Math.round((Date.now() - new Date(st.bat_dau)) / 1000); $('#ncGio').textContent = `${Math.floor(s / 60)} phút ${s % 60} giây`; }
    if (st.trang_thai === 'xong') {
      daXemXong = true; anBongBong();
      $('.noi .noe-khung').innerHTML = noe('khen');
      await tai();
      setTimeout(() => { if (luot === LUOT) manLoTrinh(); }, 1200);
      return;
    }
    if (st.trang_thai === 'loi' || !st.trang_thai) {
      daXemXong = true; anBongBong();
      const chu = !st.trang_thai ? 'Việc tìm đã dừng (có thể app vừa tắt rồi mở lại).' : st.loi === 'chua-dang-nhap' ? 'Claude Code trên máy chưa đăng nhập. Vào Cài đặt AI để đăng nhập, rồi tìm lại.' : st.thong_bao || 'AI báo lỗi.';
      man.insertAdjacentHTML('beforeend', `<div class="the loi"><b>${esc(chu)}</b><div class="hang" style="margin-top:10px"><button class="chinh" id="thuLai">Tìm lại</button><button id="quay">Sửa thông tin</button><button id="caiAI2">Cài đặt AI</button></div></div>`);
      $('#thuLai').onclick = () => manTim(); $('#quay').onclick = () => manDangODau(); $('#caiAI2').onclick = () => manNoiAI(true);
      return;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
}
// Bong bóng Noe nổi ở góc (giống bong bóng gọi video): kéo được, bấm vào xem tiến độ; xong thì báo.
let nghienCuuDangTheoDoi = false, daXemXong = false;
function anBongBong() { $('#bongNoe')?.remove(); }
function veBongBong(st) {
  if (manHienTai?.ten === 'tim') return anBongBong();
  let el = $('#bongNoe');
  if (!el) {
    el = document.createElement('button');
    el.id = 'bongNoe'; el.className = 'bong-noe-noi'; el.type = 'button';
    document.body.append(el);
    let keo = null;
    el.addEventListener('pointerdown', e => { keo = { x: e.clientX, y: e.clientY, l: el.offsetLeft, t: el.offsetTop, di: false }; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', e => {
      if (!keo) return;
      const dx = e.clientX - keo.x, dy = e.clientY - keo.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) keo.di = true;
      if (keo.di) { el.style.left = `${Math.min(innerWidth - el.offsetWidth - 8, Math.max(8, keo.l + dx))}px`; el.style.top = `${Math.min(innerHeight - el.offsetHeight - 8, Math.max(8, keo.t + dy))}px`; el.style.right = 'auto'; el.style.bottom = 'auto'; }
    });
    el.addEventListener('pointerup', () => {
      const di = keo?.di; keo = null;
      if (di) { el.style.left = `${el.offsetLeft + el.offsetWidth / 2 < innerWidth / 2 ? 8 : innerWidth - el.offsetWidth - 8}px`; return; } // dính vào mép gần nhất
      const tt = el.dataset.tt;
      if (tt === 'xong') { daXemXong = true; anBongBong(); tai().then(() => manLoTrinh()); } else xemNghienCuu();
    });
  }
  const xong = st.trang_thai === 'xong', loi = st.trang_thai === 'loi';
  el.dataset.tt = st.trang_thai;
  el.innerHTML = `<span class="bn-noe" aria-hidden="true">${noe(xong ? 'khen' : loi ? 'buon' : 'suy-nghi')}</span><span class="bn-chu">${xong ? 'Xong! Xem lộ trình' : loi ? 'Có lỗi, bấm xem' : `Đang tìm · bước ${st.buoc || 0}/3`}</span>`;
  el.setAttribute('aria-label', el.querySelector('.bn-chu').textContent);
}
function baoXong() {
  toast('Noe tìm xong rồi! Bấm bong bóng để xem lộ trình.');
  try { if ('Notification' in window && Notification.permission === 'granted') new Notification('Noe tìm xong rồi!', { body: 'Mời bạn xem 3 lộ trình: Sơ cấp, Trung cấp, Chuyên sâu.', icon: '/noe-icon-192.png' }); } catch { /* bỏ qua */ }
}
async function theoDoiNghienCuu() {
  if (nghienCuuDangTheoDoi) return;
  nghienCuuDangTheoDoi = true; daXemXong = false;
  let daThayChay = false;
  try {
    while (true) {
      const st = await api('/api/nghien-cuu?tu=999999').catch(() => ({}));
      if (st.trang_thai === 'dang-chay') { daThayChay = true; veBongBong(st); await new Promise(r => setTimeout(r, 3000)); continue; }
      // vừa chạy xong trong lúc mình theo dõi: báo và đổi bong bóng (trừ khi người học đang đứng ở màn tìm)
      if (daThayChay && st.trang_thai === 'xong') { await tai(); soanSanBai1().catch(() => {}); if (!daXemXong) { baoXong(); veBongBong(st); } }
      else if (daThayChay && st.trang_thai === 'loi' && !daXemXong) veBongBong(st);
      break;
    }
  } finally { nghienCuuDangTheoDoi = false; }
}

async function manTim() {
  vaoMan('tim', manTim, arguments);
  if (S.ai.cach_noi && S.ai.cach_noi !== 'sao-chep') return batDauNghienCuuNgam();
  const luot = LUOT;
  await api('/api/tien-do', { chang_hien_tai: 'tim' }); await tai();
  veChang('tim');
  const apiMode = S.ai.cach_noi && S.ai.cach_noi !== 'sao-chep';
  man.innerHTML = `
    ${noi('suy-nghi', `<h2>Noe đi tìm đây!</h2><p>Mình nhờ AI của bạn tìm nguồn uy tín nhất cho "${esc(S.ho_so.linh_vuc)}": đại học, nền tảng học lớn, chuyên gia, cộng đồng. Rồi mình mở thử từng link và xếp 3 lộ trình.</p>`)}
    <div class="the"><h3>Noe đang làm</h3><div class="nhat-ky-tim" id="nk" aria-live="polite"></div>
      ${apiMode ? '' : '<p class="mo">Bạn đang dùng cách sao chép và dán, nên mình không thấy được từng nơi AI tìm. Kết quả vẫn y như vậy.</p>'}</div>`;
  const nk = $('#nk');
  const ghi = (loai, chu) => { nk.insertAdjacentHTML('beforeend', `<div class="${loai}"><span>${new Date().toTimeString().slice(0, 8)}</span>${esc(chu)}</div>`); nk.scrollTop = nk.scrollHeight; };
  try {
    // Bước 1: tìm nguồn
    ghi('bat-dau', 'Bước 1/3: tìm nguồn học trên mạng');
    const p1 = loiDanTimNguon();
    const dl = await hoiJSON(p1, { web: true, viec: 'tìm nguồn học', nhatKy: nk }, d => Array.isArray(d.nguon) && d.nguon.length > 0);
    // Bảng chấm 20 điểm: dưới 10 thì bỏ (AI không ghi điểm thì giữ, để không mất nguồn vì AI quên ghi)
    dl.nguon = dl.nguon.filter(n => /^https?:\/\//.test(n.link || '') && !(n.diem !== undefined && +n.diem < 10))
      .map((n, i) => ({ ...n, ma: n.ma || `N${i + 1}`, tang: +n.tang || 4 }));
    dl.ngon_ngu_nguon = nnNguoiHoc(); // nhớ nguồn này tìm theo ngôn ngữ nào, đổi ngôn ngữ thì biết để hỏi tìm lại
    await api('/api/nguon', dl);
    ghi('xong', `Tìm được ${dl.nguon.length} nguồn.`);
    // Bước 2: kiểm link
    ghi('bat-dau', 'Bước 2/3: Noe mở thử từng đường link');
    const kq = (await api('/api/nguon/kiem', {})).nguon;
    kq.nguon.forEach(n => ghi(n.ngay_kiem ? 'doc' : 'loi', `${n.can_mo_tay ? 'Trang chặn máy kiểm, giữ lại, bạn mở tay giúp' : n.ngay_kiem ? 'Mở được' : 'KHÔNG mở được'}: ${n.ten} (${n.link})`));
    await tai();
    ghi('bat-dau', 'AI thứ hai đọc từng trang, kiểm nội dung đúng như mô tả');
    try { await kiemNoiDungNguon(nk); (S.nguon?.nguon || []).filter(n => n.bo && n.ly_do_bo).forEach(n => ghi('loi', `Bỏ ${n.ma}: ${n.ly_do_bo}`)); }
    catch (e) { if (e.message === 'huy') throw e; ghi('loi', 'Chưa kiểm được nội dung nguồn, vẫn dùng kết quả mở link.'); }
    const tot = nguonDung();
    if (!tot.length) throw new Error('khong-link');
    // Bước 3: 3 lộ trình
    ghi('bat-dau', 'Bước 3/3: xếp 3 lộ trình (Sơ cấp, Trung cấp, Chuyên sâu)');
    await dung3LoTrinh(nk);
    ghi('xong', 'Xong! Mời bạn xem lộ trình.');
    // Người học đã rời màn này: vẫn lưu là đã có lộ trình, nhưng không tự nhảy màn
    if (luot !== LUOT) { await api('/api/tien-do', { chang_hien_tai: 'lo-trinh' }); await tai(); return toast('Noe tìm xong rồi! Bấm Học tiếp để xem lộ trình.'); }
    $('.noi .noe-khung').innerHTML = noe('khen');
    setTimeout(() => { if (luot === LUOT) datChang('lo-trinh'); }, 1200);
  } catch (e) {
    if (luot !== LUOT) return;
    if (e.message === 'huy') { man.insertAdjacentHTML('beforeend', '<div class="hang"><button class="chinh" id="thuLai">Tìm lại</button></div>'); $('#thuLai').onclick = manTim; return; }
    ghi('loi', e.message === 'khong-link' ? 'Không link nào mở được. Thử tìm lại nhé.' : 'Câu trả lời của AI chưa đúng mẫu.');
    man.insertAdjacentHTML('beforeend', '<div class="hang"><button class="chinh" id="thuLai">Tìm lại</button><button id="quay">Sửa thông tin</button></div>');
    $('#thuLai').onclick = manTim; $('#quay').onclick = () => datChang('dang-o-dau');
  }
}

const KHOA_LT = { 'nhanh': 'nhanh', 'can-doi': 'can_doi', 'chuyen-sau': 'chuyen_sau' };
// Nguồn dùng được: máy mở được, hoặc trang chặn máy kiểm (cần mở tay) nhưng không bị người học bỏ
function nguonDung() { return (S.nguon?.nguon || []).filter(n => (n.ngay_kiem || n.can_mo_tay) && !n.bo); }

// Lời dặn AI xếp lộ trình, dùng chung cho app và cho việc nghiên cứu chạy ở máy chủ
// (máy chủ thay {{NGUON}}, {{KHUNG}} bằng nguồn vừa tìm và kiểm xong).
const dongNguon = n => `- ${n.ma}${+n.diem >= 14 ? ' [NGUỒN CHÍNH]' : ''}: ${n.ten} (${n.ai_lam}; tầng ${n.tang}; ${n.tieng}; ${n.phi}; hợp mức: ${(n.cap || []).join(', ')}${(n.ky_nang || []).length ? `; dạy ${n.ky_nang.join(', ')}` : ''}) ${n.link}`;
function loiDanLoTrinh(ds, khung, gopY = '') {
  const cu = gopY && S.lo_trinh_3 ? `\nBa lộ trình hiện tại (sửa theo góp ý, giữ phần không bị góp ý):\n\`\`\`json\n${JSON.stringify(S.lo_trinh_3)}\n\`\`\`\nGóp ý của người học: ${gopY}\n` : '';
  const ph = +S.ho_so.phut_moi_ngay || 60;
  return `Bạn là người dựng lộ trình học cho app "Học cùng Noe". Từ MỘT lần nghiên cứu, hãy xếp 3 lộ trình cho cùng người học.${ngonNgu()}

Người học:
${moTaNguoiHoc()}
${moTaMucTieu()}
Khung chuẩn: ${khung}
Nguồn đã kiểm, mở được (CHỈ dùng các mã này):
${ds}
${cu}
Ba lộ trình:
${DINH_NGHIA_CAP}
Ba cấp phải khác nhau thật về độ sâu và độ rộng; Chuyên sâu dài nhất, nhiều module nhất, theo khung chuẩn.

CÁCH DỰNG (quy trình lên lộ trình của gói, docs/quy-trinh-len-lo-trinh.md):
1. Thiết kế ngược: viết đầu ra cuối trước (mục đích người học + mức tương đương trong khung chuẩn), rồi mới chia chặng.
2. Bản đồ kỹ năng con theo khung chuẩn; kỹ năng nền xếp trước. Phần người học đã vững (theo kiểm tra đầu vào) thì rút gọn hoặc bỏ.
3. Mỗi chặng kết bằng MỘT SẢN PHẨM THẬT người học làm ra được; "xong_khi" ghi đúng sản phẩm đó.
4. "dau_ra" của module dùng động từ đo được theo thang Bloom (kể ra, giải thích, dùng ... để ..., so sánh, tự làm ...), không dùng "biết", "nắm được". Sơ cấp dừng ở hiểu, áp dụng; Trung cấp tới phân tích; Chuyên sâu tới đánh giá, sáng tạo.
5. "thuc_hanh" cuối module: việc làm thật, nhỏ, làm được trên thiết bị người học có.
6. Chủ đề lớn quay lại ở mức sâu hơn ở chặng sau (học xoắn ốc). Không 3 module liền cùng một kiểu hoạt động.
7. Tổng thời gian khớp thời gian học của người học và hạn chót nếu có. Ba mức phải khác nhau thật về độ sâu, không chỉ khác số buổi.
8. Ví dụ, sản phẩm gần với mục đích, công việc, lý do học của người học.
9. Mỗi module ghi "ky_nang": các mã kỹ năng con nó dạy (đúng mã trong bản đồ kỹ năng nếu có). Lộ trình cấp nào cũng phải dạy MỌI kỹ năng có cấp từ cấp đó trở xuống.
10. "bai_do_cuoi": bài đo cuối lộ trình, mỗi việc trong Hợp đồng đầu ra có cấp từ cấp này trở xuống là một mục {"hop_dong": mã việc, "de": người học làm gì để chứng minh, "dat_khi": thế nào là đạt}. Không có hợp đồng thì tự viết 3–5 việc từ mục đích.
11. Ba cấp nối tiếp: Trung cấp bao trùm toàn bộ kỹ năng của Sơ cấp và đi sâu hơn (mức Bloom cao hơn, sản phẩm lớn hơn); Chuyên sâu bao trùm Trung cấp. Không chỉ thêm buổi.
12. Ưu tiên nguồn ghi [NGUỒN CHÍNH] (từ 14/20 điểm) cho phần học chính.
14. THẮNG SỚM THẬT: buổi 1–2 người học đã làm ra một kết quả nhỏ có thật gắn với mục đích (ví dụ gõ số tiền thật của mình, nói 3 câu và ghi âm). Thao tác người học đã quen hằng ngày (theo "Đã biết") chỉ ôn nhanh tối đa 1 buổi. Chưa có kết quả kiểm tra đầu vào thì suy điểm xuất phát từ "Đã biết", tuổi, học vấn (ví dụ học sinh lớp 11 đã học ngữ pháp cơ bản ở trường) và bỏ phần chắc chắn đã biết.
15. Chọn MỘT công cụ chính và dùng xuyên suốt, không đổi giữa chừng. Có bước sẵn sàng khi việc cần: cài đặt, tài khoản (người học tự nhập mật khẩu), lưu và sao lưu để không mất sản phẩm.
16. Mỗi chặng có sản phẩm để so TRƯỚC và SAU (ví dụ ghi âm đầu chặng và cuối chặng). Kỹ năng nói, nghe, làm tay thì luyện bằng việc làm thật từ tuần đầu. Ví dụ, chủ đề hợp tuổi và sở thích để người học muốn học tiếp.
17. "thoi_gian" ghi tổng số buổi BẰNG ĐÚNG tổng "so_buoi" các module (code sẽ cộng lại để kiểm).
13. TỰ SOÁT trước khi trả lời, ghi vào "tu_soat" đủ 9 mục: đầu ra cuối khớp mục đích và có mức tương đương khung chuẩn; mỗi chặng có xong_khi là sản phẩm thật; mỗi module có dau_ra đo được và thuc_hanh; thứ tự đúng quan hệ học trước sau; phần đã biết (theo kiểm tra đầu vào) được rút gọn; tổng thời gian khớp thời gian học và hạn chót; ba cấp khác nhau thật về độ sâu; mọi mã nguồn có trong danh sách, không nguồn trả phí khi chỉ học miễn phí; bài đo cuối đo đủ các việc trong hợp đồng. Mục nào chưa đạt thì SỬA lộ trình rồi mới trả lời; "dat": false chỉ khi không sửa được, ghi lý do. Soát THẬT (đếm, đối chiếu), không đánh "dat": true cho có: code sẽ kiểm lại.

Mỗi lộ trình: chặng → module. Mỗi module có "dau_ra" (làm được gì), "thuc_hanh" (một bài thực hành hoặc dự án nhỏ cuối module để chứng minh làm được), "so_buoi" (số buổi; mỗi buổi là một bài ngắn học trong vài phút: 2–4 ý mới, làm thử, kiểm tra 5 câu), "nguon" (mã).
CHỈ module ĐẦU TIÊN của mỗi lộ trình mới ghi danh sách "buoi" chi tiết; các module khác để "buoi": [] (app sẽ nhờ soạn sau).
Ghi "tuong_duong": trình độ tương đương (ví dụ "chứng chỉ nghề bậc 3", "cử nhân ngành ...") và "thoi_gian": ước tính theo ${S.ho_so.ngay_moi_tuan} buổi/tuần.
Kiến thức nền trước. Bỏ qua hoặc rút gọn phần người học đã biết. Không bịa nguồn.
Mã: chặng "c1", module "m1-1", buổi "m1-1-b1".
Trả lời bằng đúng MỘT khối \`\`\`json, không viết gì thêm:
\`\`\`json
{"nhanh":{"ten":"...","tuong_duong":"...","thoi_gian":"...","chang":[{"ma":"c1","ten":"Chặng 1: ...","xong_khi":"...",
  "module":[{"ma":"m1-1","ten":"Module 1.1: ...","dau_ra":"...","thuc_hanh":"...","so_buoi":4,"nguon":["N1"],"ky_nang":["KN1"],
    "buoi":[{"ma":"m1-1-b1","ten":"Buổi 1: ...","muc_tieu":"...","loi_ich":"học xong được lợi gì, 1 câu","nguon":["N1"]}]}]}],
  "bai_do_cuoi":{"mo_ta":"...","viec":[{"hop_dong":"D1","de":"...","dat_khi":"..."}]},
  "tu_soat":[{"muc":"...","dat":true,"ghi_chu":""}]},
 "can_doi":{...cùng mẫu...},"chuyen_sau":{...cùng mẫu...}}
\`\`\``;
}
const TEN_CAP_K = { nhanh: 'Sơ cấp', can_doi: 'Trung cấp', chuyen_sau: 'Chuyên sâu' };
const loiDanMotCap = k => `\n\nLẦN NÀY CHỈ XẾP lộ trình "${k}" (${TEN_CAP_K[k]}).${k === 'nhanh' ? '' : `\nLộ trình cấp trước đã xếp (cấp này phải bao trùm toàn bộ kỹ năng của nó và đi sâu hơn):\n{{CAP_TRUOC}}`}\nTrả lời bằng đúng MỘT khối \`\`\`json là MỘT lộ trình: {"ten":"...","tuong_duong":"...","thoi_gian":"...","chang":[...],"bai_do_cuoi":{...},"tu_soat":[...]} (không bọc trong "${k}").`;
async function dung3LoTrinh(nk, gopY = '') {
  const prompt = loiDanLoTrinh(nguonDung().map(dongNguon).join('\n'), S.nguon?.khung_chuan?.ten || '(không có)', gopY);
  const hopLe = lt => lt && Array.isArray(lt.chang) && lt.chang.length > 0;
  let lt3;
  if (!S.ai.cach_noi || S.ai.cach_noi === 'sao-chep') {
    // sao chép và dán: một lần cho cả 3 lộ trình để người học đỡ phải dán nhiều lần
    lt3 = await hoiJSON(prompt, { viec: gopY ? 'sửa 3 lộ trình' : 'xếp 3 lộ trình', nhatKy: nk }, d => hopLe(d.nhanh) && hopLe(d.can_doi) && hopLe(d.chuyen_sau));
  } else {
    // nối tự động: xếp từng lộ trình một, câu trả lời ngắn hơn nên AI (kể cả model miễn phí) ít sai mẫu hơn
    lt3 = {};
    let truoc = null;
    for (const k of ['nhanh', 'can_doi', 'chuyen_sau']) { // Sơ cấp → Trung cấp → Chuyên sâu: cấp sau bao trùm cấp trước
      lt3[k] = await xepMotCap(prompt + loiDanMotCap(k).replace('{{CAP_TRUOC}}', truoc ? tomTatLT(truoc) : ''), k, nk);
      truoc = lt3[k];
    }
  }
  const hop = new Set(nguonDung().map(n => n.ma));
  for (const k of ['nhanh', 'can_doi', 'chuyen_sau']) {
    const lt = lt3[k]; if (!lt || !lt.chang?.length) throw new Error('mau');
    if (!lt.kiem) { const loi = kiemLoTrinh(lt, k); lt.kiem = { ngay: NGAY(), loi_ban_dau: loi.length, loi_con_lai: loi, ai: tenModel() }; }
    lt.cap_do = Object.keys(KHOA_LT).find(x => KHOA_LT[x] === k);
    ganTienTo(lt, k);
    lt.chang.forEach(c => (c.module || []).forEach(m => { m.nguon = (m.nguon || []).filter(x => hop.has(x)); m.buoi = m.buoi || []; m.buoi.forEach(b => b.nguon = (b.nguon || []).filter(x => hop.has(x))); }));
  }
  await api('/api/lo-trinh-3', lt3);
  await api('/api/lo-trinh', { ...lt3[KHOA_LT[S.ho_so.cap_do] || 'can_doi'], trang_thai: 'cho-duyet' });
  await tai();
}

// ---------- 5. Lộ trình ----------
const cacModule = lt => (lt?.chang || []).flatMap(c => c.module || []);
const soBuoiModule = m => (m.buoi && m.buoi.length) || +m.so_buoi || 1;
const tongBuoi = lt => cacModule(lt).reduce((s, m) => s + soBuoiModule(m), 0);
const cacBuoi = lt => cacModule(lt).flatMap(m => m.buoi || []);

function manLoTrinh(xem) {
  vaoMan('lo-trinh', manLoTrinh, arguments);
  veChang('lo-trinh');
  const lt3 = S.lo_trinh_3 || {};
  const dangChon = S.lo_trinh?.cap_do || S.ho_so.cap_do;
  xem = xem || dangChon;
  const lt = (xem === dangChon && S.lo_trinh?.chang) ? S.lo_trinh : lt3[KHOA_LT[xem]];
  if (!lt) return datChang('tim');
  const nguon = Object.fromEntries((S.nguon?.nguon || []).map(n => [n.ma, n]));
  const lk = mas => (mas || []).map(m => nguon[m] ? `<a href="${esc(nguon[m].link)}" target="_blank" rel="noopener" title="${esc(nguon[m].ten)}">${esc(m)}</a>` : esc(m)).join(', ');
  const daDuyet = S.lo_trinh?.trang_thai === 'da-duyet' && xem === dangChon;
  man.innerHTML = `
    <div class="tab" role="group" aria-label="Ba lộ trình">${CAP.map(c => `<button data-xem="${c[0]}" aria-pressed="${xem === c[0]}">${c[1]}${c[0] === dangChon ? ' (đang chọn)' : ''}</button>`).join('')}</div>
    ${noi(daDuyet ? 'khen' : 'vui', `<h2>${esc(lt.ten)}</h2><p>${lt.chang.length} chặng · ${cacModule(lt).length} module · khoảng <b>${tongBuoi(lt)} buổi</b>${lt.thoi_gian ? ` · ${esc(lt.thoi_gian)}` : ''}.<br>Tương đương: <b>${esc(lt.tuong_duong || tenCap(xem))}</b></p>`)}
    ${lt.chang.map(c => `<div class="the"><h3>${esc(c.ten)}</h3><p class="mo">Xong khi: ${esc(c.xong_khi)}</p>
      ${(c.module || []).map(m => `<details class="mod"><summary><b>${esc(m.ten)}</b> · ${soBuoiModule(m)} buổi</summary>
        <p class="mo">Đầu ra: ${esc(m.dau_ra)}<br>Thực hành cuối module: ${esc(m.thuc_hanh || '')}<br>Nguồn: ${lk(m.nguon)}</p>
        ${(m.buoi || []).length ? `<ol class="huong-dan">${m.buoi.map(b => `<li><b>${esc(b.ten)}</b>: ${esc(b.muc_tieu)} <span class="mo">· ${lk(b.nguon)}</span></li>`).join('')}</ol>` : '<p class="mo">Các buổi sẽ được soạn khi bạn học tới module này.</p>'}
      </details>`).join('')}</div>`).join('')}
    ${theDaSoat(lt)}
    <div class="the"><h3>Nguồn đã kiểm</h3><ul>${nguonDung().map(n => `<li>${esc(n.ma)} · <a href="${esc(n.link)}" target="_blank" rel="noopener">${esc(n.ten)}</a> <span class="mo">· ${esc(n.ai_lam)} · ${tenTieng(n.tieng)} · ${tenPhi(n.phi)} · ${n.can_mo_tay ? 'trang chặn máy kiểm, bạn mở tay giúp' : `kiểm ${esc(n.ngay_kiem)}`}${n.diem !== undefined ? ` · ${esc(n.diem)}/20 điểm` : ''}</span></li>`).join('')}</ul></div>
    <div class="the"><h3>Miễn trừ trách nhiệm</h3><p class="mo">Lộ trình này do AI tổng hợp để tư vấn, có thể có sai sót hoặc nguồn đã thay đổi. Bạn hãy đọc kỹ và tự kiểm tra các nguồn trước khi học theo. Bạn có thể điều chỉnh lộ trình theo nhu cầu của mình bất cứ lúc nào.</p></div>
    ${daDuyet ? '' : `<div class="the"><label class="cau">Muốn sửa gì? <span class="goi-y">Ví dụ: thêm thực hành, bỏ phần lập trình, mỗi buổi ngắn hơn</span><textarea id="gopy"></textarea></label><div class="hang"><button id="sua">Nhờ AI sửa</button></div><div class="nhat-ky-tim" id="nkSua" hidden></div></div>`}
    <div class="hang">${daDuyet ? '<button class="chinh" id="vao">Vào học</button>' : `<button class="chinh" id="duyet">Chọn và học lộ trình ${esc(tenCap(xem))}</button>`}<button id="timLai">Tìm lại từ đầu</button></div>`;
  man.querySelectorAll('[data-xem]').forEach(b => b.onclick = () => manLoTrinh(b.dataset.xem));
  // lộ trình đã duyệt: hỏi trước, vì tìm lại sẽ thay lộ trình đang học (sửa 24/11/2026)
  $('#timLai').onclick = async () => { if (daDuyet && await hopChon(noi('suy-nghi', '<b>Tìm lại lộ trình từ đầu?</b><p>Noe sẽ tìm nguồn và xếp lộ trình mới thay cho lộ trình đang học. Bài và sao đã có vẫn giữ.</p>'), ['Thôi', 'Tìm lại']) !== 1) return; manTim(); };
  if ($('#sua')) $('#sua').onclick = async () => {
    const g = $('#gopy').value.trim(); if (!g) return baoNho('Bạn ghi góp ý vào ô trước nhé.');
    // hiện Noe suy nghĩ ngay dưới ô góp ý, khoá nút để khỏi bấm hai lần
    const nut = $('#sua'), nk = $('#nkSua');
    nut.disabled = true; nut.textContent = 'Noe đang nhờ AI sửa…'; $('#gopy').readOnly = true;
    try { await dung3LoTrinh(nk, g); manLoTrinh(xem); }
    catch (e) { nut.disabled = false; nut.textContent = 'Nhờ AI sửa'; $('#gopy').readOnly = false; if (e.message !== 'huy') baoNho('Câu trả lời của AI chưa đúng mẫu, thử lại nhé.'); }
  };
  if ($('#vao')) $('#vao').onclick = () => manTrangChu();
  if (!daDuyet && xem === dangChon) soanSanBai1().catch(() => {});
  if ($('#duyet')) $('#duyet').onclick = async () => {
    const lanDau = !S.lo_trinh || S.lo_trinh.trang_thai !== 'da-duyet';
    await chonCap(xem);
    chuanBiNgam({ truoc: true }).catch(() => {}); // bài số 1 của lộ trình vừa chọn lên đầu hàng soạn (thường đã soạn sẵn từ lúc đọc lộ trình), rồi các module
    lanDau ? manLich(true) : manTrangChu();
  };
}
// ---------- Ba cấp: Sơ cấp, Trung cấp, Chuyên sâu ----------
// Mỗi cấp một lộ trình riêng, mã buổi riêng (Trung cấp "tc-", Chuyên sâu "cs-") để tiến độ từng cấp không lẫn nhau.
// Chuyển cấp: cất lộ trình đang học (có các buổi đã soạn, buổi ôn, buổi gộp) về đúng cấp của nó, rồi mở cấp mới.
const TIEN_TO = { nhanh: '', can_doi: 'tc-', chuyen_sau: 'cs-' };
function ganTienTo(lt, k) {
  const t = TIEN_TO[k]; if (!t || !lt) return lt;
  const g = x => x && !String(x).startsWith(t) ? t + x : x;
  (lt.chang || []).forEach(c => { c.ma = g(c.ma); (c.module || []).forEach(m => { m.ma = g(m.ma); (m.buoi || []).forEach(b => { b.ma = g(b.ma); }); }); });
  return lt;
}
async function chonCap(xem) {
  const k = KHOA_LT[xem], lt3 = { ...(S.lo_trinh_3 || {}) };
  if (S.lo_trinh?.cap_do && S.lo_trinh.trang_thai === 'da-duyet') lt3[KHOA_LT[S.lo_trinh.cap_do]] = JSON.parse(JSON.stringify(S.lo_trinh));
  const lt = ganTienTo(JSON.parse(JSON.stringify(lt3[k])), k);
  lt3[k] = lt;
  await api('/api/lo-trinh-3', lt3);
  const chon = { ...lt, trang_thai: 'da-duyet', bat_dau: lt.bat_dau || NGAY(), cap_do: xem };
  await api('/api/lo-trinh', chon);
  await api('/api/ho-so', { truong: { cap_do: xem } });
  await tai();
  await api('/api/tien-do', { chang_hien_tai: 'hoc', buoi_tiep_theo: cacBuoi(S.lo_trinh).find(b => !daHoc(b.ma))?.ma || null });
  await tai();
}

// ---------- Nhắc lịch ----------
const THU = [['MO', 'T2'], ['TU', 'T3'], ['WE', 'T4'], ['TH', 'T5'], ['FR', 'T6'], ['SA', 'T7'], ['SU', 'CN']];
const soBuoiMoiTuan = () => +String(S.ho_so.ngay_moi_tuan || '3').split('-')[0] || 3;
function ngayMacDinh(n) { return { 1: ['WE'], 2: ['TU', 'FR'], 3: ['MO', 'WE', 'FR'], 4: ['MO', 'TU', 'TH', 'SA'], 5: ['MO', 'TU', 'WE', 'TH', 'FR'], 6: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA'] }[n] || THU.map(t => t[0]); }
// Lịch nhắc là một chuỗi CÓ ĐIỂM DỪNG: đúng số buổi còn lại, hết buổi là hết lịch (không lặp vô hạn).
// Lỡ buổi hoặc đổi ngày giờ thì tạo lại: các buổi còn lại dời theo, cùng mã lịch nên ứng dụng lịch hiểu là bản cập nhật.
const MA_THU = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const ngayVN = s => s ? s.split('-').reverse().join('/') : '';
const soBuoiConLai = () => { const s = soLieu(); return Math.max(0, s.tong - s.da); };
// Bắt đầu lịch mới từ hôm nay, trừ khi hôm nay đã học hoặc đã qua giờ học thì từ mai
function ngayBatDauLich(gio) {
  const [hh, mm] = (gio || '20:00').split(':').map(Number), now = new Date();
  const daHocHomNay = (S.tien_do.buoi_da_hoc || []).some(x => x.ngay === NGAY());
  return daHocHomNay || now.getHours() * 60 + now.getMinutes() >= hh * 60 + mm ? congNgay(1) : NGAY();
}
async function taoLaiLich(ngay, gio) {
  const r = await api('/api/lich', { ngay, gio, phut: S.ho_so.phut_moi_ngay, ten: S.lo_trinh?.ten || '', so_buoi: soBuoiConLai(), tu_ngay: ngayBatDauLich(gio) });
  await api('/api/ho-so', { truong: { gio_hoc: gio, ngay_hoc: ngay } }); await tai();
  return { ...r.lich, _google: r.google };
}
const daNoiGoogle = () => !!S.google?.da_noi;
// Đã nối Google Lịch: lỡ buổi hay hết lịch thì Noe tự dời luôn, không cần người học bấm
async function tuDoiLichGoogle() {
  const k = kiemLich(); if (!daNoiGoogle() || !k) return;
  const l = k.l;
  const canDoi = (k.thieu || k.hetLich) || (k.xong && l.so_buoi > 0);
  if (!canDoi || l.tu_dong === NGAY()) return;
  await api('/api/tien-do', { lich: { ...l, tu_dong: NGAY() } }); // mỗi ngày tự dời tối đa một lần
  const moi = await taoLaiLich(l.ngay, l.gio);
  if (moi._google?.ok) toast(k.xong ? 'Học xong rồi! Noe đã dừng lịch nhắc trên Google Lịch.' : `Noe đã dời ${moi.so_buoi} buổi còn lại trên Google Lịch, buổi tới: ${ngayVN(moi.buoi_dau)}.`);
  else if (moi._google?.loi === 'can-noi-lai') baoNho('Google Lịch cần nối lại. Vào Nhắc lịch, bấm Nối Google Lịch nhé.');
  if (man.querySelector('.canh-nha')) manTrangChu();
}
// Google chỉ cho quay về địa chỉ 127.0.0.1 của chính máy tính, nên bước nối phải làm trên máy tính
const laMayTinh = () => ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);
function theGoogle() {
  const g = S.google || {};
  if (!g.da_noi && !laMayTinh()) return `<div class="the"><h3>Nối Google Lịch</h3><p class="mo">Bước nối Google Lịch làm <b>trên máy tính</b> (mở app trên máy tính → Nhắc lịch → Nối Google Lịch). Nối xong một lần, điện thoại cũng dùng chung: Noe tự ghi và tự dời lịch, lịch hiện trong app Google Lịch trên điện thoại.</p></div>`;
  if (g.da_noi) return `<div class="the"><h3>Google Lịch: đã nối</h3><p class="mo">Noe ghi buổi học vào lịch riêng <b>Học cùng Noe</b> trên Google Lịch của bạn, nhắc trước 10 phút. Lỡ buổi, đổi ngày giờ hay học xong, Noe tự sửa lịch, bạn không phải tải file. Noe chỉ đụng tới lịch riêng này, không xem các lịch khác của bạn.</p>
    <div class="hang"><button id="ngatG" class="nho">Ngắt nối Google Lịch</button></div></div>`;
  if (g.co_ma_app) return `<div class="the"><h3>Nối Google Lịch</h3><p class="mo">Nối một lần, sau đó Noe tự ghi và tự dời lịch học trên Google Lịch. Noe chỉ tạo một lịch riêng tên <b>Học cùng Noe</b>, không xem các lịch khác của bạn.</p>
    <ol class="huong-dan"><li>Bấm <b>Nối Google Lịch</b>.</li><li>Chọn tài khoản Gmail của bạn.</li><li>Bấm <b>Cho phép</b>. Xong!</li></ol>
    <div class="hang"><button class="chinh" id="noiG">Nối Google Lịch</button>${g.ma_san ? '' : '<button id="doiMaG" class="nho">Đổi mã app Google</button>'}</div><p class="mo" id="choG" hidden></p></div>`;
  return `<div class="the"><h3>Nối Google Lịch</h3><p class="mo">Nối một lần, sau đó Noe tự ghi và tự dời lịch học trên Google Lịch. Bản này cần bạn tạo một <b>mã app Google</b> (làm một lần, khoảng 10 phút, miễn phí):</p>
    <details><summary><b>Xem cách tạo mã app Google</b></summary><ol class="huong-dan">
      <li>Vào <a href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener">Google Cloud</a>, đăng nhập Gmail, tạo dự án (project) tên <b>Hoc cung Noe</b>.</li>
      <li>Bật <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noopener">Google Calendar API</a>: bấm <b>Enable</b> (Bật).</li>
      <li>Vào <a href="https://console.cloud.google.com/auth/overview" target="_blank" rel="noopener">Google Auth Platform</a> → <b>Get started</b>: tên app "Học cùng Noe", email của bạn, chọn <b>External</b>.</li>
      <li>Mục <b>Data Access</b> → <b>Add or remove scopes</b> → dán <code>https://www.googleapis.com/auth/calendar.app.created</code> → Update → Save.</li>
      <li>Mục <b>Audience</b> → <b>Publish app</b> (để quyền không tự hết hạn sau 7 ngày).</li>
      <li>Mục <b>Clients</b> → <b>Create client</b> → loại <b>Desktop app</b> (Ứng dụng máy tính) → Create. Sao chép <b>Client ID</b> và <b>Client secret</b> dán vào dưới.</li>
    </ol><p class="mo">Lúc nối, Google có thể báo "Google chưa xác minh ứng dụng này" vì đây là app của chính bạn: bấm <b>Nâng cao</b> → <b>Đi tới Học cùng Noe</b>.</p></details>
    <label class="cau">Client ID<input id="gId" placeholder="....apps.googleusercontent.com" autocomplete="off"></label>
    <label class="cau">Client secret<input id="gSec" type="password" autocomplete="off"></label>
    <div class="hang"><button class="chinh" id="luuMaG">Lưu mã</button></div></div>`;
}
function ganTheGoogle(veLai) {
  if ($('#luuMaG')) $('#luuMaG').onclick = async () => {
    try { await api('/api/google/ma-app', { client_id: $('#gId').value, client_secret: $('#gSec').value }); }
    catch { return baoNho('Mã chưa đúng dạng. Client ID kết thúc bằng .apps.googleusercontent.com, bạn kiểm tra lại nhé.'); }
    await tai(); veLai();
  };
  if ($('#doiMaG')) $('#doiMaG').onclick = () => { S.google = { ...S.google, co_ma_app: false }; veLai(); };
  if ($('#ngatG')) $('#ngatG').onclick = async () => {
    if (await hopChon(noi('buon', 'Ngắt nối thì Noe không tự dời lịch trên Google nữa. Lịch "Học cùng Noe" đã có trên Google vẫn giữ nguyên, bạn tự xoá nếu muốn.'), ['Ngắt nối', 'Thôi']) !== 0) return;
    await api('/api/google/ngat', {}); await tai(); veLai();
  };
  if ($('#noiG')) $('#noiG').onclick = async () => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    window.open(`/api/ket-noi/google?mui_gio=${encodeURIComponent(tz)}`, '_blank');
    $('#choG').hidden = false; $('#choG').textContent = 'Đang chờ bạn cho phép trên trang Google (tab mới)…';
    for (let i = 0; i < 150; i++) {
      await new Promise(r => setTimeout(r, 2000));
      await tai();
      if (daNoiGoogle()) {
        toast('Đã nối Google Lịch!');
        const l = S.tien_do.lich;
        if (l?.ngay?.length) { const moi = await taoLaiLich(l.ngay, l.gio); return manLich(false, moi); }
        return veLai();
      }
      if (!$('#choG')) return;
    }
  };
}
// So lịch với việc học thật: từ ngày bắt đầu lịch tới hôm qua, lịch hẹn bao nhiêu buổi, đã học bao nhiêu
function kiemLich() {
  const l = S.tien_do.lich; if (!l?.tu_ngay || !l.ngay?.length) return null;
  const homQua = congNgay(-1), lo = [];
  let hen = 0;
  for (let d = new Date(l.tu_ngay + 'T00:00'); ngayDia(d) <= homQua && hen < l.so_buoi; d.setDate(d.getDate() + 1))
    if (l.ngay.includes(MA_THU[d.getDay()])) { hen++; lo.push(ngayDia(d)); }
  const da = (S.tien_do.buoi_da_hoc || []).filter(x => x.ngay >= l.tu_ngay).length;
  const conLai = soBuoiConLai();
  return { l, hen, da, thieu: Math.max(0, hen - da), ngayLo: lo.filter(n => !(S.tien_do.buoi_da_hoc || []).some(x => x.ngay === n)),
    hetLich: hen >= l.so_buoi && conLai > 0, xong: conLai === 0 };
}
function theLich() {
  const k = kiemLich(); if (!k) return '';
  const { l } = k;
  if (l.hoan === NGAY()) return '';
  if (k.xong) return l.ket_thuc && l.ket_thuc >= NGAY()
    ? `<div class="the bao-lich">${noi('khen', `<b>Bạn học xong lộ trình rồi!</b> Lịch nhắc còn hẹn tới ${ngayVN(l.ket_thuc)}.<details class="giai-thich"><summary class="mo">Cách xoá lịch nhắc</summary><p class="mo">Mở một buổi "Học cùng Noe" trong lịch, bấm <b>Xoá</b>, chọn <b>Tất cả sự kiện</b>.</p></details>`)}</div>` : '';
  if (!k.thieu && !k.hetLich) return '';
  if (daNoiGoogle() && l.tu_dong !== NGAY()) return `<div class="the bao-lich">${noi('suy-nghi', '<b>Noe đang dời lịch trên Google Lịch cho khớp với bạn…</b>')}</div>`;
  const vi = k.hetLich && !k.thieu ? `Lịch nhắc đã hết (buổi cuối ${ngayVN(l.ket_thuc)}) mà bạn còn ${soBuoiConLai()} buổi.`
    : `Bạn lỡ ${k.thieu} buổi theo lịch.`;
  return `<div class="the bao-lich">${noi('suy-nghi', `<b>${vi}</b> Dời lịch nhé?`)}
    <div class="hang"><button class="chinh" id="doiLich">Dời lịch</button><button id="doiNgayGio">Đổi ngày giờ học</button><button id="hoanLich" class="nho">Để mai</button></div></div>`;
}
function ganTheLich() {
  if ($('#doiLich')) $('#doiLich').onclick = async () => { const l = S.tien_do.lich; const moi = await taoLaiLich(l.ngay, l.gio); manLich(false, moi); };
  if ($('#doiNgayGio')) $('#doiNgayGio').onclick = () => manLich();
  if ($('#hoanLich')) $('#hoanLich').onclick = async () => { await api('/api/tien-do', { lich: { ...S.tien_do.lich, hoan: NGAY() } }); await tai(); manTrangChu(); };
}
function huongDanLich(lich) {
  const capNhat = lich.lan > 1, g = lich._google;
  const dauLich = lich.so_buoi ? `<p>Lịch có <b>${lich.so_buoi} buổi</b>, từ ${ngayVN(lich.buoi_dau || lich.tu_ngay)} tới <b>${ngayVN(lich.ket_thuc)}</b>, lúc ${esc(lich.gio)}. Hết buổi là lịch tự dừng, không lặp mãi.</p>` : '<p>Bạn đã học hết các buổi, không còn buổi nào để nhắc.</p>';
  if (g?.ok) return `${dauLich}<p class="tom-tat">${ic('tron', 'mau-xanh')} Đã cập nhật lên Google Lịch (lịch <b>Học cùng Noe</b>). Bạn không cần tải file.</p>`;
  const loiG = g && g.loi !== 'chua-noi' ? `<p class="canh-bao">Chưa cập nhật được Google Lịch: ${esc(g.thong_bao || 'lỗi kết nối')} Bạn dùng tạm file lịch bên dưới nhé.</p>` : '';
  return `${loiG}${lich.so_buoi ? `<p>Lịch có <b>${lich.so_buoi} buổi</b>, từ ${ngayVN(lich.buoi_dau || lich.tu_ngay)} tới <b>${ngayVN(lich.ket_thuc)}</b>, lúc ${esc(lich.gio)}. Hết buổi là lịch tự dừng, không lặp mãi.</p>` : '<p>Bạn đã học hết các buổi, không còn buổi nào để nhắc.</p>'}
    ${capNhat ? `<p class="canh-bao"><b>Bạn đã thêm lịch cũ vào điện thoại hay Google Lịch?</b> Xoá lịch cũ trước để khỏi bị trùng: mở một buổi "Học cùng Noe" cũ, bấm <b>Xoá</b>, chọn <b>Tất cả sự kiện</b>. Rồi mới nhập file mới.</p>` : ''}
    ${lich.so_buoi ? `<p><a class="nut" href="/api/lich.ics" download="lich-hoc.ics">Tải file lịch (lich-hoc.ics)</a></p>
    <ol class="huong-dan"><li><b>Máy tính:</b> bấm đúp file vừa tải, chọn ứng dụng lịch, bấm Lưu.</li><li><b>Google Lịch:</b> calendar.google.com → Cài đặt → Nhập và xuất → chọn file → Nhập.</li><li><b>iPhone:</b> gửi file qua Zalo hoặc email cho chính mình, mở trên iPhone, chọn Thêm tất cả.</li></ol>` : ''}
    <p class="mo">Lỡ buổi nào, Noe sẽ báo trên trang chủ và dời lịch giúp bạn.</p>`;
}
function manLich(moiDuyet = false, vuaTao = null) {
  vaoMan('lich', manLich, arguments);
  veChang('hoc');
  const l = S.tien_do.lich;
  const chon = l?.ngay?.length ? l.ngay : S.ho_so.ngay_hoc?.length ? S.ho_so.ngay_hoc : ngayMacDinh(soBuoiMoiTuan());
  const gio = l?.gio || S.ho_so.gio_hoc || '20:00';
  man.innerHTML = `
    ${noi('chao', `<h2>${moiDuyet ? 'Chốt lộ trình rồi!' : vuaTao ? 'Noe dời lịch rồi nè' : 'Nhắc lịch học'}</h2><p>${vuaTao ? 'Các buổi còn lại đã được xếp sang các ngày học tới.' : `Để mình nhắc${goiTen()} học đúng giờ nha: chọn ngày học rồi thêm vào lịch điện thoại hoặc Google Lịch.`}</p>`)}
    ${l && !vuaTao ? `<div class="the"><h3>Lịch đang dùng</h3><p class="mo">${l.ngay.map(m => THU.find(t => t[0] === m)?.[1]).join(', ')} lúc ${esc(l.gio)} · ${l.so_buoi} buổi, tới ${ngayVN(l.ket_thuc)}.</p></div>` : ''}
    <div class="the">
      <div class="cau"><b>Học vào những ngày nào?</b><div class="o-chon">${THU.map(t => `<label><input type="checkbox" name="thu" value="${t[0]}" ${chon.includes(t[0]) ? 'checked' : ''}>${t[1]}</label>`).join('')}</div></div>
      <label class="cau">Giờ học<input type="time" id="gioL" value="${esc(gio)}"></label>
      <p class="mo">Còn ${soBuoiConLai()} buổi cần học. Lịch nhắc chỉ hẹn đúng chừng đó buổi.</p>
      <div class="hang"><button class="chinh" id="taoLich">${l ? 'Cập nhật lịch' : 'Tạo file lịch'}</button><button id="boQua">${vuaTao ? 'Về trang chủ' : 'Để sau'}</button></div>
      <div id="lichOk" ${vuaTao ? '' : 'hidden'}>${vuaTao ? huongDanLich(vuaTao) : ''}</div>
      <div class="hang" id="veNha" ${vuaTao ? '' : 'hidden'}><button class="chinh" id="vaoHoc">Về trang chủ</button></div>
    </div>
    ${theGoogle()}`;
  $('#boQua').onclick = manTrangChu; $('#vaoHoc').onclick = manTrangChu;
  ganTheGoogle(() => manLich(moiDuyet, vuaTao));
  $('#taoLich').onclick = async () => {
    const ngay = [...man.querySelectorAll('input[name=thu]:checked')].map(x => x.value);
    if (!ngay.length) return baoNho('Bạn chọn ít nhất một ngày nhé.');
    const nut = $('#taoLich'); if (nut.disabled) return; nut.disabled = true; // bấm nhiều lần chỉ tạo một lần
    let moi; try { moi = await taoLaiLich(ngay, $('#gioL').value); } finally { nut.disabled = false; }
    $('#lichOk').innerHTML = huongDanLich(moi); $('#lichOk').hidden = false; $('#veNha').hidden = false;
    $('#taoLich').textContent = 'Cập nhật lịch';
  };
}

// ---------- Hai thanh: Tiến độ và Thông tuệ ----------
const ngayDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const NGAY = () => ngayDia(new Date());
const congNgay = n => { const d = new Date(); d.setDate(d.getDate() + n); return ngayDia(d); };
const dauTuan = ngay => { const d = new Date(ngay + 'T00:00:00'); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; }; // thứ Hai của tuần đó
const soNgay = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const tuanSo = (d = new Date()) => { const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const n = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - n); const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return `${t.getUTCFullYear()}-W${Math.ceil(((t - y) / 864e5 + 1) / 7)}`; };
const BAC = [1, 3, 7, 14, 30, 60];
const THONG_TUE = [['hieu', 'Hiểu'], ['nho', 'Nhớ'], ['dung', 'Dùng'], ['lam_that', 'Làm thật']];

function soLieu() {
  const lt = S.lo_trinh, td = S.tien_do;
  // Chỉ đếm buổi của lộ trình đang học (mỗi cấp có tiến độ riêng)
  const tong = lt ? tongBuoi(lt) : 0, da = cacBuoi(lt).filter(b => daHoc(b.ma)).length;
  const mods = cacModule(lt), mt = td.module || {};
  // Phần nào của module đã đạt trọn thì tính 1; Hiểu và Dùng chưa trọn thì cộng dần theo từng buổi học tốt (phanModule)
  const diem = mods.reduce((s, m) => { const p = phanModule(td, m); return s + THONG_TUE.reduce((t, [k]) => t + (mt[m.ma]?.[k] ? 1 : (p[k] || 0)), 0); }, 0);
  return { tong, da, tienDo: tong ? Math.min(100, Math.round(da / tong * 100)) : 0, thongTue: mods.length ? Math.round(diem / (mods.length * 4) * 100) : 0 };
}
// Phần Hiểu và Dùng đạt được tới đâu khi module CHƯA học xong: mỗi buổi đã học góp 1 phần (trên tổng số buổi của module).
// Hiểu: buổi đó có lần kiểm tra đúng từ 80% và tổng kết không bị "chưa đúng". Dùng: buổi đó làm thử được.
// Học xong cả module thì tinhModule chấm trọn như cũ.
function phanModule(td, m) {
  const lan = [...(td.buoi_da_hoc || []), ...(td.hoc_lai || [])];
  const tong = soBuoiModule(m);
  let hieu = 0, dung = 0;
  for (const x of m.buoi || []) {
    const cua = lan.filter(y => y.ma === x.ma);
    if (!cua.length) continue;
    const tile = Math.max(0, ...cua.map(y => y.tong ? y.diem / y.tong : 0));
    const tot = Math.max(-1, ...cua.map(y => HANG_MUC[y.tong_ket] ?? -1));
    if (tile >= .8 && tot !== 0) hieu++;
    if (cua.some(y => y.lam_thu_duoc !== false)) dung++;
  }
  return { hieu: hieu / tong, dung: dung / tong };
}
// Dải số liệu ngang dưới bản đồ: Tiến độ, Thông tuệ, Hiểu đúng, sao, chuỗi ngày (chung mọi khoá)
function thanhSoLieu() {
  const s = soLieu(), td = S.tien_do;
  const buoi = cacBuoi(S.lo_trinh).filter(b => daHoc(b.ma));
  const hieu = buoi.filter(b => ketQuaTot(b.ma).muc === 'dung').length;
  const o = (icon, so, ten, thanh = null, lop = '') => `<div class="sl-o ${lop}"><span class="sl-icon" aria-hidden="true">${icon}</span><b>${so}</b><span class="mo">${ten}</span>${thanh !== null ? `<div class="thanh ${lop === 'cam' ? 'cam' : ''}"><i style="width:${thanh}%"></i></div>` : ''}</div>`;
  return `<section class="the so-lieu" aria-label="Số liệu học">
    <div class="sl-hang">
      ${o(ic('cot'), `${s.tienDo}%`, `Tiến độ · ${s.da}/${s.tong} buổi`, s.tienDo)}
      ${o(ic('sao'), td.sao || 0, `Sao vàng${td.sao_on ? ` · +${td.sao_on} xanh` : ''}`, null, 'bam-duoc')}
      ${o(ic('lua'), +S.noe?.chuoi || 0, 'Chuỗi ngày')}
    </div>
    <details class="giai-thich"><summary class="mo">Xem thêm số liệu</summary>
      <div class="sl-hang">${o(ic('den'), `${s.thongTue}%`, 'Thông tuệ', s.thongTue, 'cam')}${o(ic('tron'), `${hieu}/${buoi.length}`, 'Hiểu đúng')}</div>
      <p class="mo"><b>Tiến độ:</b> đã học bao nhiêu buổi. <b>Thông tuệ:</b> hiểu, nhớ, dùng được, làm thật tới đâu; đầy 100% là đạt trình độ ${esc(S.lo_trinh?.tuong_duong || tenCap(S.lo_trinh?.cap_do))}. <b>Hiểu đúng:</b> số buổi phần tổng kết được chấm hiểu đúng.</p></details>
  </section>`;
}
function haiThanh() {
  const s = soLieu();
  return `<div class="the tien-do">
    <div class="vach"><span>Tiến độ</span><div class="thanh"><i style="width:${s.tienDo}%"></i></div><span>${s.tienDo}% · ${s.da}/${s.tong} buổi</span></div>
    <div class="vach"><span>Thông tuệ</span><div class="thanh cam"><i style="width:${s.thongTue}%"></i></div><span>${s.thongTue}%</span></div>
    <div class="hang mo"><span>${ic('sao', 'mau-vang')} ${S.tien_do.sao || 0} sao vàng${S.tien_do.sao_on ? ` · ${S.tien_do.sao_on} xanh` : ''}</span><span>${ic('lua', 'mau-lua')} Chuỗi ${+S.noe?.chuoi || 0} ngày</span></div>
    <details class="giai-thich"><summary class="mo">Hai thanh này là gì?</summary>
      <p class="mo"><b>Tiến độ:</b> đã học bao nhiêu buổi. <b>Thông tuệ:</b> hiểu, nhớ, dùng được, làm thật tới đâu; đầy 100% là đạt trình độ ${esc(S.lo_trinh?.tuong_duong || tenCap(S.lo_trinh?.cap_do))}.</p></details>
  </div>`;
}

// ---------- Bản đồ học: mỗi buổi là một chấm trên đường đi ----------
// Đã học (✓, bấm xem kết quả, học lại) · Tiếp theo (★ to, bấm vào học) · Chưa tới (khoá) · Cúp cuối module (bài thực hành).
// Chặng chưa tới được gấp gọn để bản đồ không quá dài.
const LECH = [0, 44, 66, 44, 0, -44, -66, -44];
function ketQuaTot(ma) {
  const td = S.tien_do, cua = [...(td.buoi_da_hoc || []), ...(td.hoc_lai || [])].filter(x => x.ma === ma);
  const muc = cua.map(x => x.tong_ket).filter(x => HANG_MUC[x] !== undefined).sort((a, c) => HANG_MUC[c] - HANG_MUC[a])[0];
  const diem = cua.filter(x => x.tong).sort((a, c) => c.diem / c.tong - a.diem / a.tong)[0];
  return { muc, diem, ngay: cua[0]?.ngay, soLai: (td.hoc_lai || []).filter(x => x.ma === ma).length };
}
// ---------- Cửa hàng của Noe: dùng sao đổi đồ cho Noe, vé giữ chuỗi ngày; huy hiệu theo mốc tổng sao ----------
// Ví sao chung cho mọi khoá học: sao vàng (kiểm tra) + sao xanh (ôn) kiếm được, trừ số đã dùng. Giá do máy chủ giữ.
// Đồ chia theo BỘ SƯU TẬP; mỗi món một câu chuyện riêng. Mặc được nhiều món cùng lúc (mỗi chỗ một món: đầu, mắt, cổ, tay, lưng...).
const TEN_DO = { no: 'Nơ hồng', kinh: 'Kính tròn', khan: 'Khăn quàng', 'tai-nghe': 'Tai nghe', mu: 'Mũ tốt nghiệp', 'vuong-mien': 'Vương miện',
  'non-la': 'Nón lá', 'dau-bep': 'Đầu bếp', 'hoa-si': 'Hoạ sĩ', 'cuop-bien': 'Cướp biển', 'ao-thuat': 'Ảo thuật gia', 'tay-dua': 'Tay đua', 'phi-hanh-gia': 'Phi hành gia', 'sieu-nhan': 'Siêu nhân',
  'bac-si': 'Bác sĩ', ninja: 'Ninja', 'cao-boi': 'Cao bồi', 'cuu-hoa': 'Lính cứu hoả', 'ky-si': 'Hiệp sĩ',
  'thuy-thu': 'Thuỷ thủ', 'canh-sat': 'Cảnh sát', 'nha-khoa-hoc': 'Nhà khoa học', 'ca-si': 'Ca sĩ', 'tho-lan': 'Thợ lặn',
  'ong-gia-noel': 'Ông già Noel', 'thien-than': 'Thiên thần', 'tham-tu': 'Thám tử', 'cau-thu': 'Cầu thủ', 'con-ong': 'Chú ong',
  'kinh-vu-tru': 'Kính du hành vũ trụ', 'hanh-tinh': 'Hành tinh nhỏ', 'ten-lua': 'Tên lửa', 'ba-lo-phan-luc': 'Ba lô phản lực',
  'kinh-tim': 'Kính râm trái tim', 'o-mua': 'Ô che mưa', 'du-nang': 'Dù che nắng', 'mu-tai-beo': 'Mũ tai bèo', 'kep-hoa': 'Kẹp hoa tím', 'dong-ho': 'Đồng hồ đeo tay',
  'tui-deo': 'Túi đeo chéo', 'tra-sua': 'Ly trà sữa', 'bong-bay': 'Bóng bay', 'dien-thoai': 'Điện thoại',
  'kep-sao': 'Kẹp tóc ngôi sao', 'but-chi': 'Bút chì', sach: 'Quyển sách', 'mu-luoi-trai': 'Mũ lưỡi trai', 'day-chuyen': 'Dây chuyền trái tim', 'ba-lo': 'Ba lô đi học',
  'hoa-mai': 'Hoa mai cài tóc', 'li-xi': 'Bao lì xì', 'banh-chung': 'Bánh chưng', 'long-den': 'Lồng đèn đỏ',
  kem: 'Kem ốc quế', 'kinh-ram': 'Kính râm', 'mu-coi': 'Mũ cói đi biển', 'phao-boi': 'Phao bơi',
  'la-phong': 'Lá phong đỏ', 'khan-len': 'Khăn len cam', 'mu-noi': 'Mũ nồi', 'o-thu': 'Chiếc ô mùa thu',
  'gang-tay': 'Găng tay đỏ', 'coc-cacao': 'Cốc ca cao nóng', 'bit-tai': 'Bịt tai lông', 'mu-len': 'Mũ len quả bông',
  'qua-cau': 'Quả cầu pha lê', 'truong-phep': 'Trượng phép', 'mu-phu-thuy': 'Mũ phù thuỷ', 'ao-choang-tim': 'Áo choàng sao',
  'huan-chuong': 'Huân chương vàng', 'truong-vang': 'Trượng vàng', 'ao-choang-do': 'Áo choàng hoàng gia',
  'hoa-sen': 'Hoa sen hồng', 'quat-giay': 'Quạt giấy', 'khan-dong': 'Khăn đóng đỏ', 'ao-dai': 'Áo dài đỏ' };
// [tên bộ, các món, câu chuyện khi sưu tầm và mặc đủ bộ]
const NHOM_DO = [
  ['Phụ kiện thường ngày', ['no', 'kinh', 'khan', 'tai-nghe', 'mu', 'kep-sao', 'but-chi', 'sach', 'mu-luoi-trai', 'day-chuyen', 'ba-lo',
    'kinh-tim', 'o-mua', 'du-nang', 'mu-tai-beo', 'kep-hoa', 'dong-ho', 'tui-deo', 'tra-sua', 'bong-bay', 'dien-thoai'], ''],
  ['Bộ trang phục chủ đề', ['non-la', 'dau-bep', 'hoa-si', 'cuop-bien', 'ao-thuat', 'tay-dua', 'phi-hanh-gia', 'sieu-nhan', 'bac-si', 'ninja', 'cao-boi', 'cuu-hoa', 'ky-si',
    'thuy-thu', 'canh-sat', 'nha-khoa-hoc', 'ca-si', 'tho-lan', 'ong-gia-noel', 'thien-than', 'tham-tu', 'cau-thu', 'con-ong'], ''],
  ['Bộ sưu tập Áo dài', ['hoa-sen', 'quat-giay', 'khan-dong', 'ao-dai'], 'Đủ bộ Áo dài! Khăn đóng, áo dài đỏ, quạt giấy và đoá sen hồng: Noe đẹp như một bức tranh Tết xưa. Noe tự hào là người Việt, và bạn cũng vậy.', 'ao-dai'],
  ['Bộ sưu tập Pháp sư', ['qua-cau', 'truong-phep', 'mu-phu-thuy', 'ao-choang-tim'], 'Noe đã thành Pháp sư thực thụ! Mũ, áo choàng, trượng và quả cầu đủ cả. Phép thuật lớn nhất của Noe là sự kiên trì.', 'phap-su'],
  ['Bộ sưu tập Không gian', ['kinh-vu-tru', 'hanh-tinh', 'ten-lua', 'ba-lo-phan-luc'], 'Đủ bộ Không gian! Kính du hành, ba lô phản lực, tên lửa và hành tinh nhỏ: Noe sẵn sàng bay ra ngoài vũ trụ. Bầu trời không phải giới hạn của người ham học.', 'khong-gian'],
  ['Bộ sưu tập Xuân', ['hoa-mai', 'li-xi', 'banh-chung', 'long-den'], 'Đủ bộ Xuân rồi! Hoa mai, lì xì, bánh chưng, lồng đèn: Noe đón Tết thật tròn đầy. Năm mới, kiến thức mới!', 'xuan'],
  ['Bộ sưu tập Hạ', ['kem', 'kinh-ram', 'mu-coi', 'phao-boi'], 'Đủ bộ Hạ! Noe sẵn sàng cho một mùa hè rực rỡ, vui hết mình mà vẫn không quên học mỗi ngày.', 'ha'],
  ['Bộ sưu tập Thu', ['la-phong', 'khan-len', 'mu-noi', 'o-thu'], 'Đủ bộ Thu! Mùa thu của Noe thật lãng mạn: mùa của lá vàng và những hiểu biết đã chín.', 'thu'],
  ['Bộ sưu tập Đông', ['gang-tay', 'coc-cacao', 'bit-tai', 'mu-len'], 'Đủ bộ Đông! Noe ấm áp từ đầu tới tay, sẵn sàng học xuyên suốt mùa lạnh.', 'dong'],
  ['Bộ sưu tập Hoàng gia', ['huan-chuong', 'truong-vang', 'ao-choang-do', 'vuong-mien'], 'Noe đăng quang! Vương miện, áo choàng, trượng vàng và huân chương: Noe là vị vua của tri thức.', 'hoang-gia'],
];
const CHUYEN_DO = {
  no: 'Một buổi sáng đẹp trời, Noe để dành đủ sao và mua được chiếc nơ hồng. Từ khi có nơ, Noe thấy cuộc đời thật dịu dàng, ai nhìn cũng mỉm cười với Noe.',
  kinh: 'Noe đeo kính tròn vào và bỗng thấy chữ trong sách rõ hẳn ra. Noe bảo: đeo kính lên là thấy mình thông thái thêm một chút xíu.',
  khan: 'Chiếc khăn quàng đỏ ấm như một cái ôm. Mỗi lần gió thổi, khăn bay phấp phới, Noe thấy mình như đang đi phiêu lưu.',
  'tai-nghe': 'Có tai nghe rồi, Noe vừa học vừa nghe nhạc êm êm. Noe nói nhạc hay làm bài học trôi vào đầu nhẹ như mây.',
  mu: 'Đội mũ tốt nghiệp lên, Noe đứng thẳng lưng hơn hẳn. Noe tin một ngày bạn cũng sẽ tung mũ ăn mừng vì đã học xong.',
  'vuong-mien': 'Chiếc vương miện lấp lánh làm Noe hơi run tay. Noe hiểu: vương miện không để khoe, mà để nhắc mình luôn giữ phong độ của người ham học.',
  'kinh-vu-tru': 'Noe đeo kính du hành, nhìn đâu cũng thấy sao lấp lánh. Kính này giúp Noe nhìn xa hơn, như kiến thức giúp mình thấy rộng hơn.',
  'hanh-tinh': 'Noe nâng niu một hành tinh nhỏ có vành vàng. Mỗi bài học là một hành tinh mới Noe vừa khám phá.',
  'ten-lua': 'Tên lửa đỏ trắng sẵn sàng rời bệ phóng. Noe đếm ngược: 3, 2, 1… học thôi!',
  'ba-lo-phan-luc': 'Ba lô phản lực phụt lửa vù vù, Noe bay vút qua những đám mây. Học đều mỗi ngày là nhiên liệu để bay cao.',
  'kinh-tim': 'Noe đeo cặp kính râm trái tim đỏ, nhìn đâu cũng thấy đáng yêu. Nắng gắt cỡ nào Noe cũng cười tươi, vì học xong hôm nay rồi!',
  'o-mua': 'Trời đổ mưa, Noe bung chiếc ô xanh chấm bi. Mưa to cỡ nào Noe vẫn đi học đều, vì có ô là có cách.',
  'du-nang': 'Chiếc dù hồng viền ren che nắng dịu dàng. Noe thong thả dạo bước, vừa đi vừa nhẩm lại bài hôm qua.',
  'mu-tai-beo': 'Mũ tai bèo xanh ngọc cài bông cúc trắng: Noe sẵn sàng đi dã ngoại. Đi đâu Noe cũng mang theo một câu hỏi để học thêm.',
  'kep-hoa': 'Bông hoa tím nhỏ cài trên tóc làm Noe vui cả ngày. Noe bảo: mỗi ngày học một chút, như hoa nở từng cánh.',
  'dong-ho': 'Noe đeo đồng hồ đỏ để nhớ giờ học. Chỉ vài phút mỗi ngày thôi, nhưng đúng giờ là thành thói quen.',
  'tui-deo': 'Túi đeo chéo nhỏ xinh đựng đủ sổ tay, bút và một viên kẹo. Noe đi đâu cũng sẵn sàng ghi lại điều hay.',
  'tra-sua': 'Ly trà sữa trân châu là phần thưởng Noe tự đãi sau buổi học. Học xong mới uống, ngon gấp đôi!',
  'bong-bay': 'Quả bóng bay đỏ lơ lửng trên đầu, Noe nắm dây thật chặt. Mỗi buổi học xong, Noe thấy mình nhẹ và bay cao hơn một chút.',
  'dien-thoai': 'Noe cầm điện thoại, mở app Học cùng Noe ra học ngay lúc chờ xe buýt. Vài phút rảnh cũng thành một buổi học.',
  'kep-sao': 'Noe cài chiếc kẹp ngôi sao vàng lên tóc. Mỗi lần soi gương, Noe tự nhắc: hôm nay mình cũng sẽ sáng thêm một chút.',
  'but-chi': 'Cây bút chì vàng nhỏ xíu nhưng đã viết nên biết bao điều. Noe ghi chép mỗi ngày, vì nhớ lâu nhất là tự tay mình viết ra.',
  sach: 'Noe ôm quyển sách xanh đi khắp nơi. Đọc thêm một trang là thế giới rộng ra thêm một chút.',
  'mu-luoi-trai': 'Chiếc mũ lưỡi trai xanh, đội lệch một chút cho năng động. Noe sẵn sàng chạy một vòng rồi về học tiếp.',
  'day-chuyen': 'Dây chuyền trái tim hồng là quà Noe tự thưởng sau một tuần học chăm. Yêu việc học thì học mới bền.',
  'ba-lo': 'Ba lô cam trên vai, Noe như cậu học trò ngày đầu đến lớp. Hành trang tốt nhất là sự tò mò.',
  'bac-si': 'Noe đeo ống nghe, cài gương soi trán, sẵn sàng khám bệnh cho mọi bài khó. Chẩn đoán đúng chỗ chưa hiểu là chữa được ngay.',
  ninja: 'Noe hoá ninja, lặng lẽ luyện tập mỗi ngày không ai thấy. Đến lúc cần thì ra tay nhanh gọn, chuẩn xác.',
  'cao-boi': 'Mũ cao bồi, khăn đỏ, dây thừng trong tay: Noe phi ngựa qua thảo nguyên kiến thức, gặp bài khó là quăng dây bắt gọn.',
  'cuu-hoa': 'Mũ đỏ, bình chữa cháy sẵn sàng: Noe dập tắt mọi "đám cháy" bài vở dồn đống. Bình tĩnh, từng việc một, là xong hết.',
  'thuy-thu': 'Mũ trắng, cổ áo xanh, nơ đỏ: thuỷ thủ Noe ra khơi. Biển kiến thức rộng mênh mông, nhưng đi đều mỗi ngày thì tàu nào cũng tới bến.',
  'canh-sat': 'Cảnh sát Noe đội mũ, gắn phù hiệu, cầm gậy chỉ đường: bắt gọn mọi lỗi sai trong bài. Lỗi nào bị bắt là lần sau không tái phạm.',
  'nha-khoa-hoc': 'Kính bảo hộ, áo blouse trắng, bình thí nghiệm sủi bọt: nhà khoa học Noe thích thử, thích hỏi vì sao. Sai thì thử lại, đó là cách khoa học tiến lên.',
  'ca-si': 'Kính ngôi sao, micro trong tay, nốt nhạc bay quanh: ca sĩ Noe hát vang bài ca chăm học. Ôn bài như tập hát, càng hát càng thuộc.',
  'tho-lan': 'Thợ lặn Noe đeo kính, ngậm ống thở, lặn sâu xuống đáy đại dương kiến thức. Càng lặn sâu càng thấy nhiều điều kỳ diệu.',
  'ong-gia-noel': 'Ho ho ho! Ông già Noel Noe mang quà là những bài học hay. Món quà quý nhất là thói quen học mỗi ngày bạn tự tặng mình.',
  'thien-than': 'Vầng hào quang vàng, đôi cánh trắng: thiên thần Noe bay đến cổ vũ bạn. Mỗi lần bạn học xong một buổi, Noe lại vỗ cánh mừng.',
  'tham-tu': 'Mũ thám tử, kính lúp trong tay: Noe soi từng manh mối của bài khó. Hỏi đúng câu, tìm đủ chứng cứ, bí ẩn nào cũng được giải.',
  'cau-thu': 'Băng đô đỏ, quả bóng dưới chân, huy chương trên cổ: cầu thủ Noe tập luyện mỗi ngày. Bàn thắng đến từ những buổi tập không ai thấy.',
  'con-ong': 'Chú ong Noe vo ve chăm chỉ, mỗi ngày một chút mật. Học cũng vậy: từng giọt nhỏ góp lại thành cả hũ mật ngọt.',
  'ky-si': 'Mũ sắt, khiên xanh, kiếm bạc: hiệp sĩ Noe bảo vệ lời hứa học mỗi ngày. Danh dự của hiệp sĩ là không bỏ cuộc.',
  'non-la': 'Nón lá che nắng, Noe dạo một vòng phố cổ. Nhìn mái ngói rêu phong, Noe thấy thương quê hương mình quá chừng.',
  'dau-bep': 'Noe đội mũ đầu bếp, thắt nơ đỏ và tuyên bố: hôm nay Noe nấu món kiến thức xào giòn! Ai ăn cũng thông minh thêm một chút.',
  'hoa-si': 'Cầm cọ lên, Noe vẽ một bầu trời đầy sao. Noe nói học cũng như vẽ: mỗi ngày một nét, rồi thành bức tranh lớn.',
  'cuop-bien': 'Noe đội mũ cướp biển, đeo bịt mắt, đi tìm kho báu. Kho báu hoá ra là những điều bạn học được mỗi ngày.',
  'ao-thuat': 'Noe vẫy đũa phép một cái, bùm, bài khó biến thành bài dễ! Noe thì thầm: phép thuật thật ra là luyện tập đều đặn.',
  'tay-dua': 'Noe đội mũ bảo hiểm, cầm cờ đích và lao về phía trước. Noe không vội, nhưng cũng không bao giờ dừng lại.',
  'phi-hanh-gia': 'Noe mặc bộ đồ phi hành gia, bay lên giữa các vì sao. Từ trên cao nhìn xuống, Noe thấy giới hạn nào cũng vượt qua được.',
  'sieu-nhan': 'Áo choàng đỏ tung bay, Noe đứng trên mái nhà ngắm thành phố. Siêu năng lực của Noe là không bỏ cuộc, và bạn cũng có nó.',
  'hoa-mai': 'Sáng mùng Một, Noe cài một bông mai vàng lên tóc. Cả năm mới bừng sáng, Noe chúc bạn học đâu nhớ đó.',
  'li-xi': 'Noe nhận được bao lì xì đỏ thắm. Bên trong không có tiền, chỉ có một lời chúc: chăm học, năm nay giỏi hơn năm ngoái.',
  'banh-chung': 'Noe ôm chiếc bánh chưng xanh vuông vức vừa vớt ra khỏi nồi. Tết là lúc nhớ về cội nguồn, giống như ôn lại bài cũ vậy.',
  'long-den': 'Noe xách chiếc lồng đèn đỏ dạo đêm xuân. Ánh đèn nhỏ thôi nhưng đủ soi đường, như mỗi bài học nhỏ của bạn.',
  kem: 'Trưa hè nóng nực, Noe liếm cây kem dâu bạc hà mát lạnh. Noe bảo học xong một buổi rồi ăn kem là hạnh phúc nhất trần đời.',
  'kinh-ram': 'Noe đeo kính râm, tạo dáng dưới nắng hè. Ngầu vậy thôi chứ Noe vẫn nhớ ôn bài đầy đủ nha.',
  'mu-coi': 'Chiếc mũ cói rộng vành theo Noe ra biển. Gió mặn, sóng êm, đầu óc Noe nhẹ tênh, học gì cũng vào.',
  'phao-boi': 'Noe ôm phao bơi nhảy ùm xuống biển xanh. Học cũng như bơi: lúc đầu cần phao, rồi sẽ tự bơi được thôi.',
  'la-phong': 'Một chiếc lá phong đỏ rơi đúng lên đầu Noe. Noe giữ lại làm kỷ niệm của mùa thu, mùa của những điều chín muồi.',
  'khan-len': 'Gió thu se lạnh, Noe quấn chiếc khăn len cam ấm áp, ngồi bên cửa sổ đọc bài và nghe lá rơi xào xạc.',
  'mu-noi': 'Noe đội mũ nồi nghiêng nghiêng như một nghệ sĩ. Mùa thu làm Noe muốn viết thơ, mà viết thơ thì cần học thật nhiều chữ hay.',
  'o-thu': 'Mưa thu lất phất, Noe bung chiếc ô cam và vẫn đi học đều. Trời mưa hay nắng, Noe đều có cách để không bỏ lỡ.',
  'gang-tay': 'Đôi găng tay đỏ giữ ấm bàn tay nhỏ xíu của Noe. Tay ấm rồi, Noe lại hăng hái bấm trả lời câu hỏi.',
  'coc-cacao': 'Noe ôm cốc ca cao nóng có kẹo dẻo, khói bay nghi ngút. Ngoài trời lạnh, nhưng trong lòng Noe ấm áp vô cùng.',
  'bit-tai': 'Bịt tai lông hồng mềm như mây. Noe đội vào là tiếng ồn biến mất, chỉ còn Noe và bài học.',
  'mu-len': 'Chiếc mũ len xanh có quả bông trắng nảy nảy mỗi khi Noe nhún. Mùa đông lạnh mấy Noe cũng không ngại đi học.',
  'qua-cau': 'Noe nhìn vào quả cầu pha lê và thấy tương lai: bạn đang giỏi lên từng ngày. Quả cầu không bao giờ nói dối đâu nha.',
  'truong-phep': 'Cây trượng gỗ có viên ngọc xanh phát sáng. Mỗi lần bạn trả lời đúng, viên ngọc lại sáng thêm một chút.',
  'mu-phu-thuy': 'Chiếc mũ phù thuỷ tím đầy sao làm Noe trông thật bí ẩn. Câu thần chú đầu tiên Noe học được là: mỗi ngày một chút.',
  'ao-choang-tim': 'Áo choàng tím lấp lánh sao bay phần phật sau lưng Noe. Pháp sư thật sự không sinh ra đã giỏi, họ học từng phép một.',
  'huan-chuong': 'Noe được trao huân chương vàng vì chăm chỉ. Mỗi lần nhìn xuống ngực, Noe lại nhớ những buổi học không bỏ cuộc.',
  'truong-vang': 'Cây trượng vàng nặng trịch, đỉnh có viên hồng ngọc. Noe cầm nó và tự hứa sẽ dùng hiểu biết của mình để giúp người khác.',
  'ao-choang-do': 'Áo choàng đỏ viền lông trắng phủ lên vai Noe. Noe bước đi chậm rãi, đàng hoàng, như một vị vua của tri thức.',
  'hoa-sen': 'Noe hái một đoá sen hồng giữa đầm. Sen mọc lên từ bùn mà vẫn thơm ngát, như người chịu học thì hoàn cảnh nào cũng toả sáng được.',
  'quat-giay': 'Noe xoè chiếc quạt giấy vàng, phe phẩy giữa trưa hè. Từng nan quạt nhỏ ghép lại thành gió mát, như từng bài học nhỏ ghép lại thành hiểu biết.',
  'khan-dong': 'Noe đội chiếc khăn đóng đỏ quấn từng lớp ngay ngắn, như ông bà mình ngày xưa đi chúc Tết. Đội lên rồi, Noe tự nhắc mình học hành cho xứng với cội nguồn.',
  'ao-dai': 'Noe khoác lên chiếc áo dài đỏ, tà áo bay nhẹ trong gió. Noe thấy thương lắm vẻ đẹp Việt Nam: dịu dàng mà kiên cường, giống như cách bạn học mỗi ngày.',
};
const giaBo = (ma, co) => { const thieu = (S.bo_suu_tap?.[ma] || []).filter(x => !co.has(x)), tong = thieu.reduce((t, x) => t + (S.gia_do?.[x] || 0), 0);
  return { thieu, tong, gia: thieu.length >= 2 ? tong - Math.round(tong * .1) : tong }; };
const TEN_NEN = { 'ao-dai': 'Áo dài', 'phap-su': 'Pháp sư', 'khong-gian': 'Không gian', xuan: 'Xuân', ha: 'Hạ', thu: 'Thu', dong: 'Đông', 'hoang-gia': 'Hoàng gia', 'ho-den': 'Hố đen', 'thien-ha': 'Thiên hà', 'big-bang': 'Big Bang' };
const saoCon = () => (S.tong_sao || 0) - (S.noe?.da_dung || 0);
// Vẽ Noe đang mặc món (hoặc các món) để xem trước, rồi trả lại đồ đang mặc thật
function noeMac(tam, ma) { const cu = window.NOE_DO; window.NOE_DO = ma; const s = noe(tam); window.NOE_DO = cu; return s; }
const dangMac = () => noeDsMac(S.noe?.dang_mac || '');
// Câu chuyện ở khu "Noe đang mặc": chưa mặc gì thì Noe thấy trống trải; mặc đủ bộ thì kể chuyện cả bộ; còn lại kể chuyện món vừa mặc
function chuyenNoe() {
  const ds = dangMac();
  if (!ds.length) return `Noe đang cảm thấy trống trải, chẳng có món đồ nào để diện. ${S.ho_so.ten_goi ? esc(S.ho_so.ten_goi) : 'Bạn'} hãy học để có sao mua đồ cho Noe nhé!`;
  const bo = NHOM_DO.find(([, mon, chuyen]) => chuyen && mon.every(x => ds.includes(x)));
  if (bo) return esc(bo[2]);
  const cuoi = ds.includes(S.noe?.mac_cuoi) ? S.noe.mac_cuoi : ds[ds.length - 1];
  return esc(CHUYEN_DO[cuoi] || '');
}
// Cửa hàng: trang chính là lưới ô bộ sưu tập (hình Noe mặc nguyên bộ), bấm ô mới mở trang chi tiết của bộ đó
// Nền riêng cho 2 ô không phải bộ sưu tập (cho khác hẳn nhau và khác các bộ)
const NEN_O_THUONG = { 'Phụ kiện thường ngày': 'ch-o-phu-kien', 'Bộ trang phục chủ đề': 'ch-o-chu-de' };
const HINH_BO = { 'Phụ kiện thường ngày': 'no,kinh,khan,tai-nghe', 'Bộ trang phục chủ đề': 'phi-hanh-gia' };
function manCuaHang(boIdx = null) {
  const chiTiet = Number.isInteger(boIdx) && NHOM_DO[boIdx]; // bấm từ nút khác truyền vào sự kiện: coi như trang chính
  vaoMan(chiTiet ? 'cua-hang-bo' : 'cua-hang', manCuaHang, chiTiet ? [boIdx] : []);
  veChang('hoc');
  const n = S.noe || {}, gia = S.gia_do || {}, con = saoCon(), co = new Set(n.do || []), mac = dangMac();
  const theMon = ma => {
    const dang = mac.includes(ma);
    return `<div class="ch-mon ${dang ? 'dang' : ''}"><button type="button" class="ch-noe" data-chuyen="${ma}" aria-label="Chuyện của ${esc(TEN_DO[ma] || ma)}">${noeMac('vui', ma)}</button><b>${esc(TEN_DO[ma] || ma)}</b>
      ${co.has(ma) ? (dang ? `<button class="nho" data-coi="${ma}">Cởi ra</button>` : `<button class="nho" data-mac="${ma}">Mặc</button>`)
        : `<button class="nho ${con >= gia[ma] ? 'chinh' : ''}" data-mua="${ma}" ${con >= gia[ma] ? '' : 'disabled'}>${ic('sao', 'mau-vang')} ${gia[ma]}</button>`}</div>`;
  };
  const viSao = `<span class="ch-vi">${ic('sao')}<b>${con}</b><span>sao</span></span>`;
  if (chiTiet) {
    // ----- Trang chi tiết một bộ -----
    const [tenNhom, ds, chuyenBo, maBo] = chiTiet;
    const coMon = ds.filter(ma => gia[ma]), du = coMon.length && coMon.every(x => co.has(x));
    const gb = maBo ? giaBo(maBo, co) : null, dangNen = (n.nen || '') === maBo;
    const oNen = maBo ? `<div class="ch-nen"><span class="nen-xem nen-${maBo}" aria-hidden="true"></span><div><b>Nền bản đồ ${esc(TEN_NEN[maBo])}</b>
      <span class="mo">${du ? (dangNen ? 'Bản đồ học đang dùng nền này.' : 'Đủ bộ rồi, bạn dùng được nền này.') : 'Sưu tập đủ bộ để mở khoá nền này cho bản đồ học.'}</span></div>
      ${du ? (dangNen ? `<button class="nho" data-nen="">Bỏ nền</button>` : `<button class="nho chinh" data-nen="${maBo}">Dùng nền này</button>`) : `<span class="ch-khoa">${ic('khoa')}</span>`}</div>` : '';
    const nutBo = gb && gb.thieu.length ? `<button class="${con >= gb.gia ? 'chinh' : ''}" data-mua-bo="${maBo}" ${con >= gb.gia ? '' : 'disabled'}>Mua cả bộ · ${ic('sao', 'mau-vang')} ${gb.gia}${gb.thieu.length >= 2 ? ` <s>${gb.tong}</s>` : ''}</button>` : '';
    const nutMacBo = du && chuyenBo && !coMon.every(x => mac.includes(x)) ? `<button class="chinh" data-mac-bo="${coMon.join(',')}">Mặc cả bộ</button>` : '';
    man.innerHTML = `
      <div class="hang ch-dau-bo">${viSao}</div>
      <section class="the ch-bia ${maBo ? `nen-${maBo}` : NEN_O_THUONG[tenNhom] || ''}"><span class="ch-bia-noe" aria-hidden="true">${noeMac('khen', HINH_BO[tenNhom] || coMon.join(','))}</span>
        <div><h2>${esc(tenNhom)}</h2>${chuyenBo ? `<span class="nhan ${du ? '' : 'xam'}">${du ? 'Đủ bộ' : `Có ${coMon.filter(x => co.has(x)).length}/${coMon.length} món`}</span>` : `<span class="nhan xam">${coMon.length} món</span>`}
        ${chuyenBo ? `<p class="ch-chuyen">${esc(chuyenBo)}</p>` : ''}<div class="hang">${nutBo}${nutMacBo}</div></div></section>
      <section class="the ch-bo"><div class="ch-luoi">${coMon.map(theMon).join('')}</div>${oNen}</section>`;
  } else {
    // ----- Trang chính: lưới ô bộ sưu tập -----
    const oBo = NHOM_DO.map(([tenNhom, ds, chuyenBo, maBo], i) => {
      const coMon = ds.filter(ma => gia[ma]), soCo = coMon.filter(x => co.has(x)).length, du = coMon.length && soCo === coMon.length;
      const gb = maBo ? giaBo(maBo, co) : null;
      return `<button type="button" class="ch-o-bo ${maBo ? `nen-${maBo}` : `ch-o-thuong ${NEN_O_THUONG[tenNhom] || ''}`} ${du ? 'du' : ''}" data-mo-bo="${i}" aria-label="Xem ${esc(tenNhom)}">
        <span class="ch-o-noe" aria-hidden="true">${noeMac('vui', HINH_BO[tenNhom] || coMon.join(','))}</span>
        <b>${esc(tenNhom.replace('Bộ sưu tập ', ''))}</b>
        <span class="ch-o-dem">${du ? `${ic('tron')} Đủ bộ` : `${soCo}/${coMon.length} món`}</span>
        ${gb && gb.thieu.length ? `<span class="ch-o-gia">${ic('sao', 'mau-vang')} ${gb.gia}</span>` : ''}</button>`;
    }).join('');
    man.innerHTML = `
      ${noi('khen', `<h2>Cửa hàng của Noe</h2><p>Bạn đang có <b>${con} sao</b> để dùng. <span class="mo">Đã kiếm ${S.tong_sao || 0} sao ở mọi khoá.</span></p>`)}
      <section class="the ch-xem"><span class="ch-noe-to" aria-hidden="true">${noe(mac.length ? 'vui' : 'buon')}</span>
        <div><h3>${mac.length ? `Noe đang mặc: ${mac.map(x => esc(TEN_DO[x] || x)).join(', ')}` : 'Noe chưa mặc gì'}</h3><p class="ch-chuyen">${chuyenNoe()}</p>
        ${mac.length ? '<button id="chCoi" class="nho">Cởi hết</button>' : ''}</div></section>
      <section class="the ch-ve"><div><h3>Vé giữ chuỗi ngày</h3><p class="mo">Bạn có <b>${n.ve || 0} vé</b>. Hôm nào bận không học, lần học sau Noe tự dùng vé (mỗi ngày lỡ một vé) để chuỗi ngày không bị mất.</p></div>
        <button id="chVe" class="${con >= (S.gia_ve || 25) ? 'chinh' : ''}" ${con >= (S.gia_ve || 25) ? '' : 'disabled'}>${ic('sao', 'mau-vang')} ${S.gia_ve || 25} · Đổi 1 vé</button></section>
      <section class="the"><h3>Bộ sưu tập</h3><p class="mo">Bấm vào một bộ để xem từng món. Sưu tầm đủ bộ để mở khoá nền bản đồ học.</p><div class="ch-luoi-bo">${oBo}</div></section>`;
  }
  const doi = async (d, chu) => {
    const r = await api('/api/noe', d);
    if (!r.ok) return baoNho(r.thong_bao || 'Chưa đổi được.');
    await tai(); if (chu) toast(chu); manCuaHang(chiTiet ? boIdx : null);
  };
  man.querySelectorAll('[data-mo-bo]').forEach(b => b.onclick = () => { manCuaHang(+b.dataset.moBo); scrollTo(0, 0); });
  if ($('#veCH')) $('#veCH').onclick = () => { manCuaHang(); scrollTo(0, 0); };
  man.querySelectorAll('[data-mua]').forEach(b => b.onclick = async () => {
    const ma = b.dataset.mua, thu = noeMacThem(n.dang_mac, ma);
    const c = await hopChon(noi('vui', `<span class="ch-noe" style="width:120px;height:120px;display:block;margin:0 auto">${noeMac('khen', thu)}</span><b>Đổi ${gia[ma]} sao lấy ${esc(TEN_DO[ma])}?</b><p class="mo">${esc(CHUYEN_DO[ma] || '')}</p>`), ['Đổi', 'Thôi']);
    if (c === 0) doi({ mua: ma, mac: thu, mac_cuoi: ma }, `Noe có ${TEN_DO[ma]} mới rồi!`);
  });
  man.querySelectorAll('[data-mac]').forEach(b => b.onclick = () => doi({ mac: noeMacThem(n.dang_mac, b.dataset.mac), mac_cuoi: b.dataset.mac }));
  man.querySelectorAll('[data-coi]').forEach(b => b.onclick = () => doi({ mac: noeCoi(n.dang_mac, b.dataset.coi) }));
  man.querySelectorAll('[data-mua-bo]').forEach(b => b.onclick = async () => {
    const ma = b.dataset.muaBo, gb = giaBo(ma, co), mon = S.bo_suu_tap[ma], thu = mon.reduce((t, x) => noeMacThem(t, x), n.dang_mac);
    const c = await hopChon(noi('vui', `<span class="ch-noe" style="width:140px;height:140px;display:block;margin:0 auto">${noeMac('khen', thu)}</span>
      <b>Đổi ${gb.gia} sao lấy cả bộ ${esc(TEN_NEN[ma])}?</b><p class="mo">Gồm ${gb.thieu.map(x => esc(TEN_DO[x] || x)).join(', ')}.${gb.thieu.length >= 2 ? ` Mua cả bộ giảm 10% (giá lẻ ${gb.tong} sao).` : ''} Đủ bộ còn mở khoá <b>nền bản đồ ${esc(TEN_NEN[ma])}</b>.</p>`), ['Mua cả bộ', 'Thôi']);
    if (c === 0) doi({ mua_bo: ma, mac: thu, mac_cuoi: mon[mon.length - 1] }, `Noe có đủ bộ ${TEN_NEN[ma]} rồi! Nền bản đồ ${TEN_NEN[ma]} đã mở khoá.`);
  });
  man.querySelectorAll('[data-nen]').forEach(b => b.onclick = () => doi({ nen: b.dataset.nen }, b.dataset.nen ? `Bản đồ học đã đổi sang nền ${TEN_NEN[b.dataset.nen]}.` : 'Đã bỏ nền bản đồ.'));
  man.querySelectorAll('[data-mac-bo]').forEach(b => b.onclick = () => doi({ mac: b.dataset.macBo.split(',').reduce((s, x) => noeMacThem(s, x), n.dang_mac) }, 'Noe mặc đủ bộ rồi nè!'));
  man.querySelectorAll('[data-chuyen]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    const ma = b.dataset.chuyen;
    hopChon(noi('vui', `<span class="ch-noe" style="width:120px;height:120px;display:block;margin:0 auto">${noeMac('khen', ma)}</span><b>${esc(TEN_DO[ma] || ma)}</b><p>${esc(CHUYEN_DO[ma] || '')}</p>`), ['Đóng']);
  });
  if ($('#chCoi')) $('#chCoi').onclick = () => doi({ mac: '' });
  if ($('#chVe')) $('#chVe').onclick = async () => {
    const c = await hopChon(noi('vui', `<b>Đổi ${S.gia_ve || 25} sao lấy 1 vé giữ chuỗi ngày?</b>`), ['Đổi', 'Thôi']);
    if (c === 0) doi({ mua_ve: 1 }, 'Đã có thêm 1 vé giữ chuỗi.');
  };
  if (!chiTiet) moiHuyHieu();
}
// Mở trang chủ hoặc cửa hàng mà tổng sao đã vượt nấc chưa nhận (ví dụ sao được cộng ở máy khác): ăn mừng ngay
let dangMungHH = false;
async function moiHuyHieu() {
  if (dangMungHH || document.querySelector('.an-mung')) return;
  dangMungHH = true;
  try { const moi = await nhanHuyHieu(); if (moi.length) await anMungHuyHieu(moi.at(-1).moc); } catch {} finally { dangMungHH = false; }
}

// ---------- Huy hiệu thành tích: 11 nấc ánh sáng theo tổng sao của mọi khoá (tới Hố đen, Big Bang) ----------
// Mỗi nấc một hình biểu trưng riêng (vẽ trong noe.js: hinhHuyHieu) và một màn ăn mừng toàn màn hình có hiệu ứng riêng.
const CAP_SANG = [
  ['dom-sang', 'Đốm sáng nhỏ', 'Tri thức của bạn đang bắt đầu le lói. Mỗi buổi học là một hạt sáng nhỏ, và bạn vừa thắp hạt đầu tiên!'],
  ['dom-dom', 'Đom đóm', 'Ánh sáng của bạn đã biết bay! Như đom đóm giữa đêm, bạn đang tự soi đường bằng chính hiểu biết của mình.'],
  ['ngon-nen', 'Ngọn nến', 'Ngọn nến tri thức đã cháy đều. Nhỏ thôi nhưng ấm, và đủ sáng để bạn đọc tiếp những trang mới.'],
  ['ngon-den', 'Ngọn đèn', 'Bạn đã thành ngọn đèn sáng cả căn phòng. Những gì bạn học bắt đầu soi sáng công việc và cuộc sống.'],
  ['lua-trai', 'Đống lửa trại', 'Lửa đã bùng lên! Tri thức của bạn đủ ấm để người khác ngồi quanh lắng nghe. Hãy chia sẻ điều bạn biết nhé.'],
  ['ngoi-sao', 'Ngôi sao', 'Bạn đã là một ngôi sao! Ánh sáng của bạn giờ nhìn thấy được từ rất xa, người khác có thể nhìn theo mà đi.'],
  ['mat-trang', 'Vầng trăng', 'Vầng trăng tri thức đã tròn. Ngay cả trong đêm tối nhất, bạn vẫn đủ sáng để dẫn đường cho người khác.'],
  ['mat-troi', 'Mặt trời', 'Bạn đã thành mặt trời! Hiểu biết của bạn rực rỡ, ấm áp, nuôi lớn những hạt mầm xung quanh.'],
  ['ho-den', 'Hố đen', 'Bạn đã thành Hố đen tri thức! Sức hút của bạn lớn đến mức không kiến thức nào thoát ra được. Điều gì bạn chạm vào cũng được hiểu tới tận cùng.'],
  ['thien-ha', 'Thiên hà', 'Thiên hà tri thức! Hàng tỉ ngôi sao hiểu biết của bạn đã xoay thành một vũ trụ riêng. Thật phi thường!'],
  ['big-bang', 'Vụ nổ Big Bang', 'VỤ NỔ BIG BANG! Từ một điểm nhỏ ban đầu, tri thức của bạn bùng nổ thành cả một vũ trụ mới. Bạn không chỉ học nữa, bạn đang tạo ra những điều mới. Phi thường tột bậc!'],
];
const capHuyHieu = moc => Math.max(0, (S.moc_huy_hieu || []).indexOf(moc));
const tenHuyHieu = moc => CAP_SANG[capHuyHieu(moc)]?.[1] || `${moc} sao`;
async function nhanHuyHieu() {
  const moi = (S.moc_huy_hieu || []).filter(m => m <= (S.tong_sao || 0) && !(S.noe?.huy_hieu || []).includes(m));
  if (!moi.length) return [];
  await api('/api/noe', { nhan_huy_hieu: moi }); await tai();
  return moi.map(m => ({ moc: m, ten: tenHuyHieu(m) }));
}
function theHuyHieu() {
  const n = S.noe || {}, tong = S.tong_sao || 0, moc = S.moc_huy_hieu || [];
  const tiep = moc.find(m => tong < m);
  return `<section class="the"><h3>Huy hiệu thành tích</h3><p class="mo">${CAP_SANG.length} nấc ánh sáng (từ đốm sáng tới Big Bang), tính theo <b>tổng sao đã kiếm ở mọi khoá</b> (bạn có ${tong} sao). Huy hiệu là danh hiệu, không phải mua, đổi đồ rồi vẫn giữ.${tiep ? ` Còn <b>${tiep - tong} sao</b> nữa là lên nấc ${esc(tenHuyHieu(tiep))}.` : ' Bạn đã đạt nấc cao nhất!'}</p>
    <div class="ch-huy">${moc.map((m, i) => {
      const dat = (n.huy_hieu || []).includes(m) || tong >= m;
      return `<button type="button" class="ch-hh ${dat ? 'dat' : ''}" ${dat ? `data-hh="${m}"` : 'disabled'} aria-label="${esc(CAP_SANG[i][1])}, ${m} sao${dat ? ', đã đạt' : ''}"><span class="hh-hinh">${hinhHuyHieu(CAP_SANG[i][0], !dat)}</span><b>${esc(CAP_SANG[i][1])}</b><span class="mo">${m} sao</span></button>`; }).join('')}</div>
    ${oNenHuyHieu()}</section>`;
}
// Ô nền bản đồ học của các nấc cao (Hố đen, Thiên hà, Big Bang): đạt nấc thì dùng được nền đó
function oNenHuyHieu() {
  const n = S.noe || {}, tong = S.tong_sao || 0, ds = Object.entries(S.nen_huy_hieu || {});
  if (!ds.length) return '';
  return `<h4 class="hh-nen-tieu-de">Nền bản đồ học của nấc cao</h4>${ds.map(([ma, moc]) => {
    const dat = (n.huy_hieu || []).includes(moc) || tong >= moc, dang = (n.nen || '') === ma, nac = (S.moc_huy_hieu || []).indexOf(moc) + 1;
    return `<div class="ch-nen"><span class="nen-xem nen-${ma}" aria-hidden="true"></span><div><b>Nền bản đồ ${esc(TEN_NEN[ma] || ma)}</b>
      <span class="mo">${dat ? (dang ? 'Bản đồ học đang dùng nền này.' : `Bạn đã đạt nấc ${nac}, dùng được nền này.`) : `Đạt nấc ${nac} (${moc} sao) để mở khoá nền này.`}</span></div>
      ${dat ? (dang ? `<button class="nho" data-nen="">Bỏ nền</button>` : `<button class="nho chinh" data-nen="${ma}">Dùng nền này</button>`) : `<span class="ch-khoa" aria-label="Chưa mở khoá">${ic('khoa')}</span>`}</div>`;
  }).join('')}`;
}
// Nút nhỏ ở trang chủ khoá (giống nút Cửa hàng): hình nấc cao nhất đã đạt, bấm vào mới mở bảng các nấc
function nutHuyHieu() {
  const tong = S.tong_sao || 0, moc = S.moc_huy_hieu || [];
  const dat = moc.filter(m => tong >= m || (S.noe?.huy_hieu || []).includes(m)).length, tiep = moc.find(m => tong < m);
  const hinh = dat ? hinhHuyHieu(CAP_SANG[dat - 1][0]) : hinhHuyHieu(CAP_SANG[0][0], true);
  return `<button class="the cua-hang-nut huy-hieu-nut" id="xemHH"><span class="ch-bieu-tuong">${hinh}</span>
    <span class="ch-nut-chu"><b>Huy hiệu</b></span>
    <span class="ch-vi"><b>${dat}</b><span>/${CAP_SANG.length} nấc</span></span></button>`;
}
// Thẻ nhỏ trên điện thoại đang mở bằng http: mời sang bản https để dùng nút Nói (ẩn được)
function theBaoMat() {
  return ''; // đã bỏ nút Nói (24/11/2026)
  let an = false;
  try { an = localStorage.getItem('noe_an_bao_mat') === '1'; } catch { /* bỏ qua */ }
  if (isSecureContext || !S.bao_mat || an) return '';
  return `<section class="the the-bao-mat" id="theBM"><span class="tbm-ic" aria-hidden="true">${ic('mic')}</span><div><b>Trả lời bằng giọng nói</b><p class="mo">Mở bản https để dùng nút <b>Nói</b>.</p>
    <div class="hang"><button class="chinh nho" id="moBM">Mở bản bảo mật</button><button class="nho" id="anBM">Để sau</button></div></div></section>`;
}
function manHuyHieu() {
  vaoMan('huy-hieu', manHuyHieu, arguments);
  veChang('hoc');
  man.innerHTML = `${theHuyHieu()}<div class="hang"><button class="chinh" id="veNha">Về trang chủ</button></div>`;
  man.querySelectorAll('[data-hh]').forEach(b => b.onclick = () => anMungHuyHieu(+b.dataset.hh, true));
  man.querySelectorAll('[data-nen]').forEach(b => b.onclick = async () => {
    const ma = b.dataset.nen, r = await api('/api/noe', { nen: ma });
    if (!r.ok) return baoNho(r.thong_bao || 'Chưa đổi được.');
    await tai(); toast(ma ? `Bản đồ học đã đổi sang nền ${TEN_NEN[ma]}.` : 'Đã bỏ nền bản đồ.');
    const y = scrollY; manHuyHieu(); scrollTo(0, y);
  });
  $('#veNha').onclick = () => manTrangChu();
  scrollTo(0, 0);
  moiHuyHieu();
}
// Màn ăn mừng toàn màn hình khi lên nấc mới (xem lại được: bấm huy hiệu đã đạt trong cửa hàng)
function anMungHuyHieu(moc, xemLai = false) {
  return new Promise(ok => {
    const i = capHuyHieu(moc), [ma, ten, loi] = CAP_SANG[i];
    const lop = document.createElement('div');
    // Nấc càng cao càng rực rỡ: thêm hạt sáng, hào quang (từ nấc 4), tia sáng (nấc 6), sóng loé (nấc 7), Thiên hà là cả vũ trụ
    const vuTruCap = ['thien-ha', 'ho-den', 'big-bang'].includes(ma);
    const dt = Math.min(innerWidth, innerHeight) < 700; // điện thoại: ít phần tử chuyển động hơn cho mượt
    lop.className = `an-mung am-${ma} am-tang-${i + 1}${vuTruCap && ma !== 'thien-ha' ? ' am-thien-ha am-vu-tru-lon' : ''}`;
    lop.setAttribute('role', 'dialog'); lop.setAttribute('aria-modal', 'true'); lop.setAttribute('aria-label', `Huy hiệu mới: ${ten}`);
    const hat = Array.from({ length: (dt ? 10 : 16) + i * (dt ? 2 : 5) }, (_, k) => `<i style="--x:${(k * 37) % 100}%;--y:${(k * 53) % 100}%;--tre:${(k % 7) * .35}s;--co:${4 + (k % 4) * 3}px"></i>`).join('');
    const vuTru = !vuTruCap ? '' : `${ma === 'ho-den' ? `<div class="am-hut" aria-hidden="true">${Array.from({ length: dt ? 22 : 50 }, (_, k) => `<i style="--goc:${k * 37}deg;--tre:${(k % 12) * .25}s;--xa:${40 + (k * 13) % 30}vmax;--co:${2 + k % 4}px"></i>`).join('')}</div>` : ''}
      ${ma === 'big-bang' ? `<div class="am-toi" aria-hidden="true"></div><div class="am-diem" aria-hidden="true"></div><div class="am-sieu-toc" aria-hidden="true">${Array.from({ length: dt ? 12 : 50 }, (_, k) => `<i style="--goc:${(k * 137.5) % 360}deg;--tre:${1 + (k % 14) * .18}s;--dai:${40 + (k * 23) % 90}px"></i>`).join('')}</div><div class="am-thien-ha-nho" aria-hidden="true">${[[12, 18, 70, 20], [84, 14, 54, -25], [88, 70, 66, 35], [10, 78, 50, -15], [50, 8, 40, 10]].map(([x, y, w, q], k) => `<i style="--x:${x}%;--y:${y}%;--w:${w}px;--q:${q}deg;--tre:${1.6 + k * .3}s"></i>`).join('')}</div>` : ''}
      ${ma === 'big-bang' ? `<div class="am-no" aria-hidden="true">${Array.from({ length: dt ? 16 : 60 }, (_, k) => `<i style="--goc:${k * 29}deg;--tre:${.4 + (k % 10) * .05}s;--xa:${30 + (k * 17) % 45}vmax;--co:${3 + k % 5}px;--mau:${['#FF5A5F', '#FFD12E', '#4FC3F7', '#B07CFF', '#7BE495', '#FFFFFF', '#FF8DB9'][k % 7]}"></i>`).join('')}</div>` : ''}
      <div class="am-tinh-van" aria-hidden="true"></div>
      <div class="am-sao-nen" aria-hidden="true">${Array.from({ length: dt ? 24 : 70 }, (_, k) => `<i style="--x:${(k * 61 + 7) % 100}%;--y:${(k * 29 + 13) % 100}%;--tre:${(k % 9) * .4}s;--co:${1 + (k % 3)}px"></i>`).join('')}</div>
      <div class="am-sao-bang" aria-hidden="true">${[[80, 6, 0], [100, 30, 1.7], [60, 0, 3.1], [92, 52, 4.4], [40, 4, 5.6]].map(([x, y, t]) => `<i style="--x:${x}%;--y:${y}%;--tre:${t}s"></i>`).join('')}</div>`;
    const quanhHinh = '<span class="am-gon"><i></i><i style="--tre:1s"></i><i style="--tre:2s"></i></span>'
      + (ma === 'ho-den' ? `<span class="am-hd-nhip"></span>${[[.62, 5, '#FFD9A0', 0], [.78, 8, '#FF8A3D', 1], [.94, 12, '#B07CFF', 2], [.7, 6.5, '#fff', 3]].map(([r, t, m, k]) => `<span class="am-vun" style="--r:${r};--t:${t}s;--m:${m};--goc:${k * 90}deg"><i></i></span>`).join('')}` : '')
      + (ma === 'big-bang' ? '<span class="am-vong-bb"><i></i><i style="--tre:.18s"></i><i style="--tre:.36s"></i></span>' : '')
      + (i >= 3 ? '<span class="am-hao"></span>' : '') + (i >= 5 && ma !== 'mat-troi' ? '<span class="am-tia"></span>' : '')
      + (i >= 6 ? '<span class="am-song"><i></i><i style="--tre:.35s"></i><i style="--tre:.7s"></i></span>' : '')
      + (ma === 'ho-den' ? '<span class="am-dia"></span>' : '')
      + (ma === 'big-bang' ? '<span class="am-hao-quang-bb"></span>' : '')
      + (ma === 'thien-ha' || ma === 'big-bang' ? '<span class="am-xoan"></span><span class="am-quy-dao"><span><i></i></span></span><span class="am-quy-dao q2"><span><i></i></span></span>' : '');
    const bui = vuTruCap ? '' : `<div class="am-bui" aria-hidden="true">${Array.from({ length: dt ? 12 : 22 }, (_, k) => `<i style="--x:${(k * 41 + 9) % 100}%;--tre:${(k % 8) * .55}s;--t:${4 + (k % 5)}s;--co:${3 + (k % 3) * 2}px"></i>`).join('')}</div>`;
    const muaSao = ma !== 'big-bang' ? '' : `<div class="am-mua-sao" aria-hidden="true">${Array.from({ length: dt ? 3 : 9 }, (_, k) => `<i style="--x:${15 + (k * 37) % 85}%;--y:${(k * 23) % 40}%;--tre:${2 + k * .9}s"></i>`).join('')}</div>`;
    lop.innerHTML = `<div class="am-nen"></div>${vuTru}${bui}${muaSao}<div class="am-hat" aria-hidden="true">${hat}</div>${i >= 6 ? '<div class="am-loe" aria-hidden="true"></div>' : ''}${i === 0 ? '<div class="am-tho-sang" aria-hidden="true"></div>' : ''}
      <div class="am-giua"><p class="am-nhan">${xemLai ? `Huy hiệu nấc ${i + 1}/${CAP_SANG.length}` : `Lên nấc ${i + 1}/${CAP_SANG.length}!`}</p>
        <div class="am-hinh"><span class="am-bung" aria-hidden="true"></span><span class="am-quanh" aria-hidden="true">${quanhHinh}</span>${hinhHuyHieu(ma)}${ma === 'ho-den' ? '<span class="am-dia am-dia-truoc" aria-hidden="true"></span>' : ''}</div>
        <h2>${tungChu(xemLai ? ten : `Chúc mừng ${S.ho_so.ten_goi || 'bạn'} đã trở thành ${ten}!`)}</h2>
        <p class="am-moc">${ic('sao')} <b data-dem="${moc}">0</b> sao</p>
        <p>${esc(loi)}</p><span class="am-noe" aria-hidden="true">${noe('khen')}</span>
        <button class="chinh" id="amXong">${xemLai ? 'Đóng' : 'Tuyệt vời!'}</button></div>`;
    document.body.append(lop);
    const cuonCu = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'; // khóa cuộn trang cho khỏi xê dịch
    // Big Bang: chờ đốm sáng nổ xong mới tung pháo giấy của Noe
    const henNoe = setTimeout(() => lop.isConnected && noePhao(lop.querySelector('.am-giua')), ma === 'big-bang' ? 1000 : 0);
    const dungPhao = phaoGiay(lop, i);
    const dungNhac = nhacMung(i);
    if (!xemLai && navigator.userActivation?.hasBeenActive) try { navigator.vibrate?.([30, 60, 90]); } catch { /* bỏ qua */ }
    demSo(lop.querySelector('[data-dem]'), moc, 1100, 1300);
    const xong = () => { clearTimeout(henNoe); dungPhao(); dungNhac(); lop.classList.add('dong'); setTimeout(() => { lop.remove(); document.documentElement.style.overflow = cuonCu; ok(); }, 260); };
    lop.querySelector('#amXong').onclick = xong;
    lop.querySelector('#amXong').focus();
  });
}

// Tiêu đề hiện dần từng chữ (mỗi chữ một nhịp)
const tungChu = t => String(t).split(/\s+/).map((c, k) => `<span class="tu" style="--k:${k}">${esc(c)}</span>`).join(' ');
// Đếm số chạy lên tới đích
function demSo(o, dich, tre = 0, thoiGian = 1200) {
  if (!o) return;
  setTimeout(() => {
    const t0 = performance.now();
    const buoc = t => { const x = Math.min(1, (t - t0) / thoiGian), e = 1 - Math.pow(1 - x, 3); o.textContent = Math.round(dich * e).toLocaleString('vi-VN'); if (x < 1 && o.isConnected) requestAnimationFrame(buoc); };
    requestAnimationFrame(buoc);
  }, tre);
}
// Bảng màu pháo giấy theo từng nấc
const MAU_PHAO = [
  ['#FFD12E', '#FFF1A6', '#FFFFFF', '#FFB000'], ['#FFE27A', '#C8F26B', '#FFFFFF', '#7BCB5A'], ['#FFA24A', '#FFD2A6', '#FFF1A6', '#FFFFFF'],
  ['#FFD12E', '#A6D8FF', '#FFFFFF', '#3FA9FF'], ['#FF5A5F', '#FFA24A', '#FFD12E', '#FFF1A6'], ['#FFD12E', '#FFFFFF', '#FFF1A6', '#A6D8FF'],
  ['#E8EDF2', '#A6D8FF', '#FFFFFF', '#D4C6FF'], ['#FFD12E', '#FFA24A', '#FFFFFF', '#FF8DB9'], ['#FF8A3D', '#FFD9A0', '#B07CFF', '#FFFFFF', '#FFC83D'],
  ['#A07CFF', '#FF8DB9', '#7FE7FF', '#FFFFFF', '#FFD12E'], ['#FF5A5F', '#FFD12E', '#4FC3F7', '#B07CFF', '#7BE495', '#FFFFFF', '#FF8DB9'],
];
// Pháo giấy + tia sáng + pháo hoa vẽ bằng canvas. Nấc càng cao càng nhiều đợt, nấc 8–9 có pháo hoa bay lên nổ.
function phaoGiay(lop, cap) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const cv = document.createElement('canvas'); cv.className = 'am-phao'; cv.setAttribute('aria-hidden', 'true');
  lop.insertBefore(cv, lop.querySelector('.am-giua'));
  // Điện thoại vẽ yếu hơn: ít hạt hơn, không bóng sáng, độ nét thấp hơn cho khỏi giật
  const nhe = Math.min(innerWidth, innerHeight) < 700 || (navigator.hardwareConcurrency || 8) <= 4;
  const ctx = cv.getContext('2d'), dpr = nhe ? 1 : Math.min(2, devicePixelRatio || 1), mau = MAU_PHAO[cap] || MAU_PHAO[0], TOI_DA = nhe ? (cap >= 10 ? 170 : 240) : 600;
  let W = 0, H = 0, raf = 0, song = true;
  const doKich = () => { W = lop.clientWidth; H = lop.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  doKich(); addEventListener('resize', doKich);
  const ds = [], hen = [], R = Math.random, chon = a => a[Math.floor(R() * a.length)];
  const them = p => { if (ds.length < TOI_DA) ds.push(p); };
  const tam = () => { const h = lop.querySelector('.am-hinh')?.getBoundingClientRect(); return h ? [h.left + h.width / 2, h.top + h.height / 2] : [W / 2, H * .4]; };
  // nổ tròn: giấy + sao lấp lánh bay ra mọi hướng
  const no = (x, y, so, luc) => { for (let k = 0; k < so; k++) { const a = R() * Math.PI * 2, v = luc * (.35 + R() * .85);
    them({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - luc * .25, g: .1 + R() * .08, xo: R() * 6, vxo: (R() - .5) * .35, w: 5 + R() * 6, h: 8 + R() * 8, mau: chon(mau), con: 1, giam: .005 + R() * .006, kieu: R() < .28 ? 'sao' : 'giay' }); } };
  // súng bắn giấy từ hai góc dưới
  const sung = (trai, so) => { const x = trai ? 0 : W, y = H; for (let k = 0; k < so; k++) { const a = (trai ? -1 : -Math.PI) + (trai ? -1 : 1) * (R() * .5 - .1) + (trai ? 0 : 0), goc = trai ? -Math.PI / 2 + .35 + R() * .45 : -Math.PI / 2 - .35 - R() * .45, v = 13 + R() * 8;
    them({ x, y, vx: Math.cos(goc) * v, vy: Math.sin(goc) * v, g: .16 + R() * .06, xo: R() * 6, vxo: (R() - .5) * .4, w: 5 + R() * 6, h: 8 + R() * 9, mau: chon(mau), con: 1, giam: .004 + R() * .004, kieu: 'giay' }); void a; } };
  // mưa giấy nhẹ từ trên xuống
  const mua = so => { for (let k = 0; k < so; k++) them({ x: R() * W, y: -10, vx: (R() - .5) * 1.2, vy: 1 + R() * 2, g: .03, xo: R() * 6, vxo: (R() - .5) * .2, w: 4 + R() * 5, h: 7 + R() * 7, mau: chon(mau), con: 1, giam: .0025, kieu: R() < .2 ? 'sao' : 'giay' }); };
  // pháo hoa: một tia bay lên rồi nổ thành vòng tia sáng
  const phaoHoa = () => { const x = W * (.15 + R() * .7), dich = H * (.12 + R() * .3), m = chon(mau);
    them({ x, y: H + 5, vx: (R() - .5) * 1.5, vy: -(Math.sqrt(2 * .18 * (H - dich)) || 12), g: .18, con: 1, giam: 0, kieu: 'ten', mau: m, no: true }); };
  const noTia = (x, y, m) => { const so = 46 + Math.floor(R() * 24); for (let k = 0; k < so; k++) { const a = (k / so) * Math.PI * 2, v = 3.2 + R() * 1.6;
    them({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: .05, con: 1, giam: .011 + R() * .006, kieu: 'tia', mau: R() < .25 ? '#FFFFFF' : m, vet: [] }); } };
  const sao4 = (r) => { ctx.beginPath(); ctx.moveTo(0, -r); ctx.quadraticCurveTo(r * .2, -r * .2, r, 0); ctx.quadraticCurveTo(r * .2, r * .2, 0, r); ctx.quadraticCurveTo(-r * .2, r * .2, -r, 0); ctx.quadraticCurveTo(-r * .2, -r * .2, 0, -r); ctx.fill(); };
  const ve = () => {
    if (!song) return;
    ctx.clearRect(0, 0, W, H);
    for (let k = ds.length - 1; k >= 0; k--) {
      const p = ds[k];
      if (p.kieu === 'ten') { p.vy += p.g; p.x += p.vx; p.y += p.vy;
        ctx.globalAlpha = 1; ctx.fillStyle = '#FFF6C9'; ctx.shadowColor = p.mau; ctx.shadowBlur = nhe ? 0 : 14; ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
        if (p.vy >= -.5) { noTia(p.x, p.y, p.mau); ds.splice(k, 1); } continue; }
      p.vx *= .985; p.vy = p.vy * .985 + p.g; p.x += p.vx; p.y += p.vy; p.con -= p.giam;
      if (p.con <= 0 || p.y > H + 30) { ds.splice(k, 1); continue; }
      ctx.globalAlpha = Math.min(1, p.con * 1.6);
      if (p.kieu === 'tia') { p.vet.push([p.x, p.y]); if (p.vet.length > 6) p.vet.shift();
        ctx.strokeStyle = p.mau; ctx.lineWidth = 2; ctx.shadowColor = p.mau; ctx.shadowBlur = nhe ? 0 : 10; ctx.beginPath(); p.vet.forEach(([a, b], j) => j ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.stroke(); ctx.shadowBlur = 0; continue; }
      ctx.save(); ctx.translate(p.x, p.y); p.xo += p.vxo; ctx.rotate(p.xo); ctx.fillStyle = p.mau;
      if (p.kieu === 'sao') { ctx.shadowColor = p.mau; ctx.shadowBlur = nhe ? 0 : 12; sao4(4 + p.w * .5); ctx.shadowBlur = 0; }
      else ctx.fillRect(-p.w / 2, -p.h / 2 * Math.abs(Math.cos(p.xo * 1.7)), p.w, p.h * Math.abs(Math.cos(p.xo * 1.7)) + .5); // lật như giấy thật
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(ve);
  };
  raf = requestAnimationFrame(ve);
  const lui = cap >= 10 ? 420 : 0; // Big Bang: pháo bắn sau khi đốm sáng nổ
  const sau = (ms, f) => hen.push(setTimeout(() => song && f(), ms + lui));
  sau(480, () => { const [x, y] = tam(); no(x, y, 70 + cap * 22, 8 + cap * .7); });
  if (cap >= 2) sau(900, () => { sung(true, 30 + cap * 8); sung(false, 30 + cap * 8); });
  if (cap >= 4) sau(1600, () => { const [x, y] = tam(); no(x, y, 50 + cap * 10, 7 + cap * .5); });
  if (cap >= 5) for (let k = 0; k < 10; k++) sau(1800 + k * 650, () => mua(6 + cap));
  if (cap >= 7) for (let k = 0; k < (cap >= 10 ? 18 : cap >= 8 ? 9 : 4); k++) sau(1300 + k * (cap >= 10 ? 320 : cap >= 8 ? 520 : 800), phaoHoa);
  if (cap >= 10) for (let k = 0; k < 5; k++) sau(500 + k * 260, () => { const [x, y] = tam(); no(x, y, 90, 14 - k); }); // Big Bang: bùng nổ liên tiếp từ tâm
  return () => { song = false; cancelAnimationFrame(raf); hen.forEach(clearTimeout); removeEventListener('resize', doKich); };
}
// Tiếng chuông mừng tự tạo (không cần file nhạc): chuỗi nốt đi lên, nấc càng cao càng dài và lấp lánh
function nhacMung(cap) {
  let ac;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return () => {};
    ac = new AC(); const t0 = ac.currentTime + .42, tong = ac.createGain(); tong.gain.value = .09; tong.connect(ac.destination);
    const not = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093];
    const so = Math.min(not.length, 3 + Math.ceil(cap / 2));
    const chuong = (f, t, dai, kieu = 'sine', to = 1) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = kieu; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(to, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + dai); o.connect(g); g.connect(tong); o.start(t); o.stop(t + dai + .05); };
    for (let k = 0; k < so; k++) { chuong(not[k], t0 + k * .11, .9); chuong(not[k] * 2, t0 + k * .11, .5, 'triangle', .25); }
    const cuoi = t0 + so * .11 + .05; [1, 1.25, 1.5].forEach(h => chuong(not[Math.min(so, not.length - 1)] * h / 2, cuoi, 1.8, 'sine', .45)); // hợp âm kết
    if (cap >= 6) for (let k = 0; k < 8; k++) chuong(2637 + k * 220, cuoi + .2 + k * .07, .35, 'sine', .2); // lấp lánh
    if (cap >= 9) { const o = ac.createOscillator(), gg = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(cap >= 10 ? 90 : 70, t0 - .1); o.frequency.exponentialRampToValueAtTime(28, t0 + 1.2);
      gg.gain.setValueAtTime(0, t0 - .1); gg.gain.linearRampToValueAtTime(cap >= 10 ? 1.4 : .8, t0); gg.gain.exponentialRampToValueAtTime(.001, t0 + 1.4); o.connect(gg); gg.connect(tong); o.start(t0 - .1); o.stop(t0 + 1.5); } // tiếng bùm trầm
  } catch { return () => {}; }
  let daDong = false;
  const dong = () => { if (daDong || !ac) return; daDong = true; try { ac.close().catch(() => {}); } catch { /* bỏ qua */ } };
  const t = setTimeout(dong, 5000);
  return () => { clearTimeout(t); dong(); };
}

// ---------- Bộ biểu tượng riêng của app (thay emoji): phẳng, nét dày, bo tròn, cùng màu với Noe ----------
const NET = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
const ICON = {
  dung: `<path d="M5 12.5l4.5 4.5L19 7.5" ${NET} stroke-width="3.4"/>`,
  sao: `<path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.35 1.05 6.12L12 16.9l-5.5 2.87 1.05-6.12L3.1 9.3l6.15-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>`,
  khoa: `<path d="M8 10.5V8.2a4 4 0 0 1 8 0v2.3" ${NET} stroke-width="2.6"/><rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor"/><circle cx="12" cy="15.3" r="1.6" fill="var(--surface)"/>`,
  cup: `<path d="M7.5 6H5a2.6 2.6 0 0 0 3 3.6M16.5 6H19a2.6 2.6 0 0 1-3 3.6" ${NET} stroke-width="2.2"/><path d="M7 4h10v4.8a5 5 0 0 1-10 0z" fill="currentColor"/><rect x="10.6" y="13.4" width="2.8" height="3.6" fill="currentColor"/><rect x="7.6" y="17" width="8.8" height="3.2" rx="1.6" fill="currentColor"/>`,
  on: `<path d="M18.8 13a7 7 0 1 1-1.9-5.6" ${NET} stroke-width="3"/><path d="M18 3.8v4.4h-4.4" ${NET} stroke-width="3"/>`,
  cho: `<circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="18" cy="12" r="2" fill="currentColor"/>`,
  co: `<path d="M6 21V4" ${NET} stroke-width="2.6"/><path d="M6.5 4.5h11l-2.6 3.8 2.6 3.8h-11z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>`,
  dich: `<circle cx="12" cy="12" r="8.5" ${NET} stroke-width="2.6"/><circle cx="12" cy="12" r="4.6" ${NET} stroke-width="2.6"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>`,
  ghim: `<path d="M12 21.5s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0c0 5-6.5 11.2-6.5 11.2z" fill="currentColor"/><circle cx="12" cy="10.2" r="2.5" fill="var(--surface)"/>`,
  cot: `<rect x="4" y="12" width="4" height="8" rx="1.6" fill="currentColor"/><rect x="10" y="8" width="4" height="12" rx="1.6" fill="currentColor"/><rect x="16" y="4" width="4" height="16" rx="1.6" fill="currentColor"/>`,
  den: `<path d="M9 17.2h6M10 20.4h4" ${NET} stroke-width="2.4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6V16h5.6v-.6c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z" fill="currentColor"/>`,
  tron: `<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M7.6 12.3l3 3 5.8-6" fill="none" stroke="var(--surface)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  mic: `<rect x="8.4" y="2.6" width="7.2" height="12" rx="3.6" fill="currentColor"/><path d="M5.2 11.2a6.8 6.8 0 0 0 13.6 0M12 18v3.2M8.6 21.2h6.8" ${NET} stroke-width="2.4"/>`,
  lua: `<path d="M12 2.5c.6 3.2 4.8 5.2 4.8 10.2a4.8 4.8 0 0 1-9.6 0c0-2.4 1.3-3.7 2-4.6.3 1.4 1 2.3 1.8 2.6C10.6 7.8 11.4 5 12 2.5z" fill="currentColor"/>`,
  caidat: `<path d="M12 2.8l1.7 2.3 2.8-.6.6 2.8 2.3 1.7-1.2 2.6 1.2 2.6-2.3 1.7-.6 2.8-2.8-.6L12 21.2l-1.7-2.3-2.8.6-.6-2.8-2.3-1.7 1.2-2.6-1.2-2.6 2.3-1.7.6-2.8 2.8.6z" fill="currentColor"/><circle cx="12" cy="12" r="3.2" fill="var(--surface)"/>`,
  menu: `<path d="M4.5 7h15M4.5 12h15M4.5 17h15" ${NET} stroke-width="2.8"/>`,
  lich: `<rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="currentColor"/><rect x="5.6" y="10" width="12.8" height="8.4" rx="1.4" fill="var(--surface)"/><path d="M8 3v4M16 3v4" ${NET} stroke-width="2.6"/><circle cx="9" cy="13.4" r="1.2" fill="currentColor"/><circle cx="12" cy="13.4" r="1.2" fill="currentColor"/><circle cx="15" cy="13.4" r="1.2" fill="currentColor"/>`,
  bando: `<path d="M3.5 6.5l5.3-2.3 6.4 2.3 5.3-2.3v13.3l-5.3 2.3-6.4-2.3-5.3 2.3z" fill="currentColor"/><path d="M8.8 4.2v13.3M15.2 6.5v13.3" fill="none" stroke="var(--surface)" stroke-width="1.6"/>`,
};
const ic = (ten, lop = '') => `<svg class="ic ${lop}" viewBox="0 0 24 24" aria-hidden="true">${ICON[ten] || ''}</svg>`;

// Sao trên đầu mỗi buổi đã học: luôn 5 sao, sáng theo điểm kiểm tra tốt nhất (đúng 3/5 câu → 3 sao sáng; 5/5 → sáng đủ 5)
function saoBuoi(ma) {
  const d = ketQuaTot(ma).diem;
  return d && d.tong ? Math.round(d.diem / d.tong * 5) : null; // bỏ qua kiểm tra thì chưa có sao
}
const saoOnBuoi = ma => Math.max(0, ...(S.tien_do.buoi_da_hoc || []).filter(x => x.ma === ma).map(x => +x.sao_on || 0));
const veSao = (sao, on = 0) => sao === null ? '' : `<span class="bd-sao" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => ic('sao', i <= sao ? 'sang' : '')).join('')}${on ? `<span class="bd-sao-on">+${on}${ic('sao')}</span>` : ''}</span>`;
function banDoHoc() {
  const lt = S.lo_trinh; if (!lt?.chang) return '';
  const tiep = buoiTiepTheo(), mt = S.tien_do.module || {};
  let k = 0, so = 0;
  // Noe đứng phía đối diện chấm vừa vẽ (chấm lệch phải thì Noe bên trái và ngược lại)
  const noeCanhDuong = tam => { const p = LECH[(k - 1) % 8]; return `<div class="bd-noe" style="--lech:${p >= 0 ? p - 145 : p + 145}px" aria-hidden="true">${noe(tam)}</div>`; };
  // Mỗi buổi một số thứ tự 1, 2, 3… liên tục từ đầu tới hết lộ trình (cúp thực hành cuối module không đánh số)
  const nut = (lop, data, nhan, chu, them = '', danhSo = true) => { const s = danhSo ? ++so : 0;
    return `<div class="bd-o" style="--lech:${LECH[k++ % 8]}px">${them}<button class="bd-nut ${lop}" ${data} aria-label="${esc(s ? `Buổi ${s}: ${nhan}` : nhan)}" title="${esc(s ? `Buổi ${s}: ${nhan}` : nhan)}">${chu}${s ? `<span class="bd-so" aria-hidden="true">${s}</span>` : ''}</button></div>`; };
  const chang = lt.chang.map((c, ci) => {
    const mods = c.module || [];
    const coHoc = mods.some(m => (m.buoi || []).some(b => daHoc(b.ma)));
    const coTiep = mods.some(m => m === tiep.m || m === tiep.canSoan);
    const xong = mods.length && mods.every(m => (m.buoi || []).length && m.buoi.every(b => daHoc(b.ma)));
    const dau = `<div class="bd-chang ${xong ? 'xong' : ''}"><span class="nhan">Chặng ${ci + 1}${xong ? ' · xong' : ''}</span><h3>${esc(String(c.ten).replace(/^Chặng\s*\d+\s*:\s*/i, ''))}</h3>${c.xong_khi ? `<div class="bd-sp">${ic('co')}<p class="mo">${esc(c.xong_khi)}</p></div>` : ''}${nutDoChang(c, ci)}</div>`;
    const tongB = mods.reduce((s, m) => s + soBuoiModule(m), 0);
    const than = mods.map((m, mi) => {
      const o = [];
      // Module chưa soạn danh sách buổi: vẽ đủ số chấm dự kiến (đánh số luôn), Noe đang soạn ngầm hoặc soạn khi học tới
      if (!(m.buoi || []).length) for (let i = 0; i < soBuoiModule(m); i++) o.push(nut(`cho-soan${tiep.canSoan === m && !i ? ' tiep-soan' : ''}`, `data-cho-soan="${esc(m.ma)}"`, `${m.ten}: Noe đang soạn`, ic('cho')));
      for (const b of m.buoi || []) {
        const da = daHoc(b.ma), laTiep = tiep.b === b, on = /-on\d+$/.test(b.ma);
        if (da) { const sao = saoBuoi(b.ma); o.push(nut(`xong${on ? ' on' : ''}`, `data-da="${esc(b.ma)}"`, `${b.ten} (đã học${sao === null ? '' : `, ${sao}/5 sao`})`, on ? ic('on') : ic('dung'), veSao(sao, saoOnBuoi(b.ma)))); }
        else if (laTiep) o.push(nut('tiep', 'data-tiep="1"', `${b.ten} (tiếp theo)`, ic('sao'), `<span class="bd-bong">Tiếp theo<br><b>${esc(String(b.ten).replace(/^Buổi\s*\d+\s*:\s*/i, ''))}</b></span>`));
        else o.push(nut(`khoa${on ? ' on' : ''}`, `data-khoa="${esc(b.ma)}"`, `${b.ten} (chưa tới)`, on ? ic('on') : ic('khoa')));
        // Noe đứng ở chỗ trống bên cạnh đường: cạnh buổi tiếp theo thì vẫy chào, chỗ khác mỗi chỗ một biểu cảm
        if (laTiep) o.push(noeCanhDuong('chao'));
        else if (k % 4 === 2) o.push(noeCanhDuong(da ? ['khen', 'vui'][Math.floor(k / 4) % 2] : ['suy-nghi', 'ngac-nhien', 'vui'][Math.floor(k / 4) % 3]));
      }
      if (m.thuc_hanh) o.push(nut(`cup ${mt[m.ma]?.lam_that ? 'xong' : ''}`, `data-cup="${esc(m.ma)}"`, `Thực hành cuối ${m.ten}`, ic('cup'), '', false));
      // Module nào chưa có Noe thì thêm một Noe cạnh đường, đổi biểu cảm theo module
      if (!o.some(x => x.includes('bd-noe'))) o.push(noeCanhDuong(['vui', 'suy-nghi', 'khen', 'ngac-nhien', 'chao'][(ci * 3 + mi) % 5]));
      return `<div class="bd-module">${esc(m.ten)}</div><div class="bd-duong">${o.join('')}</div>`;
    }).join('');
    // Chặng chưa tới: gấp gọn
    if (!coHoc && !coTiep && !xong) return `<details class="bd-gap">${dau.replace('<div class="bd-chang', '<summary class="bd-chang khoa').replace(/<\/div>$/, `<p class="mo">${mods.length} module · khoảng ${tongB} buổi</p></summary>`)}${than}</details>`;
    return dau + than;
  }).join('') + nutDoCuoi(lt); // học hết lộ trình: bài đo cuối theo Hợp đồng đầu ra (chat-luong.js)
  return `<section class="ban-do the ${S.noe?.nen ? `nen-${S.noe.nen}` : ''}" aria-label="Bản đồ học"><h3>Bản đồ học của bạn${S.nen_huy_hieu?.[S.noe?.nen] ? `<span class="bd-huy bd-huy-${S.noe.nen}">${hinhHuyHieu(S.noe.nen)}Nấc ${(S.moc_huy_hieu || []).indexOf(S.nen_huy_hieu[S.noe.nen]) + 1}</span>` : ''}</h3>${chang}</section>`;
}
// Hồ sơ học: quay lại xem, sửa Mục đích và Đang ở đâu bất cứ lúc nào (không mất tiến độ)
function theHoSo() {
  const h = S.ho_so, md = (h.muc_dich || [h.muc_tieu]).filter(Boolean);
  return `<div class="the ho-so"><h3>Hồ sơ học của tôi</h3>
    <div class="ho-so-luoi">
      <button class="ho-so-nut" id="xemMD"><span class="ho-so-icon" aria-hidden="true">${ic('dich')}</span><b>Mục đích</b><span class="mo">${esc(h.linh_vuc || '')}${md[0] ? ` · ${esc(md[0])}` : ''}</span></button>
      <button class="ho-so-nut" id="xemDOD"><span class="ho-so-icon" aria-hidden="true">${ic('ghim')}</span><b>Đang ở đâu</b><span class="mo">${S.dau_vao?.tom_tat ? esc(S.dau_vao.tom_tat.split('.')[0]) : 'Xem, sửa điểm xuất phát'}</span></button>
    </div></div>`;
}
function ganBanDoHoc() {
  const bd = man.querySelector('.ban-do'); if (!bd) return;
  bd.onclick = async e => {
    const dc = e.target.closest('[data-do-chang]'); if (dc) return doCuoiChang(+dc.dataset.doChang);
    if (e.target.closest('[data-do-cuoi]')) return doCuoiLoTrinh();
    const n = e.target.closest('.bd-nut'); if (!n) return;
    if (n.dataset.tiep) return manHomNay();
    if (n.dataset.da) {
      const { b, m } = timBuoi(n.dataset.da), t = ketQuaTot(n.dataset.da);
      const c = await hopChon(noi('khen', `<b>${esc(b?.ten || n.dataset.da)}</b><p class="mo">${esc(m?.ten || '')}</p>
        <p>Học ngày ${esc(t.ngay || '')}${t.diem ? ` · tốt nhất <b>${t.diem.diem}/${t.diem.tong}</b> câu` : ''}${t.soLai ? ` · đã học lại ${t.soLai} lần` : ''}</p>
        ${t.muc ? `<span class="nhan ${MUC_TK[t.muc][1]}">${MUC_TK[t.muc][0]}</span>` : ''}<p class="mo">Học lại thì Noe ra câu hỏi mới: đúng thêm câu nào được thêm sao câu đó (tối đa 5 sao mỗi buổi).</p>`), ['Học lại', 'Đóng']);
      if (c === 0 && b) buoiHoc(b, m, true);
      return;
    }
    if (n.dataset.khoa) { const { b } = timBuoi(n.dataset.khoa); return hopChon(noi('vui', `<b>${esc(b?.ten || '')}</b><p>Học xong các buổi trước là mở được buổi này nha.</p>`), ['Được']); }
    if (n.dataset.choSoan) return n.classList.contains('tiep-soan') ? manHomNay() : hopChon(noi('suy-nghi', `<b>Module này Noe đang soạn.</b><p>${noiTuDong() ? 'Noe soạn ngầm các buổi ở máy chủ, xong là hiện lên bản đồ.' : 'Khi bạn học tới đây, Noe sẽ nhờ AI soạn các buổi theo đúng nhịp học của bạn.'}</p>`), ['Được']);
    if (n.dataset.cup) {
      const m = cacModule(S.lo_trinh).find(x => x.ma === n.dataset.cup), mt = S.tien_do.module || {};
      const xong = (m.buoi || []).length && m.buoi.every(b => daHoc(b.ma));
      if (mt[m.ma]?.lam_that) return hopChon(noi('khen', `<b>Đã làm xong thực hành!</b><p>${esc(m.thuc_hanh)}</p>`), ['Được']);
      if (!xong) return hopChon(noi('vui', `<b>Thực hành cuối module</b><p>${esc(m.thuc_hanh)}</p><p class="mo">Học xong các buổi của module này rồi làm bài này nha.</p>`), ['Được']);
      return nopThucHanh(m);
    }
  };
}

// ---------- Trang chủ ----------
// Biểu tượng cửa hàng: vẽ phẳng, mái hiên sọc lượn sóng, bảng hiệu ngôi sao (cùng phong cách Noe)
const HINH_CUA_HANG = `<svg class="hinh-ch" viewBox="0 0 64 64" aria-hidden="true">
  <path d="M10 28h44v26a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#14A38B"/><path d="M40 28h14v26a4 4 0 0 1-4 4H40z" fill="#0D7F6B"/>
  <rect x="17" y="38" width="13" height="20" rx="3" fill="#FFF4D6"/><circle cx="27" cy="48" r="1.6" fill="#D98E00"/>
  <rect x="35" y="37" width="13" height="10" rx="3" fill="#BDE3FF"/><path d="M37 39l4 0" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  <path d="M8 16h48l4 12H4z" fill="#FF5A5F"/>
  <path d="M4 28q0 5 5 5t5-5q0 5 5 5t5-5q0 5 5 5t5-5q0 5 5 5t5-5q0 5 5 5t5-5q0 5 5 5t4-5z" fill="#FF5A5F"/>
  <path d="M15 16l-3 12h10l1-12zM31 16v12h10l-2-12z" fill="#fff"/><path d="M14 28q0 5 5 5t5-5zM34 28q0 5 5 5t5-5z" fill="#fff"/>
  <rect x="20" y="4" width="24" height="12" rx="4" fill="#FFC93C"/><path d="M32 6.2l1.4 2.8 3 .4-2.2 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.2-2.1 3-.4z" fill="#fff"/>
</svg>`;
// Danh sách khoá học đang học: hiện ở trang chính và trang chủ khoá để thấy rõ, bấm là chuyển khoá
function theKhoaHoc(oTrangChinh = false) {
  const ds = (S.khoa_tom_tat || []).filter(x => x.ten);
  if (!ds.length) return '';
  const the = x => {
    const pt = x.tong ? Math.min(100, Math.round(x.da / x.tong * 100)) : 0;
    return `<button type="button" class="kh-the ${x.hien_tai ? 'dang' : ''}" data-mo-khoa="${esc(x.ma)}" aria-pressed="${x.hien_tai}">
      <span class="kh-ten">${esc(x.ten)}</span>
      <span class="mo">${x.dang_hoc ? `${x.da}/${x.tong} buổi${x.cap ? ` · ${esc(tenCap(x.cap))}` : ''}` : 'Đang tạo khoá'}</span>
      <span class="thanh"><i style="width:${pt}%"></i></span>
      ${x.hien_tai && !oTrangChinh ? '<span class="nhan">Đang học</span>' : ''}</button>`;
  };
  return `<section class="kh-ds" aria-label="Khoá học của bạn"><h3>${oTrangChinh ? 'Khoá học của bạn' : 'Các khoá đang học'}</h3>
    <div class="kh-hang">${ds.map(the).join('')}<button type="button" class="kh-the kh-moi" id="khMoi"><span class="kh-cong" aria-hidden="true">+</span><span class="kh-ten">Khoá mới</span><span class="mo">Học thêm môn khác</span></button></div></section>`;
}
function ganKhoaHoc(oTrangChinh = false) {
  man.querySelectorAll('[data-mo-khoa]').forEach(b => b.onclick = async () => {
    const ma = b.dataset.moKhoa;
    if (ma === S.khoa_hoc?.hien_tai) { if (oTrangChinh) { document.body.classList.remove('gioi-thieu'); return dieuHuong(); } return; }
    if (await moKhoa(ma)) { toast(`Đang học: ${(S.khoa_tom_tat || []).find(x => x.ma === ma)?.ten || ''}`); document.body.classList.remove('gioi-thieu'); dieuHuong(); }
  });
  if ($('#khMoi')) $('#khMoi').onclick = batDauKhoaMoi;
}
// Bấm Học tiếp: cuộn tới đúng buổi đang học trên bản đồ và làm nổi bật buổi đó
function cuonToiBuoiTiep() {
  const n = man.querySelector('.bd-nut.tiep, .bd-nut.tiep-soan');
  if (!n) return false;
  const o = n.closest('.bd-o');
  o.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  o.classList.remove('noi-bat'); void o.offsetWidth; o.classList.add('noi-bat');
  setTimeout(() => n.focus({ preventScroll: true }), 600);
  return true;
}
let menuKhoaMo = false; // menu Cấp độ, lộ trình, nhắc lịch ở trang chủ: nhớ đang mở hay gấp khi vẽ lại
function manTrangChu(tuyChon = {}) {
  vaoMan('trang-chu', manTrangChu, []);
  veChang('hoc');
  const lt = S.lo_trinh, den = (S.tien_do.lich_on || []).filter(x => x.han_on <= NGAY()).length;
  const h = new Date().getHours();
  // Bố cục (theo ý chủ dự án): tên khoá + 3 cấp → bản đồ học (thứ để nhìn biết đang tới đâu) → dải số liệu ngang → hồ sơ
  const capDang = lt?.cap_do || S.ho_so.cap_do, lt3 = S.lo_trinh_3 || {};
  // Bố cục 24/11/2026 (anh dặn): Cài đặt AI lên trên cùng; 3 cấp + Xem lộ trình + Nhắc lịch gom vào một menu gấp, đặt trên Cửa hàng
  man.innerHTML = `
    <section class="khoa-dau">
      ${S.ban_web ? '' : '<div class="khoa-tren"><button id="dt" class="nho">Mở trên điện thoại</button></div>'}
      <div class="khoa-ten"><span class="noe-mini" aria-hidden="true">${noeCanh(h)}</span><div><p class="mo">${gioChao()}${goiTen()}!${den ? ` Có ${den} câu đến hạn ôn.` : ''}</p><h1>Học ${esc(S.ho_so.linh_vuc || lt?.ten || '')}</h1></div></div>
      <div class="hang nut-khoa"><button class="chinh" id="hocTiep">Học tiếp</button></div>
    </section>
    ${theKhoaHoc()}
    ${theLich()}
    <details class="the menu-khoa" id="menuKhoa" ${menuKhoaMo ? 'open' : ''}>
      <summary>${ic('menu')}<b>Cấp độ, lộ trình, nhắc lịch</b><span class="nhan">${esc(tenCap(capDang))}</span></summary>
      <div class="menu-than">
        <div class="cap-tab" role="group" aria-label="Cấp độ">${CAP.map(c => `<button data-cap="${c[0]}" aria-pressed="${capDang === c[0]}" ${lt3[KHOA_LT[c[0]]] ? '' : 'disabled'}><b>${c[1]}</b><span>${c[2]}</span></button>`).join('')}</div>
        <div class="hang menu-nut"><button id="xemLT">${ic('bando')}<span>Xem lộ trình</span></button><button id="lich">${ic('lich')}<span>Nhắc lịch</span></button></div>
      </div>
    </details>
    <div class="hang-ch">
      <button class="the cua-hang-nut" id="xemCH"><span class="ch-bieu-tuong">${HINH_CUA_HANG}</span>
        <span class="ch-nut-chu"><b>Cửa hàng</b></span>
        <span class="ch-vi">${ic('sao')}<b>${saoCon()}</b><span>sao</span></span></button>
      ${nutHuyHieu()}
    </div>
    ${theBaoMat()}
    ${banDoHoc()}
    ${thanhSoLieu()}
    ${theHoSo()}`;
  const mk = $('#menuKhoa'); mk.ontoggle = () => { menuKhoaMo = mk.open; };
  $('#hocTiep').onclick = () => { if (!cuonToiBuoiTiep()) manHomNay(); };
  ganKhoaHoc();
  if (tuyChon.cuon) setTimeout(cuonToiBuoiTiep, 250);
  chuanBiNgam().catch(() => {});
  $('#xemHH').onclick = manHuyHieu;
  if ($('#moBM')) {
    $('#moBM').onclick = () => moBanBaoMat('Mở Noe bằng bản bảo mật (https) để trả lời bằng giọng nói.');
    $('#anBM').onclick = () => { try { localStorage.setItem('noe_an_bao_mat', '1'); } catch { /* bỏ qua */ } $('#theBM').remove(); };
  }
  moiHuyHieu();
  man.querySelectorAll('.cap-tab [data-cap]').forEach(b => b.onclick = async () => {
    const cap = b.dataset.cap;
    if (cap === capDang) return;
    const c = await hopChon(noi('suy-nghi', `<b>Chuyển sang cấp ${esc(tenCap(cap))}?</b><p>Tiến độ của mỗi cấp được giữ riêng, bạn đổi lại lúc nào cũng được.</p>`), ['Chuyển cấp', 'Thôi']);
    if (c !== 0) return;
    await chonCap(cap);
    chuanBiNgam().catch(() => {});
    toast(`Đang học cấp ${tenCap(cap)}.`);
    manTrangChu();
  });
  ganBanDoHoc();
  $('#xemMD').onclick = () => manMucDich();
  $('#xemDOD').onclick = () => manDangODau();
  $('#xemCH').onclick = manCuaHang;
  man.querySelector('.sl-o.bam-duoc')?.addEventListener('click', manCuaHang);
  $('#xemLT').onclick = () => manLoTrinh();
  $('#lich').onclick = () => manLich();
  ganTheLich();
  tuDoiLichGoogle().catch(() => {});
  if ($('#dt')) $('#dt').onclick = manDienThoai;
}


// ---------- Ảnh đại diện của học viên (anh dặn 24/11/2026) ----------
window.ANH_DD = null;
async function napAnhDaiDien() {
  try { window.ANH_DD = (await api('/api/anh-dai-dien')).anh || null; } catch { window.ANH_DD = null; }
  veAnhTrenNut();
}
function veAnhTrenNut() {
  const b = $('#nutCaiDat'); if (!b) return;
  b.querySelector('.anh-dd-nho')?.remove();
  if (window.ANH_DD) b.insertAdjacentHTML('beforeend', `<img class="anh-dd-nho" src="${esc(window.ANH_DD)}" alt="">`);
}
// Thu nhỏ ảnh trên máy (cắt giữa thành hình vuông 256x256, JPEG) rồi mới gửi: ảnh điện thoại vài MB thành khoảng 20–40 KB
function thuNhoAnh(tep) {
  return new Promise((ok, loi) => {
    if (!tep || !/^image\//.test(tep.type)) return loi(new Error('khong-phai-anh'));
    const url = URL.createObjectURL(tep), img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'), n = 256; c.width = n; c.height = n;
      const canh = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext('2d').drawImage(img, (img.naturalWidth - canh) / 2, (img.naturalHeight - canh) / 2, canh, canh, 0, 0, n, n);
      URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); loi(new Error('khong-doc-duoc')); };
    img.src = url;
  });
}
function hinhDaiDien(lop = 'anh-dd') {
  const ten = (window.TAI_KHOAN?.ten || S.ho_so?.ten_goi || '').trim();
  return window.ANH_DD ? `<img class="${lop}" src="${esc(window.ANH_DD)}" alt="Ảnh đại diện">`
    : `<span class="${lop} anh-dd-chu" aria-hidden="true">${esc((ten || '?').charAt(0).toUpperCase())}</span>`;
}

// ---------- Màn Cài đặt (anh dặn 24/11/2026): gom AI, giao diện, ngôn ngữ, tài khoản, dữ liệu, quản trị vào một chỗ ----------
function manCaiDat() {
  vaoMan('cai-dat', manCaiDat, []);
  const a = S.ai || {}, tk = window.TAI_KHOAN, g = giaoDienDangDung(), n = ngonNguGT();
  const mienPhi = S.ban_web && a.cach_noi === 'noe' && a.mien_phi ? `<p class="mo">AI miễn phí hôm nay: đã dùng ${+a.mien_phi.da_dung_phan_tram || 0}%. 7 giờ sáng mỗi ngày có lại.</p>` : '';
  const cauNoi = S.ban_web && a.cach_noi === 'claude-code' ? `<p class="mo">Cầu nối Claude Code: <b>${a.cau_noi?.dang_bat ? 'đang nối' : 'đang tắt'}</b></p>` : '';
  const daDangNhap = !!(S.ban_web && tk && tk.da_dang_nhap); // tài khoản, dữ liệu, quản trị: chỉ bản web
  man.innerHTML = `
    ${noi('vui', '<h1>Cài đặt</h1>')}
    <section class="the cd-muc cd-anh"><h3>Ảnh đại diện</h3>
      <div class="hang">${hinhDaiDien()}<label class="nut-chon-anh" for="cdChonAnh" tabindex="0" role="button">Chọn ảnh</label><input type="file" id="cdChonAnh" accept="image/*" hidden>${window.ANH_DD ? '<button type="button" id="cdBoAnh" class="nho">Bỏ ảnh</button>' : ''}</div></section>
    <section class="the cd-muc"><h3>${ic('caidat')}AI đang dùng</h3>
      <p><b>${esc(TEN_CACH[a.cach_noi] || 'Chưa nối AI')}</b></p>${mienPhi}${cauNoi}
      <div class="hang"><button class="chinh" id="cdAI">Đổi AI</button></div></section>
    <section class="the cd-muc"><h3>Giao diện và ngôn ngữ</h3>
      <div class="hang"><span class="chon-gd" role="group" aria-label="Giao diện">
        <button type="button" data-cd-gd="trang" aria-pressed="${g === 'trang'}"><span aria-hidden="true">☀️</span> Nền trắng</button>
        <button type="button" data-cd-gd="den" aria-pressed="${g === 'den'}"><span aria-hidden="true">🌙</span> Nền đen</button></span>
      <label class="chon-nn"><span aria-hidden="true">🌐</span> <select id="cdNN" aria-label="Ngôn ngữ hiển thị">${NGON_NGU_GT.map(([m, t]) => `<option value="${m}" ${m === n ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div></section>
    ${daDangNhap ? `<section class="the cd-muc"><h3>Tài khoản</h3>
      <p><b>${esc(tk.ten || 'Bạn')}</b><br><span class="mo">${esc(tk.email || '')}</span></p>
      <div class="hang"><button id="cdDangXuat">Đăng xuất</button></div></section>
    <section class="the cd-muc"><h3>Dữ liệu</h3>
      <div class="hang"><button id="cdTai">Tải dữ liệu của tôi</button>${(S.khoa_tom_tat || []).some(x => x.ten) ? '<button id="cdXoaKhoa">Xoá một khoá học…</button>' : ''}</div>
      <p class="xoa-tk"><button type="button" id="cdXoaTk">Xoá tài khoản</button></p></section>
    ${tk.quan_tri ? '<section class="the cd-muc"><h3>Quản trị</h3><div class="hang"><button id="cdQT">Trang quản trị</button></div></section>' : ''}` : ''}
    ${S.ban_web ? '' : '<section class="the cd-muc"><h3>Điện thoại</h3><div class="hang"><button id="cdDT">Mở trên điện thoại</button></div></section>'}
    <div class="hang"><button class="chinh" id="cdXong">Xong</button></div>`;
  $('#cdAI').onclick = () => manNoiAI(true);
  man.querySelector('.nut-chon-anh').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#cdChonAnh').click(); } };
  $('#cdChonAnh').onchange = async e => {
    const tep = e.target.files?.[0]; if (!tep) return;
    let anh; try { anh = await thuNhoAnh(tep); } catch { return baoNho('Chưa đọc được ảnh này, bạn chọn ảnh khác nhé.'); }
    const r = await api('/api/anh-dai-dien', { anh }).catch(() => ({}));
    if (!r.ok) return baoNho(r.thong_bao || 'Chưa lưu được ảnh, thử lại nhé.');
    window.ANH_DD = anh; veAnhTrenNut(); toast('Đã đổi ảnh đại diện.'); manCaiDat();
  };
  if ($('#cdBoAnh')) $('#cdBoAnh').onclick = async () => { await api('/api/anh-dai-dien', { anh: null }).catch(() => null); window.ANH_DD = null; veAnhTrenNut(); manCaiDat(); };
  man.querySelectorAll('[data-cd-gd]').forEach(b => b.onclick = () => { datGiaoDien(b.dataset.cdGd); manCaiDat(); });
  $('#cdNN').onchange = async e => { await doiNgonNgu(e.target.value); location.reload(); };
  if ($('#cdDangXuat')) $('#cdDangXuat').onclick = () => dangXuat();
  if ($('#cdTai')) $('#cdTai').onclick = () => { location.href = '/api/du-lieu/tai-ve'; };
  if ($('#cdXoaKhoa')) $('#cdXoaKhoa').onclick = () => xoaMotKhoa(() => manCaiDat());
  if ($('#cdXoaTk')) $('#cdXoaTk').onclick = () => xoaTaiKhoan();
  if ($('#cdQT')) $('#cdQT').onclick = () => { location.href = '/quan-tri'; };
  if ($('#cdDT')) $('#cdDT').onclick = manDienThoai;
  $('#cdXong').onclick = () => (S.lo_trinh?.trang_thai === 'da-duyet' ? manTrangChu() : dieuHuong());
  scrollTo(0, 0);
}

// ---------- Học mỗi ngày ----------
function md(t) {
  return esc(t || '').split(/\n{2,}/).map(k => {
    const d = k.split('\n');
    if (d.every(x => /^\s*[-*] /.test(x))) return `<ul>${d.map(x => `<li>${x.replace(/^\s*[-*] /, '')}</li>`).join('')}</ul>`;
    return `<p>${d.join('<br>')}</p>`;
  }).join('').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}
const onDenHan = () => (S.tien_do.lich_on || []).filter(x => x.han_on <= NGAY());
const daHoc = ma => (S.tien_do.buoi_da_hoc || []).some(x => x.ma === ma);
function buoiTiepTheo() {
  for (const m of cacModule(S.lo_trinh)) {
    if (!(m.buoi || []).length) return { canSoan: m };
    const b = m.buoi.find(x => !daHoc(x.ma));
    if (b) return { b, m };
  }
  return {};
}

// ---------- Soạn bài: lời dặn AI dùng chung cho soạn trực tiếp và soạn ngầm ở máy chủ ----------
const noiTuDong = () => !!S.ai.cach_noi && S.ai.cach_noi !== 'sao-chep';
function loiDanModule(m) {
  const ds = nguonDung().map(n => `- ${n.ma}: ${n.ten} (${n.ai_lam}) ${n.link}`).join('\n');
  const so = soBuoiModule(m);
  return `Soạn danh sách buổi học cho một module trong app "Học cùng Noe".${ngonNgu()}

Người học:
${moTaNguoiHoc()}

Lộ trình: ${S.lo_trinh.ten} (mức ${tenCap(S.lo_trinh.cap_do)})
Module: ${m.ten} · mã ${m.ma}
Đầu ra module: ${m.dau_ra}
Thực hành cuối module: ${m.thuc_hanh || ''}
Số buổi: khoảng ${so}. Mỗi buổi là MỘT bài ngắn, học trong vài phút (đọc vài ý chính, làm thử, kiểm tra 5 câu).
Nguồn đã kiểm (chỉ dùng các mã này):
${ds}
Cách chia buổi (docs/quy-trinh-len-lo-trinh.md):
- Mỗi buổi 2–4 ý mới. Ý nền trước, ý khó sau.
- "muc_tieu" viết bằng động từ đo được (giải thích, dùng ... để ..., tự làm ...).
- "loi_ich": MỘT câu ngắn nói học xong buổi này người học được lợi gì, gần với mục đích của họ.
- Buổi đầu module có một việc người học làm được ngay (thắng sớm). Buổi cuối gom lại để làm bài thực hành của module.
- Đổi nhịp giữa các buổi: đọc, xem, làm, nói, viết; không 3 buổi liền cùng một kiểu.
${(S.tien_do.buoi_da_hoc || []).length ? `- Từ module thứ 2: mỗi buổi gợi lại một ý của module trước (học xen kẽ).\n` : ''}${(+S.tien_do.nhip || 0) > 0 ? '- Người học đã đồng ý nâng mức: mỗi buổi dày hơn, có thể ít buổi hơn số dự kiến.\n' : (+S.tien_do.nhip || 0) < 0 ? '- Người học đã đồng ý hạ mức: mỗi buổi ít ý hơn, có thể thêm 1 buổi so với dự kiến.\n' : ''}Mã buổi: "${m.ma}-b1", "${m.ma}-b2"...
Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"buoi":[{"ma":"${m.ma}-b1","ten":"Buổi 1: ...","muc_tieu":"...","loi_ich":"...","nguon":["N1"]}]}
\`\`\``;
}
async function soanModule(m) {
  const dl = await hoiJSON(loiDanModule(m), { viec: `soạn các buổi cho ${m.ten}` }, d => Array.isArray(d.buoi) && d.buoi.length > 0);
  const hop = new Set(nguonDung().map(n => n.ma));
  const buoi = (dl.buoi || []).filter(b => b.ma && b.ten).map(b => ({ ...b, nguon: (b.nguon || []).filter(x => hop.has(x)) }));
  if (!buoi.length) throw new Error('mau');
  m.buoi = buoi;
  await api('/api/lo-trinh', S.lo_trinh); await tai();
}
// Lời dặn soạn MỘT buổi. mau = true: để trống tên buổi, mục tiêu, nguồn ({{...}}) cho máy chủ điền sau khi soạn xong module.
function loiDanBai(b, m, mau = false) {
  const tatCaCau = S._cauHoi || {};
  const nguon = Object.fromEntries((S.nguon?.nguon || []).map(n => [n.ma, n]));
  const ds = mau ? '{{NGUON}}' : (b.nguon || []).concat(m?.nguon || []).filter((x, i, a) => nguon[x] && a.indexOf(x) === i).map(x => `- ${x}: ${nguon[x].ten} (${nguon[x].ai_lam}) ${nguon[x].link}`).join('\n');
  return `Bạn là giáo viên trong app "Học cùng Noe". Hãy soạn MỘT buổi học ngắn (người học học trong vài phút).${ngonNgu()}

Người học:
${moTaNguoiHoc()}

Buổi học: ${mau ? '{{TEN_BUOI}}' : b.ten}
Mục tiêu buổi: ${mau ? '{{MUC_TIEU}}' : b.muc_tieu || ''}
Thuộc module: ${m?.ten || ''} (đầu ra: ${m?.dau_ra || ''})
Mức học: ${tenCap(S.lo_trinh.cap_do)} (Sơ cấp: câu ngắn, ví dụ đời thường, đủ để xài được; Trung cấp: có thực hành, xài tốt; Chuyên sâu: đi tới gốc, thuật ngữ chuẩn, cấp chuyên gia)
Nguồn tham khảo (chỉ các mã này):
${ds || '(không có)'}

${camNhanGanDay(tatCaCau)}
Cách soạn (docs/quy-trinh-len-lo-trinh.md, bước 6–8 và quy tắc chống nhàm chán):
- ÍT CHỮ, DỄ HIỂU. Chia bài thành 2–4 Ý CHÍNH rõ ràng; mỗi ý một tiêu đề ngắn và 1–3 câu ngắn (mỗi câu dưới 20 chữ), thêm một ví dụ đời thường nếu cần. Không viết đoạn dài.
- "nguyen_ly": 1–2 NGUYÊN LÝ quan trọng nhất của buổi (điều cần nhớ mãi, dùng được ở nhiều chỗ), mỗi nguyên lý 1–2 câu. App đóng khung cho nổi bật.
- "mo_dau": MỘT tình huống hoặc câu hỏi thật người học có thể gặp (gần với mục đích, công việc của họ), 1–2 câu. Không mở bằng định nghĩa.
- "loi_ich": MỘT câu nói học xong buổi này người học được lợi gì.
- "tom_tat": 3–5 gạch đầu dòng, phần QUAN TRỌNG NHẤT để nhớ, mỗi dòng dưới 15 chữ.
- "dao_sau": cho ai muốn hiểu kỹ: giải thích đầy đủ hơn, gạch đầu dòng bằng '- ', chữ đậm bằng **...**.
- Ý khó: có ví dụ giải sẵn từng bước trước, rồi mới cho tự làm. Bài làm thử "hơi quá sức một chút": làm được khi có gợi ý.
- ${giongNoe()}

Luật:
- TỰ VIẾT bằng lời mới. Không chép câu chữ, hình, đề của nguồn. Ý nào lấy từ nguồn thì ghi mã, ví dụ (N2). Không chắc thì ghi (chưa xác minh). Không bịa số liệu.
- LÀM THỬ (để áp dụng ngay trong app, người học không phải gõ dài):
  + "trac_nghiem": 2–3 câu trắc nghiệm TÌNH HUỐNG (áp dụng bài vào một việc cụ thể), mỗi câu 3 lựa chọn, đề dưới 30 chữ, giải thích ngắn.
  + "de": MỘT câu tự luận ngắn, trả lời được trong 1–2 câu (dưới 30 chữ). KHÔNG giao việc dài phải làm ngoài app (việc đó để ở bài thực hành cuối module).
  + Mục tiêu buổi là NÓI hoặc LÀM trên thiết bị: "viec_that" là một việc làm thật 1–3 phút ngay trong buổi (nói to và ghi âm 3 câu, gõ một số tiền thật vào bảng...), kèm "bang_kiem": 2–4 tiêu chí tự kiểm có/không. Mục tiêu khác thì để trống.
  + Lựa chọn sai là lỗi người mới hay mắc thật, không vô lý. Câu mẫu tự nhiên như người bản xứ, người trong nghề hay dùng.
  + "goi_y": 2–3 gợi ý từng bước, mỗi gợi ý dưới 20 chữ. "dap_an_mau": 1–2 câu.
- KIỂM TRA: đúng 5 câu trắc nghiệm (mỗi câu đúng là 1 sao), khác với phần làm thử, mỗi câu 3 lựa chọn, 1 đáp án đúng, giải thích ngắn. Câu kiểm tra đo đúng mục tiêu buổi và đầu ra module, ghi "ky_nang" là một mã trong [${(m?.ky_nang || []).join(', ') || 'kỹ năng của module'}]. Tự giải lại từng câu trước khi trả lời: chỉ một đáp án đúng.
- App XÁO thứ tự câu hỏi và thứ tự lựa chọn mỗi lần làm. Nên KHÔNG viết lựa chọn kiểu "Cả A và B", "Tất cả các ý trên", "Đáp án trên"; giải thích KHÔNG nhắc vị trí (A, B, thứ nhất, cuối cùng), chỉ nói nội dung.
- Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"tieu_de":"...","nguon":["N1"],"mo_dau":"tình huống hoặc câu hỏi thật mở bài","loi_ich":"học xong bạn ...",
 "y_chinh":[{"tieu_de":"Ý 1 ngắn gọn","noi_dung":"1–3 câu ngắn","vi_du":"ví dụ đời thường 1 câu, có thể để trống"}],
 "nguyen_ly":[{"ten":"Tên nguyên lý","noi_dung":"1–2 câu"}],
 "dao_sau":"giải thích đầy đủ, gạch đầu dòng bằng '- ', chữ đậm bằng **...**","tom_tat":["...","...","..."],
 "lam_thu":{"trac_nghiem":[{"de":"Tình huống ngắn ...?","lua_chon":["...","...","..."],"dap_an":0,"giai_thich":"..."}],"de":"câu tự luận ngắn","goi_y":["...","..."],"dap_an_mau":"1–2 câu","viec_that":"","bang_kiem":[]},
 "cau_hoi":[{"de":"...","lua_chon":["...","...","..."],"dap_an":0,"giai_thich":"...","ky_nang":"KN1"}],
 "giai_thich_bang_loi":{"de":"Giải thích bằng lời của bạn: ...","y_can_co":["...","..."]}}
\`\`\``;
}
const viecBai = (b, m, lai = false) => ({ loai: 'bai', ma: b.ma, module: m?.ma, buoi_ten: b.ten, prompt: loiDanBai(b, m), nhip: +S.tien_do.nhip || 0, lai, kiem: loiDanKiemDapAn() });
const viecModule = (m, kemBai = false) => ({ loai: 'module', module: m.ma, prompt: loiDanModule(m), nhip: +S.tien_do.nhip || 0, ...(kemBai ? { bai_mau: loiDanBai({}, m, true), kiem: loiDanKiemDapAn() } : {}) });
// Soạn ngầm ở máy chủ (chỉ khi nối AI tự động): bài kế tiếp trước, rồi danh sách buổi của các module chưa soạn.
// Máy chủ tự bỏ qua việc đã xong hoặc đang chờ, nên gọi nhiều lần không tốn thêm lượt AI.
async function chuanBiNgam({ truoc = false, lai = false } = {}) {
  if (!noiTuDong() || S.lo_trinh?.trang_thai !== 'da-duyet') return null;
  S._cauHoi = (await api('/api/cau-hoi').catch(() => ({}))).cau_hoi || {};
  const { b, m, canSoan } = buoiTiepTheo(), viec = [];
  if (b && (lai || !(await api(`/api/bai?ma=${encodeURIComponent(b.ma)}`)).bai)) viec.push(viecBai(b, m, lai));
  if (canSoan) viec.push(viecModule(canSoan, true));
  // AI miễn phí của Noe có trần mỗi ngày: chỉ soạn trước module kế tiếp, để phần AI dành cho bài sắp học (không soạn sẵn mọi module)
  if (S.ai.cach_noi !== 'noe') for (const x of cacModule(S.lo_trinh)) if (!(x.buoi || []).length && x !== canSoan) viec.push(viecModule(x));
  if (!viec.length) return null;
  return api('/api/soan-ngam', { viec, truoc }).catch(() => null);
}
// Lộ trình vừa xong, người học còn đang đọc (chưa duyệt): soạn sẵn NGAY buổi 1 của lộ trình đang chọn,
// để duyệt xong bấm Học là vào học luôn, không phải đợi. Máy chủ bỏ qua nếu đã soạn hoặc đang chờ.
async function soanSanBai1() {
  if (!noiTuDong() || !S.lo_trinh?.chang || S.lo_trinh.trang_thai === 'da-duyet' || (S.tien_do?.buoi_da_hoc || []).length) return null;
  const m = cacModule(S.lo_trinh)[0]; if (!m) return null;
  S._cauHoi = (await api('/api/cau-hoi').catch(() => ({}))).cau_hoi || {};
  const b = (m.buoi || [])[0];
  if (b && (await api(`/api/bai?ma=${encodeURIComponent(b.ma)}`).catch(() => ({}))).bai) return null;
  return api('/api/soan-ngam', { viec: [b ? viecBai(b, m) : viecModule(m, true)], truoc: true }).catch(() => null);
}
// Buổi kế tiếp SAU buổi b (bỏ qua buổi đã học). Module kế chưa có danh sách buổi thì trả về canSoan.
function buoiSau(b) {
  let qua = false;
  for (const m of cacModule(S.lo_trinh)) {
    if (!(m.buoi || []).length) { if (qua) return { canSoan: m }; continue; }
    for (const x of m.buoi) { if (x.ma === b.ma) { qua = true; continue; } if (qua && !daHoc(x.ma)) return { b: x, m }; }
  }
  return {};
}
// Vừa mở buổi b là gửi máy chủ soạn luôn buổi SAU nó: người học đọc bài, làm kiểm tra mất vài phút,
// học xong thì bài sau thường đã sẵn, bấm Học buổi tiếp theo là vào ngay.
async function soanTruocBuoiSau(b) {
  if (!noiTuDong() || S.lo_trinh?.trang_thai !== 'da-duyet') return null;
  const { b: bs, m, canSoan } = buoiSau(b);
  if (!bs && !canSoan) return null;
  if (bs && (await api(`/api/bai?ma=${encodeURIComponent(bs.ma)}`).catch(() => ({}))).bai) return null;
  S._cauHoi = (await api('/api/cau-hoi').catch(() => ({}))).cau_hoi || {};
  return api('/api/soan-ngam', { viec: [bs ? viecBai(bs, m) : viecModule(canSoan, true)], truoc: true }).catch(() => null);
}
// Màn kết quả: theo dõi bài kế tiếp. Xong thì nút "Học buổi tiếp theo" sáng lên, bấm là vào học.
async function theoDoiBaiSau() {
  const nut = $('#hocTiep'), chu = $('#baiSau'), luot = LUOT;
  if (!nut) return;
  nut.onclick = () => manHomNay();
  if (!noiTuDong()) return;
  const mo = (loi) => { if (luot !== LUOT) return; nut.disabled = false; nut.textContent = 'Học buổi tiếp theo'; chu.textContent = loi ? 'Bài kế tiếp chưa soạn xong, bấm để Noe soạn tiếp.' : 'Bài kế tiếp Noe đã soạn xong, bấm là học ngay.'; };
  for (let i = 0; i < 600 && luot === LUOT; i++) {
    const { b: bs, canSoan } = buoiTiepTheo();
    if (!bs && !canSoan) { nut.remove(); chu.remove(); return; }
    if (bs && (await api(`/api/bai?ma=${encodeURIComponent(bs.ma)}`).catch(() => ({}))).bai) return mo();
    const st = await api('/api/soan-ngam').catch(() => ({})), loi = st.loi || {};
    if ((bs && loi[`b:${bs.ma}`]) || (canSoan && loi[`m:${canSoan.ma}`])) return mo(true);
    if (canSoan && (st.xong || []).includes(`m:${canSoan.ma}`)) { await tai(); continue; }
    await new Promise(r => setTimeout(r, 2000));
  }
  mo(true);
}
// Chờ một việc soạn ngầm xong (người học đang muốn học ngay). Trả về 'xong' | 'loi' | 'roi' (đã rời màn).
async function choSoanNgam(khoa, tieuDe) {
  const luot = LUOT;
  man.innerHTML = `${noi('suy-nghi', `<b>${tieuDe}</b><p class="mo">Việc soạn chạy ở máy chủ của app. Bạn đi xem màn khác cũng được, Noe vẫn soạn tiếp, xong là học được ngay.</p>`)}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
  const nk = $('#nk'), cho = new DongCho('soạn bài', nk);
  let tu = 0;
  try {
    while (luot === LUOT) {
      const st = await api(`/api/soan-ngam?tu=${tu}`).catch(() => ({}));
      if (luot !== LUOT) return 'roi';
      (st.nhat_ky || []).forEach(e => nk.insertAdjacentHTML('beforeend', `<div class="${esc(e.loai)}"><span>${esc(e.luc)}</span>${esc(e.chu)}</div>`));
      tu = st.tong ?? tu; nk.scrollTop = nk.scrollHeight;
      if ((st.loi || {})[khoa]) { S._loiSoan = st.loi[khoa]; return 'loi'; }
      if ((st.xong || []).includes(khoa)) return 'xong';
      if (st.dang !== khoa && !(st.cho || []).includes(khoa)) return 'xong'; // không còn trong hàng: đã có kết quả từ trước
      await new Promise(r => setTimeout(r, 1500));
    }
    return 'roi';
  } finally { cho.xong(); }
}

// Quay lại sau lỡ nhịp (docs/quy-trinh-dong-hanh.md mục 4): không trách, mừng người học quay lại
const soNgayVang = () => { const ds = S.tien_do.buoi_da_hoc || []; return ds.length ? soNgay(ds[ds.length - 1].ngay, NGAY()) : null; };
// Số thứ tự của buổi trên cả lộ trình (giống số trên bản đồ)
function soThuTuBuoi(ma) {
  let so = 0;
  for (const m of cacModule(S.lo_trinh)) {
    if (!(m.buoi || []).length) { so += soBuoiModule(m); continue; }
    for (const b of m.buoi) { so++; if (b.ma === ma) return so; }
  }
  return null;
}
// Câu chào đầu buổi: đổi theo bối cảnh (lần đầu, quay lại, chuỗi ngày, kết quả buổi trước, module mới, giờ trong ngày), luôn vui vẻ tích cực
function loiChaoBoiCanh(b, m) {
  const ten = S.ho_so.ten_goi ? ` ${esc(S.ho_so.ten_goi)}` : '', ds = S.tien_do.buoi_da_hoc || [], cuoi = ds.at(-1), xa = soNgayVang(), chuoi = +S.noe?.chuoi || 0, h = new Date().getHours();
  const chon = a => a[Math.floor(Math.random() * a.length)];
  if (!ds.length) return chon([`Buổi đầu tiên đây rồi${ten}! Noe hồi hộp quá, mình cùng bắt đầu nha.`, `Chào${ten}! Hành trình bắt đầu từ bước nhỏ này. Noe đi cùng bạn nè!`]);
  if (xa >= 7) return chon([`Chào mừng${ten} quay lại! Noe nhớ bạn lắm. Mình học tiếp từ chỗ dở nha.`, `A,${ten} về rồi! Không sao cả, mình nhẹ nhàng đi tiếp thôi.`]);
  if (cuoi?.ngay === NGAY()) return chon([`Thêm một buổi nữa hôm nay?${ten} chăm quá trời!`, `Học tiếp luôn hả? Noe thích tinh thần này của${ten || ' bạn'} ghê!`]);
  if (m && m.buoi?.[0] === b && ds.length) return `Sang module mới: <b>${esc(m.ten)}</b>. Một chân trời mới mở ra rồi${ten}!`;
  if (m && m.buoi?.at(-1) === b) return `Buổi cuối của module rồi${ten}, mình về đích thôi!`;
  const y = [];
  if (chuoi >= 2) y.push(`Chuỗi ${chuoi} ngày rồi đó${ten}! Giữ lửa thêm hôm nay nha.`);
  if (cuoi?.tong && cuoi.diem === cuoi.tong) y.push(`Buổi trước${ten} đúng hết ${cuoi.diem}/${cuoi.tong} câu, Noe vẫn còn phấn khích nè!`);
  if (cuoi?.tong_ket === 'dung') y.push(`Buổi trước${ten} hiểu bài rất chắc. Hôm nay tiếp đà nha!`);
  y.push(h < 11 ? `${gioChao()}${ten}! Đầu óc buổi sáng tỉnh táo, học là vào.` : h < 18 ? `${gioChao()}${ten}! Vài phút thôi là xong một buổi, đi nào!` : `${gioChao()}${ten}! Tối nay mình học nhẹ nhàng vài phút nha.`);
  return chon(y);
}
async function manHomNay() {
  vaoMan('hom-nay', manHomNay, arguments);
  veChang('hoc');
  let { b, m, canSoan } = buoiTiepTheo();
  const den = onDenHan();
  if (canSoan) {
    // Module chưa có danh sách buổi: nối AI tự động thì chờ máy chủ soạn ngầm (bấm Học từ lúc duyệt lộ trình là đã soạn)
    if (noiTuDong()) {
      await api('/api/soan-ngam', { viec: [viecModule(canSoan, true)], truoc: true });
      const kq = await choSoanNgam(`m:${canSoan.ma}`, `Noe đang soạn các buổi cho ${esc(canSoan.ten)}…`);
      if (kq === 'roi') return;
      await tai();
      if (kq === 'xong' && cacModule(S.lo_trinh).find(x => x.ma === canSoan.ma)?.buoi?.length) return manHomNay();
      man.innerHTML = `${noi('buon', `<b>Chưa soạn được ${esc(canSoan.ten)}.</b><p class="mo">${esc(S._loiSoan || 'AI trả lời chưa đúng mẫu.')}</p>`)}<div class="hang"><button class="chinh" id="soan">Thử lại</button><button id="ve">Về trang chủ</button></div>`;
      $('#ve').onclick = manTrangChu; $('#soan').onclick = manHomNay;
      return;
    }
    man.innerHTML = `${noi('suy-nghi', `<h2>Tới ${esc(canSoan.ten)}</h2><p>Mình nhờ AI soạn các buổi cho module này nhé.</p>`)}<div class="hang"><button class="chinh" id="soan">Soạn các buổi</button><button id="ve">Về trang chủ</button></div>`;
    $('#ve').onclick = manTrangChu;
    $('#soan').onclick = async () => { try { await soanModule(canSoan); manHomNay(); } catch (e) { if (e.message !== 'huy') baoNho('Câu trả lời của AI chưa đúng mẫu, thử lại nhé.'); } };
    return;
  }
  if (!b && !den.length) {
    man.innerHTML = `${haiThanh()}${noi('khen', `<h2>Bạn đã học hết lộ trình!</h2><p>Muốn Thông tuệ đầy 100% thì làm nốt phần thực hành của từng module nha. Hoặc nâng lên mức học sâu hơn.</p>`)}<div class="hang"><button id="ve">Về trang chủ</button><button id="lt">Xem 3 lộ trình</button></div>`;
    $('#ve').onclick = manTrangChu; $('#lt').onclick = () => manLoTrinh();
    return;
  }
  if (!b) {
    man.innerHTML = `${noi('vui', `<h2>${gioChao()}${goiTen()}!</h2><p>Hôm nay không có bài mới, mình ôn lại ${den.length} câu sắp quên nha. Ôn đúng lúc giúp nhớ lâu hơn học lại từ đầu.</p>`)}
      <div class="hang"><button class="chinh nut-to" id="batDau">Ôn bài</button><button id="ve">Về trang chủ</button></div>`;
    $('#ve').onclick = manTrangChu; $('#batDau').onclick = () => buoiHoc(null, null);
    return;
  }
  // Màn trước buổi học: trên là câu chào theo bối cảnh, dưới làm nổi bật buổi số mấy, học gì, mục tiêu, lợi ích. Bấm là học luôn.
  const so = soThuTuBuoi(b.ma), tong = tongBuoi(S.lo_trinh);
  const veMan = (bai) => {
    const loiIch = bai?.loi_ich || b.loi_ich || (m?.dau_ra ? `Tiến gần hơn tới: ${m.dau_ra}` : '');
    man.innerHTML = `
      ${noi('chao', `<p class="loi-chao">${loiChaoBoiCanh(b, m)}</p>`)}
      <section class="the buoi-sap">
        <span class="bs-so">Buổi ${so || ''}<small>/${tong}</small></span>
        <p class="mo bs-module">${esc(m?.ten || '')}</p>
        <h2>${esc(String(bai?.tieu_de || b.ten).replace(/^Buổi\s*\d+\s*:\s*/i, ''))}</h2>
        ${b.muc_tieu ? `<div class="bs-dong">${ic('dich')}<div><b>Mục tiêu</b><p>${esc(b.muc_tieu)}</p></div></div>` : ''}
        ${loiIch ? `<div class="bs-dong">${ic('sao')}<div><b>Lợi ích</b><p>${esc(loiIch)}</p></div></div>` : ''}
        ${den.length ? `<p class="mo">Khởi động: ôn ${Math.min(3, den.length)} câu cũ sắp quên.</p>` : ''}
        <button class="nut-to chinh" id="batDau">Học ngay</button>
      </section>
      <div class="hang"><button id="ve" class="nho">Về trang chủ</button></div>`;
    $('#ve').onclick = manTrangChu;
    $('#batDau').onclick = () => buoiHoc(b, m);
  };
  veMan(null);
  // bài đã soạn sẵn thì lấy tiêu đề, lợi ích của bài cho đúng
  const luot = LUOT;
  api(`/api/bai?ma=${encodeURIComponent(b.ma)}`).then(r => { if (r.bai && luot === LUOT && manHienTai?.ten === 'hom-nay') veMan(r.bai); }).catch(() => {});
}

async function buoiHoc(b, m, hocLai = false) {
  vaoMan('buoi-hoc', buoiHoc, arguments);
  dangHocBuoi = true; const luot = LUOT;
  const KQ = { on: [], kiem: [], bo_qua: false, dung: null, tu_luan: null, tong_ket: '', danh_gia: null, hoc_lai: hocLai };
  if (!hocLai) {
    const tatCa = (await api('/api/cau-hoi')).cau_hoi;
    const den = onDenHan().map(x => ({ ...x, c: tatCa[x.id_cau_hoi] })).filter(x => x.c && x.c.loai === 'chon').slice(0, 3);
    for (let i = 0; i < den.length; i++) { const kq = await motCau(den[i].c, `Khởi động ôn ${i + 1}/${den.length}`); KQ.on.push({ id: den[i].id_cau_hoi, dung: kq.dung }); }
  }
  if (!b) { const tt = await luuKetQua(null, null, KQ); return manKetQua(null, null, KQ, tt); }
  // Học lại buổi chưa đủ 5 sao: Noe soạn bộ câu hỏi mới (đáp án vừa xem không dùng được), đúng thêm câu nào thêm sao câu đó
  const bai = await layBai(b, m, hocLai && noiTuDong() && (saoBuoi(b.ma) ?? 0) < 5);
  if (bai?._cauMoi) KQ.cau_moi = true;
  if (luot !== LUOT) return; // người học đã bấm Quay lại / Trang chính trong lúc chờ
  if (!bai) return hocLai ? manTrangChu() : manHomNay();
  if (!hocLai) soanTruocBuoiSau(b).catch(() => {}); // bài hiện tại đã có: soạn luôn bài sau trong lúc người học đang học
  await phanBai(b, bai, hocLai);
  KQ.dung = await phanLamThu(b, bai, hocLai);
  await phanKiemTra(b, KQ);
  KQ.tong_ket = await phanGhiLai(b);
  KQ.do_kho = await hoiDoKho();
  // Lưu kết quả buổi học NGAY (sao, ôn, chuỗi ngày): thoát ra lúc đang chấm cũng không mất tiến trình
  const tt = await luuKetQua(b, m, KQ);
  // Bài kế tiếp đã gửi soạn từ lúc mở buổi; gọi lại để chắc chắn nó ở đầu hàng (máy chủ bỏ qua nếu đã xong)
  if (!hocLai) chuanBiNgam({ truoc: true }).catch(() => {});
  KQ.danh_gia = await danhGiaTongKet(b, bai, KQ);
  if (KQ.danh_gia) await ghiDanhGia(b, m, KQ);
  if (luot !== LUOT) return;
  manKetQua(b, m, KQ, tt);
}

// Cuối buổi: hỏi độ khó (để chỉnh buổi sau). Trả về 'de' | 'vua' | 'kho' | null.
function hoiDoKho() {
  return new Promise(ok => {
    man.innerHTML = `${noi('suy-nghi', '<b>Buổi này bạn thấy thế nào?</b><p class="mo">Noe dùng câu trả lời để chỉnh buổi sau cho vừa sức.</p>')}
      <div class="the"><div class="hang"><button class="lua-chon" data-k="de">Dễ quá</button><button class="lua-chon" data-k="vua">Vừa</button><button class="lua-chon" data-k="kho">Khó quá</button></div>
      <div class="hang" style="margin-top:10px"><button class="nho" data-k="">Bỏ qua</button></div></div>`;
    man.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => ok(b.dataset.k || null));
  });
}

// Tìm buổi theo mã trong lộ trình đang học
function timBuoi(ma) {
  for (const m of cacModule(S.lo_trinh)) { const b = (m.buoi || []).find(x => x.ma === ma); if (b) return { b, m }; }
  return {};
}
const MUC_TK = { 'dung': ['Hiểu đúng', ''], 'dung-mot-phan': ['Đúng một phần', 'vang'], 'chua-dung': ['Cần học lại', 'xam'] };
const HANG_MUC = { 'chua-dung': 0, 'dung-mot-phan': 1, 'dung': 2 };
const yChinhChu = bai => (bai.y_chinh || []).length ? bai.y_chinh.map(y => `${y.tieu_de}: ${y.noi_dung}`).join(' | ') : (bai.nhanh || '');

// AI xem phần tổng kết (và câu giải thích bằng lời) của người học đã hiểu đúng chưa
async function danhGiaTongKet(b, bai, KQ) {
  const tl = KQ.tu_luan?.tra_loi ? KQ.tu_luan : null;
  if (!KQ.tong_ket && !tl) return null;
  const prompt = `Bạn là giáo viên tử tế trong app "Học cùng Noe". Hãy xem người học đã hiểu ĐÚNG bài chưa, dựa trên nội dung bài dưới đây.${ngonNgu()}

Buổi học: ${b.ten}
Mục tiêu: ${b.muc_tieu || ''}
Nội dung bài (để đối chiếu):
- Ý chính: ${yChinhChu(bai)}
- Nguyên lý: ${(bai.nguyen_ly || []).map(x => `${x.ten}: ${x.noi_dung}`).join('; ')}
- Tóm tắt cần nhớ: ${(bai.tom_tat || []).join('; ')}
- Đào sâu: ${String(bai.dao_sau || '').slice(0, 2500)}
${tl ? `
Câu hỏi giải thích bằng lời: ${tl.de}
Các ý cần có: ${(tl.y_can_co || []).join('; ')}
Người học trả lời: ${tl.tra_loi}
` : ''}
Người học tổng kết buổi học: ${KQ.tong_ket || '(không viết)'}

Việc cần làm:
- Chấm mức hiểu: "dung" (hiểu đúng các ý chính), "dung-mot-phan" (đúng nhưng thiếu hoặc mơ hồ), "chua-dung" (có ý sai hoặc chưa nắm ý chính).
- Chỉ ra ý đúng, ý còn thiếu, ý sai kèm cách hiểu đúng. Chỉ dựa vào nội dung bài, không bịa thêm.
- Lời nhận xét 2–3 câu, thân thiện. Khen CỤ THỂ cách làm, ý đúng (ví dụ "bạn giải thích đúng vì sao..."), không khen chung chung, không chê bai. ${giongNoe()}
- "an_toan": false CHỈ KHI người học viết điều cho thấy nguy hiểm tới bản thân hoặc người khác, hoặc đang khủng hoảng nặng; còn lại true.
Trả lời bằng đúng MỘT khối \`\`\`json:
\`\`\`json
{"muc":"dung","nhan_xet":"...","y_dung":["..."],"y_thieu":["..."],"y_sai":[{"cau":"điều người học viết sai","sua":"cách hiểu đúng"}],"an_toan":true}
\`\`\``;
  man.innerHTML = `${noi('suy-nghi', `<b>Noe đang chấm điểm và chuẩn bị bài tiếp theo…</b><p class="mo">Kết quả buổi này đã được lưu${noiTuDong() ? ', bài kế tiếp đang được soạn sẵn ở máy chủ' : ''}. Lỡ thoát ra cũng không mất gì.</p>`)}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
  let d;
  try { d = await hoiJSON(prompt, { viec: 'xem phần tổng kết của bạn', nhatKy: $('#nk') }, x => x && HANG_MUC[x.muc] !== undefined); }
  catch { return null; }
  // An toàn trước bài học (docs/quy-trinh-dong-hanh.md mục 6): Noe không phải chuyên gia, chỉ đường tới nơi giúp được
  if (d.an_toan === false) {
    await hopChon(noi('suy-nghi', `<b>Noe đọc thấy bạn đang không ổn.</b><p>Bài học để sau cũng được. Bạn hãy nói chuyện ngay với người thân hoặc người bạn tin tưởng.</p>
      <p>Nếu bạn hoặc ai đó đang gặp nguy hiểm: gọi <b>115</b> (cấp cứu). Trẻ em cần giúp đỡ: gọi <b>111</b> (Tổng đài quốc gia bảo vệ trẻ em).</p>
      <p class="mo">Noe chỉ là bạn học, không thay được người có chuyên môn.</p>`), ['Mình hiểu rồi']);
  }
  const [nhan, mau] = MUC_TK[d.muc];
  const ds = (tieuDe, arr, fn = x => esc(x)) => (arr || []).length ? `<h3>${tieuDe}</h3><ul>${arr.map(x => `<li>${fn(x)}</li>`).join('')}</ul>` : '';
  man.innerHTML = `${noi(d.muc === 'dung' ? 'khen' : d.muc === 'dung-mot-phan' ? 'vui' : 'buon', `<span class="nhan ${mau}">${nhan}</span><p>${esc(d.nhan_xet)}</p>`)}
    <div class="the">${ds('Bạn hiểu đúng', d.y_dung)}${ds('Còn thiếu', d.y_thieu)}${ds('Cần sửa lại', d.y_sai, x => `<s>${esc(x.cau)}</s> → <b>${esc(x.sua)}</b>`)}
      ${d.muc === 'chua-dung' ? '<p class="mo">Không sao cả, học lại một lần là chắc hơn nhiều. Cuối buổi có nút <b>Học lại buổi này</b>.</p>' : ''}
      <div class="hang"><button class="chinh" id="tiep">Tiếp</button></div></div>`;
  if (d.muc === 'dung') noePhao(man.querySelector('.noi'));
  scrollTo(0, 0);
  await api('/api/nhat-ky', { ma: b.ma, dong: `Noe nhận xét: ${nhan}. ${d.nhan_xet}` });
  await cho('#tiep');
  return d;
}

// Mức hiểu của một module: dùng kết quả tốt nhất của mỗi buổi (lần học đầu hoặc các lần học lại)
function tinhModule(td, m) {
  const lan = [...(td.buoi_da_hoc || []), ...(td.hoc_lai || [])];
  const buoi = m.buoi || [];
  if (!buoi.length || !buoi.every(x => (td.buoi_da_hoc || []).some(y => y.ma === x.ma))) return null;
  let tile = 0, chuaDung = false, lamDuoc = true;
  for (const x of buoi) {
    const cua = lan.filter(y => y.ma === x.ma);
    tile += Math.max(0, ...cua.map(y => y.tong ? y.diem / y.tong : 0));
    const tot = Math.max(-1, ...cua.map(y => HANG_MUC[y.tong_ket] ?? -1));
    if (tot === 0) chuaDung = true;
    if (!cua.some(y => y.lam_thu_duoc !== false)) lamDuoc = false;
  }
  return { hieu: tile / buoi.length >= .8 && !chuaDung, dung: lamDuoc };
}
const cho = nut => new Promise(ok => { $(nut).onclick = () => ok(); });

// Xáo thứ tự (Fisher–Yates), trả về mảng mới. Dùng cho câu hỏi và lựa chọn: làm lại thì vị trí đổi,
// người học phải đọc hiểu chứ không nhớ vị trí mà chọn.
const daoThuTu = ds => { const a = [...ds]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// Xáo lựa chọn của một câu, giữ đúng đáp án; thứ tự mới không trùng thứ tự cũ (khi có từ 2 lựa chọn)
const xaoLuaChon = c => {
  const goc = c.lua_chon.map((l, i) => i);
  let moi = daoThuTu(goc);
  for (let k = 0; k < 5 && goc.length > 1 && moi.every((x, i) => x === i); k++) moi = daoThuTu(goc);
  return { ...c, lua_chon: moi.map(i => c.lua_chon[i]), dap_an: moi.indexOf(c.dap_an) };
};
function motCau(c0, nhan, { sao = true } = {}) {
  const c = xaoLuaChon(c0);
  const cong = sao ? ' +1 sao' : '';
  return new Promise(ok => {
    man.innerHTML = `${noi('vui', esc(nhan))}<div class="the"><h2>${esc(c.de)}</h2>
      <div style="display:flex;flex-direction:column;gap:8px">${c.lua_chon.map((l, j) => `<button class="lua-chon" data-j="${j}">${esc(l)}</button>`).join('')}<button class="lua-chon" data-j="-1">Mình chưa biết</button></div><div id="gt"></div></div>`;
    man.querySelectorAll('.lua-chon').forEach(btn => btn.onclick = async () => {
      const j = +btn.dataset.j, dung = j === c.dap_an;
      man.querySelectorAll('.lua-chon').forEach(x => { x.disabled = true; const k = +x.dataset.j; if (k === c.dap_an) x.classList.add('dung'); else if (k === j) x.classList.add('sai'); });
      const khung = man.querySelector('.noe-khung'), bong = man.querySelector('.bong');
      if (dung) {
        khung.innerHTML = noe('khen'); bong.textContent = ['Đúng rồi!', 'Chuẩn luôn!', 'Giỏi quá, mình sáng lên rồi nè!'][Math.floor(Math.random() * 3)] + cong;
        if (sao) { const n = document.createElement('span'); n.className = 'sao-bay'; n.setAttribute('aria-hidden', 'true'); n.innerHTML = ic('sao'); btn.append(n); }
      }
      else if (j === -1) { khung.innerHTML = noe('buon'); bong.textContent = 'Không sao, phần này mình học lại nha.'; }
      else { bong.textContent = 'Saiiii! Noe tức nổ cái đùng nè!'; await noeNo(khung); bong.textContent = 'Lành lại rồi, hí hí. Đọc giải thích rồi lần sau đúng nha!'; }
      $('#gt').innerHTML = `<p class="mo" style="margin-top:8px">${esc(c.giai_thich || '')}</p><div class="hang" style="margin-top:12px"><button class="chinh" id="tiep">Tiếp</button></div>`;
      $('#tiep').onclick = () => ok({ dung, chon: j });
    });
  });
}

// Lấy bài của buổi: có sẵn (soạn ngầm từ trước) thì vào học ngay; chưa có thì nhờ máy chủ soạn (nối tự động) hoặc soạn trực tiếp (sao chép và dán).
async function layBai(b, m, cauMoi = false) {
  const co = (await api(`/api/bai?ma=${encodeURIComponent(b.ma)}`)).bai;
  const deCu = JSON.stringify((co?.cau_hoi || []).map(c => c.de));
  const baoCauCu = bai => { if (cauMoi && bai && JSON.stringify((bai.cau_hoi || []).map(c => c.de)) !== deCu) bai._cauMoi = true; if (cauMoi && bai && JSON.stringify((bai.cau_hoi || []).map(c => c.de)) === deCu) toast('Lần học lại này câu hỏi giống lần trước nên không thêm sao. Lần sau học lại nhé.'); return bai; };
  // người học vừa đồng ý đổi mức: bài soạn trước đó theo mức cũ thì soạn lại theo mức mới
  const soanLai = (S.tien_do.soan_lai || []).includes(b.ma) && (co?.nhip ?? 0) !== (+S.tien_do.nhip || 0);
  if (co && co.buoi_ten === b.ten && !soanLai && !cauMoi) return co;
  S._cauHoi = (await api('/api/cau-hoi')).cau_hoi || {};
  if (noiTuDong()) {
    await api('/api/soan-ngam', { viec: [viecBai(b, m, soanLai || !!co)], truoc: true });
    const kq = await choSoanNgam(`b:${b.ma}`, cauMoi ? `Noe đang soạn bộ câu hỏi mới cho lần học lại ${esc(b.ten)}…` : `Noe đang soạn ${esc(b.ten)}…`);
    if (kq === 'roi') return null;
    const bai = (await api(`/api/bai?ma=${encodeURIComponent(b.ma)}`)).bai;
    if (kq === 'xong' && bai) {
      if (soanLai) { await api('/api/tien-do', { soan_lai: (S.tien_do.soan_lai || []).filter(x => x !== b.ma) }); await tai(); }
      return baoCauCu(bai);
    }
    if (cauMoi && co) { toast('Chưa soạn được câu mới, bạn học lại bằng bài cũ nhé (lần này không thêm sao).'); return co; }
    await baoNho(`Chưa soạn được bài: ${S._loiSoan || 'AI trả lời chưa đúng mẫu'}. Bạn thử lại nhé.`);
    return null;
  }
  const nguon = Object.fromEntries((S.nguon?.nguon || []).map(n => [n.ma, n]));
  man.innerHTML = `${noi('suy-nghi', `Noe đang nhờ AI soạn <b>${esc(b.ten)}</b>…`)}<div class="the"><div class="nhat-ky-tim" id="nk"></div></div>`;
  let bai;
  try { bai = await hoiJSON(loiDanBai(b, m), { viec: `soạn ${b.ten}`, nhatKy: $('#nk') }, d => (d.y_chinh || d.nhanh) && Array.isArray(d.cau_hoi)); }
  catch (e) { if (e.message !== 'huy') baoNho('Câu trả lời của AI chưa đúng mẫu, thử lại nhé.'); return null; }
  bai.nguon = (bai.nguon || []).filter(x => nguon[x]);
  bai.cau_hoi = bai.cau_hoi.filter(c => Array.isArray(c.lua_chon) && Number.isInteger(c.dap_an) && c.dap_an >= 0 && c.dap_an < c.lua_chon.length);
  bai.buoi_ten = b.ten; bai.module = m?.ma; bai.nhip = +S.tien_do.nhip || 0;
  await api('/api/bai', { ma: b.ma, bai });
  if (soanLai) { await api('/api/tien-do', { soan_lai: (S.tien_do.soan_lai || []).filter(x => x !== b.ma) }); await tai(); }
  return (await api(`/api/bai?ma=${encodeURIComponent(b.ma)}`)).bai;
}

function nguonBai(bai) {
  const nguon = Object.fromEntries((S.nguon?.nguon || []).map(n => [n.ma, n]));
  const li = (bai.nguon || []).filter(x => nguon[x]).map(x => `<li>${esc(x)}: <a href="${esc(nguon[x].link)}" target="_blank" rel="noopener">${esc(nguon[x].ten)}</a> <span class="mo">· ${esc(nguon[x].ai_lam)}</span></li>`).join('');
  return li ? `<div class="the"><h3>Nguồn</h3><ul>${li}</ul><p class="mo">Bài do AI viết lại bằng lời mới từ các nguồn trên, có thể có sai sót. Muốn chắc thì mở nguồn đọc thêm.</p></div>` : '';
}
// Bài chính: từng ý chính một thẻ, nguyên lý quan trọng đóng khung, tóm tắt nổi bật, đào sâu mở khi cần. Bài mẫu cũ (chỉ có "nhanh") vẫn đọc được.
async function phanBai(b, bai, hocLai = false, docLai = false) {
  const yChinh = (bai.y_chinh || []).filter(y => y && (y.tieu_de || y.noi_dung));
  const than = yChinh.length
    ? `<ol class="y-chinh">${yChinh.map((y, i) => `<li class="the y-o"><span class="y-so" aria-hidden="true">${i + 1}</span><div><h3>${esc(String(y.tieu_de || '').replace(/^Ý\s*\d+\s*[:.]\s*/i, ''))}</h3>${md(y.noi_dung)}${y.vi_du ? `<p class="y-vd"><b>Ví dụ:</b> ${esc(y.vi_du)}</p>` : ''}</div></li>`).join('')}</ol>`
    : `<article class="the bai"><span class="nhan vang">Ý chính</span>${md(bai.nhanh)}${bai.vi_du ? `<div class="vi-du"><b>Ví dụ:</b> ${md(bai.vi_du)}</div>` : ''}</article>`;
  const nguyenLy = (bai.nguyen_ly || []).filter(x => x && (x.ten || x.noi_dung));
  man.innerHTML = `${noi('vui', `${hocLai ? '<span class="nhan vang">Học lại</span> ' : docLai ? '<span class="nhan vang">Đọc lại</span> ' : ''}<b>${esc(bai.tieu_de || b.ten)}</b>`)}
    ${bai.mo_dau ? `<div class="the vi-du"><b>Thử nghĩ xem:</b> ${md(bai.mo_dau)}</div>` : ''}
    ${than}
    ${nguyenLy.map(x => `<aside class="nguyen-ly">${ic('den')}<div><span class="nl-nhan">Nguyên lý quan trọng</span><b>${esc(x.ten || '')}</b><p>${esc(x.noi_dung || '')}</p></div></aside>`).join('')}
    ${(bai.tom_tat || []).length ? `<section class="tom-tat-to"><h3>${ic('ghim')} Tóm tắt cần nhớ</h3><ul>${bai.tom_tat.map(t => `<li>${esc(t)}</li>`).join('')}</ul></section>` : ''}
    ${bai.dao_sau ? `<details class="the dao-sau"><summary><b>Đào sâu</b> <span class="mo">cho ai muốn hiểu kỹ hơn</span></summary>${md(bai.dao_sau)}</details>` : ''}
    ${nguonBai(bai)}<div class="hang"><button class="chinh" id="tiep">${docLai ? 'Đọc lại xong, làm bài kiểm tra' : 'Mình đọc xong, làm thử'}</button></div>`;
  scrollTo(0, 0); await cho('#tiep');
}
// Làm thử: 2–3 câu trắc nghiệm tình huống (không tính sao) + 1 câu tự luận ngắn 1–2 câu (gõ hoặc nói).
// So đáp án xong: "Học lại" (đọc lại bài rồi kiểm tra) hoặc "Làm bài kiểm tra luôn". Trả về làm thử được hay chưa (theo trắc nghiệm).
async function phanLamThu(b, bai, hocLai = false) {
  const lt = bai.lam_thu; if (!lt) return null;
  const tn = (lt.trac_nghiem || []).filter(c => Array.isArray(c.lua_chon) && Number.isInteger(c.dap_an) && c.dap_an >= 0 && c.dap_an < c.lua_chon.length);
  if (!tn.length) return lt.de ? lamThuCu(lt) : null;
  let dungTN = 0;
  const tnXao = daoThuTu(tn);
  for (let i = 0; i < tnXao.length; i++) { const kq = await motCau(tnXao[i], `Làm thử ${i + 1}/${tnXao.length}: áp dụng vào tình huống`, { sao: false }); if (kq.dung) dungTN++; }
  const datTN = dungTN >= Math.ceil(tn.length / 2);
  if (!lt.de) return datTN;
  const chon = await tuLuanNgan(lt);
  if (chon === 'hoc-lai') await phanBai(b, bai, hocLai, true);
  return datTN;
}
// Nút micro: nói thay gõ (nhận giọng nói của trình duyệt, tiếng Việt), chữ nói ra hiện vào ô để người học sửa rồi gửi
let nhanDang = null, micCuoi = null;
// Nhật ký micro gửi về máy tính (thư mục cài đặt/nhat-ky-mic.log) để gỡ lỗi nút Nói trên điện thoại; không gửi chữ người học nói
const nkMic = (su_kien, chi_tiet = '') => { try { fetch('/api/nhat-ky-mic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ su_kien, chi_tiet }), keepalive: true }).catch(() => {}); } catch { /* bỏ qua */ } };
// Nút Nói chỉ hiện khi trình duyệt cho dùng micro (máy tính, hoặc bản https). Điện thoại mở bằng http thì ẩn:
// học viên gõ hoặc bấm micro trên bàn phím điện thoại (bàn phím tự đổi giọng nói thành chữ).
// Nút Nói (anh chốt 24/11/2026): CHỈ trên máy tính (Chrome, Edge nghe tiếng Việt tốt). Điện thoại không có nút Nói,
// không xin quyền micro; app nhắc bấm micro trên bàn phím điện thoại.
const laDienThoai = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const coNutMic = () => !laDienThoai() && isSecureContext && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const cachNoiBangMay = () => laDienThoai()
  ? 'bấm micro trên bàn phím điện thoại' : /Mac/i.test(navigator.platform || navigator.userAgent) ? 'bấm phím Fn hai lần (đọc chính tả của Mac)' : 'bấm phím Windows + H (gõ bằng giọng nói của Windows)';
const cachNoi = () => coNutMic() ? 'gõ hoặc bấm <b>Nói</b>' : 'gõ, hoặc bấm biểu tượng micro trên bàn phím để nói';
const nutMic = id => coNutMic() ? `<button type="button" class="nut-mic" data-mic="${id}" aria-label="Bấm để nói thay vì gõ">${ic('mic')}<span>Nói</span></button>`
  : `<span class="goi-y-mic mo">Muốn nói thay vì gõ: ${cachNoiBangMay()}.</span>`;
function ganMic() {
  man.querySelectorAll('[data-mic]').forEach(nut => nut.onclick = () => batMic(nut, $('#' + nut.dataset.mic)));
}
// Điện thoại mở bằng http thì trình duyệt chặn micro: chỉ đường sang bản https (máy chủ tự tạo chứng chỉ trong mạng nhà)
const HD_BAO_MAT = `<p class="mo">Điện thoại sẽ cảnh báo một lần (chứng chỉ do máy tính nhà bạn tự tạo, an toàn trong wifi nhà). Bấm qua:<br>
  <b>iPhone:</b> Hiển thị chi tiết → truy cập trang web này.<br><b>Android:</b> Nâng cao → Tiếp tục truy cập.</p>`;
async function moBanBaoMat(lyDo) {
  const c = await hopChon(noi('vui', `<b>${lyDo}</b>${HD_BAO_MAT}`), ['Mở bản bảo mật', 'Để sau']);
  if (c === 0) location.href = S.bao_mat;
}
// Mở app là lo micro ngay từ đầu (không đợi vào bài mới hỏi):
// 1) Điện thoại đang ở bản thường (http): thử gọi bản bảo mật; điện thoại đã chấp nhận rồi thì tự chuyển sang luôn, không hỏi.
//    Chưa chấp nhận thì hỏi ngay lúc mở, bấm Đồng ý là sang bản bảo mật (bấm qua cảnh báo một lần).
// 2) Ở bản bảo mật (hoặc máy tính): mỗi lần mở mà micro chưa được cấp quyền (mới cài lại, bị thu hồi...) thì hỏi cấp quyền ngay.
const thuBaoMat = () => new Promise(ok => {
  const goc = new URL(S.bao_mat).origin, t = setTimeout(() => ok(false), 3500);
  fetch(goc + '/noe-icon-192.png?thu=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).then(() => { clearTimeout(t); ok(true); }, () => { clearTimeout(t); ok(false); });
});
const sangBaoMat = () => { const u = new URL(location.pathname + location.search, S.bao_mat); u.searchParams.set('tu', 'http'); return u.href; };
// iPhone mở Noe từ biểu tượng ghim ở bản thường (http) thì bản bảo mật hiện trong khung Safari nhỏ,
// có nút micro cam bấm vào là tắt micro. Ghim lại từ bản bảo mật thì Noe chạy toàn màn hình, không còn khung đó.
async function moiGhimLai() {
  const q = new URLSearchParams(location.search);
  if (q.get('tu') !== 'http') return;
  q.delete('tu'); history.replaceState(history.state, '', location.pathname + (q.toString() ? '?' + q : ''));
  if (!laIPhone()) return;
  nkMic('moi-ghim-lai');
  await hopChon(noi('chao', `<b>Ghim lại Noe một lần để micro chạy ổn định</b>
    <p>Biểu tượng Noe cũ mở Noe trong khung Safari nhỏ, có nút micro cam dễ bấm nhầm làm mất micro. Ghim lại thì Noe chạy toàn màn hình như app thật:</p>
    <ol class="huong-dan"><li>Mở Noe bằng <b>Google Chrome</b>.</li>
    <li>Trong Chrome bấm <b>Chia sẻ</b> (cạnh ô địa chỉ) → <b>Thêm vào Màn hình chính</b> → <b>Thêm</b>.</li>
    <li>Nhấn giữ biểu tượng Noe <b>cũ</b> → <b>Xoá ứng dụng</b> (dữ liệu học vẫn nằm trên máy tính, không mất gì).</li></ol>`), ['Đã hiểu']);
}
async function hoiMicLucMo() {
  if (laDienThoai()) return; // điện thoại: không có nút Nói, không xin quyền micro (anh chốt 24/11/2026)
  nkMic('mo-app', { https: isSecureContext, standalone: !!navigator.standalone, sr: !!(window.SpeechRecognition || window.webkitSpeechRecognition), ua: navigator.userAgent.slice(0, 120) });
  if (!isSecureContext) {
    if (!S.bao_mat) return;
    if (await thuBaoMat()) { location.replace(sangBaoMat()); return; }
    const c = await hopChon(noi('chao', `<b>Cho Noe dùng micro nhé?</b><p>Để bạn bấm <b>Nói</b> rồi nói, Noe ghi thành chữ (không lưu tiếng nói), Noe cần mở bản bảo mật một lần.</p>${HD_BAO_MAT}`),
      ['Đồng ý', 'Để lần sau']);
    if (c === 0) location.href = sangBaoMat();
    return;
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!navigator.mediaDevices?.getUserMedia || !SR) return; // trình duyệt không đổi giọng nói thành chữ (Chrome trên iPhone, Firefox): khỏi xin micro
  try { if ((await navigator.permissions?.query({ name: 'microphone' }))?.state === 'granted') return; } catch { /* trình duyệt không cho hỏi trạng thái: hỏi luôn */ }
  // Chỉ hỏi MỘT lần (anh dặn 24/11/2026): đã đồng ý thì không hỏi lại khi mở app; bấm "Để lần sau" thì 7 ngày sau mới hỏi lại.
  // (iPhone không cho app biết đã được phép, nên trước đây lần mở nào cũng hỏi.)
  let daCho = null, hoan = 0;
  try { daCho = localStorage.getItem('noe_mic_da_cho'); hoan = +localStorage.getItem('noe_mic_hoan') || 0; } catch { /* bỏ qua */ }
  if (daCho || Date.now() - hoan < 7 * 864e5) return;
  const c = await hopChon(noi('chao', `<b>Cho Noe dùng micro nhé?</b><p>Ở câu tự luận, bạn bấm <b>Nói</b> rồi nói, Noe ghi thành chữ giúp bạn (không lưu tiếng nói). Bấm <b>Đồng ý</b> rồi chọn <b>Cho phép</b> khi ${dienThoaiMay() ? 'điện thoại' : 'trình duyệt'} hỏi.</p>${LOI_DAN_CHAM_CAM}</p>`),
    ['Đồng ý', 'Để lần sau']);
  if (c !== 0) { try { localStorage.setItem('noe_mic_hoan', String(Date.now())); } catch { /* bỏ qua */ } return; }
  try {
    // Xin quyền bằng getUserMedia rồi nhả micro ngay (cách đã chạy đúng trên iPhone).
    // KHÔNG bật bộ nhận giọng rồi tắt ngang (abort): iPhone không nhả micro, nút Nói sẽ báo micro bận.
    const st = await navigator.mediaDevices.getUserMedia({ audio: true }); st.getTracks().forEach(t => t.stop());
    try { localStorage.setItem('noe_mic_da_cho', '1'); } catch { /* bỏ qua */ }
    if (laIPhone()) await hopChon(noi('khen', `<b>Xong! Lúc học bấm Nói là nói được ngay.</b><p>Muốn iPhone <b>không bao giờ hỏi lại</b> quyền micro: trong Safari bấm nút <b>aA</b> (hoặc biểu tượng trang) cạnh ô địa chỉ → <b>Cài đặt trang web</b> → <b>Micrô</b> → chọn <b>Cho phép</b>. Chỉ làm một lần.</p>`), ['Đã hiểu']);
    else toast(SR ? 'Xong! Lúc học bấm Nói là nói được ngay.' : 'Đã cho dùng micro.');
    if (!SR) baoNho(navigator.standalone ? 'Micro đã bật, nhưng mở Noe từ biểu tượng màn hình chính iPhone thì chưa đổi giọng nói thành chữ được. Bấm micro trên bàn phím iPhone để nói thành chữ.' : 'Micro đã bật, nhưng trình duyệt này chưa đổi giọng nói thành chữ được. Dùng Safari (iPhone), Chrome (Android) hoặc Chrome, Edge (máy tính) nhé.');
  } catch { baoNho('Micro chưa được cho phép. Bạn vào Cài đặt của trình duyệt, cho trang này dùng Micro, rồi mở lại Noe nhé.'); }
}
const laIPhone = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const LOI_DAN_CHAM_CAM = laIPhone() ? '<p class="mo"><b>Lưu ý:</b> lúc Noe nghe, iPhone hiện biểu tượng micro <b>màu cam</b> ở góc trên. Đó là của iPhone, bạn <b>đừng bấm vào</b> (bấm vào có thể tắt micro của Noe).</p>' : '';
let daDanChamCam = false;
// Micro của Noe bị tắt (lỡ bấm vào biểu tượng micro cam của iPhone, hoặc thu hồi quyền): hỏi lại quyền ngay trong app, khỏi vào Cài đặt
async function batLaiMic() {
  nkMic('mic-bi-tat');
  const cu = nhanDang; nhanDang = null;
  if (cu) { cu.daTat = true; clearTimeout(cu.hen); try { cu.r.stop(); } catch { /* bỏ qua */ } veNutMic(cu.nut, false); }
  boNgheChung = null; // bộ nghe cũ đã hỏng: lần sau tạo bộ mới
  const c = await hopChon(noi('buon', `<b>Micro của Noe đang bị tắt.</b><p>Có thể bạn lỡ bấm vào biểu tượng micro màu cam của iPhone và chọn tắt tiếng. Bấm <b>Bật lại micro</b> (chọn <b>Cho phép</b> nếu điện thoại hỏi). Nếu vẫn không nghe được, bạn vuốt tắt Noe rồi mở lại.</p>`), ['Bật lại micro', 'Để sau, mình gõ chữ']);
  if (c !== 0) return;
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    nkMic('gum-ok', { track: st.getAudioTracks()[0]?.readyState, muted: st.getAudioTracks()[0]?.muted });
    st.getTracks().forEach(t => t.stop());
  } catch (e) { nkMic('gum-loi', String(e?.name || e)); return baoNho('Điện thoại vẫn chưa cho dùng micro. Bạn đóng hẳn Noe (vuốt tắt) rồi mở lại, Noe sẽ hỏi quyền lại từ đầu nhé.'); }
  // Đợi iPhone nhả micro rồi tự nghe tiếp trên ô đang trả lời (khỏi bấm Nói lại)
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (micCuoi?.o?.isConnected && SR) {
    veNutMic(micCuoi.nut, true, 'Đang mở micro…');
    setTimeout(() => { if (!nhanDang && micCuoi.o.isConnected) moLanNghe(SR, micCuoi.nut, micCuoi.o, 0); }, 900);
  } else toast('Micro bật lại rồi! Bấm Nói để nói tiếp nha.');
}
const dienThoaiMay = () => !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
function batMic(nut, o) {
  // Đang học dở thì không bao giờ chuyển trang (kẻo mất bài đang làm): chỉ dặn cách khác cho lần này
  if (!isSecureContext && S.bao_mat) return baoNho('Micro chưa được bật cho Noe (lúc mở app bạn chọn để lần sau). Lần này bạn gõ, hoặc bấm biểu tượng micro trên bàn phím để nói. Lần tới mở Noe, bấm Đồng ý là dùng được nút Nói.');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return baoNho(navigator.standalone ? 'Mở Noe từ biểu tượng ngoài màn hình chính iPhone thì chưa nghe được giọng nói. Bạn bấm micro trên bàn phím iPhone để nói thành chữ nhé.' : 'Trình duyệt này chưa nghe được giọng nói. Trên máy tính bạn dùng Chrome hoặc Edge; trên điện thoại dùng Safari (iPhone) hoặc Chrome (Android) nhé.');
  // iPhone hay từ chối bật lại micro ngay sau khi vừa tắt. Nên:
  // - "tạm ngừng" chỉ ngừng ghi chữ, micro vẫn mở; bấm Nói lần nữa là ghi tiếp trên cùng lần nghe đó;
  // - sang câu khác mà lần nghe cũ còn mở thì dùng tiếp nó cho ô mới (không tắt rồi bật lại);
  // - ngừng lâu (25 giây) mới tắt hẳn micro.
  micCuoi = { nut, o };
  const m = nhanDang;
  nkMic('bam-noi', { co_phien: !!m, da_tat: m?.daTat, dang_nghe: m?.nghe, cung_o: m?.o === o });
  if (m && !m.daTat) {
    if (m.o === o && m.nghe) { // tạm ngừng: tắt micro ngay để biểu tượng micro cam của iPhone biến mất (khỏi bị bấm nhầm)
      m.nghe = false; veNutMic(nut, false); clearTimeout(m.hen);
      try { m.r.stop(); } catch { /* bỏ qua */ }
      return;
    }
    // nói tiếp (cùng ô hoặc ô mới): giữ chữ trong ô (kể cả chữ vừa sửa tay), nối phần nói mới vào sau
    if (m.nut !== nut) veNutMic(m.nut, false);
    clearTimeout(m.hen);
    Object.assign(m, { o, nut, truoc: o.value.trim() ? o.value.trimEnd() + ' ' : '', boQua: m.toanBo, dangNghe: '', nghe: true });
    veNutMic(nut, true);
    return;
  }
  moLanNghe(SR, nut, o, 0);
}
// Mở một lần nghe mới. Micro còn bận (iPhone vừa nhả) thì tự thử lại vài lần, người học không phải bấm lại.
// iPhone: tạo bộ nghe MỚI lần thứ hai thì hay bị báo audio-capture. Nên cả trang chỉ dùng MỘT bộ nghe, lần sau khởi động lại chính nó.
let boNgheChung = null;
function moLanNghe(SR, nut, o, lanThu, lanTuNoi = 0) {
  const r = boNgheChung || (boNgheChung = new SR());
  r.lang = { vi: 'vi-VN', en: 'en-US' }[nnNguoiHoc()] || 'vi-VN';
  r.interimResults = true; r.continuous = true;
  const phien = { r, nut, o, nghe: true, daTat: false, truoc: o.value.trim() ? o.value.trimEnd() + ' ' : '', dangNghe: '', toanBo: '', boQua: '' };
  const dauTu = t => (t.trim().split(/\s+/)[0] || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  r.onresult = e => {
    let t = ''; for (const x of e.results) { const d = x[0].transcript; t += t && d && !/\s$/.test(t) && !/^\s/.test(d) ? ' ' + d : d; } // iPhone gửi các đoạn không có dấu cách
    t = t.trim();
    if (!t) return; // iPhone gửi kết quả rỗng lúc dừng: bỏ qua, không xoá chữ đã nghe
    const cu = phien.toanBo; phien.toanBo = t;
    if (!phien.daBaoChu) { phien.daBaoChu = true; nkMic('co-chu', { lan: lanThu }); }
    const o = phien.o;
    if (!phien.nghe) return; // đang tạm ngừng: không ghi
    if (!o.isConnected) { // đã rời câu hỏi: coi như tạm ngừng, lát tắt hẳn
      phien.nghe = false; clearTimeout(phien.hen); try { r.stop(); } catch { /* bỏ qua */ }
      return;
    }
    // phần nghe được sau lần bấm Nói tiếp (bỏ phần đã có từ trước khi tạm ngừng)
    let moi = t;
    if (phien.boQua) { if (t.startsWith(phien.boQua)) moi = t.slice(phien.boQua.length).trim(); else if (dauTu(t) === dauTu(phien.boQua) && t.length < phien.boQua.length) return; else phien.boQua = ''; }
    if (!moi) return;
    // iPhone tự làm lại danh sách sau mỗi lần ngừng nói: chốt phần đã nghe rồi nối phần mới vào sau
    if (phien.dangNghe && cu && dauTu(t) !== dauTu(cu) && !t.toLowerCase().includes(cu.toLowerCase().slice(0, 12))) { phien.truoc += phien.dangNghe + ' '; phien.boQua = ''; moi = t; }
    phien.dangNghe = moi;
    o.value = phien.truoc + phien.dangNghe;
  };
  let thuLai = false;
  r.onerror = e => {
    nkMic('loi', { loi: e.error, lan: lanThu, co_tieng: !!phien.coTieng });
    if (e.error === 'audio-capture' && lanThu < 4 && !phien.coTieng) { thuLai = true; return; } // micro còn bận: thử lại sau một nhịp
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { if (isSecureContext) batLaiMic(); else baoNho('Micro chưa được bật cho Noe. Lần này bạn gõ, hoặc bấm micro trên bàn phím để nói nhé.'); }
    else if (e.error === 'no-speech') { if (phien.nghe) toast('Noe chưa nghe thấy gì, bạn nói lại nha.'); }
    else if (e.error === 'network') baoNho('Nhận giọng nói cần có mạng. Bạn kiểm tra mạng rồi thử lại, hoặc gõ chữ nhé.');
    else if (e.error === 'audio-capture') batLaiMic();
  };
  r.onaudiostart = () => { phien.coTieng = true; nkMic('audiostart', { lan: lanThu }); };
  r.onstart = () => nkMic('start', { lan: lanThu });
  r.onspeechstart = () => nkMic('speechstart');
  // Điện thoại tự tắt nghe (im lâu, hết giờ): lần bấm Nói sau sẽ mở lần nghe mới
  r.onend = () => {
    nkMic('end', { lan: lanThu, thu_lai: thuLai, co_chu: !!phien.toanBo });
    phien.daTat = true; clearTimeout(phien.hen);
    if (nhanDang !== phien) return;
    nhanDang = null;
    // iPhone tự tắt sau vài giây im lặng dù người học chưa bấm tạm ngừng: tự nghe lại ngay trên cùng bộ nghe
    if (!thuLai && phien.nghe && phien.o.isConnected && lanTuNoi < 20) {
      nkMic('tu-nghe-lai', { lan: lanTuNoi + 1 });
      veNutMic(phien.nut, true);
      setTimeout(() => { if (!nhanDang && phien.o.isConnected) moLanNghe(SR, phien.nut, phien.o, 0, phien.daBaoChu ? 0 : lanTuNoi + 1); }, 250);
      return;
    }
    if (thuLai && phien.o.isConnected) { veNutMic(phien.nut, true, 'Đang mở micro…'); setTimeout(() => { if (!nhanDang && phien.o.isConnected) moLanNghe(SR, phien.nut, phien.o, lanThu + 1); }, 700); return; }
    veNutMic(phien.nut, false);
  };
  nhanDang = phien; veNutMic(nut, true);
  if (laIPhone() && !daDanChamCam) { daDanChamCam = true; toast('Noe đang nghe. Đừng bấm vào biểu tượng micro màu cam của iPhone nha.'); }
  try { r.start(); } catch {
    nhanDang = null;
    if (lanThu < 4) { veNutMic(nut, true, 'Đang mở micro…'); setTimeout(() => { if (!nhanDang && o.isConnected) moLanNghe(SR, nut, o, lanThu + 1); }, 700); }
    else { veNutMic(nut, false); toast('Micro chưa sẵn sàng, bạn bấm Nói lại nha.'); }
  }
}
const veNutMic = (nut, dang, chu) => { if (!nut?.isConnected) return; nut.classList.toggle('dang', dang); nut.querySelector('span').textContent = chu || (dang ? 'Đang nghe… bấm để tạm ngừng' : 'Nói'); };
const tatMic = () => { const cu = nhanDang; nhanDang = null; if (cu) { cu.daTat = true; clearTimeout(cu.hen); try { cu.r.stop(); } catch { /* bỏ qua */ } } };
// Câu tự luận ngắn: gõ hoặc nói 1–2 câu, xin gợi ý từng bước, so với đáp án mẫu. Trả về 'hoc-lai' | 'kiem-tra' | null (bỏ qua).
function tuLuanNgan(lt) {
  let mo = 0;
  man.innerHTML = `${noi('suy-nghi', `<b>Câu cuối của phần làm thử.</b> Trả lời ngắn thôi, 1–2 câu, ${cachNoi()}. Bí thì bấm gợi ý.`)}
    <div class="the"><div class="de-ngan">${md(lt.de)}</div><div class="o-tra-loi"><textarea id="traLoi" rows="2" placeholder="Trả lời 1–2 câu"></textarea>${nutMic('traLoi')}</div><div id="goiY"></div>
      <div class="hang"><button id="xinGoiY">Xin gợi ý</button><button id="xemMau" class="chinh">So đáp án</button><button id="boQuaTL" class="nho">Bỏ qua</button></div><div id="mau"></div>
      <div class="sau-so" id="danhGia" hidden><p><b>So xong rồi, bạn muốn:</b></p><div class="hang"><button id="hocLaiBai">Học lại bài</button><button class="chinh" id="kiemTraLuon">Làm bài kiểm tra luôn</button></div></div></div>${theViecThat(lt)}`;
  scrollTo(0, 0); ganMic();
  const gy = lt.goi_y || [];
  $('#xinGoiY').disabled = !gy.length;
  $('#xinGoiY').onclick = () => { if (mo < gy.length) { $('#goiY').insertAdjacentHTML('beforeend', `<p class="goi-y-o">Gợi ý ${mo + 1}: ${esc(gy[mo])}</p>`); mo++; } if (mo >= gy.length) $('#xinGoiY').disabled = true; };
  $('#xemMau').onclick = () => {
    tatMic();
    if (!$('#traLoi').value.trim()) return baoNho('Bạn thử trả lời trước (gõ hoặc bấm Nói), rồi mới so với đáp án mẫu nhé.');
    $('#mau').innerHTML = `<div class="vi-du"><b>Đáp án mẫu:</b> ${md(lt.dap_an_mau)}</div>`; $('#danhGia').hidden = false;
    $('#danhGia').scrollIntoView({ block: 'nearest' });
  };
  return new Promise(ok => {
    $('#boQuaTL').onclick = () => { tatMic(); ok(null); };
    $('#hocLaiBai').onclick = () => ok('hoc-lai');
    $('#kiemTraLuon').onclick = () => ok('kiem-tra');
  });
}
// Bài mẫu cũ: đề làm thật ngoài app, không bắt gõ câu trả lời
function lamThuCu(lt) {
  const gy = lt.goi_y || [];
  man.innerHTML = `${noi('suy-nghi', '<b>Làm thử.</b> Bạn làm theo đề bên dưới (ngoài app cũng được), xong thì bấm cho Noe biết nhé.')}
    <div class="the"><div class="de-ngan">${md(lt.de)}</div>
      ${gy.length ? `<details class="giai-thich"><summary class="mo">Xem gợi ý từng bước</summary><ol class="huong-dan">${gy.map(g => `<li>${esc(g)}</li>`).join('')}</ol></details>` : ''}
      ${lt.dap_an_mau ? `<details class="giai-thich"><summary class="mo">Xem đáp án mẫu</summary>${md(lt.dap_an_mau)}</details>` : ''}
      <div class="hang"><button class="chinh" id="duoc">Mình làm được</button><button id="chua">Chưa làm được</button></div></div>`;
  scrollTo(0, 0);
  return new Promise(ok => { $('#duoc').onclick = () => ok(true); $('#chua').onclick = () => ok(false); });
}
async function phanKiemTra(b, KQ) {
  const cau = Object.values((await api('/api/cau-hoi')).cau_hoi).filter(c => c.id.startsWith(b.ma + '-q'));
  const chon = daoThuTu(cau.filter(c => c.loai === 'chon'));
  man.innerHTML = `${noi('vui', `<b>Kiểm tra cuối buổi:</b> ${chon.length} câu ngắn, mỗi câu đúng 1 sao. Tự kiểm tra là cách nhớ lâu nhất đó.`)}<div class="hang"><button class="chinh" id="lam">Làm bài</button><button id="boQua">Bỏ qua lần này</button></div>`;
  const lam = await new Promise(ok => { $('#lam').onclick = () => ok(true); $('#boQua').onclick = () => ok(false); });
  if (!lam) { KQ.bo_qua = true; return; }
  for (let i = 0; i < chon.length; i++) { const kq = await motCau(chon[i], `Câu ${i + 1}/${chon.length}`); KQ.kiem.push({ id: chon[i].id, dung: kq.dung }); }
  const tl = cau.find(c => c.loai === 'tu-luan');
  if (tl) {
    man.innerHTML = `${noi('suy-nghi', `<b>Câu cuối:</b> giải thích bằng lời của bạn (${cachNoi()}). Xong thì Noe nhờ AI xem bạn hiểu đúng chưa, cùng với phần tổng kết.`)}<div class="the"><h3>${esc(tl.de)}</h3><div class="o-tra-loi"><textarea id="tlv"></textarea>${nutMic('tlv')}</div><div class="hang"><button class="chinh" id="tiep">Tiếp</button></div></div>`;
    ganMic();
    await cho('#tiep'); tatMic();
    KQ.tu_luan = { de: tl.de, y_can_co: tl.y_can_co, tra_loi: $('#tlv').value.trim() };
  }
}
async function phanGhiLai(b) {
  man.innerHTML = `${noi('vui', '<b>Tổng kết buổi học:</b> nói hoặc viết vài câu bằng lời của bạn, hôm nay bạn hiểu được gì? Noe sẽ nhờ AI xem bạn hiểu đúng chưa.')}<div class="the"><div class="o-tra-loi"><textarea id="nk" placeholder="Hôm nay mình hiểu được..."></textarea>${nutMic('nk')}</div><div class="hang"><button class="chinh" id="tiep">Xong, nhờ Noe xem giúp</button></div></div>`;
  ganMic();
  await cho('#tiep'); tatMic();
  const v = $('#nk').value.trim(); if (v) await api('/api/nhat-ky', { ma: b.ma, dong: v });
  return v;
}

// Lưu kết quả buổi học ngay khi học xong (trước lúc AI chấm tổng kết): sao, lịch ôn, chuỗi ngày, mức hiểu module.
// Trả về số liệu để màn kết quả hiện.
async function luuKetQua(b, m, KQ) {
  const td = S.tien_do, hom = NGAY();
  td.lich_on = td.lich_on || []; td.buoi_da_hoc = td.buoi_da_hoc || []; td.module = td.module || {}; td.hoc_lai = td.hoc_lai || [];
  const tatCa = (await api('/api/cau-hoi')).cau_hoi;
  const modCua = id => { const ma = id.replace(/-q\d+$/, ''); return cacModule(S.lo_trinh).find(x => (x.buoi || []).some(y => y.ma === ma))?.ma; };
  let sao = 0, saoOn = 0; const moiNho = new Set(); // sao vàng: câu kiểm tra đúng (tối đa 5) · sao xanh: câu ôn đầu buổi đúng (tối đa 3)
  const ttTruoc = soLieu().thongTue, dung = KQ.kiem.filter(k => k.dung).length;
  let xongModule = false;
  if (KQ.hoc_lai && b) {
    // Học lại: không thêm lịch ôn. Có bộ câu hỏi MỚI (anh chốt 24/11/2026) thì đúng thêm câu nào thêm sao câu đó, tối đa 5 sao mỗi buổi
    if (KQ.cau_moi) {
      // sao đã có của buổi: lần học đầu và các lần học lại có câu mới (lần học lại bằng câu cũ không tính)
      const daCo = Math.max(0, ...[...td.buoi_da_hoc, ...td.hoc_lai.filter(x => x.cau_moi)].filter(x => x.ma === b.ma && x.tong).map(x => Math.min(5, x.diem)));
      sao = Math.max(0, Math.min(5, dung) - daCo); td.sao = (td.sao || 0) + sao;
    }
    td.hoc_lai.push({ cau_moi: !!KQ.cau_moi, ma: b.ma, module: m?.ma, ngay: hom, diem: dung, tong: KQ.kiem.length, lam_thu_duoc: KQ.dung, tong_ket: null, do_kho: KQ.do_kho || null });
  } else {
    for (const o of KQ.on) {
      const x = td.lich_on.find(y => y.id_cau_hoi === o.id); if (!x) continue;
      if (o.dung) { saoOn++; if (x.lan_cuoi && soNgay(x.lan_cuoi, hom) >= 3) { const mm = modCua(o.id); if (mm && !td.module[mm]?.nho) { td.module[mm] = { ...(td.module[mm] || {}), nho: true }; moiNho.add(mm); } } x.bac = Math.min((x.bac || 0) + 1, BAC.length - 1); }
      else x.bac = 0;
      x.lan_cuoi = hom; x.han_on = congNgay(BAC[x.bac]);
    }
    for (const k of KQ.kiem) {
      if (k.dung) sao++;
      if (tatCa[k.id] && !td.lich_on.some(y => y.id_cau_hoi === k.id)) td.lich_on.push({ id_cau_hoi: k.id, bac: k.dung ? 1 : 0, lan_cuoi: hom, han_on: congNgay(BAC[k.dung ? 1 : 0]) });
    }
    td.sao = (td.sao || 0) + sao;
    td.sao_on = (td.sao_on || 0) + saoOn;
    if (b) td.buoi_da_hoc.push({ ma: b.ma, module: m?.ma, ngay: hom, diem: dung, tong: KQ.kiem.length, bo_qua_kiem_tra: KQ.bo_qua, lam_thu_duoc: KQ.dung, tong_ket: null,
      do_kho: KQ.do_kho || null, sai: KQ.kiem.filter(k => !k.dung).map(k => k.id), sao_on: saoOn });
  }
  if (m) { const t = tinhModule(td, m); xongModule = !!t && !KQ.hoc_lai; if (t) td.module[m.ma] = { ...(td.module[m.ma] || {}), ...t }; }
  await api('/api/tien-do', td);
  // Chuỗi ngày (chung mọi khoá): hôm nay có học là giữ chuỗi; lỡ ngày thì máy chủ tự dùng vé giữ chuỗi nếu còn
  const r = await api('/api/noe', { hoc_xong: hom }).catch(() => ({}));
  dangHocBuoi = false;
  await tai();
  return { sao, saoOn, moiNho, xongModule, ttTruoc, veDaDung: +r.noe?.ve_vua_dung || 0, dung };
}
// Có kết quả chấm tổng kết: ghi vào lần học vừa lưu, tính lại mức hiểu của module
async function ghiDanhGia(b, m, KQ) {
  const td = S.tien_do, ds = KQ.hoc_lai ? (td.hoc_lai || []) : (td.buoi_da_hoc || []);
  const x = [...ds].reverse().find(y => y.ma === b.ma); if (!x) return;
  x.tong_ket = KQ.danh_gia.muc;
  if (m) { const t = tinhModule(td, m); if (t) td.module[m.ma] = { ...(td.module[m.ma] || {}), ...t }; }
  await api('/api/tien-do', { buoi_da_hoc: td.buoi_da_hoc, hoc_lai: td.hoc_lai, module: td.module }); await tai();
}
async function manKetQua(b, m, KQ, tt) {
  const { sao, saoOn, moiNho, xongModule, ttTruoc, veDaDung, dung } = tt;
  if (KQ.hoc_lai && b) {
    const tang = soLieu().thongTue > ttTruoc;
    man.innerHTML = `${haiThanh()}
      ${noi(tang ? 'khen' : 'vui', `<h2>Học lại xong ${esc(b.ten)}!</h2><p>${KQ.bo_qua ? '' : `Kiểm tra đúng <b>${dung}/${KQ.kiem.length}</b>. `}${sao ? `Được thêm <b>${sao} sao</b>! ` : ''}${KQ.danh_gia ? `Tổng kết: <b>${MUC_TK[KQ.danh_gia.muc][0]}</b>. ` : ''}${tang ? 'Thông tuệ tăng rồi nè!' : 'Mỗi lần học lại là mỗi lần chắc hơn.'}</p>`)}
      <div class="hang"><button class="chinh" id="veNha">Về trang chủ</button>${KQ.danh_gia?.muc === 'chua-dung' ? '<button id="lai">Học lại lần nữa</button>' : ''}</div>`;
    if (tang) noePhao(man.querySelector('.noi'));
    $('#veNha').onclick = manTrangChu;
    if ($('#lai')) $('#lai').onclick = () => buoiHoc(b, m, true);
    scrollTo(0, 0);
    return;
  }
  // Hỏi nâng / hạ mức sau buổi (người học đồng ý mới đổi); đổi mức thì bài kế tiếp soạn ngầm lại theo mức mới
  const td = S.tien_do, nhipTruoc = +td.nhip || 0;
  const loiChinh = b ? await dieuChinhSauBuoi(td, m) : '';
  if (b && loiChinh) { await api('/api/tien-do', { nhip: td.nhip, soan_lai: td.soan_lai || [] }); await tai(); if ((+S.tien_do.nhip || 0) !== nhipTruoc) chuanBiNgam({ truoc: true, lai: true }).catch(() => {}); }
  const huyMoi = await nhanHuyHieu();
  const chuoi = +S.noe?.chuoi || 0;
  // Khuyến khích học lại: kiểm tra đúng dưới 2 câu (dưới 2 sao), hoặc AI chấm tổng kết là chưa hiểu đúng
  const itSao = !!b && !KQ.bo_qua && KQ.kiem.length > 0 && dung < 2, chuaHieu = !!b && KQ.danh_gia?.muc === 'chua-dung';
  const nenHocLai = itSao || chuaHieu;
  man.innerHTML = `${haiThanh()}
    ${noi(xongModule || moiNho.size ? 'khen' : 'chao', `<h2>${xongModule ? 'Xong một module, giỏi quá!' : 'Xong buổi học!'}</h2>
      <p>${b ? (KQ.bo_qua ? 'Lần này bạn bỏ qua kiểm tra, lần sau làm nha.' : `Kiểm tra đúng <b>${dung}/${KQ.kiem.length}</b>.`) : ''} ${KQ.on.length ? `Ôn đúng ${KQ.on.filter(o => o.dung).length}/${KQ.on.length}.` : ''} Bạn nhận <b>+${sao} sao vàng</b>${saoOn ? ` và <b>+${saoOn} sao xanh</b> (ôn bài cũ)` : ''}.</p>
      <p>${ic('lua', 'mau-lua')} Chuỗi <b>${chuoi} ngày</b> học liên tiếp${chuoi >= 2 ? '. Giữ lửa nha!' : '. Mai học tiếp là thành chuỗi!'}</p>
      ${veDaDung ? `<p>Bạn lỡ ${veDaDung} ngày, Noe đã dùng ${veDaDung} vé giữ chuỗi nên chuỗi ngày vẫn còn nguyên.</p>` : ''}
      ${moiNho.size ? '<p>Thông tuệ tăng: bạn đã <b>nhớ</b> được một module. Mình sáng hơn rồi nè!</p>' : soLieu().thongTue > ttTruoc ? `<p>Thông tuệ tăng lên <b>${soLieu().thongTue}%</b>.</p>` : ''}
      ${loiChinh ? `<p class="mo">${esc(loiChinh)}</p>` : ''}${b && noiTuDong() ? '<p class="mo" id="baiSau">Noe đang soạn bài kế tiếp…</p>' : ''}`)}
    ${xongModule && m?.thuc_hanh ? `<div class="the"><h3>Thực hành cuối module</h3><p>${esc(m.thuc_hanh)}</p><p class="mo">Làm xong bài này thì Thông tuệ tăng phần "Làm thật".</p><div class="hang"><button class="chinh" id="lamThat">Nộp bài thực hành</button><button id="sau">Để sau</button></div></div>` : ''}
    ${nenHocLai ? `<div class="the the-hoc-lai"><h3>Mình xem lại buổi này nha?</h3><p class="mo">${itSao ? `Lần này kiểm tra mới đúng <b>${dung}/${KQ.kiem.length}</b> câu. Không sao cả, ai cũng có lúc vậy!` : 'Phần tổng kết cho thấy còn chỗ chưa hiểu đúng.'} Xem lại ngay lúc còn nhớ là lần sau chắc hơn nhiều. Học lại không mất sao đã có.</p><div class="hang"><button class="chinh" id="hocLai">Học lại buổi này</button></div></div>` : ''}
    <div class="hang">${b ? `<button ${nenHocLai ? '' : 'class="chinh"'} id="hocTiep" ${noiTuDong() ? 'disabled' : ''}>${noiTuDong() ? 'Đang soạn bài tiếp…' : 'Học buổi tiếp theo'}</button>` : ''}<button ${b ? '' : 'class="chinh"'} id="veNha">Về trang chủ</button></div>`;
  scrollTo(0, 0);
  theoDoiBaiSau();
  if (xongModule || moiNho.size) noePhao(man.querySelector('.noi'));
  $('#veNha').onclick = manTrangChu;
  if ($('#hocLai')) $('#hocLai').onclick = () => buoiHoc(b, m, true);
  if ($('#lamThat')) {
    $('#lamThat').onclick = () => nopThucHanh(m);
    $('#sau').onclick = manTrangChu;
  }
  // Lên nấc huy hiệu mới: màn ăn mừng toàn màn hình của nấc cao nhất vừa đạt (lên nhiều nấc một lúc thì không bật liền nhiều màn)
  if (huyMoi.length) await anMungHuyHieu(huyMoi.at(-1).moc);
}

// ---------- Điện thoại ----------
async function manDienThoai() {
  vaoMan('dien-thoai', manDienThoai, arguments);
  const { url, url_bao_mat: bm } = await api('/api/dien-thoai', {});
  if (!url) {
    // Đang mở trên điện thoại: máy chủ không đưa mã ghép đôi ra ngoài máy tính, nên không có mã QR ở đây
    hienHop(`<h2>Bạn đang mở Noe trên điện thoại rồi</h2>
      <p>Mã QR chỉ hiện trên <b>máy tính</b> (để người khác trong cùng wifi không lấy được mã). Muốn nối thêm điện thoại khác thì mở app trên máy tính, bấm <b>Mở trên điện thoại</b> rồi quét mã.</p>
      <p><b>Ghim Noe ra màn hình chính</b> để lần sau mở như một app:</p>
      <ol class="huong-dan"><li><b>iPhone:</b> trong <b>Chrome</b> bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên, cạnh ô địa chỉ) → <b>Thêm vào Màn hình chính</b> → <b>Thêm</b>.</li>
      <li><b>Android:</b> trong <b>Chrome</b> bấm menu ba chấm → <b>Thêm vào màn hình chính</b>.</li></ol>
      <div class="hang"><button class="chinh" id="dong">Đóng</button></div>`);
    $('#dong').onclick = dongHop;
    return;
  }
  // Mã QR dẫn thẳng tới bản bảo mật (https): ghim từ đầu là đúng bản, Noe chạy toàn màn hình và nút Nói dùng được ngay.
  // Máy không tạo được https (thiếu openssl) thì dùng bản thường như trước.
  const dich = bm || url;
  hienHop(`<h2>Mở trên điện thoại</h2>
    <ol class="huong-dan"><li>Điện thoại bắt <b>cùng wifi</b> với máy tính này.</li>
      <li>Mở camera điện thoại, quét mã QR bên dưới, bấm vào đường dẫn hiện ra.</li>
      ${bm ? `<li>Lần đầu, điện thoại cảnh báo vì chứng chỉ do máy tính nhà bạn tự tạo (an toàn trong wifi nhà). Bấm qua một lần:<br>
        <b>iPhone:</b> Hiển thị chi tiết → truy cập trang web này → Truy cập trang web.<br><b>Android:</b> Nâng cao → Tiếp tục truy cập.</li>` : ''}
      <li>Ghim Noe ra màn hình chính để mở như một app:<br>
        <b>iPhone:</b> mở bằng <b>Chrome</b>, bấm <b>Chia sẻ</b> (ô vuông có mũi tên, cạnh ô địa chỉ) → <b>Thêm vào Màn hình chính</b> → <b>Thêm</b>.<br>
        <b>Android:</b> trong <b>Chrome</b> bấm menu ba chấm → <b>Thêm vào màn hình chính</b>.</li>
      ${bm ? '<li>Mở Noe từ biểu tượng vừa ghim, bấm <b>Đồng ý</b> khi Noe xin dùng micro là học và nói được ngay.</li>' : ''}</ol>
    <div id="qr" style="display:grid;place-items:center;padding:12px;background:#fff;border-radius:12px;width:fit-content"></div>
    <pre class="prompt">${esc(dich)}</pre>
    <p class="mo">Địa chỉ có mã ghép đôi, người khác trong mạng không có mã sẽ không vào được. Không đưa lên mạng công khai. Mã giữ nguyên giữa các lần mở app, nên biểu tượng trên màn hình chính dùng được lâu dài. Khi máy tính tắt app thì điện thoại cũng không học được.</p>
    <div class="hang"><button class="chinh" id="dong">Đóng</button></div>`);
  $('#dong').onclick = dongHop;
  try {
    if (!window.QRCode) await new Promise((ok, loi) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; s.onload = ok; s.onerror = loi; document.head.append(s); });
    new QRCode($('#qr'), { text: dich, width: 220, height: 220 });
  } catch { $('#qr').outerHTML = '<p class="mo">Không tải được mã QR (máy đang không có mạng). Gõ địa chỉ trên vào điện thoại nhé.</p>'; }
}

// ---------- Trang giới thiệu (mở app lần đầu) ----------
// Cảnh Noe: Noe to ở giữa nhún nhảy vẫy tay, các "bạn học" (đồ vật có mặt cười) bay lơ lửng xung quanh.
// Vẽ bằng SVG, nét viền đậm, màu phẳng; không dùng ảnh ngoài.
function canhGioiThieu() {
  // Sticker bản 3: hình phẳng, 2 màu, không viền, không mặt (đơn giản, để Noe là nhân vật duy nhất)
  const vat = [
    // [x %, y %, xoay độ, độ trễ, hình vẽ trong khung -40..40]
    // Sách mở
    [13, 22, -12, 0, `<path d="M-30 -18 q15 -6 30 2 v36 q-15 -8 -30 -2 z" fill="#14A38B"/><path d="M30 -18 q-15 -6 -30 2 v36 q15 -8 30 -2 z" fill="#2DD4B5"/>`],
    // Bóng đèn
    [85, 16, 10, .7, `<circle cy="-6" r="20" fill="#FFC93C"/><rect x="-9" y="12" width="18" height="12" rx="4" fill="#A9B4C2"/><circle cx="-7" cy="-12" r="5" fill="#fff" opacity=".6"/>`],
    // Máy tính xách tay
    [88, 64, 6, 1.3, `<rect x="-28" y="-22" width="56" height="36" rx="8" fill="#7B6CFF"/><rect x="-20" y="-14" width="40" height="20" rx="4" fill="#B9B1FF"/><rect x="-36" y="16" width="72" height="9" rx="4.5" fill="#5A4BE0"/>`],
    // Quả địa cầu
    [11, 68, -8, .35, `<circle r="24" fill="#4FB3E8"/><path d="M-14 -14 q10 2 8 12 q-6 6 0 14 M10 -18 q8 8 2 14 q6 4 6 12" fill="none" stroke="#14A38B" stroke-width="7" stroke-linecap="round"/>`],
    // Bút chì
    [52, 93, -24, 1, `<rect x="-26" y="-7" width="44" height="14" rx="3" fill="#FF8A3D"/><path d="M18 -7 l14 7 l-14 7 z" fill="#FFE2B8"/><rect x="-32" y="-7" width="8" height="14" rx="3" fill="#E8507A"/>`],
  ];
  const sao = [[30, 8, .55], [68, 30, .4], [24, 46, .35], [76, 88, .5]];
  // Noe vẫy tay: bọc hai cánh tay trong nhóm có hoạt ảnh riêng
  // Trang chính: Noe mặc đồ phi hành gia (người học đang mặc món khác thì hiện món của họ)
  const noeTo = noeMac('chao', S?.noe?.dang_mac || 'phi-hanh-gia')
    .replace(/(<ellipse cx="44" cy="110"[^>]*\/>)/, '<g class="a vay-trai">$1</g>')
    .replace(/(<ellipse cx="156" cy="110"[^>]*\/>)/, '<g class="a vay-phai">$1</g>');
  return `<div class="canh-gt" aria-hidden="true">
    <svg class="nen-gt" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M50 4 C76 2 98 22 96 50 C94 78 74 98 48 96 C22 94 3 76 4 50 C5 24 24 6 50 4 Z" fill="var(--nen-blob)"/></svg>
    <div class="vong-sang"></div>
    <div class="bong-noe"></div>
    ${vat.map(([x, y, r, d, hinh]) => `<svg class="vat-bay" style="left:${x}%;top:${y}%;--xoay:${r}deg;animation-delay:-${d * 2}s" viewBox="-42 -42 84 84">${hinh}</svg>`).join('')}
    ${sao.map(([x, y, s], i) => `<svg class="sao-nhay" style="left:${x}%;top:${y}%;width:${s * 60}px;animation-delay:${i * .35}s" viewBox="-11 -11 22 22"><path d="M0 -10 q1.5 8.5 10 10 q-8.5 1.5 -10 10 q-1.5 -8.5 -10 -10 q8.5 -1.5 10 -10 z" fill="var(--l2)"/></svg>`).join('')}
    <span class="noe-to">${noeTo}</span>
  </div>`;
}

// Chữ của trang giới thiệu theo ngôn ngữ (các màn khác sẽ dịch dần)
const GT = {
  vi: {
    h1: 'Học bất cứ điều gì cùng AI của bạn, theo cách vui nhất!',
    p: 'Noe cùng AI bạn đang dùng tìm nguồn học uy tín, xếp lộ trình riêng cho bạn, rồi kèm bạn học mỗi ngày. Miễn phí, mã nguồn công khai, dữ liệu nằm trên máy bạn.',
    batDau: 'Bắt đầu', hocTiep: 'Học tiếp', khoaMoi: 'Bắt đầu khoá học mới', daCo: 'Tôi đã có dữ liệu học', batDauNgay: 'Bắt đầu ngay',
    mon: ['🇬🇧 Tiếng Anh', '💻 Lập trình', '📊 Dữ liệu', '🖥️ Máy chủ', '🎨 Thiết kế', '📈 Kinh doanh', '🧮 Toán', '🎸 Âm nhạc', '📷 Quay dựng video', '🧾 Kế toán'],
    giup: 'Noe giúp bạn những gì?',
    the: [['suy-nghi', 'Lộ trình riêng cho bạn', '3 cấp: Sơ cấp, Trung cấp, Chuyên sâu. Nguồn từ đại học, chuyên gia.'],
      ['vui', 'Mỗi ngày một chút', 'Bài ngắn, làm thử, kiểm tra. Noe ôn đúng lúc bạn sắp quên.'],
      ['khen', 'Thấy rõ tiến bộ', 'Bản đồ học, Tiến độ, Thông tuệ, sao, chuỗi ngày.'],
      ['yeu', 'Nhắc lịch giúp bạn', 'Nối Google Lịch, lỡ buổi thì Noe tự dời.']],
    baBuoc: 'Bắt đầu trong 3 bước',
    buoc: [['Nối AI của bạn', 'Có cả cách miễn phí.'], ['Trả lời vài câu', 'Muốn học gì, để làm gì, rảnh bao lâu.'], ['Nhận lộ trình và học', 'Chọn cấp, Noe kèm bạn từng buổi.']],
    mayKhac: 'Dữ liệu học nằm trong thư mục <b>Tài liệu/Hoc cung Noe</b> trên máy cũ. Chép cả thư mục đó sang máy này (cùng chỗ), mở lại app là học tiếp được. Hoặc mở Noe trên điện thoại cùng wifi với máy cũ.', hieu: 'Đã hiểu',
    sauNay: 'Giao diện bên trong đang là tiếng Việt, bản tiếng Anh sẽ có sau. Bài học AI soạn sẽ theo ngôn ngữ bạn chọn.',
  },
  en: {
    h1: 'Learn anything with your own AI, the fun way!',
    p: 'Noe works with the AI you already use to find trusted sources, build a learning path just for you, and coach you every day. Free, source-available, and your data stays on your computer.',
    batDau: 'Get started', hocTiep: 'Continue learning', khoaMoi: 'Start a new course', daCo: 'I already have my data', batDauNgay: 'Get started now',
    mon: ['🇬🇧 English', '💻 Coding', '📊 Data', '🖥️ Servers', '🎨 Design', '📈 Business', '🧮 Math', '🎸 Music', '📷 Video editing', '🧾 Accounting'],
    giup: 'How Noe helps you',
    the: [['suy-nghi', 'A path made for you', '3 levels: Beginner, Intermediate, Expert. Sources from universities and experts.'],
      ['vui', 'A little every day', 'Short lessons, practice, quizzes. Noe reviews right before you forget.'],
      ['khen', 'See your progress', 'Learning map, Progress, Mastery, stars, daily streaks.'],
      ['yeu', 'Reminders for you', 'Connect Google Calendar; miss a session and Noe reschedules.']],
    baBuoc: 'Start in 3 steps',
    buoc: [['Connect your AI', 'Free options included.'], ['Answer a few questions', 'What, why, and how much time you have.'], ['Get your path and learn', 'Pick a level; Noe coaches you each session.']],
    mayKhac: 'Your learning data lives in the <b>Documents/Hoc cung Noe</b> folder on your old computer. Copy that whole folder to the same place on this computer, reopen the app, and carry on. Or open Noe on your phone on the same Wi-Fi as the old computer.', hieu: 'Got it',
    sauNay: 'The app screens are in Vietnamese for now; English is coming. Lessons your AI writes will follow the language you choose.',
  },
};
const NGON_NGU_GT = [['vi', 'Tiếng Việt'], ['en', 'English']];
function ngonNguGT() {
  let n = S.ho_so?.ngon_ngu;
  try { n = n || localStorage.getItem('noe_ngon_ngu'); } catch { /* trình duyệt chặn lưu: dùng mặc định */ }
  if (!n) n = (navigator.language || 'vi').toLowerCase().startsWith('vi') ? 'vi' : 'en';
  return GT[n] ? n : 'vi';
}
async function doiNgonNgu(n) {
  try { localStorage.setItem('noe_ngon_ngu', n); } catch { /* bỏ qua */ }
  try { await api('/api/ho-so', { truong: { ngon_ngu: n } }); await tai(); } catch { S.ho_so = { ...(S.ho_so || {}), ngon_ngu: n }; }
  document.documentElement.lang = n;
}
// Nền trắng / nền đen: người học tự chọn, lưu trên máy này. Chưa chọn thì theo cài đặt sáng/tối của máy.
function giaoDienDangDung() {
  const g = document.documentElement.dataset.giaoDien;
  if (g === 'trang' || g === 'den') return g;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'den' : 'trang';
}
function datGiaoDien(g) {
  document.documentElement.dataset.giaoDien = g;
  try { localStorage.setItem('noe_giao_dien', g); } catch { /* trình duyệt chặn lưu: chỉ đổi lần này */ }
  veChonGiaoDien();
}
function veChonGiaoDien() {
  const g = giaoDienDangDung(), k = $('#gdKhung');
  if (!k) return;
  k.innerHTML = `<span class="chon-gd" role="group" aria-label="Giao diện">
    <button type="button" data-gd="trang" aria-pressed="${g === 'trang'}" aria-label="Nền trắng"><span aria-hidden="true">☀️</span><span class="chu-gd"> Nền trắng</span></button>
    <button type="button" data-gd="den" aria-pressed="${g === 'den'}" aria-label="Nền đen"><span aria-hidden="true">🌙</span><span class="chu-gd"> Nền đen</span></button></span>`;
  k.querySelectorAll('button[data-gd]').forEach(b => b.onclick = () => datGiaoDien(b.dataset.gd));
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.content = g === 'den' ? '#111A16' : '#F6F7F3';
}
function chonNgonNgu() {
  const n = ngonNguGT();
  return `<label class="chon-nn"><span aria-hidden="true">🌐</span><span class="an-chu">${n === 'vi' ? 'Ngôn ngữ' : 'Language'}</span>
    <select id="nn" aria-label="${n === 'vi' ? 'Ngôn ngữ hiển thị' : 'Display language'}">${NGON_NGU_GT.map(([m, t]) => `<option value="${m}" ${m === n ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`;
}
function manGioiThieu() {
  vaoMan('gioi-thieu', manGioiThieu, arguments);
  document.body.classList.add('gioi-thieu');
  const n = ngonNguGT(), T = GT[n];
  document.documentElement.lang = n;
  $('#steps').innerHTML = '';
  const dangHoc = !!(S.ai.cach_noi || S.ho_so?.linh_vuc);
  man.innerHTML = `
    <section class="gt-dau">
      ${canhGioiThieu()}
      <div class="gt-chu">
        <h1>${T.h1}</h1>
        <p class="mo">${T.p}</p>
        <div class="gt-nut">
          <button class="nut-to chinh" id="batDau">${dangHoc ? T.hocTiep : T.batDau}</button>
          ${dangHoc ? `<button class="nut-to phu" id="xemLai">${T.khoaMoi}</button>` : `<button class="nut-to phu" id="daCo">${T.daCo}</button>`}
        </div>
      </div>
    </section>
    ${dangHoc ? theKhoaHoc(true) : ''}
    <section class="gt-loi">
      <h2>${T.baBuoc}</h2>
      <ol class="gt-buoc">${T.buoc.map(([b, m]) => `<li><b>${b}</b><span class="mo">${m}</span></li>`).join('')}</ol>
    </section>
    <section class="gt-mon" aria-hidden="true"><div class="gt-mon-chay">${[...T.mon, ...T.mon].map(m => `<span>${m}</span>`).join('')}</div></section>
    <section class="gt-loi">
      <details class="gt-them"><summary><h2>${T.giup}</h2></summary>
      <div class="gt-luoi gon">${T.the.map(([tam, h, p]) => `<div class="the"><span class="gt-noe">${noe(tam)}</span><div><h3>${h}</h3><p class="mo">${p}</p></div></div>`).join('')}</div></details>
      <div class="hang gt-cuoi"><button class="nut-to chinh" id="batDau2">${dangHoc ? T.hocTiep : T.batDauNgay}</button></div>
    </section>`;
  const vao = () => dangHoc ? hocTiep() : dieuHuong();
  $('#batDau').onclick = vao; $('#batDau2').onclick = vao;
  if ($('#xemLai')) $('#xemLai').onclick = batDauKhoaMoi;
  ganKhoaHoc(true);
  if ($('#daCo')) $('#daCo').onclick = () => hopChon(noi('vui', T.mayKhac), [T.hieu]);
  window.scrollTo(0, 0);
}

// ---------- Nhiều khoá học ----------
// "Bắt đầu khoá học mới": máy chủ cất khoá đang học (không xoá gì) và mở một khoá trắng, nên mọi màn vẽ lại từ trạng thái trắng.
async function batDauKhoaMoi() {
  const r = await api('/api/khoa-hoc/moi', {}).catch(() => ({}));
  // Server cũ (bật trước bản sửa) chưa có chức năng này: báo rõ, không âm thầm mở lại khoá cũ
  if (r.loi === 'dang-nghien-cuu') return baoNho(r.thong_bao);
  if (!r.ok) return baoNho(S.ban_web ? 'Chưa mở được khoá mới, kiểm tra mạng rồi thử lại nhé.' : 'Chưa mở được khoá mới. Hãy tắt cửa sổ đen của app rồi bấm lại MO-APP.bat để app chạy bản mới nhất.');
  await tai();
  document.body.classList.remove('gioi-thieu');
  dieuHuong();
}
// Mở (chuyển sang) một khoá đã có. Trả về true nếu đã mở được.
async function moKhoa(ma) {
  if (!ma || ma === S.khoa_hoc?.hien_tai) return true;
  const r = await api('/api/khoa-hoc/mo', { ma }).catch(() => ({}));
  if (r.loi === 'dang-nghien-cuu') { baoNho(r.thong_bao); return false; }
  if (!r.ok) { baoNho(S.ban_web ? 'Chưa mở lại được khoá này, kiểm tra mạng rồi thử lại nhé.' : 'Chưa mở lại được khoá này. Hãy tắt cửa sổ đen của app rồi bấm lại MO-APP.bat.'); return false; }
  await tai();
  return true;
}
// "Học tiếp": vào lại khoá đang học (chuyển khoá thì bấm vào danh sách khoá học ngay bên dưới).
// Khoá đang mở còn trắng (vừa bấm khoá mới chưa điền) thì mở lại khoá học gần nhất.
async function hocTiep() {
  const ds = (S.khoa_tom_tat || []).filter(x => x.ten);
  const hienTrang = !ds.some(x => x.hien_tai) && !S.ho_so?.linh_vuc;
  if (hienTrang && ds.length) {
    const gan = [...ds].sort((a, b) => String(b.lan_cuoi).localeCompare(String(a.lan_cuoi)))[0];
    if (!(await moKhoa(gan.ma))) return;
  }
  document.body.classList.remove('gioi-thieu');
  dieuHuong(false, { cuon: true });
}

// ---------- Điều hướng ----------
// Lúc vào khoá học: nguồn đang khác ngôn ngữ người học chọn thì hỏi một lần (mỗi ngôn ngữ một lần) có tìm lại nguồn không.
// Trả về true nếu đã chuyển sang bước tìm nguồn.
async function hoiTimLaiNguon() {
  // khoá đang trống (vừa đổi mà bản mới chưa soạn xong) mà có bản ngôn ngữ người học chọn đã cất: đưa bản đó ra
  const cu = nnCuaNguon() || ((S.ban_ngon_ngu || []).includes(nnNguoiHoc()) && !S.lo_trinh?.chang ? (nnNguoiHoc() === 'vi' ? 'en' : 'vi') : null), moi = nnNguoiHoc();
  if (!cu || cu === moi || S.tien_do.da_hoi_nn_nguon === moi) return false;
  await api('/api/tien-do', { da_hoi_nn_nguon: moi }); await tai();
  const dangHoc = (S.tien_do.buoi_da_hoc || []).length > 0;
  const c = await hopChon(noi('suy-nghi', `<b>${moi === 'vi' ? 'Bạn đang dùng Tiếng Việt, nhưng nguồn học của khoá này đa số là tiếng Anh.' : 'Bạn đang dùng English, nhưng nguồn học của khoá này đa số là tiếng Việt.'}</b>
    <p>${moi === 'vi' ? 'Noe tìm lại nguồn tiếng Việt và xếp lại 3 lộ trình nhé?' : 'Noe tìm lại nguồn tiếng Anh và xếp lại 3 lộ trình nhé?'}</p>
    ${dangHoc ? '<p class="mo">Lộ trình đang học sẽ được xếp lại theo nguồn mới. Các buổi đã học vẫn được ghi trong nhật ký.</p>' : ''}`), ['Tìm lại nguồn ngay', 'Giữ nguồn cũ']);
  if (c !== 0) return false;
  manTim();
  return true;
}
async function dieuHuong(boQuaNoi = false, tuyChonTrangChu = {}) {
  if (!S.ai.cach_noi && !boQuaNoi) return manNoiAI();
  if (await hoiTimLaiNguon()) return;
  const c = S.tien_do.chang_hien_tai || 'muc-dich';
  // Khoá mới: hỏi từng câu một, làm tiếp đúng câu đang dở
  if (c === 'muc-dich' || c === 'B') return taoKhoa(Math.min(+S.tien_do.buoc_tao || 0, BUOC_A));
  if (c === 'dang-o-dau' || c === 'A') return taoKhoa(Math.max(+S.tien_do.buoc_tao || 0, BUOC_A));
  if (c === 'tim' || c === 'C1') {
    const st = await api('/api/nghien-cuu').catch(() => ({}));
    if (st.trang_thai === 'dang-chay' || st.trang_thai === 'loi') return xemNghienCuu();
    return S.lo_trinh_3 ? manLoTrinh() : manDangODau();
  }
  if (c === 'lo-trinh' || c === 'C2') return manLoTrinh();
  return manTrangChu(tuyChonTrangChu);
}

tai().then(() => {
  const q = new URLSearchParams(location.search);
  if (q.get('da-noi')) toast('Đã liên kết OpenRouter. Noe sẵn sàng!');
  if (q.get('loi-noi')) baoNho(q.get('loi-noi'));
  if (q.get('da-noi') || q.get('loi-noi')) history.replaceState(null, '', '/');
  $('.brand').onclick = veTrangChinh; /* hỏi trước khi thoát buổi học */ $('.brand').style.cursor = 'pointer'; $('.brand').title = 'Trang giới thiệu';
  // Nút chọn ngôn ngữ ở mọi màn; đổi thì lưu và tải lại trang để vẽ lại toàn bộ bằng ngôn ngữ mới
  const nn = ngonNguGT();
  document.documentElement.lang = nn;
  $('#nnKhung').innerHTML = chonNgonNgu();
  veChonGiaoDien();
  // Nút Cài đặt trên thanh trên cùng, ở mọi màn (anh dặn 24/11/2026: nhìn là biết, bấm là vào cài đặt liền)
  if (!$('#nutCaiDat')) {
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'nutCaiDat'; b.className = 'nut-cai-dat';
    b.innerHTML = `${ic('caidat')}<span>Cài đặt</span>`;
    b.title = `Cài đặt AI (${TEN_CACH[S.ai?.cach_noi] || 'chưa nối'})`;
    $('#nnKhung').before(b);
    b.onclick = async () => { if (!(await roiManDangLam())) return; manCaiDat(); };
  }
  document.body.classList.add('trong-app'); // nền sáng/tối, ngôn ngữ, tài khoản đã nằm trong Cài đặt
  napAnhDaiDien();
  // Nút Quay lại trong app đi cùng đường với nút quay lại của điện thoại / trình duyệt
  $('#nutQuayLai').onclick = () => history.state?.noe ? history.back() : quayLai();
  window.addEventListener('popstate', async () => {
    dangLui = true;
    let ok;
    try { ok = await quayLai(); } finally { dangLui = false; }
    // Người học chọn "Ở lại học tiếp" (không thoát buổi đang học): trả lại bước lịch sử vừa lùi
    if (ok === false) { try { history.pushState({ noe: Date.now() }, ''); } catch { /* bỏ qua */ } }
  });
  $('#nutTrangChinh').onclick = veTrangChinh;
  // Đổi ngôn ngữ chỉ đổi chữ, ở nguyên trang (không hỏi, không nhảy trang). Việc nguồn học khác tiếng hỏi sau, lúc vào khoá học.
  $('#nn').onchange = async e => { if (!(await roiManDangLam())) { e.target.value = S.ho_so?.ngon_ngu || 'vi'; return; } await doiNgonNgu(e.target.value); location.reload(); };
  window.batDich(nn);
  // Mở app luôn vào trang giới thiệu trước (theo ý chủ 19/11/2026); người đang học bấm "Học tiếp" vào thẳng chỗ đang dở.
  // Riêng lúc vừa liên kết AI xong (quay về từ trang liên kết) thì đi tiếp luôn.
  if (!q.get('da-noi') && !q.get('loi-noi')) manGioiThieu(); else dieuHuong();
  hoiMicLucMo();
  theoDoiNghienCuu(); // đang có việc tìm nguồn chạy ngầm thì hiện bong bóng Noe
}).catch(() => { man.innerHTML = '<p class="loi">Không kết nối được với app. Hãy bấm lại MO-APP.bat rồi mở lại trang.</p>'; });
