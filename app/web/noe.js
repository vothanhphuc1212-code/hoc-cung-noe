// Noe: đốm sáng nhỏ. noe(tam_trang) trả về chuỗi SVG.
// Tâm trạng: vui, chao, khen, suy-nghi, buon, ngac-nhien, gian, yeu, ngu
// Phong cách (19/11/2026, theo chủ dự án): phẳng, tròn mềm, nhiều đường cong; mảng màu tươi không viền,
// mảng bóng cắt cong ở góc dưới phải, mảng sáng góc trên trái, mắt to có lòng trắng và đốm sáng.
(function () {
  const C = n => `var(--${n})`;
  let id = 0;
  // Bảng màu của Noe
  const V = '#FFC83D', VB = '#F5A300', VS = '#FFE27A', MAT = '#3B2416', MA = '#FF8C82', LUOI = '#FF6F6F';
  const EX = [83, 117], EY = 102;
  const longMat = (x, y = EY, rx = 11, ry = 13) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff"/>`;
  const conNguoi = (x, y, r = 7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${MAT}"/><circle cx="${x + r * .45}" cy="${y - r * .5}" r="${r * .36}" fill="#fff"/>`;
  const mat = {
    mo: () => EX.map(x => longMat(x) + conNguoi(x + 2, EY + 2)).join(''),
    cong: () => EX.map(x => `<path d="M${x - 10} ${EY + 3} Q${x} ${EY - 10} ${x + 10} ${EY + 3}" stroke="${MAT}" stroke-width="5.5" fill="none" stroke-linecap="round"/>`).join(''),
    sao: () => EX.map(x => `<path d="M${x} ${EY - 13} Q${x + 2.4} ${EY - 3.6} ${x + 12} ${EY - 2} Q${x + 4} ${EY + 3.6} ${x + 7} ${EY + 13} Q${x} ${EY + 7} ${x - 7} ${EY + 13} Q${x - 4} ${EY + 3.6} ${x - 12} ${EY - 2} Q${x - 2.4} ${EY - 3.6} ${x} ${EY - 13} Z" fill="${MAT}"/><circle cx="${x - 2}" cy="${EY - 3}" r="2.2" fill="#fff"/>`).join(''),
    tron: () => EX.map(x => longMat(x, EY, 13, 14) + conNguoi(x, EY + 1, 4.5)).join(''),
    liec: () => EX.map(x => longMat(x) + conNguoi(x + 5, EY - 1)).join(''),
    xuong: () => EX.map(x => longMat(x) + conNguoi(x + 1, EY + 5)).join(''),
  };
  const mieng = {
    cuoi: `<path d="M89 120 Q100 132 111 120" stroke="${MAT}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    to: `<path d="M87 117 Q100 140 113 117 Q100 121 87 117 Z" fill="${MAT}" stroke="${MAT}" stroke-width="3" stroke-linejoin="round"/><path d="M93 128 Q100 135 107 128 Q100 124 93 128 Z" fill="${LUOI}"/>`,
    nho: `<path d="M94 121 Q100 126 106 121" stroke="${MAT}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`,
    buon: `<path d="M90 127 Q100 117 110 127" stroke="${MAT}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
    o: `<ellipse cx="100" cy="124" rx="6.5" ry="8" fill="${MAT}"/>`,
  };
  const chuyen = (x, y, s = 1) => `<path class="a tw" d="M${x} ${y - 9 * s} q${1.6 * s} ${7.4 * s} ${9 * s} ${9 * s} q${-7.4 * s} ${1.6 * s} ${-9 * s} ${9 * s} q${-1.6 * s} ${-7.4 * s} ${-9 * s} ${-9 * s} q${7.4 * s} ${-1.6 * s} ${9 * s} ${-9 * s} z" fill="${V}"/>`;
  const may = (trai, phai) => `<path d="${trai} ${phai}" stroke="${MAT}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
  const KIEU = {
    vui: { m: 'mo', mi: 'cuoi', anim: 'bob' },
    chao: { m: 'cong', mi: 'to', anim: 'bounce', tay: 'len' },
    khen: { m: 'sao', mi: 'to', anim: 'pulse', sang: .5, them: chuyen(34, 50, 1.1) + chuyen(170, 40, .8) + chuyen(172, 160, .9) },
    // 3 chấm tròn trên đầu nhún lần lượt: Noe đang suy nghĩ, máy đang chạy
    'suy-nghi': { m: 'liec', mi: 'nho', anim: 'sway', them: [0, 1, 2].map(i => `<circle class="a cham" style="animation-delay:${i * .2}s" cx="${128 + i * 24}" cy="28" r="11" fill="${C('teal')}"/>`).join('') },
    buon: { m: 'xuong', mi: 'buon', anim: 'droop', sang: .14, may: may('M72 86 Q80 82 92 88', 'M128 86 Q120 82 108 88') },
    'ngac-nhien': { m: 'tron', mi: 'o', anim: 'pulse' },
  };
  KIEU.gian = { m: 'mo', mi: 'buon', anim: 'lac', may: may('M72 84 Q84 86 93 93', 'M128 84 Q116 86 107 93'), sang: .2 };
  KIEU.yeu = { m: 'cong', mi: 'cuoi', anim: 'bob', them: [[40, 70], [160, 60], [150, 150]].map(([x, y], i) => `<path class="a len" style="animation-delay:${i * .5}s" d="M${x} ${y + 9} C${x - 13} ${y} ${x - 7} ${y - 10} ${x} ${y - 3} C${x + 7} ${y - 10} ${x + 13} ${y} ${x} ${y + 9} Z" fill="${C('heart')}"/>`).join('') };
  KIEU.ngu = { m: 'cong', mi: 'nho', anim: 'droop', sang: .12 };
  // ---------- Đồ của Noe (đổi bằng sao trong Cửa hàng của Noe). window.NOE_DO = mã món đang mặc ----------
  // Cùng phong cách với thân Noe: khối phẳng, mảng bóng cắt cong ở góc dưới phải, đốm sáng nhỏ, không viền mảnh.
  // Mỗi món là hàm nhận tiền tố p để mã cắt hình không trùng giữa các hình Noe trên cùng trang.
  const MAU = { // [màu chính, màu bóng, màu sáng]
    rom: ['#F9D77A', '#E2AF4A', '#FFF0BF'], trang: ['#FFFFFF', '#DCE4EC', '#FFFFFF'], do: ['#FF5A5F', '#D63B44', '#FF9EA1'],
    xanh: ['#3FA9FF', '#1E7FE0', '#A6D8FF'], tim: ['#A07CFF', '#7A55E6', '#D4C6FF'], than: ['#4A5068', '#353A50', '#80879F'],
    ngoc: ['#2ED3B0', '#12A88A', '#9CF0DD'], vang: ['#FFD12E', '#EFA600', '#FFF1A6'], hong: ['#FF8DB9', '#F05A92', '#FFC8DD'],
    cam: ['#FFA24A', '#E77C14', '#FFD2A6'], go: ['#D39A5E', '#A06B38', '#F0C99A'], bac: ['#E8EDF2', '#B9C5D1', '#FFFFFF'],
    la: ['#7BCB5A', '#56A83A', '#B9EBA0'], nau: ['#B5523B', '#8E3A28', '#E08A70'],
  };
  // Khối phẳng: tô cả hình bằng màu bóng, rồi phủ màu chính bằng một hình tròn lệch lên trái (cắt theo hình)
  const khoi = (p, ten, d, k, [cx, cy, r], them = '') => `<clipPath id="${p}${ten}"><path d="${d}" ${them}/></clipPath><g clip-path="url(#${p}${ten})"><path d="${d}" fill="${MAU[k][1]}" ${them}/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${MAU[k][0]}"/></g>`;
  const elip = (cx, cy, rx, ry) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
  const chuNhat = (x, y, w, h, r) => `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  const dom = (cx, cy, rx, ry, xoay = -30, mau = '#fff', do_ = .9) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${mau}" opacity="${do_}" transform="rotate(${xoay} ${cx} ${cy})"/>`;
  const net = (d, mau, w = 5) => `<path d="${d}" stroke="${mau}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const bongDo = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${VB}" opacity=".55"/>`;
  const lap = (x, y, s = 1) => `<path class="a tw" d="M${x} ${y - 8 * s} q${1.4 * s} ${6.6 * s} ${8 * s} ${8 * s} q${-6.6 * s} ${1.4 * s} ${-8 * s} ${8 * s} q${-1.4 * s} ${-6.6 * s} ${-8 * s} ${-8 * s} q${6.6 * s} ${-1.4 * s} ${8 * s} ${-8 * s} z" fill="${V}"/>`;
  const THAN = MAU.than[0];
  // Bông hoa 5 cánh phẳng: lớp bóng lệch xuống phải, lớp màu chính, nhuỵ tròn có đốm sáng
  const hoa = (x, y, r, k, nhuy = 'cam') => {
    const canh = (dx, dy, mau) => [0, 1, 2, 3, 4].map(i => { const g = (-90 + i * 72) * Math.PI / 180; return `<circle cx="${(x + Math.cos(g) * r * .62 + dx).toFixed(1)}" cy="${(y + Math.sin(g) * r * .62 + dy).toFixed(1)}" r="${(r * .5).toFixed(1)}" fill="${mau}"/>`; }).join('');
    return canh(1.4, 1.6, MAU[k][1]) + canh(0, 0, MAU[k][0]) + `<circle cx="${x}" cy="${y}" r="${(r * .32).toFixed(1)}" fill="${MAU[nhuy][0]}"/><circle cx="${x - r * .1}" cy="${y - r * .1}" r="${(r * .1).toFixed(1)}" fill="#fff"/>`;
  };
  const saoNho = (x, y, s, mau = MAU.vang[0]) => `<path d="M${x} ${y - 7 * s} Q${x + 1.6 * s} ${y - 1.6 * s} ${x + 7 * s} ${y} Q${x + 1.6 * s} ${y + 1.6 * s} ${x} ${y + 7 * s} Q${x - 1.6 * s} ${y + 1.6 * s} ${x - 7 * s} ${y} Q${x - 1.6 * s} ${y - 1.6 * s} ${x} ${y - 7 * s} Z" fill="${mau}"/>`;
  const LA_PHONG = 'M0 -20 L5 -9 L15 -13 L11 -2 L20 2 L10 6 L12 14 L2 10 L1 20 H-1 L-2 10 L-12 14 L-10 6 L-20 2 L-11 -2 L-15 -13 L-5 -9 Z';
  const AO_CHOANG = 'M62 98 Q34 150 46 192 Q74 180 100 184 Q126 180 154 192 Q166 150 138 98 Z';
  const DO_NOE = {
    no: p => `<g transform="translate(64 76) rotate(-18)">${khoi(p, 'a', 'M0 0 C-6 -18 -26 -16 -24 0 C-26 16 -6 18 0 0 Z', 'hong', [-16, -6, 18])}${khoi(p, 'b', 'M0 0 C6 -18 26 -16 24 0 C26 16 6 18 0 0 Z', 'hong', [12, -6, 18])}${khoi(p, 'c', elip(0, 0, 6.5, 6.5), 'hong', [-2, -2, 6])}${dom(-14, -6, 4, 2.2, -20)}${dom(12, -7, 4, 2.2, 20)}</g>`,
    kinh: p => `<g fill="#CFEAFF" fill-opacity=".45" stroke="${THAN}" stroke-width="4.5"><circle cx="83" cy="102" r="15"/><circle cx="117" cy="102" r="15"/></g>${net('M98 99 Q100 95 102 99', THAN, 4.5)}${net('M68 98 L58 93 M132 98 L142 93', THAN, 4.5)}${net('M75 96 Q78 90 85 90 M109 96 Q112 90 119 90', '#fff', 3.2)}`,
    khan: p => `${khoi(p, 'a', 'M60 144 Q100 170 140 144 Q143 156 138 162 Q100 184 62 162 Q57 156 60 144 Z', 'do', [92, 136, 40])}${net('M66 153 Q100 172 134 153', '#fff', 4)}${khoi(p, 'b', 'M112 164 Q122 176 126 192 Q118 196 110 192 Q108 178 102 167 Z', 'do', [108, 166, 18])}`,
    'tai-nghe': p => `${net('M53 112 Q53 50 100 50 Q147 50 147 112', THAN, 9)}${net('M64 84 Q72 60 96 56', MAU.than[2], 3)}${khoi(p, 'a', chuNhat(40, 96, 22, 34, 11), 'ngoc', [46, 104, 18])}${khoi(p, 'b', chuNhat(138, 96, 22, 34, 11), 'ngoc', [144, 104, 18])}${dom(47, 106, 2.6, 6, 0)}${dom(145, 106, 2.6, 6, 0)}`,
    mu: p => `${bongDo(100, 84, 28, 5)}${khoi(p, 'a', 'M77 70 V84 Q100 96 123 84 V70 Z', 'than', [92, 70, 24])}${khoi(p, 'b', 'M52 66 Q100 44 148 66 Q100 88 52 66 Z', 'than', [90, 54, 46])}${net('M72 62 Q90 54 108 54', MAU.than[2], 3)}${net('M100 66 Q122 66 138 72 V88', MAU.vang[0], 4)}${khoi(p, 'c', chuNhat(132, 86, 12, 12, 4), 'vang', [136, 88, 9])}`,
    'vuong-mien': p => `${bongDo(100, 74, 30, 4.5)}${khoi(p, 'a', 'M70 74 Q72 58 74 44 Q82 54 89 60 Q95 48 100 36 Q105 48 111 60 Q118 54 126 44 Q128 58 130 74 Q100 82 70 74 Z', 'vang', [92, 52, 34])}${khoi(p, 'b', elip(100, 62, 5.5, 5.5), 'do', [98, 60, 5])}${khoi(p, 'c', elip(83, 67, 4, 4), 'ngoc', [82, 66, 4])}${khoi(p, 'd', elip(117, 67, 4, 4), 'ngoc', [116, 66, 4])}${dom(98, 60, 1.6, 1.2, 0)}${dom(80, 56, 2.4, 6, 20, MAU.vang[2], 1)}`,
    // ---- Bộ trang phục theo chủ đề ----
    'non-la': p => `${net('M61 88 Q58 162 100 167 Q142 162 139 88', MAU.hong[0], 3.5)}${bongDo(100, 88, 50, 7)}
      ${khoi(p, 'a', 'M100 18 Q104 20 108 25 L162 76 Q168 82 160 85 Q100 96 40 85 Q32 82 38 76 L92 25 Q96 20 100 18 Z', 'rom', [86, 54, 58])}
      ${net('M68 50 Q100 60 132 50', MAU.rom[1], 3.5)}${net('M52 66 Q100 79 148 66', MAU.rom[1], 3.5)}<path d="M98 26 L62 72 Q70 76 76 72 Z" fill="${MAU.rom[2]}"/>`,
    'dau-bep': p => `${bongDo(100, 80, 30, 5)}${khoi(p, 'a', 'M74 76 Q66 70 66 58 Q64 40 82 38 Q88 22 104 26 Q120 22 126 38 Q140 42 136 60 Q134 70 126 76 Z', 'trang', [92, 40, 44])}${net('M86 62 V74 M100 60 V74 M114 62 V74', MAU.trang[1], 3)}${khoi(p, 'b', chuNhat(72, 64, 56, 14, 7), 'trang', [92, 64, 30])}
      ${khoi(p, 'c', 'M78 150 Q100 162 122 150 Q118 162 110 170 Q100 178 90 170 Q82 162 78 150 Z', 'do', [92, 148, 24])}${khoi(p, 'd', elip(100, 160, 7, 6), 'do', [98, 158, 6])}`,
    'hoa-si': p => `${bongDo(98, 78, 32, 5)}<g transform="rotate(-12 94 66)">${khoi(p, 'a', elip(94, 64, 40, 16), 'tim', [84, 56, 38])}</g>${khoi(p, 'b', elip(106, 48, 6, 6), 'tim', [104, 46, 6])}
      ${net('M150 144 L168 116', MAU.go[0], 6.5)}${net('M166 119 L171 111', MAU.bac[1], 7)}${khoi(p, 'c', 'M170 112 Q172 100 182 94 Q182 106 175 116 Z', 'hong', [172, 100, 10])}
      ${khoi(p, 'd', 'M24 142 C24 128 40 124 53 128 C64 132 63 142 57 146 C51 150 55 158 46 158 C32 158 24 154 24 142 Z', 'rom', [38, 134, 22])}<circle cx="48" cy="147" r="3.6" fill="#fff"/>
      ${[[33, 139, 'do'], [42, 133, 'xanh'], [52, 137, 'ngoc'], [33, 149, 'vang']].map(([x, y, k]) => `<circle cx="${x}" cy="${y}" r="4.2" fill="${MAU[k][0]}"/><circle cx="${x - 1.2}" cy="${y - 1.4}" r="1.3" fill="#fff"/>`).join('')}`,
    'cuop-bien': p => `${bongDo(100, 88, 42, 6)}${khoi(p, 'a', 'M50 94 Q50 52 100 50 Q150 52 150 94 Q100 74 50 94 Z', 'do', [88, 58, 48])}
      <g fill="#fff"><circle cx="74" cy="74" r="4"/><circle cx="100" cy="62" r="4"/><circle cx="126" cy="74" r="4"/><circle cx="87" cy="64" r="2.6"/><circle cx="113" cy="64" r="2.6"/></g>
      ${khoi(p, 'b', 'M144 82 Q160 72 170 78 Q164 90 152 92 Z', 'do', [152, 78, 14])}${khoi(p, 'c', 'M146 88 Q160 92 164 106 Q150 104 144 94 Z', 'do', [150, 90, 12])}
      ${net('M64 86 Q96 90 136 112', THAN, 3.6)}${khoi(p, 'd', elip(117, 102, 13, 14), 'than', [113, 97, 12])}${dom(112, 97, 3.5, 2, -20, '#fff', .45)}`,
    'ao-thuat': p => `${bongDo(100, 78, 36, 5)}${khoi(p, 'a', chuNhat(76, 24, 48, 46, 7), 'than', [90, 34, 34])}<rect x="76" y="54" width="48" height="10" fill="${MAU.do[0]}"/>${khoi(p, 'b', elip(100, 70, 44, 9), 'than', [94, 64, 40])}${net('M85 32 V50', MAU.than[2], 4)}
      ${khoi(p, 'c', 'M100 158 C92 146 78 144 80 158 C78 172 92 170 100 158 Z', 'do', [86, 152, 12])}${khoi(p, 'd', 'M100 158 C108 146 122 144 120 158 C122 172 108 170 100 158 Z', 'do', [108, 152, 12])}${khoi(p, 'e', elip(100, 158, 5.5, 5.5), 'do', [98, 156, 5])}
      ${net('M150 144 L176 112', THAN, 6)}${net('M173 115 L179 108', '#fff', 6)}${lap(185, 96, 1)}${lap(170, 86, .6)}`,
    'tay-dua': p => `${net('M50 88 Q100 64 150 88', THAN, 8.5)}${khoi(p, 'a', chuNhat(67, 64, 31, 24, 12), 'cam', [76, 70, 18])}${khoi(p, 'b', chuNhat(102, 64, 31, 24, 12), 'cam', [111, 70, 18])}
      <g fill="none" stroke="${THAN}" stroke-width="4"><path d="${chuNhat(67, 64, 31, 24, 12)}"/><path d="${chuNhat(102, 64, 31, 24, 12)}"/></g>${net('M74 72 Q78 68 85 69 M109 72 Q113 68 120 69', '#fff', 3.4)}
      ${net('M150 146 L164 66', MAU.bac[1], 5)}<circle cx="164" cy="64" r="4.5" fill="${MAU.vang[0]}"/>
      <g transform="translate(165 67) skewY(-10)"><path d="${chuNhat(0, 0, 32, 24, 4)}" fill="#fff"/>${[0, 1, 2, 3].map(i => [0, 1, 2].map(j => (i + j) % 2 ? '' : `<rect x="${i * 8}" y="${j * 8}" width="8" height="8" fill="${THAN}"/>`).join('')).join('')}</g>
      ${khoi(p, 'c', elip(128, 144, 11, 11), 'trang', [126, 142, 10])}<circle cx="128" cy="144" r="11" fill="none" stroke="${MAU.do[0]}" stroke-width="3"/><text x="128" y="149" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="14" fill="${MAU.do[1]}">1</text>`,
    'phi-hanh-gia': p => `<circle cx="100" cy="112" r="62" fill="#BDE3FF" fill-opacity=".22"/><circle cx="100" cy="112" r="62" fill="none" stroke="${MAU.bac[0]}" stroke-width="9"/><path d="M146 150 A62 62 0 0 1 62 162" stroke="${MAU.bac[1]}" stroke-width="9" fill="none"/>
      ${net('M62 96 A42 42 0 0 1 92 66', '#fff', 7)}<circle cx="102" cy="62" r="4" fill="#fff"/>
      ${net('M58 163 Q100 188 142 163', MAU.bac[1], 13)}${net('M60 160 Q100 184 140 160', MAU.bac[0], 8)}
      ${net('M100 49 V37', MAU.bac[1], 5)}${khoi(p, 'a', elip(100, 32, 7, 7), 'do', [98, 30, 6])}<circle cx="97.5" cy="29.5" r="2" fill="#fff"/>`,
    'sieu-nhan': p => `${khoi(p, 'a', 'M62 99 Q82 83 100 95 Q118 83 138 99 Q136 120 116 117 Q100 109 84 117 Q64 120 62 99 Z ' + elip(83, 102, 11.5, 13.5) + ' ' + elip(117, 102, 11.5, 13.5), 'xanh', [90, 90, 34], 'fill-rule="evenodd" clip-rule="evenodd"')}${dom(70, 96, 5, 2.2, -20)}
      ${khoi(p, 'b', elip(100, 149, 14, 14), 'vang', [97, 146, 12])}<path d="M104 138 Q100 144 95 150 H101 L97 160 Q103 153 108 146 H102 Z" fill="${MAU.do[0]}" stroke="${MAU.do[0]}" stroke-width="1.5" stroke-linejoin="round"/>`,

    // ---- Bộ sưu tập Xuân ----
    'hoa-mai': () => `<ellipse cx="58" cy="86" rx="10" ry="5" fill="${MAU.la[0]}" transform="rotate(30 58 86)"/><ellipse cx="80" cy="56" rx="8" ry="4" fill="${MAU.la[1]}" transform="rotate(-40 80 56)"/>${hoa(68, 72, 15, 'vang')}${hoa(88, 58, 10, 'vang')}`,
    'li-xi': p => `<g transform="translate(38 136) rotate(-14)">${khoi(p, 'a', chuNhat(-13, -18, 26, 34, 5), 'do', [-6, -12, 20])}${net('M-12 -12 Q0 -2 12 -12', MAU.do[1], 3)}${khoi(p, 'b', elip(0, 2, 6.5, 6.5), 'vang', [-1, 1, 6])}${saoNho(0, 2, .45, MAU.do[0])}</g>`,
    'banh-chung': p => `<g transform="translate(100 158) rotate(-4)">${khoi(p, 'a', chuNhat(-16, -16, 32, 32, 6), 'la', [-6, -8, 24])}${net('M-16 -5 H16 M-16 5 H16 M-5 -16 V16 M5 -16 V16', '#F3E2B3', 2.6)}${dom(-9, -10, 4, 2, -30)}</g>`,
    'long-den': p => `${net('M150 142 L172 90', MAU.go[1], 5)}${net('M172 90 L176 104', MAU.vang[1], 2.5)}${khoi(p, 'a', elip(176, 122, 16, 18), 'do', [170, 115, 15])}
      ${net('M170 106 Q164 122 170 138 M182 106 Q188 122 182 138', MAU.do[1], 2.4)}${khoi(p, 'b', chuNhat(167, 101, 18, 6, 3), 'vang', [172, 100, 8])}${khoi(p, 'c', chuNhat(167, 138, 18, 6, 3), 'vang', [172, 137, 8])}
      ${net('M176 144 V158 M172 146 V156 M180 146 V156', MAU.vang[0], 2.6)}${dom(170, 114, 3, 5, 20)}`,
    // ---- Bộ sưu tập Hạ ----
    'kinh-ram': p => `${khoi(p, 'a', chuNhat(64, 91, 34, 23, 11), 'than', [72, 96, 16])}${khoi(p, 'b', chuNhat(102, 91, 34, 23, 11), 'than', [110, 96, 16])}${net('M98 99 Q100 96 102 99', THAN, 4.5)}${net('M65 97 L56 92 M135 97 L144 92', THAN, 4.5)}${net('M71 104 L79 97 M109 104 L117 97', '#fff', 3)}`,
    'mu-coi': p => `${khoi(p, 'a', elip(100, 74, 64, 13), 'rom', [86, 68, 52])}${khoi(p, 'b', 'M70 76 Q68 42 100 40 Q132 42 130 76 Z', 'rom', [88, 48, 34])}${net('M78 56 Q90 46 104 46', MAU.rom[2], 3.5)}
      <path d="M70 64 Q100 72 130 64 L131 72 Q100 80 69 72 Z" fill="${MAU.do[0]}"/>${hoa(124, 68, 8, 'hong', 'vang')}`,
    kem: p => `${khoi(p, 'a', 'M156 132 L170 170 L184 132 Z', 'go', [164, 136, 16])}${net('M160 140 L178 136 M163 149 L176 146 M162 136 L172 160 M170 134 L178 150', MAU.go[1], 2)}
      ${khoi(p, 'b', elip(170, 126, 16, 12), 'hong', [164, 120, 13])}${khoi(p, 'c', elip(170, 113, 12, 10), 'ngoc', [166, 108, 10])}<circle cx="173" cy="101" r="4.5" fill="${MAU.do[0]}"/>${net('M173 97 Q175 92 179 91', MAU.la[1], 2)}${dom(164, 108, 3, 2, -30)}`,
    'phao-boi': p => `${khoi(p, 'a', 'M44 140 Q100 168 156 140 Q164 152 156 163 Q100 194 44 163 Q36 152 44 140 Z', 'do', [86, 146, 54])}
      <g clip-path="url(#${p}a)" fill="#fff"><path d="M60 140 L76 140 L72 200 L56 200 Z"/><path d="M93 140 L108 140 L107 200 L92 200 Z"/><path d="M124 140 L140 140 L145 200 L129 200 Z"/></g>${net('M52 150 Q100 172 148 150', '#fff', 2.5)}`,
    // ---- Bộ sưu tập Thu ----
    'mu-noi': p => `${khoi(p, 'a', elip(98, 66, 42, 15), 'nau', [86, 58, 34], 'transform="rotate(-10 98 66)"')}${khoi(p, 'b', chuNhat(94, 44, 7, 9, 3), 'nau', [96, 45, 4])}${net('M70 62 Q84 52 102 52', MAU.nau[2], 3)}`,
    'la-phong': () => `<g transform="translate(66 74) rotate(-20)"><path d="${LA_PHONG}" fill="${MAU.cam[1]}" stroke="${MAU.cam[1]}" stroke-width="5" stroke-linejoin="round"/><path d="${LA_PHONG}" transform="translate(-1.2 -1.2) scale(.9)" fill="${MAU.cam[0]}" stroke="${MAU.cam[0]}" stroke-width="3" stroke-linejoin="round"/>${net('M0 18 V-10 M0 4 L9 -4 M0 4 L-9 -4', MAU.cam[1], 2)}</g>`,
    'o-thu': p => `${net('M166 78 V150 Q166 158 158 158 Q152 158 152 152', THAN, 4.5)}${khoi(p, 'a', 'M134 78 Q136 44 166 42 Q196 44 198 78 Q190 72 182 78 Q174 72 166 78 Q158 72 150 78 Q142 72 134 78 Z', 'cam', [156, 52, 30])}
      ${net('M166 43 Q158 58 150 77 M166 43 V77 M166 43 Q174 58 182 77', MAU.cam[1], 2.4)}${net('M166 42 V35', THAN, 3.5)}${net('M146 56 Q152 48 160 46', MAU.cam[2], 3)}`,
    'khan-len': p => `${khoi(p, 'a', 'M60 144 Q100 170 140 144 Q143 156 138 162 Q100 184 62 162 Q57 156 60 144 Z', 'cam', [92, 136, 40])}${net('M62 151 Q100 173 138 151', MAU.nau[0], 4)}
      ${khoi(p, 'b', 'M76 162 Q72 174 70 188 Q78 192 86 188 Q86 176 90 166 Z', 'cam', [76, 168, 16])}${net('M71 178 Q78 181 86 178', MAU.nau[0], 3.5)}${net('M72 191 V196 M78 192 V197 M84 191 V196', MAU.cam[1], 2.5)}`,
    // ---- Bộ sưu tập Đông ----
    'mu-len': p => `${khoi(p, 'a', 'M56 82 Q56 44 100 42 Q144 44 144 82 Z', 'xanh', [88, 52, 46])}${net('M74 70 Q74 54 90 50', MAU.xanh[2], 3.5)}${khoi(p, 'b', chuNhat(52, 72, 96, 16, 8), 'trang', [84, 70, 44])}
      ${net('M64 76 V84 M76 76 V84 M88 76 V84 M100 76 V84 M112 76 V84 M124 76 V84 M136 76 V84', MAU.trang[1], 2.4)}${khoi(p, 'c', elip(100, 38, 12, 12), 'trang', [96, 34, 11])}`,
    'bit-tai': p => `${net('M52 104 Q50 52 100 50 Q150 52 148 104', MAU.hong[1], 7)}${khoi(p, 'a', elip(50, 108, 15, 17), 'hong', [45, 102, 13])}${khoi(p, 'b', elip(150, 108, 15, 17), 'hong', [145, 102, 13])}
      ${[[44, 104], [52, 112], [146, 104], [154, 112]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${MAU.hong[2]}"/>`).join('')}`,
    'gang-tay': (p, tu) => {
      const [t, f] = tu.tayLen ? [[44, 110, -50], [156, 110, 50]] : [[53, 131, -30], [147, 131, 30]];
      const mot = ([x, y, g], ten) => `<g transform="rotate(${g} ${x} ${y})">${khoi(p, ten, elip(x, y, 15, 11.5), 'do', [x - 4, y - 4, 12])}${khoi(p, ten + 'n', elip(x + (g < 0 ? 9 : -9), y - 8, 5, 6), 'do', [x, y - 10, 5])}<rect x="${x - 15}" y="${y + 4}" width="30" height="6" rx="3" fill="#fff"/></g>`;
      return mot(t, 'a') + mot(f, 'b');
    },
    'coc-cacao': p => `${net('M176 132 Q188 134 186 142 Q184 150 176 148', MAU.trang[1], 5)}${khoi(p, 'a', chuNhat(150, 124, 27, 31, 8), 'trang', [158, 128, 18])}<rect x="150" y="138" width="27" height="6" fill="${MAU.do[0]}"/>
      <ellipse cx="163.5" cy="126" rx="11" ry="3.2" fill="${MAU.go[1]}"/><rect x="157" y="121" width="6" height="5" rx="2" fill="#fff"/><rect x="165" y="122" width="5" height="4" rx="2" fill="#FFE2EC"/>
      <path class="a len" d="M158 114 q4 -6 0 -12" stroke="${MAU.bac[1]}" stroke-width="3" fill="none" stroke-linecap="round"/><path class="a len" style="animation-delay:.6s" d="M168 114 q4 -6 0 -12" stroke="${MAU.bac[1]}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    // ---- Bộ sưu tập Pháp sư ----
    'mu-phu-thuy': p => `${khoi(p, 'a', elip(100, 72, 56, 11), 'tim', [86, 68, 44])}${khoi(p, 'b', 'M70 72 Q86 50 94 22 Q98 8 116 6 Q106 14 107 30 Q113 52 130 72 Q100 80 70 72 Z', 'tim', [88, 36, 40])}
      <path d="M72 66 Q100 74 128 66 L130 72 Q100 80 70 72 Z" fill="${MAU.vang[0]}"/>${saoNho(92, 48, .7)}${saoNho(108, 32, .5)}${saoNho(112, 56, .45)}`,
    'ao-choang-tim': p => `${net('M64 150 Q82 162 95 160', MAU.tim[1], 6)}${net('M136 150 Q118 162 105 160', MAU.tim[1], 6)}${khoi(p, 'a', elip(100, 160, 7, 7), 'vang', [98, 158, 6])}`,
    'truong-phep': p => `${net('M150 176 L171 70', MAU.go[1], 7)}${net('M151 172 L170 74', MAU.go[0], 3.5)}${net('M168 72 Q160 62 166 52', MAU.go[1], 4)}
      <circle cx="172" cy="52" r="20" fill="${MAU.ngoc[2]}" opacity=".35"/>${khoi(p, 'a', 'M172 34 L183 52 L172 70 L161 52 Z', 'ngoc', [168, 45, 14])}${lap(188, 34, .6)}${lap(156, 30, .45)}`,
    // quả cầu nâng ở tay trái (tay phải còn cầm trượng)
    'qua-cau': p => `${khoi(p, 'a', chuNhat(19, 152, 31, 11, 5), 'go', [27, 152, 14])}<circle cx="34.5" cy="136" r="22" fill="${MAU.tim[2]}" opacity=".3"/>${khoi(p, 'b', elip(34.5, 136, 17, 17), 'tim', [29, 130, 14])}
      ${net('M42 140 Q36 130 28 136 Q24 142 32 144', MAU.tim[2], 2.5)}${dom(28, 129, 4.5, 2.6, -40)}${lap(16, 118, .45)}`,
    // ---- Bộ sưu tập Hoàng gia (cùng Vương miện) ----
    'ao-choang-do': p => `${khoi(p, 'a', 'M58 140 Q100 168 142 140 Q146 152 140 160 Q100 182 60 160 Q54 152 58 140 Z', 'trang', [90, 136, 40])}
      ${[[70, 152], [86, 162], [114, 162], [130, 152], [100, 166]].map(([x, y]) => `<path d="M${x} ${y - 4} Q${x + 3} ${y} ${x} ${y + 4} Q${x - 3} ${y} ${x} ${y - 4} Z" fill="${THAN}"/>`).join('')}${khoi(p, 'b', elip(100, 156, 6, 6), 'vang', [98, 154, 5])}`,
    'truong-vang': p => `${net('M150 170 L170 78', MAU.vang[1], 7)}${net('M151 166 L169 82', MAU.vang[0], 3)}${khoi(p, 'a', chuNhat(161, 76, 18, 7, 3.5), 'vang', [165, 76, 8])}
      ${khoi(p, 'b', elip(171, 64, 12, 12), 'vang', [167, 60, 11])}${khoi(p, 'c', elip(171, 64, 5, 5), 'do', [170, 63, 4])}${net('M171 52 V42 M166 47 H176', MAU.vang[1], 4)}${dom(166, 59, 2.6, 1.6, -30)}`,
    // ---- Phụ kiện thường ngày (thêm) ----
    'mu-luoi-trai': p => `${bongDo(100, 84, 38, 6)}${khoi(p, 'a', 'M58 84 Q56 46 100 44 Q144 46 142 84 Z', 'xanh', [88, 54, 44])}${khoi(p, 'b', 'M118 80 Q156 72 174 84 Q156 94 118 88 Z', 'xanh', [130, 78, 26])}
      ${net('M100 45 V82 M78 50 Q86 66 86 82 M122 50 Q114 66 114 82', MAU.xanh[1], 2.4)}${khoi(p, 'c', elip(100, 44, 6, 4), 'trang', [99, 43, 5])}${net('M70 66 Q80 54 94 50', MAU.xanh[2], 3.5)}`,
    'kep-sao': p => `<g transform="translate(66 74) rotate(-14)">${khoi(p, 'a', 'M0 -14 L4 -5 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -5 Z', 'vang', [-3, -5, 13], 'stroke="' + MAU.vang[1] + '" stroke-width="3" stroke-linejoin="round"')}${dom(-3, -5, 2.6, 1.6, -30)}</g>`,
    'day-chuyen': p => `${net('M66 146 Q100 168 134 146', MAU.vang[1], 3)}${[72, 82, 92, 108, 118, 128].map((x, i) => `<circle cx="${x}" cy="${[150, 156, 160, 160, 156, 150][i]}" r="2.2" fill="${MAU.vang[0]}"/>`).join('')}
      ${khoi(p, 'a', 'M100 176 C88 168 88 158 94 157 C97 156 99 158 100 160 C101 158 103 156 106 157 C112 158 112 168 100 176 Z', 'hong', [96, 162, 10])}${dom(96, 161, 2, 1.3, -30)}`,
    'ba-lo': p => `${net('M64 80 Q58 112 66 150', MAU.cam[1], 6)}${net('M136 80 Q142 112 134 150', MAU.cam[1], 6)}${khoi(p, 'a', chuNhat(60, 112, 10, 8, 3), 'vang', [62, 112, 6])}${khoi(p, 'b', chuNhat(130, 112, 10, 8, 3), 'vang', [132, 112, 6])}`,
    'but-chi': p => `<g transform="rotate(-58 162 126)">${khoi(p, 'a', chuNhat(132, 119, 50, 14, 2), 'vang', [146, 120, 18])}${net('M134 126 H180', MAU.vang[1], 1.6)}
      <path d="M182 119 L196 126 L182 133 Z" fill="${MAU.go[2]}"/><path d="M191 123.5 L196 126 L191 128.5 Z" fill="${THAN}"/>${khoi(p, 'b', chuNhat(124, 119, 10, 14, 4), 'hong', [127, 120, 7])}<rect x="132" y="119" width="4" height="14" fill="${MAU.bac[1]}"/></g>`,
    sach: p => `<g transform="translate(38 132) rotate(-10)">${khoi(p, 'a', 'M0 -14 Q-12 -20 -24 -16 V14 Q-12 10 0 16 Z', 'xanh', [-14, -12, 16])}${khoi(p, 'b', 'M0 -14 Q12 -20 24 -16 V14 Q12 10 0 16 Z', 'xanh', [8, -12, 16])}
      ${net('M-19 -8 Q-10 -12 -4 -8 M-19 -1 Q-10 -5 -4 -1 M4 -8 Q12 -12 19 -8 M4 -1 Q12 -5 19 -1', '#fff', 1.8)}${net('M0 -14 V16', MAU.xanh[1], 2)}</g>`,
    // ---- Bộ trang phục chủ đề (đợt 3, 20/11/2026) ----
    'thuy-thu': p => `${bongDo(100, 86, 40, 6)}${khoi(p, 'a', 'M64 80 Q66 48 100 46 Q134 48 136 80 Z', 'trang', [90, 54, 40])}<path d="M66 64 Q100 56 134 64 L135 72 Q100 64 65 72 Z" fill="${MAU.xanh[0]}"/>
      ${khoi(p, 'b', 'M56 82 Q100 70 144 82 Q146 94 136 94 Q100 84 64 94 Q54 94 56 82 Z', 'trang', [86, 78, 50])}${net('M76 56 Q86 50 100 49', MAU.trang[1], 3)}
      ${khoi(p, 'c', 'M56 140 Q100 166 144 140 L134 172 Q100 182 66 172 Z', 'xanh', [88, 146, 44])}${net('M62 150 Q100 172 138 150', '#fff', 3)}
      ${khoi(p, 'd', 'M100 162 C92 152 80 152 82 162 C80 172 92 172 100 162 Z', 'do', [88, 158, 10])}${khoi(p, 'e', 'M100 162 C108 152 120 152 118 162 C120 172 108 172 100 162 Z', 'do', [108, 158, 10])}${khoi(p, 'f', elip(100, 162, 4.5, 4.5), 'do', [99, 161, 4])}`,
    'canh-sat': p => `${bongDo(100, 86, 40, 6)}${khoi(p, 'a', 'M54 70 Q56 40 100 38 Q144 40 146 70 Q100 82 54 70 Z', 'xanh', [88, 46, 46])}${khoi(p, 'b', chuNhat(62, 66, 76, 14, 6), 'than', [80, 66, 40])}
      ${khoi(p, 'c', 'M64 78 Q100 92 136 78 Q134 90 100 96 Q66 90 64 78 Z', 'than', [90, 80, 30])}${khoi(p, 'd', elip(100, 56, 9, 9), 'vang', [98, 54, 8])}${saoNho(100, 56, .7, MAU.vang[1])}${net('M68 52 Q80 42 96 41', MAU.xanh[2], 3.5)}
      <g transform="translate(78 156)">${khoi(p, 'e', 'M0 -12 L10 -6 V4 Q10 10 0 14 Q-10 10 -10 4 V-6 Z', 'vang', [-3, -6, 12])}${saoNho(0, 0, .55, MAU.vang[1])}</g>
      <g transform="rotate(-28 160 128)">${khoi(p, 'f', chuNhat(154, 84, 13, 56, 6.5), 'trang', [158, 90, 18])}<g clip-path="url(#${p}f)" fill="${MAU.do[0]}"><rect x="150" y="84" width="20" height="10"/><rect x="150" y="104" width="20" height="10"/><rect x="150" y="124" width="20" height="16"/></g>${dom(158, 96, 1.6, 5, 0)}</g>`,
    'nha-khoa-hoc': p => `${net('M52 76 Q100 60 148 76', THAN, 5)}${khoi(p, 'a', elip(83, 70, 12, 10), 'ngoc', [79, 66, 10])}${khoi(p, 'b', elip(117, 70, 12, 10), 'ngoc', [113, 66, 10])}
      <g fill="none" stroke="${THAN}" stroke-width="3.5"><ellipse cx="83" cy="70" rx="12" ry="10"/><ellipse cx="117" cy="70" rx="12" ry="10"/></g>${net('M78 66 Q80 63 84 63 M112 66 Q114 63 118 63', '#fff', 2.5)}
      ${khoi(p, 'c', 'M60 142 Q74 156 92 166 L100 152 L108 166 Q126 156 140 142 Q144 160 132 170 Q100 184 68 170 Q56 160 60 142 Z', 'trang', [88, 148, 44])}
      ${khoi(p, 'd', 'M160 96 H172 V112 L184 140 Q186 148 178 148 H154 Q146 148 148 140 L160 112 Z', 'trang', [158, 104, 24])}<path d="M152 132 H180 L184 140 Q186 148 178 148 H154 Q146 148 148 140 Z" fill="${MAU.la[0]}"/>
      ${[[160, 126, 3], [168, 118, 2.4], [164, 108, 2]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${MAU.la[2]}"/>`).join('')}${dom(156, 138, 2, 4, 20)}`,
    'ca-si': p => `${[[83, 101], [117, 101]].map(([x, y], i) => khoi(p, 'k' + i, `M${x} ${y - 15} L${x + 4.5} ${y - 5} L${x + 15} ${y - 4} L${x + 7} ${y + 4} L${x + 9.5} ${y + 14} L${x} ${y + 9} L${x - 9.5} ${y + 14} L${x - 7} ${y + 4} L${x - 15} ${y - 4} L${x - 4.5} ${y - 5} Z`, 'tim', [x - 4, y - 5, 12], `stroke="${MAU.tim[1]}" stroke-width="3" stroke-linejoin="round"`)).join('')}
      ${net('M97 99 Q100 96 103 99', MAU.tim[1], 3.5)}${net('M70 97 L58 92 M130 97 L142 92', MAU.tim[1], 3.5)}
      ${net('M152 142 L166 116', THAN, 7)}${khoi(p, 'a', elip(170, 108, 11, 11), 'bac', [167, 105, 10])}${net('M162 104 H178 M162 111 H178 M170 98 V118', MAU.bac[1], 1.6)}
      ${[[30, 66, 'tim'], [176, 50, 'hong'], [22, 108, 'xanh']].map(([x, y, k]) => `<g fill="${MAU[k][0]}"><ellipse cx="${x}" cy="${y + 12}" rx="6" ry="4.5" transform="rotate(-20 ${x} ${y + 12})"/><rect x="${x + 3}" y="${y - 6}" width="3.2" height="18" rx="1.6"/></g>${net(`M${x + 5} ${y - 5} Q${x + 14} ${y - 1} ${x + 12} ${y + 6}`, MAU[k][0], 3)}`).join('')}`,
    'tho-lan': p => `${net('M50 100 Q100 84 150 100', THAN, 5)}${khoi(p, 'a', chuNhat(60, 85, 80, 36, 17) + ' ' + chuNhat(67, 91, 66, 24, 11), 'cam', [80, 92, 44], 'fill-rule="evenodd" clip-rule="evenodd"')}
      <path d="${chuNhat(67, 91, 66, 24, 11)}" fill="#7FE7FF" fill-opacity=".4"/>${net('M74 106 L86 96 M82 111 L98 98', '#fff', 3)}
      ${net('M140 110 Q156 110 156 96 V56', MAU.vang[1], 9)}${net('M140 110 Q156 110 156 96 V56', MAU.vang[0], 5)}${khoi(p, 'b', chuNhat(149, 46, 14, 11, 4), 'cam', [152, 46, 9])}
      ${[[168, 38, 5], [178, 24, 3.5], [166, 14, 2.5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${MAU.xanh[2]}" stroke-width="2.4"/>`).join('')}`,
    'ong-gia-noel': p => `${khoi(p, 'r', 'M62 124 Q60 170 100 176 Q140 170 138 124 Q122 136 100 132 Q78 136 62 124 Z', 'trang', [90, 132, 40])}${net('M78 142 Q84 152 80 162 M100 144 V164 M122 142 Q116 152 120 162', MAU.trang[1], 2.6)}
      ${khoi(p, 'm', 'M100 124 Q88 115 77 123 Q84 131 100 127 Q116 131 123 123 Q112 115 100 124 Z', 'trang', [92, 119, 14])}
      ${khoi(p, 'a', 'M56 80 Q58 40 100 34 Q136 30 156 56 Q164 70 168 92 Q156 86 150 74 Q146 66 144 80 Z', 'do', [90, 46, 54])}
      ${khoi(p, 'b', chuNhat(50, 74, 100, 16, 8), 'trang', [76, 74, 50])}${khoi(p, 'c', elip(168, 96, 10, 10), 'trang', [165, 93, 9])}${net('M72 52 Q84 42 100 40', MAU.do[2], 3.5)}`,
    'thien-than': p => `<ellipse cx="100" cy="41" rx="26" ry="8" fill="none" stroke="${MAU.vang[1]}" stroke-width="8"/><ellipse cx="100" cy="40" rx="26" ry="8" fill="none" stroke="${MAU.vang[0]}" stroke-width="5"/>${net('M80 37 Q88 33 98 33', '#fff', 2.5)}
      ${lap(150, 30, .5)}${lap(48, 44, .4)}${khoi(p, 'a', 'M100 158 C94 150 84 150 86 158 C84 166 94 166 100 158 Z', 'hong', [90, 154, 8])}${khoi(p, 'b', 'M100 158 C106 150 116 150 114 158 C116 166 106 166 100 158 Z', 'hong', [106, 154, 8])}${khoi(p, 'c', elip(100, 158, 3.5, 3.5), 'hong', [99, 157, 3])}`,
    'tham-tu': p => `${bongDo(100, 84, 40, 6)}${khoi(p, 'a', 'M56 82 Q54 44 100 42 Q146 44 144 82 Z', 'nau', [88, 52, 44])}
      <g clip-path="url(#${p}a)" stroke="${MAU.nau[1]}" stroke-width="2.4" opacity=".8">${[66, 82, 98, 114, 130].map(x => `<path d="M${x} 40 V84"/>`).join('')}<path d="M54 58 H146 M54 72 H146"/></g>
      ${khoi(p, 'b', 'M56 80 Q100 92 144 80 L148 88 Q100 102 52 88 Z', 'nau', [86, 82, 40])}${khoi(p, 'c', elip(100, 42, 6, 4), 'nau', [99, 41, 5])}${net('M66 62 Q74 50 88 47', MAU.nau[2], 3)}
      ${net('M152 146 L166 128', MAU.go[1], 7)}${khoi(p, 'd', elip(176, 114, 15, 15), 'than', [172, 110, 14])}<circle cx="176" cy="114" r="10.5" fill="#CFEAFF"/>${net('M170 110 Q172 106 177 105', '#fff', 2.6)}`,
    'cau-thu': p => `${net('M52 84 Q100 66 148 84', MAU.do[1], 10)}${net('M52 83 Q100 65 148 83', MAU.do[0], 7)}${net('M54 83 Q100 66 146 83', '#fff', 1.8)}
      <g transform="translate(32 134)"><circle r="18.5" fill="${MAU.bac[1]}"/>${khoi(p, 'a', elip(0, 0, 17, 17), 'trang', [-5, -5, 15])}<path d="M0 -6 L6 -2 L4 5 L-4 5 L-6 -2 Z" fill="${THAN}"/>${[[0, -16], [14, -5], [9, 13], [-9, 13], [-14, -5]].map(([x, y]) => `<path d="M${(x * .4).toFixed(1)} ${(y * .4).toFixed(1)} L${(x * .85).toFixed(1)} ${(y * .85).toFixed(1)}" stroke="${THAN}" stroke-width="2.2"/><circle cx="${(x * .95).toFixed(1)}" cy="${(y * .95).toFixed(1)}" r="3.2" fill="${THAN}"/>`).join('')}${dom(-7, -8, 3.5, 2, -30)}</g>
      ${net('M78 142 L100 162 L122 142', MAU.xanh[0], 5)}${khoi(p, 'b', elip(100, 166, 10, 10), 'vang', [97, 163, 9])}${saoNho(100, 166, .6, MAU.vang[1])}`,
    'con-ong': p => `${net('M60 72 Q100 54 140 72', THAN, 6)}${net('M84 62 Q80 42 70 32 M116 62 Q120 42 130 32', THAN, 3.5)}${khoi(p, 'a', elip(70, 30, 7, 7), 'vang', [68, 28, 6])}${khoi(p, 'b', elip(130, 30, 7, 7), 'vang', [128, 28, 6])}
      ${khoi(p, 'e', 'M60 144 Q100 170 140 144 Q143 156 138 162 Q100 184 62 162 Q57 156 60 144 Z', 'vang', [92, 136, 40])}<g clip-path="url(#${p}e)" fill="${THAN}"><path d="M72 140 L82 140 L78 190 L68 190 Z"/><path d="M95 140 L105 140 L105 190 L95 190 Z"/><path d="M118 140 L128 140 L132 190 L122 190 Z"/></g>
      <g transform="translate(168 140)">${khoi(p, 'c', 'M-14 -10 Q-16 14 0 16 Q16 14 14 -10 Z', 'cam', [-6, -6, 18])}${khoi(p, 'd', chuNhat(-16, -17, 32, 9, 4), 'vang', [-8, -17, 14])}${net('M-6 -8 Q-8 2 -4 6', MAU.vang[0], 4)}${dom(-7, -2, 2, 4, 10)}</g>`,
    // ---- Phụ kiện thường ngày (đợt 2, 20/11/2026) ----
    'kinh-tim': p => {
      const tim = (cx, cy) => `M${cx} ${cy + 12} C${cx - 18} ${cy + 2} ${cx - 16} ${cy - 14} ${cx} ${cy - 6} C${cx + 16} ${cy - 14} ${cx + 18} ${cy + 2} ${cx} ${cy + 12} Z`;
      return `${khoi(p, 'a', tim(83, 101), 'do', [78, 94, 13])}${khoi(p, 'b', tim(117, 101), 'do', [112, 94, 13])}${net('M96 98 Q100 94 104 98', MAU.do[1], 4)}${net('M70 96 L57 91 M130 96 L143 91', MAU.do[1], 4)}${net('M75 98 Q76 93 81 92 M109 98 Q110 93 115 92', '#fff', 3)}`;
    },
    'o-mua': p => `${net('M164 80 V150 Q164 158 156 158 Q150 158 150 152', THAN, 4.5)}${khoi(p, 'a', 'M130 80 Q132 40 164 38 Q196 40 198 80 Q190 73 181 80 Q172 73 164 80 Q156 73 147 80 Q138 73 130 80 Z', 'xanh', [152, 50, 34])}
      <g clip-path="url(#${p}a)" fill="#fff" opacity=".85"><circle cx="148" cy="57" r="4"/><circle cx="168" cy="48" r="3.5"/><circle cx="184" cy="62" r="4"/><circle cx="160" cy="69" r="3"/></g>
      ${net('M164 39 Q155 56 147 79 M164 39 V79 M164 39 Q173 56 181 79', MAU.xanh[1], 2.4)}${net('M164 38 V30', THAN, 3.5)}${net('M140 54 Q146 46 154 43', MAU.xanh[2], 3)}
      ${[[128, 100], [194, 98], [184, 118]].map(([x, y]) => `<path d="M${x} ${y - 7} Q${x + 5} ${y} ${x} ${y + 3} Q${x - 5} ${y} ${x} ${y - 7} Z" fill="${MAU.xanh[2]}"/>`).join('')}`,
    'du-nang': p => `${net('M52 140 L31 62', MAU.go[1], 4)}${net('M52 140 Q55 150 48 152', MAU.go[1], 4)}
      ${khoi(p, 'a', 'M2 62 Q4 30 31 28 Q58 30 60 62 Q53 56 45 62 Q38 56 31 62 Q24 56 17 62 Q10 56 2 62 Z', 'hong', [22, 38, 28])}
      ${net('M31 29 Q24 44 17 61 M31 29 V61 M31 29 Q38 44 45 61', MAU.hong[1], 2.2)}${[2, 17, 31, 45, 60].map(x => `<circle cx="${x}" cy="63" r="3" fill="#fff"/>`).join('')}${net('M31 28 V21', MAU.go[1], 3)}${net('M10 44 Q15 36 22 33', MAU.hong[2], 3)}`,
    'mu-tai-beo': p => `${bongDo(100, 86, 42, 6)}${khoi(p, 'a', 'M48 82 Q100 64 152 82 Q156 94 144 94 Q100 82 56 94 Q44 94 48 82 Z', 'ngoc', [84, 74, 50])}${khoi(p, 'b', 'M68 78 Q66 44 100 42 Q134 44 132 78 Q100 70 68 78 Z', 'ngoc', [88, 50, 38])}
      <path d="M68 70 Q100 62 132 70 L132 78 Q100 70 68 78 Z" fill="${MAU.vang[0]}"/>${net('M78 58 Q86 48 100 47', MAU.ngoc[2], 3.5)}${hoa(122, 69, 7, 'trang', 'vang')}`,
    'kep-hoa': () => `<ellipse cx="52" cy="84" rx="9" ry="4.5" fill="${MAU.la[0]}" transform="rotate(35 52 84)"/><ellipse cx="80" cy="62" rx="7" ry="3.5" fill="${MAU.la[1]}" transform="rotate(-35 80 62)"/>${hoa(66, 72, 14, 'tim', 'vang')}`,
    'dong-ho': (p, tu) => {
      const [x, y, g] = tu.tayLen ? [156, 112, 50] : [149, 133, 30];
      return `<g transform="rotate(${g} ${x} ${y})">${khoi(p, 'a', chuNhat(x - 6, y - 15, 12, 30, 5), 'do', [x - 2, y - 12, 11])}${khoi(p, 'b', elip(x, y, 9.5, 9.5), 'trang', [x - 2.5, y - 2.5, 9])}<circle cx="${x}" cy="${y}" r="9.5" fill="none" stroke="${MAU.vang[1]}" stroke-width="2.8"/>${net(`M${x} ${y} V${y - 5.5} M${x} ${y} H${x + 4.5}`, THAN, 2.2)}${dom(x - 4, y - 4, 2, 1.2, -30)}</g>`;
    },
    'tui-deo': p => `${net('M54 124 Q86 150 116 156', MAU.nau[1], 6)}${net('M54 124 Q86 150 116 156', MAU.nau[0], 3)}${khoi(p, 'a', chuNhat(106, 146, 36, 28, 9), 'go', [114, 148, 24])}
      ${khoi(p, 'b', 'M106 156 Q106 146 115 146 H133 Q142 146 142 156 Q124 164 106 156 Z', 'nau', [116, 146, 18])}${khoi(p, 'c', elip(124, 160, 3.6, 3.6), 'vang', [123, 159, 3.5])}${dom(112, 152, 3, 1.6, -30)}`,
    'tra-sua': p => `${net('M168 112 L176 84', MAU.hong[1], 6)}${net('M168 112 L176 84', MAU.hong[0], 3.5)}${khoi(p, 'a', 'M151 112 H179 L175 152 Q165 156 155 152 Z', 'rom', [158, 116, 22])}
      ${khoi(p, 'b', elip(165, 112, 16, 5.5), 'trang', [161, 109, 13])}${[[158, 146], [165, 148], [172, 145], [161, 139], [169, 139]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${THAN}"/>`).join('')}${dom(157, 125, 2.6, 7, 0)}`,
    'bong-bay': p => `${net('M50 134 Q30 112 40 92 Q48 78 34 72', MAU.than[2], 2)}${khoi(p, 'a', 'M34 70 C14 70 10 50 12 40 C14 24 26 18 34 18 C42 18 54 24 56 40 C58 50 54 70 34 70 Z', 'do', [28, 34, 26])}
      ${khoi(p, 'b', 'M30 75 L34 69 L38 75 Z', 'do', [32, 70, 4])}${dom(24, 32, 4, 7, 20)}`,
    'dien-thoai': p => `<g transform="translate(36 132) rotate(-12)">${khoi(p, 'a', chuNhat(-12, -20, 24, 40, 6), 'than', [-6, -14, 22])}<path d="${chuNhat(-9, -15, 18, 28, 3)}" fill="#7FE7FF" fill-opacity=".8"/>
      <path d="M0 4 C-6 0 -6 -6 -2 -6 C-1 -6 0 -5 0 -4 C0 -5 1 -6 2 -6 C6 -6 6 0 0 4 Z" fill="${MAU.hong[0]}"/>${net('M-6 -10 L-1 -14', '#fff', 2)}<circle cx="0" cy="16.5" r="1.6" fill="${MAU.than[2]}"/></g>`,
    // ---- Bộ sưu tập Không gian ----
    'kinh-vu-tru': p => `${khoi(p, 'a', chuNhat(56, 88, 88, 28, 14), 'bac', [70, 92, 40])}<path d="${chuNhat(61, 92, 78, 20, 10)}" fill="#7FE7FF" fill-opacity=".75"/>
      ${net('M68 100 L82 94 M74 106 L94 96', '#fff', 3)}${net('M56 100 L48 96 M144 100 L152 96', MAU.bac[1], 4.5)}<circle cx="132" cy="102" r="2.4" fill="${MAU.do[0]}"/>`,
    'hanh-tinh': p => `<g transform="translate(36 128)"><path d="M-24 4 Q0 -8 24 -4" stroke="${MAU.vang[1]}" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${khoi(p, 'a', elip(0, 0, 15, 15), 'tim', [-5, -5, 13])}${net('M-8 -4 Q0 -8 8 -6 M-10 4 Q0 0 10 2', MAU.tim[2], 2.2)}${dom(-6, -7, 3.5, 2, -30)}
      <path d="M-24 4 Q0 14 24 -4" stroke="${MAU.vang[0]}" stroke-width="5" fill="none" stroke-linecap="round"/></g>`,
    'ten-lua': p => `<g transform="translate(166 118) rotate(28)"><path class="a lua-phut" d="M-6 22 Q0 40 6 22 Z" fill="${MAU.cam[0]}"/><path class="a lua-phut" d="M-3 22 Q0 32 3 22 Z" fill="${MAU.vang[0]}"/>
      ${khoi(p, 'a', 'M0 -26 Q12 -12 10 20 H-10 Q-12 -12 0 -26 Z', 'trang', [-4, -12, 16])}${khoi(p, 'b', 'M0 -26 Q7 -18 8 -12 H-8 Q-7 -18 0 -26 Z', 'do', [-2, -20, 8])}
      ${khoi(p, 'c', 'M-10 8 L-18 22 L-10 20 Z', 'do', [-12, 12, 6])}${khoi(p, 'd', 'M10 8 L18 22 L10 20 Z', 'do', [12, 12, 6])}${khoi(p, 'e', elip(0, -2, 5, 5), 'xanh', [-1, -3, 5])}</g>`,
    'ba-lo-phan-luc': p => `${net('M64 80 Q58 112 66 150', MAU.bac[1], 6)}${net('M136 80 Q142 112 134 150', MAU.bac[1], 6)}${khoi(p, 'a', chuNhat(88, 150, 24, 12, 5), 'bac', [94, 150, 12])}<circle cx="100" cy="156" r="3" fill="${MAU.do[0]}"/>`,
    // ---- Bộ trang phục chủ đề (thêm) ----
    'bac-si': p => `${net('M56 82 Q100 62 144 82', MAU.bac[1], 6)}${khoi(p, 'a', elip(100, 64, 12, 12), 'bac', [97, 61, 11])}<circle cx="100" cy="64" r="5" fill="#BFE3FF"/>${dom(97, 61, 2.4, 1.4, -30)}
      ${net('M66 146 Q100 168 134 146', THAN, 4)}${net('M134 146 Q140 160 126 166', THAN, 4)}${khoi(p, 'b', elip(122, 168, 7, 7), 'bac', [120, 166, 6])}
      ${khoi(p, 'c', chuNhat(70, 152, 16, 16, 4), 'trang', [74, 154, 10])}<path d="M76 155 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4z" fill="${MAU.do[0]}"/>`,
    ninja: p => `${khoi(p, 'a', 'M51 102 Q48 52 100 50 Q152 52 149 102 Q126 88 100 88 Q74 88 51 102 Z', 'than', [86, 62, 46])}
      ${khoi(p, 'b', 'M56 112 Q100 126 144 112 Q146 146 100 162 Q54 146 56 112 Z', 'than', [88, 120, 40])}${net('M52 84 Q100 66 148 84', MAU.do[0], 7)}
      ${khoi(p, 'c', 'M146 80 Q164 74 176 84 Q164 88 150 88 Z', 'do', [154, 78, 12])}${khoi(p, 'd', 'M148 86 Q160 92 166 106 Q154 102 146 92 Z', 'do', [150, 88, 10])}
      ${net('M70 58 Q84 54 98 54', MAU.than[2], 3)}<g transform="translate(166 136) rotate(15)">${khoi(p, 'e', 'M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z', 'bac', [-3, -4, 12])}<circle r="3" fill="${THAN}"/></g>`,
    'cao-boi': p => `${bongDo(100, 84, 46, 6)}${khoi(p, 'a', 'M34 78 Q50 96 100 92 Q150 96 166 78 Q156 70 142 78 L136 50 Q118 40 100 46 Q82 40 64 50 L58 78 Q44 70 34 78 Z', 'go', [80, 56, 60])}
      <path d="M60 72 Q100 82 140 72 L141 79 Q100 89 59 79 Z" fill="${MAU.nau[1]}"/>${net('M86 50 Q100 58 114 50', MAU.go[1], 3)}${net('M70 60 Q76 52 86 50', MAU.go[2], 3)}
      ${khoi(p, 'b', 'M64 148 Q100 162 136 148 L100 182 Z', 'do', [92, 150, 30])}${[[86, 156], [100, 162], [114, 156], [100, 172]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`).join('')}
      <ellipse cx="172" cy="128" rx="14" ry="10" fill="none" stroke="${MAU.go[0]}" stroke-width="3.5"/>${net('M160 136 L150 144', MAU.go[0], 3.5)}`,
    'cuu-hoa': p => `${bongDo(100, 86, 46, 6)}${khoi(p, 'a', 'M48 86 Q46 46 100 42 Q154 46 152 86 Q172 92 170 98 Q100 104 30 98 Q28 92 48 86 Z', 'do', [84, 54, 56])}
      ${net('M100 44 V84', MAU.do[1], 4)}${khoi(p, 'b', 'M88 56 L112 56 L110 80 L100 86 L90 80 Z', 'vang', [96, 60, 16])}${saoNho(100, 69, .6, MAU.do[0])}${net('M66 58 Q76 48 90 46', MAU.do[2], 3.5)}
      ${khoi(p, 'c', 'M58 142 Q100 166 142 142 Q146 154 140 162 Q100 184 60 162 Q54 154 58 142 Z', 'vang', [90, 140, 40])}${net('M60 154 Q100 176 140 154', '#E8EDF2', 4)}
      <g transform="translate(168 132)">${khoi(p, 'd', chuNhat(-9, -14, 18, 30, 7), 'do', [-4, -10, 14])}${net('M0 -14 V-20 L10 -24', THAN, 3)}<rect x="-9" y="-2" width="18" height="5" fill="#fff"/></g>`,
    'ky-si': p => `${bongDo(100, 84, 40, 6)}${khoi(p, 'a', 'M54 90 Q50 46 100 44 Q150 46 146 90 Q100 78 54 90 Z', 'bac', [86, 54, 46])}${net('M100 46 V84', MAU.bac[1], 3)}${net('M68 60 Q78 50 92 48', '#fff', 3.5)}
      ${khoi(p, 'b', 'M100 46 Q94 20 110 12 Q122 8 126 16 Q112 18 108 30 Q106 40 104 46 Z', 'do', [108, 18, 14])}
      <g transform="translate(36 134)">${khoi(p, 'c', 'M-18 -20 H18 V2 Q18 18 0 26 Q-18 18 -18 2 Z', 'xanh', [-6, -14, 22])}${net('M0 -16 V20 M-13 -4 H13', MAU.vang[0], 4)}</g>
      ${net('M152 150 L178 96', MAU.bac[1], 7)}${net('M153 146 L176 99', '#fff', 2)}${net('M144 140 L162 150', MAU.vang[1], 6)}<circle cx="150" cy="154" r="4" fill="${MAU.vang[0]}"/>`,
    'huan-chuong': p => `${net('M80 146 L98 166', MAU.xanh[0], 8)}${net('M120 146 L102 166', MAU.do[0], 8)}${khoi(p, 'a', elip(100, 172, 12, 12), 'vang', [97, 169, 11])}${saoNho(100, 172, .75, MAU.vang[1])}`,
    // ---- Bộ sưu tập Áo dài Việt Nam ----
    // Khăn đóng (khăn vấn) đỏ quấn từng lớp chéo, viền vàng
    'khan-dong': p => `${bongDo(100, 84, 40, 6)}${khoi(p, 'a', 'M58 84 Q54 54 100 50 Q146 54 142 84 Q100 74 58 84 Z', 'do', [88, 58, 46])}
      ${net('M62 74 Q78 60 96 58 M66 82 Q90 64 116 60 M84 78 Q110 64 136 66 M108 74 Q126 68 140 76', MAU.do[1], 3)}${net('M59 83 Q100 73 141 83', MAU.vang[0], 3.5)}${net('M74 62 Q86 54 100 53', MAU.do[2], 3)}`,
    // Áo dài đỏ: thân áo ôm phần dưới, cổ đứng viền vàng, đường xẻ chéo có hàng khuy, hoa văn vàng, tà trước bay xuống
    'ao-dai': p => `${khoi(p, 'a', 'M57 140 Q100 152 143 140 A50 50 0 0 1 57 140 Z', 'do', [90, 140, 44])}
      ${net('M58 140 Q100 152 142 140', MAU.vang[0], 4)}${net('M100 151 Q120 156 138 147', MAU.do[1], 2.6)}${[[110, 154], [120, 154.5], [130, 152]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="${MAU.vang[0]}"/>`).join('')}
      ${khoi(p, 'b', 'M89 158 Q100 162 111 158 Q113 178 117 197 Q100 194 83 197 Q87 178 89 158 Z', 'do', [95, 166, 22])}
      ${net('M100 162 Q101 180 100 196', MAU.do[1], 2)}${hoa(78, 152, 6, 'vang', 'do')}${hoa(100, 182, 5, 'vang', 'do')}${saoNho(70, 145, .4, MAU.vang[0])}${saoNho(92, 172, .35, MAU.vang[0])}`,
    // Quạt giấy cầm tay phải, xoè lên trên
    'quat-giay': p => {
      const [cx, cy, r, a1, a2] = [156, 144, 34, -100, 20], d2r = a => a * Math.PI / 180;
      const dm = a => `${(cx + Math.cos(d2r(a)) * r).toFixed(1)} ${(cy + Math.sin(d2r(a)) * r).toFixed(1)}`;
      const nan = [-100, -80, -60, -40, -20, 0, 20].map(a => `M${cx} ${cy} L${dm(a)}`).join(' ');
      const r2 = r * .82, vien = `M${(cx + Math.cos(d2r(a1)) * r2).toFixed(1)} ${(cy + Math.sin(d2r(a1)) * r2).toFixed(1)} A${r2} ${r2} 0 0 1 ${(cx + Math.cos(d2r(a2)) * r2).toFixed(1)} ${(cy + Math.sin(d2r(a2)) * r2).toFixed(1)}`;
      return `${khoi(p, 'a', `M${cx} ${cy} L${dm(a1)} A${r} ${r} 0 0 1 ${dm(a2)} Z`, 'vang', [162, 118, 30])}${net(nan, MAU.vang[1], 1.8)}${net(vien, MAU.do[0], 3)}
        ${hoa(170, 126, 5, 'do', 'vang')}<circle cx="${cx}" cy="${cy}" r="4" fill="${MAU.go[1]}"/>`;
    },
    // Hoa sen hồng cầm tay trái, có cuống và lá
    'hoa-sen': p => `${net('M40 132 Q42 150 50 166', MAU.la[1], 4)}<g transform="translate(52 160) rotate(30)">${khoi(p, 'l', elip(0, 0, 11, 6), 'la', [-3, -2, 9])}</g>
      <g transform="translate(38 122)">${khoi(p, 'a', 'M0 12 Q-22 6 -20 -8 Q-8 -4 0 12 Z', 'hong', [-14, -4, 12])}${khoi(p, 'b', 'M0 12 Q22 6 20 -8 Q8 -4 0 12 Z', 'hong', [12, -4, 12])}
      ${khoi(p, 'c', 'M0 12 Q-12 0 0 -20 Q12 0 0 12 Z', 'hong', [-3, -6, 12])}${khoi(p, 'd', 'M0 12 Q-14 2 -9 -12 Q-2 0 0 12 Z', 'hong', [-6, -4, 8])}${khoi(p, 'e', 'M0 12 Q14 2 9 -12 Q2 0 0 12 Z', 'hong', [6, -4, 8])}${dom(-3, -6, 1.8, 4, 10)}</g>`,
  };
  // Phần nằm sau lưng Noe (vẽ trước thân để bị thân che bớt)
  const DO_SAU = {
    'phi-hanh-gia': p => khoi(p, 'bl', chuNhat(54, 88, 92, 72, 22), 'bac', [86, 100, 60]),
    'sieu-nhan': p => khoi(p, 'cp', AO_CHOANG, 'do', [86, 120, 62]),
    'ao-choang-tim': p => khoi(p, 'cp', AO_CHOANG, 'tim', [86, 120, 62]) + saoNho(52, 172, .8) + saoNho(150, 178, .7) + saoNho(60, 150, .5) + saoNho(144, 156, .5),
    // ba lô phản lực: hai bình bạc hai bên, lửa phụt phía dưới
    'ba-lo-phan-luc': p => `<path class="a lua-phut" d="M44 160 Q52 190 60 160 Z" fill="${MAU.cam[0]}"/><path class="a lua-phut" d="M140 160 Q148 190 156 160 Z" fill="${MAU.cam[0]}"/>
      <path class="a lua-phut" d="M48 160 Q52 178 56 160 Z" fill="${MAU.vang[0]}"/><path class="a lua-phut" d="M144 160 Q148 178 152 160 Z" fill="${MAU.vang[0]}"/>
      ${khoi(p, 'ta', chuNhat(40, 92, 24, 70, 12), 'bac', [46, 100, 22])}${khoi(p, 'tb', chuNhat(136, 92, 24, 70, 12), 'bac', [142, 100, 22])}
      <rect x="40" y="112" width="24" height="6" fill="${MAU.do[0]}"/><rect x="136" y="112" width="24" height="6" fill="${MAU.do[0]}"/>`,
    // cánh thiên thần trắng và cánh ong xanh nhạt sau lưng
    'thien-than': p => khoi(p, 'wa', 'M60 110 Q30 80 14 96 Q6 110 22 118 Q10 126 20 136 Q30 144 44 136 Q40 148 54 150 Q66 148 62 130 Z', 'trang', [26, 100, 34])
      + khoi(p, 'wb', 'M140 110 Q170 80 186 96 Q194 110 178 118 Q190 126 180 136 Q170 144 156 136 Q160 148 146 150 Q134 148 138 130 Z', 'trang', [170, 100, 34])
      + net('M22 104 Q36 106 48 116 M24 128 Q38 128 50 132 M178 104 Q164 106 152 116 M176 128 Q162 128 150 132', '#DCE4EC', 2.4),
    'con-ong': () => [[40, 90, 26, 15, -30], [160, 90, 26, 15, 30], [44, 120, 18, 11, 20], [156, 120, 18, 11, -20]].map(([x, y, rx, ry, q]) =>
      `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#CDE9FF" stroke="#9FCFF5" stroke-width="2" transform="rotate(${q} ${x} ${y})"/><ellipse cx="${x - rx * .25}" cy="${y - ry * .25}" rx="${rx * .45}" ry="${ry * .35}" fill="#fff" opacity=".7" transform="rotate(${q} ${x} ${y})"/>`).join(''),
    // ba lô sau lưng: lộ ra hai bên và phía dưới thân
    'ba-lo': p => khoi(p, 'bl', chuNhat(48, 92, 104, 80, 26), 'cam', [80, 104, 62]) + khoi(p, 'bt', chuNhat(76, 150, 48, 22, 10), 'cam', [90, 152, 26]),
    'ao-choang-do': p => khoi(p, 'cp', 'M60 98 Q28 152 40 194 Q72 182 100 186 Q128 182 160 194 Q172 152 140 98 Z', 'do', [86, 120, 64]),
    // tà sau của áo dài bay sau lưng, lộ hai bên tà trước; ống quần trắng thấp thoáng
    'ao-dai': p => `${khoi(p, 'q', 'M73 156 Q71 178 75 197 Q83 199 91 197 V160 Z M109 160 V197 Q117 199 125 197 Q129 178 127 156 Z', 'trang', [84, 164, 40])}
      ${khoi(p, 'ts', 'M78 150 Q66 170 46 190 Q62 199 84 193 Q88 174 96 160 Z', 'do', [70, 160, 26])}`,
  };
  // Chỗ mặc của từng món: mặc nhiều món cùng lúc được (mỗi chỗ một món), ví dụ vương miện + áo choàng + trượng.
  // "bo" là bộ trang phục trọn gói, mặc thì cởi các món khác.
  const O_DO = {
    dau: ['tai-nghe', 'mu', 'vuong-mien', 'mu-coi', 'mu-noi', 'mu-len', 'mu-phu-thuy', 'khan-dong', 'mu-luoi-trai', 'mu-tai-beo'], kep: ['no', 'hoa-mai', 'la-phong', 'kep-sao', 'kep-hoa'], tai: ['bit-tai'],
    mat: ['kinh', 'kinh-ram', 'kinh-vu-tru', 'kinh-tim'], co: ['khan', 'khan-len', 'huan-chuong', 'day-chuyen'], than: ['phao-boi', 'banh-chung', 'ao-dai', 'tui-deo'], gang: ['gang-tay', 'dong-ho'],
    tay: ['long-den', 'kem', 'o-thu', 'coc-cacao', 'truong-phep', 'truong-vang', 'quat-giay', 'but-chi', 'ten-lua', 'o-mua', 'tra-sua'], 'tay-trai': ['li-xi', 'qua-cau', 'hoa-sen', 'sach', 'hanh-tinh', 'du-nang', 'bong-bay', 'dien-thoai'],
    lung: ['ao-choang-tim', 'ao-choang-do', 'ba-lo', 'ba-lo-phan-luc'],
    bo: ['non-la', 'dau-bep', 'hoa-si', 'cuop-bien', 'ao-thuat', 'tay-dua', 'phi-hanh-gia', 'sieu-nhan', 'bac-si', 'ninja', 'cao-boi', 'cuu-hoa', 'ky-si',
      'thuy-thu', 'canh-sat', 'nha-khoa-hoc', 'ca-si', 'tho-lan', 'ong-gia-noel', 'thien-than', 'tham-tu', 'cau-thu', 'con-ong'],
  };
  const THU_TU = ['lung', 'than', 'co', 'mat', 'tai', 'dau', 'kep', 'gang', 'tay', 'tay-trai', 'bo']; // vẽ từ trong ra ngoài
  const oCua = ma => Object.keys(O_DO).find(o => O_DO[o].includes(ma)) || 'bo';
  const dsMac = s => String(s || '').split(',').map(x => x.trim()).filter(x => DO_NOE[x] || DO_SAU[x]);
  window.noeDsMac = dsMac;
  // Mặc thêm một món: thay món cùng chỗ; bộ trọn gói thì thay hết. Trả về chuỗi các món đang mặc.
  window.noeMacThem = (dang, ma) => {
    const o = oCua(ma);
    const giu = o === 'bo' ? [] : dsMac(dang).filter(x => { const ox = oCua(x); return ox !== o && ox !== 'bo'; });
    return [...giu, ma].sort((a, b) => THU_TU.indexOf(oCua(a)) - THU_TU.indexOf(oCua(b))).join(',');
  };
  window.noeCoi = (dang, ma) => dsMac(dang).filter(x => x !== ma).join(',');
  // Món che đỉnh đầu thì ẩn ăng-ten ngôi sao của Noe
  const AN_ANG_TEN = new Set(['mu', 'vuong-mien', 'tai-nghe', 'phi-hanh-gia', 'tay-dua', 'dau-bep', 'ao-thuat', 'cuop-bien', 'hoa-si', 'non-la',
    'mu-coi', 'mu-noi', 'mu-len', 'bit-tai', 'mu-phu-thuy', 'khan-dong', 'mu-luoi-trai', 'mu-tai-beo', 'ninja', 'cao-boi', 'cuu-hoa', 'ky-si',
    'thuy-thu', 'canh-sat', 'ong-gia-noel', 'thien-than', 'tham-tu', 'con-ong']);
  window.noe = function (tam = 'vui') {
    const k = KIEU[tam] || KIEU.vui, g = 'noe' + (++id), sang = k.sang ?? .28;
    const ds = dsMac(window.NOE_DO).sort((a, b) => THU_TU.indexOf(oCua(a)) - THU_TU.indexOf(oCua(b)));
    const tu = { tayLen: k.tay === 'len' };
    // mỗi món một tiền tố riêng để mã cắt hình không trùng khi mặc nhiều món
    const tt = m => g + m.replace(/-/g, '');
    const doMac = ds.map(m => DO_NOE[m] ? DO_NOE[m](tt(m), tu) : '').join(''), doSau = ds.map(m => DO_SAU[m] ? DO_SAU[m](tt(m) + 's', tu) : '').join('');
    const anAngTen = ds.some(m => AN_ANG_TEN.has(m));
    const tay = k.tay === 'len'
      ? `<ellipse cx="44" cy="110" rx="13" ry="9" fill="${VB}" transform="rotate(-50 44 110)"/><ellipse cx="156" cy="110" rx="13" ry="9" fill="${VB}" transform="rotate(50 156 110)"/>` // tay giơ ngang hông để vẫy, không để sát đỉnh đầu kẻo trông như tai
      : `<ellipse cx="53" cy="131" rx="12" ry="9" fill="${VB}" transform="rotate(-30 53 131)"/><ellipse cx="147" cy="131" rx="12" ry="9" fill="${VB}" transform="rotate(30 147 131)"/>`;
    const ma = k.mi === 'buon' ? '' : `<ellipse cx="68" cy="119" rx="8" ry="5" fill="${MA}"/><ellipse cx="132" cy="119" rx="8" ry="5" fill="${MA}"/>`;
    const angTen = anAngTen ? '' : `<path d="M100 66 V53" stroke="${VB}" stroke-width="6" stroke-linecap="round"/>
      <g class="a tw"><path d="M100 24 Q103 37 116 40 Q103 43 100 56 Q97 43 84 40 Q97 37 100 24 Z" fill="${V}"/><path d="M100 24 Q103 37 116 40 Q103 43 100 56 Z" fill="${VB}" opacity=".55"/></g>`;
    return `<svg class="noe-svg" data-do="${window.NOE_DO || ''}" viewBox="0 0 200 200" role="img" aria-label="Noe, bấm vào để chơi với Noe" tabindex="0"><defs><clipPath id="${g}t"><circle cx="100" cy="114" r="50"/></clipPath></defs>
      <g class="a ${k.anim}"><circle cx="100" cy="112" r="84" fill="${V}" opacity="${sang * .55}"/><circle cx="100" cy="112" r="66" fill="${V}" opacity="${sang * .9}"/>
      ${angTen}${doSau}${tay}
      <g clip-path="url(#${g}t)"><circle cx="100" cy="114" r="50" fill="${VB}"/><circle cx="92" cy="105" r="49" fill="${V}"/></g>
      <ellipse cx="77" cy="83" rx="13" ry="7" fill="${VS}" transform="rotate(-32 77 83)"/><circle cx="68" cy="93" r="3.6" fill="#fff"/>
      <g class="a blink">${mat[k.m]()}</g>${k.may || ''}${mieng[k.mi]}${ma}${doMac}</g>${k.them || ''}</svg>`;
  };

  const ruot = s => s.replace(/^<svg[^>]*>|<\/svg>$/g, '');
  const sao = (x, y, s) => `<path class="a tw" d="M${x} ${y - 9 * s} l${3 * s} ${6 * s} l${6 * s} ${3 * s} l-${6 * s} ${3 * s} l-${3 * s} ${6 * s} l-${3 * s} -${6 * s} l-${6 * s} -${3 * s} l${6 * s} -${3 * s} z" fill="#F4F1D0"/>`;
  // Noe theo buổi trong ngày: nền trời, mặt trời/trăng, phụ kiện
  window.noeCanh = function (gio = new Date().getHours()) {
    const id = 'troi' + (++window._noeCanh || (window._noeCanh = 1));
    const nen = (a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="200" height="200" rx="22" fill="url(#${id})"/>`;
    let canh, tam, phu = '', ten;
    if (gio < 5 || gio >= 23) {
      ten = 'Khuya'; tam = 'ngu';
      canh = nen('#14213D', '#14213D') + sao(30, 40, .5) + sao(172, 150, .5) + sao(160, 30, .4);
      phu = `<path d="M62 74 Q90 40 140 30 Q128 56 138 76 Z" fill="#8FB3D9"/><path d="M60 76 Q100 62 140 78" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="141" cy="29" r="7" fill="#fff"/>
        <text class="a len" x="150" y="62" font-family="Nunito,sans-serif" font-weight="700" font-size="22" fill="#6FC2AE">z</text><text class="a len" style="animation-delay:.8s" x="166" y="44" font-family="Nunito,sans-serif" font-weight="700" font-size="16" fill="#6FC2AE">z</text>`;
    } else if (gio < 11) {
      ten = 'Buổi sáng'; tam = 'vui';
      canh = nen('#BFE6FF', '#FFE2B8') + `<circle class="a pulse" cx="40" cy="160" r="26" fill="#FFB000"/>`;
      phu = `<g transform="translate(152 150)"><rect x="-12" y="-14" width="22" height="24" rx="5" fill="#fff" stroke="#1E2A24" stroke-width="2.5"/><path d="M10 -8 q9 0 9 7 q0 7 -9 7" stroke="#1E2A24" stroke-width="2.5" fill="none"/><path class="a len" d="M-4 -20 q4 -5 0 -10" stroke="#56635C" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>`;
    } else if (gio < 14) {
      ten = 'Buổi trưa'; tam = 'vui';
      canh = nen('#7CC8F5', '#D8F0FF') + `<circle cx="160" cy="40" r="16" fill="#FFB000"/>` + [0, 60, 120, 180, 240, 300].map(r => `<path d="M160 40 L160 16" stroke="#FFB000" stroke-width="4" stroke-linecap="round" transform="rotate(${r} 160 40)"/>`).join('');
      phu = `<rect x="72" y="96" width="24" height="15" rx="6" fill="#1E2A24"/><rect x="104" y="96" width="24" height="15" rx="6" fill="#1E2A24"/><path d="M96 101 h8" stroke="#1E2A24" stroke-width="3"/>`;
    } else if (gio < 18) {
      ten = 'Buổi chiều'; tam = 'vui';
      canh = nen('#FFB27A', '#FFDDA8') + `<circle cx="160" cy="176" r="30" fill="#E2553B" opacity=".7"/>`;
      phu = `<g transform="translate(100 156)"><path d="M-30 -6 Q-15 -14 0 -6 Q15 -14 30 -6 V14 Q15 6 0 14 Q-15 6 -30 14 Z" fill="#fff" stroke="#2C6B5E" stroke-width="3"/><path d="M0 -6 V14" stroke="#2C6B5E" stroke-width="2.5"/></g>`;
    } else {
      ten = 'Buổi tối, giờ học'; tam = 'chao';
      canh = nen('#14213D', '#2B3A67') + `<circle cx="160" cy="40" r="16" fill="#F4F1D0"/><circle cx="167" cy="35" r="14" fill="#14213D"/>` + sao(30, 40, .6) + sao(56, 24, .45) + sao(180, 90, .5);
    }
    return `<svg class="noe-svg canh" viewBox="0 0 200 200" role="img" aria-label="Noe, ${ten}" tabindex="0">${canh}${ruot(noe(tam))}${phu}</svg>`;
  };

  // ---------- 9 huy hiệu theo cấp độ ánh sáng: hình phẳng, tròn mềm, cùng bảng màu với Noe ----------
  // hinhHuyHieu(ma, mo): mo = true thì vẽ mờ (chưa đạt). Các phần có lớp hh-* chuyển động trong màn ăn mừng.
  window.hinhHuyHieu = function (ma, mo = false) {
    const g = 'hh' + (++id);
    const nen = (mau, vien) => `<circle cx="50" cy="50" r="47" fill="${vien}"/><circle cx="50" cy="50" r="42" fill="${mau}"/>`;
    const tinh = (x, y, s, mau = '#FFF6C9', lop = 'hh-nhay', tre = 0) => `<path class="${lop}" style="animation-delay:${tre}s;transform-origin:${x}px ${y}px" d="M${x} ${y - 6 * s} Q${x + 1.4 * s} ${y - 1.4 * s} ${x + 6 * s} ${y} Q${x + 1.4 * s} ${y + 1.4 * s} ${x} ${y + 6 * s} Q${x - 1.4 * s} ${y + 1.4 * s} ${x - 6 * s} ${y} Q${x - 1.4 * s} ${y - 1.4 * s} ${x} ${y - 6 * s} Z" fill="${mau}"/>`;
    const SAO5 = (cx, cy, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = (-90 + i * 36) * Math.PI / 180, rr = i % 2 ? r * .45 : r; d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `; } return d + 'Z'; };
    const H = {
      'dom-sang': () => nen('#FFF4D6', '#FFC83D') + `<circle class="hh-tho" cx="50" cy="52" r="26" fill="${V}" opacity=".3"/><circle cx="50" cy="52" r="16" fill="${VB}"/><circle cx="47" cy="49" r="15" fill="${V}"/><ellipse cx="42" cy="44" rx="5" ry="3" fill="${VS}" transform="rotate(-30 42 44)"/>` + tinh(72, 30, .8, VB) + tinh(28, 72, .55, VB, 'hh-nhay', .5),
      'dom-dom': () => nen('#22305A', '#3B4C86') + `<g class="hh-bay"><ellipse cx="44" cy="40" rx="11" ry="7" fill="#CFEAFF" opacity=".75" transform="rotate(-30 44 40)"/><ellipse cx="58" cy="38" rx="11" ry="7" fill="#CFEAFF" opacity=".75" transform="rotate(30 58 38)"/>
        <ellipse cx="51" cy="50" rx="8" ry="11" fill="${MAU.than[0]}"/><circle cx="51" cy="40" r="6.5" fill="${MAU.than[0]}"/><circle class="hh-tho" cx="51" cy="66" r="16" fill="${V}" opacity=".35"/><ellipse cx="51" cy="64" rx="9" ry="10" fill="${V}"/><circle cx="48" cy="61" r="3" fill="#fff" opacity=".8"/></g>` + tinh(24, 34, .5, V, 'hh-nhay', .3) + tinh(76, 70, .6, V, 'hh-nhay', .9) + tinh(74, 28, .4, V, 'hh-nhay', 1.4),
      'ngon-nen': () => nen('#FFE9D6', '#FFA24A') + `<circle class="hh-tho" cx="50" cy="34" r="20" fill="${V}" opacity=".35"/><path d="${chuNhat(38, 46, 24, 36, 6)}" fill="#E6DCCB"/><path d="${chuNhat(38, 46, 18, 36, 6)}" fill="#FFF8EC"/><path d="M38 52 Q50 56 62 52" stroke="#E6DCCB" stroke-width="3" fill="none"/>
        <path d="M50 44 V40" stroke="${MAU.than[0]}" stroke-width="2.5" stroke-linecap="round"/><g class="hh-lua" style="transform-origin:50px 42px"><path d="M50 14 Q62 28 56 38 Q50 44 44 38 Q38 28 50 14 Z" fill="${MAU.cam[0]}"/><path d="M50 24 Q56 32 53 37 Q50 40 47 37 Q44 32 50 24 Z" fill="${V}"/></g>`,
      'ngon-den': () => nen('#E1F5FF', '#3FA9FF') + [0, 1, 2, 3, 4, 5, 6].map(i => `<path class="hh-tia" style="animation-delay:${i * .12}s" d="M50 10 V17" stroke="${VB}" stroke-width="4" stroke-linecap="round" transform="rotate(${-90 + i * 30} 50 42)"/>`).join('') +
        `<circle class="hh-tho" cx="50" cy="42" r="24" fill="${V}" opacity=".3"/><path d="M36 42 a14 14 0 1 1 28 0 c0 6-4 9-6 12 v4 H42 v-4 c-2-3-6-6-6-12 Z" fill="${VB}"/><path d="M36 42 a13 13 0 0 1 24 -7 c-6 -2 -14 2 -14 10 c0 4 2 7 3 9 H42 c-2-3-6-6-6-12 Z" fill="${V}"/><circle cx="43" cy="36" r="3" fill="#fff"/>
        <path d="${chuNhat(41, 59, 18, 6, 3)}" fill="${MAU.bac[1]}"/><path d="${chuNhat(43, 66, 14, 6, 3)}" fill="${MAU.bac[1]}"/><path d="${chuNhat(46, 72, 8, 5, 2.5)}" fill="${MAU.than[0]}"/>`,
      'lua-trai': () => nen('#2B2140', '#5A3E7A') + `<circle class="hh-tho" cx="50" cy="56" r="28" fill="${MAU.cam[0]}" opacity=".25"/><g class="hh-lua" style="transform-origin:50px 72px"><path d="M50 22 Q70 44 64 62 Q58 74 50 74 Q42 74 36 62 Q30 44 50 22 Z" fill="${MAU.do[0]}"/><path d="M50 36 Q62 50 58 63 Q55 70 50 70 Q45 70 42 63 Q38 50 50 36 Z" fill="${MAU.cam[0]}"/><path d="M50 48 Q56 56 54 64 Q52 68 50 68 Q48 68 46 64 Q44 56 50 48 Z" fill="${V}"/></g>
        <path d="M28 82 L72 70" stroke="${MAU.go[1]}" stroke-width="9" stroke-linecap="round"/><path d="M28 70 L72 82" stroke="${MAU.go[0]}" stroke-width="9" stroke-linecap="round"/>` + [[34, 30, 0], [66, 26, .6], [60, 18, 1.2], [40, 20, 1.6]].map(([x, y, t]) => `<circle class="hh-tan" style="animation-delay:${t}s" cx="${x}" cy="${y}" r="2.4" fill="${V}"/>`).join(''),
      'ngoi-sao': () => nen('#22305A', '#FFC83D') + `<circle class="hh-tho" cx="50" cy="51" r="30" fill="${V}" opacity=".22"/><g class="hh-quay-cham" style="transform-origin:50px 52px"><path d="${SAO5(50, 52, 28)}" fill="${VB}" stroke="${VB}" stroke-width="6" stroke-linejoin="round"/><path d="${SAO5(48, 50, 25)}" fill="${V}" stroke="${V}" stroke-width="5" stroke-linejoin="round"/></g><ellipse cx="41" cy="42" rx="5" ry="3" fill="${VS}" transform="rotate(-30 41 42)"/>` + tinh(22, 28, .6, '#FFF6C9', 'hh-nhay', .2) + tinh(80, 74, .5, '#FFF6C9', 'hh-nhay', .8) + tinh(78, 24, .4, '#FFF6C9', 'hh-nhay', 1.3),
      'mat-trang': () => nen('#14213D', '#8FB3D9') + `<defs><clipPath id="${g}"><circle cx="50" cy="50" r="42"/></clipPath><mask id="${g}m"><rect width="100" height="100" fill="#fff"/><circle cx="62" cy="40" r="22" fill="#000"/></mask></defs>
        <circle class="hh-tho" cx="46" cy="52" r="30" fill="#FFF6C9" opacity=".16"/><g mask="url(#${g}m)"><circle cx="46" cy="52" r="26" fill="#E9D98F"/><circle cx="44" cy="50" r="24" fill="#FFF1B0"/><circle cx="34" cy="60" r="4" fill="#E9D98F"/><circle cx="44" cy="70" r="2.6" fill="#E9D98F"/></g>` + tinh(74, 64, .6, '#FFF6C9', 'hh-nhay', 0) + tinh(70, 22, .45, '#FFF6C9', 'hh-nhay', .7) + tinh(84, 44, .35, '#FFF6C9', 'hh-nhay', 1.2) + tinh(26, 26, .35, '#FFF6C9', 'hh-nhay', 1.6),
      'mat-troi': () => nen('#FFE7A8', '#FFA24A') + `<g class="hh-quay" style="transform-origin:50px 50px">${Array.from({ length: 12 }, (_, i) => `<path d="M50 9 Q53 17 50 22 Q47 17 50 9 Z" fill="${i % 2 ? MAU.cam[0] : VB}" stroke="${i % 2 ? MAU.cam[0] : VB}" stroke-width="4" stroke-linejoin="round" transform="rotate(${i * 30} 50 50)"/>`).join('')}</g>
        <circle cx="50" cy="50" r="22" fill="${MAU.cam[0]}"/><circle cx="47" cy="47" r="20" fill="${V}"/><ellipse cx="40" cy="40" rx="5" ry="3" fill="${VS}" transform="rotate(-30 40 40)"/>`,
      'thien-ha': () => nen('#1A1440', '#A07CFF') + `<defs><clipPath id="${g}"><circle cx="50" cy="50" r="42"/></clipPath></defs><g clip-path="url(#${g})"><g class="hh-quay" style="transform-origin:50px 50px">
        <ellipse cx="50" cy="50" rx="38" ry="14" fill="${MAU.tim[0]}" opacity=".45" transform="rotate(-20 50 50)"/><ellipse cx="50" cy="50" rx="30" ry="10" fill="${MAU.hong[0]}" opacity=".55" transform="rotate(25 50 50)"/><ellipse cx="50" cy="50" rx="24" ry="8" fill="${MAU.xanh[2]}" opacity=".55" transform="rotate(70 50 50)"/>
        <path d="M50 50 Q30 40 26 58 Q24 70 38 74" stroke="${MAU.tim[2]}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M50 50 Q70 60 74 42 Q76 30 62 26" stroke="${MAU.tim[2]}" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${[[30, 36], [70, 66], [24, 48], [76, 52], [40, 26], [60, 76]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#fff"/>`).join('')}</g>
        <circle class="hh-tho" cx="50" cy="50" r="11" fill="#FFF6C9" opacity=".5"/><circle cx="50" cy="50" r="6" fill="#fff"/></g>` + tinh(20, 26, .4, '#fff', 'hh-nhay', .4) + tinh(82, 78, .45, '#fff', 'hh-nhay', 1.1),
      'ho-den': () => nen('#07040C', '#FF8A3D') + `<defs><clipPath id="${g}"><circle cx="50" cy="50" r="42"/></clipPath></defs>
        <g clip-path="url(#${g})">${[[16, 22], [80, 18], [86, 70], [22, 78], [60, 86], [30, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#fff" opacity=".8"/>`).join('')}
        <circle class="hh-tho" cx="50" cy="50" r="30" fill="#FF8A3D" opacity=".18"/></g>
        <g transform="rotate(-16 50 50)"><ellipse cx="50" cy="50" rx="56" ry="15" fill="none" stroke="#FF9A4D" stroke-width="7" opacity=".85"/><ellipse cx="50" cy="50" rx="56" ry="15" fill="none" stroke="#FFE3B0" stroke-width="2"/></g>
        <circle cx="50" cy="50" r="17" fill="#000"/><circle class="hh-tho" cx="50" cy="50" r="18.5" fill="none" stroke="#FFD9A0" stroke-width="2.4"/>
        <g transform="rotate(-16 50 50)"><path d="M-6 50 A56 15 0 0 0 106 50" stroke="#FF8A3D" stroke-width="7" fill="none"/><path d="M-6 50 A56 15 0 0 0 106 50" stroke="#FFF1D6" stroke-width="2" fill="none"/></g>`
        + tinh(80, 26, .45, '#FFD9A0', 'hh-nhay', .3) + tinh(22, 72, .4, '#B07CFF', 'hh-nhay', 1),
      'big-bang': () => {
        const tia = Array.from({ length: 10 }, (_, k) => { const a = (k * 36 - 90) * Math.PI / 180, R = k % 2 ? 60 : 68, w = .2;
          const p1 = [50 + Math.cos(a - w) * 40, 50 + Math.sin(a - w) * 40], p2 = [50 + Math.cos(a) * R, 50 + Math.sin(a) * R], p3 = [50 + Math.cos(a + w) * 40, 50 + Math.sin(a + w) * 40];
          const m = ['#FFD12E', '#FF5A5F', '#4FC3F7', '#B07CFF', '#7BE495'][k % 5];
          return `<path class="hh-tia" style="animation-delay:${(k % 5) * .18}s" d="M${p1.map(v => v.toFixed(1)).join(' ')} L${p2.map(v => v.toFixed(1)).join(' ')} L${p3.map(v => v.toFixed(1)).join(' ')}Z" fill="${m}" stroke="${m}" stroke-width="5" stroke-linejoin="round"/>`; }).join('');
        return `<defs><clipPath id="${g}"><circle cx="50" cy="50" r="40"/></clipPath><clipPath id="${g}v"><circle cx="50" cy="50" r="47"/></clipPath>
          <radialGradient id="${g}n" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF8D6"/><stop offset=".22" stop-color="#FFD25E"/><stop offset=".45" stop-color="#FF7A6B"/><stop offset=".7" stop-color="#8E5CF0"/><stop offset="1" stop-color="#241552"/></radialGradient></defs>
          <g class="hh-quay-cham" style="transform-origin:50px 50px">${tia}</g>
          <g clip-path="url(#${g}v)"><circle cx="50" cy="50" r="47" fill="#EFA600"/><circle cx="46" cy="45" r="46" fill="#FFD12E"/></g>
          <g clip-path="url(#${g})"><circle cx="50" cy="50" r="40" fill="url(#${g}n)"/>
            ${[[30, 28], [72, 30], [74, 70], [28, 72], [50, 20], [20, 50], [80, 50]].map(([x, y], k) => `<path class="hh-nhay" style="animation-delay:${k * .2}s;transform-origin:${x}px ${y}px" d="M${x} ${y - 3.5} Q${x + .7} ${y - .7} ${x + 3.5} ${y} Q${x + .7} ${y + .7} ${x} ${y + 3.5} Q${x - .7} ${y + .7} ${x - 3.5} ${y} Q${x - .7} ${y - .7} ${x} ${y - 3.5}Z" fill="#fff"/>`).join('')}
            <circle class="hh-tho" cx="50" cy="50" r="17" fill="#FFF3B8" opacity=".75"/><circle cx="50" cy="50" r="10" fill="#fff"/><ellipse cx="46" cy="46" rx="3.5" ry="2" fill="#fff" transform="rotate(-30 46 46)"/></g>
          <ellipse cx="28" cy="22" rx="7" ry="3.5" fill="#fff" opacity=".7" transform="rotate(-35 28 22)"/>`;
      },
    };
    return `<svg class="hh-svg ${mo ? 'mo' : ''}" viewBox="0 0 100 100" aria-hidden="true">${(H[ma] || H['dom-sang'])()}</svg>`;
  };

  // Pháo giấy mừng (xong module, chuỗi tuần...)
  window.noePhao = function (khung) {
    if (!khung) return;
    const MAU = ['l2', 'heart', 'teal', 'tear', 'l3', 'blush'];
    const lop = document.createElement('div');
    lop.className = 'phao-giay';
    lop.innerHTML = Array.from({ length: 24 }, (_, i) => `<i style="left:${(i * 37) % 100}%;background:${C(MAU[i % MAU.length])};animation-delay:${(i % 6) * .12}s;--xoay:${i * 53}deg"></i>`).join('');
    khung.style.position = 'relative';
    khung.append(lop);
    setTimeout(() => lop.remove(), 2600);
  };

  // Ngồi yên lâu thì Noe tự cử động một chút
  setInterval(() => {
    if (document.hidden) return;
    const ds = document.querySelectorAll('.noe-svg:not(.no-dung):not(.phan-ung)');
    const svg = ds[Math.floor(Math.random() * ds.length)];
    if (!svg) return;
    const hd = ['nhay', 'lac'][Math.floor(Math.random() * 2)];
    svg.classList.add('phan-ung', hd);
    setTimeout(() => svg.classList.remove('phan-ung', hd), 900);
  }, 14000);

  // Noe nổ cái đùng (giả vờ tức khi làm sai), rồi lành lại. Trả về Promise khi xong.
  window.noeNo = function (khung) {
    return new Promise(ok => {
      if (!khung) return ok();
      // giảm chuyển động: không nổ, Noe giận một chút rồi thôi, không bắt chờ 2,3 giây
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { khung.innerHTML = noe('gian'); return setTimeout(() => { khung.innerHTML = noe('vui'); ok(); }, 700); }
      const MAU = ['l2', 'heart', 'teal', 'tear', 'l3', 'blush'];
      const manh = Array.from({ length: 14 }, (_, i) => {
        const g = i / 14 * Math.PI * 2, r = 70 + (i % 3) * 18;
        return `<rect class="manh" x="96" y="108" width="9" height="13" rx="2" fill="${C(MAU[i % MAU.length])}" style="--dx:${Math.cos(g) * r}px;--dy:${Math.sin(g) * r}px;--rot:${i * 47}deg;animation-delay:.75s"/>`;
      }).join('');
      khung.innerHTML = `<svg class="noe-svg no-dung" viewBox="0 0 200 200" role="img" aria-label="Noe nổ cái đùng">
        <g class="phong">${noe('gian').replace(/^<svg[^>]*>|<\/svg>$/g, '')}<circle cx="100" cy="114" r="52" fill="${C('angry')}" class="do"/></g>
        <text x="100" y="40" text-anchor="middle" class="dung" font-family="Nunito,sans-serif" font-weight="700" font-size="34" fill="${C('angry')}">ĐÙNG!</text>
        ${manh}</svg>`;
      setTimeout(() => { khung.innerHTML = noe('vui'); ok(); }, 2300);
    });
  };

  // Bấm vào Noe: phản ứng ngẫu nhiên kèm một câu nói
  const PHAN_UNG = [['nhay', 'chao'], ['xoay', 'vui'], ['lac', 'ngac-nhien'], ['nhay', 'yeu'], ['xoay', 'khen']];
  window.noeCau = (ten) => {
    const t = ten ? `${ten} ơi` : 'Bạn ơi';
    return [`${t}, nhột quá!`, 'Hí hí, mình đây!', `${t}, học xíu nữa là mình sáng rực luôn đó.`, 'Bấm nữa là mình xoay chóng mặt á!',
      'Mình là đốm sáng nhỏ, nhưng tham vọng lớn lắm nha.', `Cố lên ${ten || 'bạn'}, mỗi ngày một chút thôi!`, 'Ủa, bạn tìm gì đó? À, tìm mình hả?'];
  };
  document.addEventListener('click', e => {
    const svg = e.target.closest && e.target.closest('.noe-svg');
    if (!svg || svg.classList.contains('no-dung')) return;
    const khung = svg.parentElement;
    const [hd, tam] = PHAN_UNG[Math.floor(Math.random() * PHAN_UNG.length)];
    if (!svg.classList.contains('canh')) {
      // Vẽ lại đúng món đồ hình này đang mặc (đồ mua bằng sao, hay món đang xem trước trong cửa hàng), không trả về Noe trơn
      const cu = window.NOE_DO;
      if (svg.dataset.do !== undefined) window.NOE_DO = svg.dataset.do;
      khung.innerHTML = noe(tam);
      window.NOE_DO = cu;
    } // cảnh theo giờ thì giữ nguyên, chỉ cử động
    const moi = khung.querySelector('svg');
    moi.classList.add('phan-ung', hd);
    const bong = khung.parentElement && khung.parentElement.querySelector('.bong');
    if (bong) {
      const ds = noeCau(window.TEN_NGUOI_HOC || '');
      const cu = bong.innerHTML;
      bong.innerHTML = `<p>${ds[Math.floor(Math.random() * ds.length)]}</p>`;
      clearTimeout(bong._t); bong._t = setTimeout(() => { bong.innerHTML = cu; }, 2600);
    }
    setTimeout(() => moi.classList.remove('phan-ung', hd), 900);
  });
})();
