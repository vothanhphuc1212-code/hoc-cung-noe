# Quy trình tìm nguồn

Giai đoạn 3 trong phương pháp 5 giai đoạn của Learn Everything with AI. Bản 1, 19/11/2026.

Đầu vào: hồ sơ người học đủ trường Bắt buộc theo `docs/tieu-chuan-thong-tin-hoc-vien.md`.
Đầu ra: danh sách nguồn đã chấm điểm, đã mở thử link, đủ cho cả 3 mức học, lưu ở `nguon.json` / `nguon.md`.
Luật bản quyền và 4 tầng uy tín: `docs/luat-ban-quyen-va-dan-nguon.md` (tài liệu này làm theo luật đó, không thay luật đó).

## 1. Tám bước, đúng thứ tự

### Bước 1. Xác định ngành
Lĩnh vực của người học thuộc ngành nào, ngành con nào. Ví dụ: "làm web bán hàng" → Công nghệ thông tin → Phát triển web. "Tiếng Anh giao tiếp" → Ngoại ngữ → Tiếng Anh tổng quát.

### Bước 2. Tìm khung chuẩn làm xương sống (tầng 1)
Khung chuẩn cho biết **ngành này cần học những gì, tới mức nào**. Lộ trình bám theo khung, không bám theo một khoá học lẻ.

**Khung của Việt Nam** (ưu tiên khi người học cần bằng cấp, chứng chỉ trong nước):

| Khung | Văn bản | Ghi chú (tra ngày 19/11/2026) |
|---|---|---|
| Khung trình độ quốc gia Việt Nam, 8 bậc | **Quyết định 39/2026/QĐ-TTg** (ban hành 23/7/2026, hiệu lực 07/9/2026) | **Thay thế** Quyết định 1982/QĐ-TTg năm 2016. Mỗi bậc mô tả kiến thức, kỹ năng, mức tự chủ và trách nhiệm. Khoá tuyển sinh trước 01/01/2027 vẫn theo quy định cũ |
| Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam | Thông tư 01/2014/TT-BGDĐT | Bậc 1–6 tương ứng A1–C2 của CEFR. Còn hiệu lực; có **dự thảo** thay thế (7 bậc, dự kiến từ 01/01/2027), chưa ban hành |
| Chuẩn kỹ năng sử dụng công nghệ thông tin | Thông tư 03/2014/TT-BTTTT | Chuẩn cơ bản (mô-đun IU01–IU06) và nâng cao (IU07 trở đi) |

Nguồn tra: [QĐ 39/2026 trên thuvienphapluat.vn](https://thuvienphapluat.vn/van-ban/Giao-duc/Decision-39-2026-QD-TTg-regulates-the-Vietnam-Qualifications-Framework-717761.aspx), [Thông tư 01/2014 trên Cổng Bộ Tư pháp](https://www.moj.gov.vn/vbpq/Lists/Vn%20bn%20php%20lut/Attachments/29454/VanBanGoc_01.2014.TT.BGDĐT.pdf), [Thông tư 03/2014 trên thuvienphapluat.vn](https://thuvienphapluat.vn/van-ban/cong-nghe-thong-tin/thong-tu-03-2014-tt-btttt-chuan-ky-nang-su-dung-cong-nghe-thong-tin-223113.aspx), [tin dự thảo khung ngoại ngữ mới trên Đại biểu Nhân dân](https://daibieunhandan.vn/bo-gd-dt-them-mot-bac-trong-khung-nang-luc-ngoai-ngu-dung-cho-viet-nam-10397488.html). Văn bản luật có thể đổi: **mỗi lần dùng phải kiểm lại còn hiệu lực không.**

**Khung quốc tế:**

| Khung | Dùng cho | Trang chính chủ |
|---|---|---|
| CEFR (Khung tham chiếu chung châu Âu về ngôn ngữ) | Mọi ngoại ngữ | coe.int (trang chặn máy kiểm, cần mở tay) |
| CS2023 (ACM, IEEE-CS, AAAI; báo cáo 01/2024) | Khoa học máy tính bậc đại học | [csed.acm.org](https://csed.acm.org) |
| SFIA (Khung kỹ năng cho thời đại số) | Nghề công nghệ, mô tả theo 7 mức trách nhiệm | [sfia-online.org](https://sfia-online.org) |
| ESCO (Danh mục kỹ năng, nghề nghiệp châu Âu) | Mọi nghề: nghề cần kỹ năng gì | [esco.ec.europa.eu](https://esco.ec.europa.eu) |
| O*NET (Mỹ) | Mọi nghề: nhiệm vụ, kỹ năng, kiến thức | [onetonline.org](https://www.onetonline.org) |
| ISCED (UNESCO) | Xếp lĩnh vực, bậc học theo chuẩn quốc tế | [uis.unesco.org](https://uis.unesco.org/en/topic/international-standard-classification-education-isced) |

Không có khung chuẩn cho lĩnh vực đó thì: lấy **2–3 chương trình đại học** của bước 3, gộp phần chung làm khung, và ghi rõ "khung tự tổng hợp từ ...".

### Bước 3. Chương trình đại học công khai (tầng 1)
Đề cương, giáo trình, bài giảng mở của trường. Dùng để biết **thứ tự học** và **độ sâu** của từng mức.
- Việt Nam: đề cương công khai trên trang của các đại học (ĐHQG Hà Nội, ĐHQG TP.HCM, ĐH Bách khoa Hà Nội...). Tìm theo tên ngành + "chương trình đào tạo" + "đề cương".
- Quốc tế: [MIT OpenCourseWare](https://ocw.mit.edu), [Harvard CS50](https://cs50.harvard.edu), [Stanford Online, khoá miễn phí](https://online.stanford.edu/free-courses), [Open Yale Courses](https://oyc.yale.edu), OpenLearn của Open University (open.edu/openlearn, trang chặn máy kiểm, cần mở tay).

### Bước 4. Sách giáo khoa mở và tài liệu chính chủ (tầng 1)
- Sách giáo khoa mở, có giấy phép rõ: [OpenStax](https://openstax.org), [LibreTexts](https://libretexts.org), Open Textbook Library (open.umn.edu, máy kiểm báo lỗi chứng chỉ bảo mật, cần mở tay).
- Tài liệu chính thức của hãng, của dự án: [Microsoft Learn](https://learn.microsoft.com), [MDN Web Docs](https://developer.mozilla.org), [tài liệu Python](https://docs.python.org/3/)... Học công cụ nào thì lấy tài liệu của chính công cụ đó.

### Bước 5. Nền tảng học lớn (tầng 2)
Bài học chính, có bài tập, có tiến độ:
[Coursera](https://www.coursera.org), [edX](https://www.edx.org), [Khan Academy](https://www.khanacademy.org), [freeCodeCamp](https://www.freecodecamp.org), [The Odin Project](https://www.theodinproject.com), [F8](https://f8.edu.vn), FutureLearn (trang chặn máy kiểm, cần mở tay). Với khoa học máy tính tự học: [OSSU](https://github.com/ossu/computer-science) (giáo trình tự học theo chuẩn đại học).
Trên nền tảng trả phí: chỉ chọn khoá **xem miễn phí được** (audit) hoặc ghi rõ giá khi người học có ngân sách.

### Bước 6. Chuyên gia, giảng viên, sách kinh điển (tầng 3)
Kênh YouTube chính thức của giảng viên, tổ chức (ví dụ [Crash Course](https://www.youtube.com/@crashcourse), [TED](https://www.ted.com)), sách kinh điển của ngành (chỉ dẫn tới trang của nhà xuất bản hoặc tác giả).

### Bước 7. Cộng đồng (tầng 4), chỉ để đối chiếu
Danh sách trên GitHub, diễn đàn, blog. Chỉ dùng để **phát hiện nguồn tốt mà bước trên bỏ sót**. Muốn đưa vào thì phải lần về trang chính chủ của nguồn đó.

### Bước 8. Chấm điểm, mở thử link, chốt danh sách
Theo mục 2 và mục 3 dưới đây.

## 2. Bảng chấm điểm nguồn (10 tiêu chí, tối đa 20 điểm)

Mỗi tiêu chí: **2** tốt · **1** tạm · **0** không đạt.

| # | Tiêu chí | 2 điểm khi |
|---|---|---|
| 1 | Chính chủ | Trang của chính tác giả, trường, tổ chức làm ra |
| 2 | Uy tín | Trường đại học, tổ chức chuẩn, chuyên gia được công nhận |
| 3 | Khớp khung chuẩn | Phủ đúng kỹ năng con trong khung của bước 2 |
| 4 | Đúng mức | Đúng cấp người học (Sơ cấp / Trung cấp / Chuyên sâu) |
| 5 | Đúng tiếng | Đúng ngôn ngữ người học đọc được |
| 6 | Đúng ngân sách | Miễn phí, hoặc trong ngân sách và ghi rõ giá |
| 7 | Còn mới | Cập nhật trong vài năm gần đây (ngành thay đổi nhanh như công nghệ thì càng gần càng tốt) |
| 8 | Có thực hành | Có bài tập, dự án, câu hỏi tự kiểm |
| 9 | Giấy phép rõ | Ghi rõ cho dùng thế nào (ví dụ giấy phép Creative Commons) |
| 10 | Mở được | Link mở được ngày kiểm |

**Luật loại thẳng, bất kể điểm:** bản lậu, bản đăng lại không phải chính chủ, link không mở được, nguồn bịa (không tìm thấy trên trang chính chủ).

**Chọn:** từ 14 điểm trở lên → dùng làm nguồn chính. 10–13 → dùng bổ sung. Dưới 10 → bỏ.

## 3. Đủ chưa

Danh sách chỉ được chốt khi:
- Có **ít nhất 1 khung chuẩn** (hoặc khung tự tổng hợp, ghi rõ).
- **Mỗi kỹ năng con** của khung có ít nhất 1 nguồn tầng 1 hoặc tầng 2.
- **Mỗi cấp** (Sơ cấp, Trung cấp, Chuyên sâu) có đủ nguồn để xếp lộ trình; Chuyên sâu cần nhiều giáo trình hơn.
- Kiến thức quan trọng (số liệu, định nghĩa, quy định) có **ít nhất 2 nguồn khớp nhau**. Hai nguồn nói ngược nhau thì giữ cả hai, ghi ngày của từng nguồn, gắn "cần kiểm lại".
- Mọi link đã mở thử, có **ngày kiểm**.

Thiếu chỗ nào thì ghi rõ trong báo cáo cho người học, không lấp bằng nguồn kém.

## 3b. Chạy ngầm ở máy chủ

Khi nối AI tự động (không phải sao chép và dán), cả 3 bước tìm nguồn, mở thử link, xếp 3 lộ trình chạy trong máy chủ của app (`/api/nghien-cuu/bat-dau`, xem tiến độ ở `/api/nghien-cuu`). Người học đóng tab hay xem màn khác vẫn chạy tiếp; bong bóng Noe nổi ở góc cho biết tiến độ, xong thì báo (kèm thông báo của trình duyệt nếu người học cho phép). Đang tìm thì chưa cho đổi khoá học, để kết quả ghi đúng khoá.

## 4. Kiểm link

- App: `/api/nguon/kiem` mở thử từng link. Dòng lệnh: `py tools/kiem_link.py <đường dẫn nguon.md>`.
- Trang **báo 403 hoặc lỗi chứng chỉ bảo mật** thường là trang chặn máy tự động, không phải link hỏng: ghi "cần mở tay" và nhờ người học bấm thử, không tự bỏ nguồn tầng 1 chỉ vì máy kiểm không mở được.
- Kiểm lại link **mỗi lần mở lộ trình sau 30 ngày** và trước mỗi buổi học dùng nguồn đó.

## 5. Dùng lại kết quả tìm nguồn (cho bản online)

Nguồn cho cùng một **lĩnh vực + mức + ngôn ngữ** (ví dụ "Tiếng Anh giao tiếp, Sơ cấp, tiếng Việt") giống nhau cho nhiều người học. Bản online lưu một **thư viện nguồn chung**: tìm một lần, kiểm lại link định kỳ, người sau dùng lại, chỉ tìm thêm phần riêng của từng người. Đây là chỗ tiết kiệm chi phí AI lớn nhất.

## 6. Báo cáo cho người học

Sau khi tìm xong, Noe báo bằng lời dễ hiểu:
- Khung chuẩn nào làm xương sống, vì sao.
- Bao nhiêu nguồn, mỗi tầng bao nhiêu, nguồn nào trả phí (giá bao nhiêu, hoặc "chưa xác minh").
- Chỗ nào còn thiếu, nguồn nào "cần mở tay".

## 7. Danh sách link trong tài liệu này

Máy mở thử ngày **19/11/2026**: mở được hết, trừ các trang chặn máy kiểm, cần mở tay:
- coe.int, open.edu, futurelearn.com: báo 403; open.umn.edu: lỗi chứng chỉ bảo mật.
- Hai trang văn bản trên thuvienphapluat.vn (QĐ 39/2026, TT 03/2014): báo 403. Bản PDF TT 01/2014 trên moj.gov.vn: lỗi chứng chỉ bảo mật. Cả ba đều có trong kết quả tìm kiếm cùng ngày.

## Cập nhật 21/11/2026: bản 2

- Mỗi nguồn ghi `ky_nang` (mã trong bản đồ kỹ năng chung). Từ 14/20 điểm là **[NGUỒN CHÍNH]**, lộ trình ưu tiên dùng.
- Sau khi mở thử link, **AI thứ hai** mở từng trang (tối đa 12 nguồn điểm cao nhất), kiểm chính chủ, đúng chủ đề, tiếng, phí, cấp; sai thì đặt `bo: true` và `ly_do_bo`. Xem `docs/bao-dam-chat-luong.md`.
