# Tiêu chuẩn thông tin học viên

Giai đoạn 2 trong phương pháp 5 giai đoạn của Learn Everything with AI. Bản 1, 19/11/2026.

Tài liệu này quy định **app và AI cần biết gì về người học**, hỏi lúc nào, hỏi thế nào, và lưu ở đâu. Mọi giai đoạn sau (tìm nguồn, lên lộ trình, đồng hành) chỉ được dựa trên thông tin trong bộ này.

## 1. Bốn nguyên tắc

1. **Hỏi đủ để dạy đúng, không hỏi thừa.** Chỉ hỏi thông tin dùng được cho việc học. Không hỏi giấy tờ tuỳ thân, số tài khoản, địa chỉ nhà, tôn giáo, chính trị.
2. **Hỏi dần, không hỏi một lần.** Lúc bắt đầu chỉ hỏi phần **Bắt buộc** (khoảng 8 câu, dưới 3 phút). Phần **Nên có** hỏi trong buổi học đầu tiên. Phần **Tuỳ chọn** chỉ hỏi khi cần, và người học được bỏ qua.
3. **Đo chứ không chỉ hỏi.** Người học hay tự chấm sai (quá cao hoặc quá thấp). Điểm xuất phát phải có **bài kiểm tra đầu vào ngắn** đi kèm phần tự khai.
4. **Người học làm chủ dữ liệu.** Người học xem, sửa, xoá được mọi thông tin của mình. Bản chạy trên máy: dữ liệu nằm ở máy người học. Bản online: theo mục 7.

## 2. Bộ thông tin: 6 nhóm

Cột **Mức**: **B** = Bắt buộc (hỏi lúc đầu) · **N** = Nên có (hỏi trong buổi đầu) · **T** = Tuỳ chọn.
Cột **Khoá trong ho-so.md**: tên trường lưu theo `docs/chuan-du-lieu.md`. "(mới)" là trường chưa có trong app. Cập nhật 19/11/2026: app đã hỏi và lưu các trường không còn ghi "(mới)".

### Nhóm 1. Cơ bản

| Thông tin | Mức | Khoá trong ho-so.md | Dùng để |
|---|---|---|---|
| Tên gọi | B | `ten_goi` | Noe gọi tên người học |
| Ngôn ngữ dùng | B | `ngon_ngu` | Ngôn ngữ của bài, của nguồn |
| Múi giờ | N | `mui_gio` (mới) | Nhắc lịch đúng giờ (bản online) |
| Nhóm tuổi: dưới 16, 16–17, 18–24, 25–39, 40–59, từ 60 | B | `nhom_tuoi` | Chọn giọng văn, ví dụ phù hợp; trẻ em cần người giám hộ (mục 7) |

Chỉ hỏi **nhóm tuổi**, không hỏi ngày sinh.

### Nhóm 2. Đích đến (điểm B)

| Thông tin | Mức | Khoá | Dùng để |
|---|---|---|---|
| Muốn học gì | B | `linh_vuc` | Xác định ngành |
| Học xong làm được gì (mỗi dòng một mục đích, càng cụ thể càng tốt) | B | `muc_dich` | Đầu ra cuối của lộ trình |
| Vì sao học lúc này | N | `ly_do` | Giữ động lực, nhắc lại khi người học nản |
| Hạn chót, nếu có (ví dụ thi, xin việc) | N | `han_chot` | Xếp nhịp học |
| Có cần bằng, chứng chỉ không; chứng chỉ nào | N | `chung_chi` | Chọn nguồn có chứng chỉ, khung chuẩn |
| Học tới cấp nào: Sơ cấp (xài được) / Trung cấp (xài tốt) / Chuyên sâu (cấp chuyên gia) | B | `cap_do` | Chọn 1 trong 3 lộ trình |

**Mục đích phải đo được.** Mục đích mơ hồ ("giỏi tiếng Anh") thì AI hỏi thêm một câu để biến thành việc làm được ("tự giới thiệu và hỏi đường bằng tiếng Anh khi đi du lịch").

### Nhóm 3. Điểm xuất phát (điểm A)

| Thông tin | Mức | Khoá | Dùng để |
|---|---|---|---|
| Công việc, học vấn | N | mục `### Về bạn` | Chọn ví dụ gần với đời người học |
| Đã biết gì, đã làm gì liên quan | B | mục `### Đã biết, đã làm` | Bỏ qua phần đã biết |
| Tự chấm từng kỹ năng con (0 chưa nghe tên · 1 biết tên · 2 làm được khi có hướng dẫn · 3 tự làm được) | N | mục `## Kỹ năng con tự chấm` | Điểm bắt đầu từng module |
| **Kết quả bài kiểm tra đầu vào** (5–10 câu, mỗi câu gắn với một kỹ năng con) | N | mục `## Kết quả kiểm tra đầu vào` | Đối chiếu với phần tự chấm |
| Đọc tiếng Anh tới đâu | B | `tieng_anh` | Lọc nguồn theo tiếng |

**Khi tự chấm và kiểm tra lệch nhau:** tin bài kiểm tra, nhưng báo người học một cách tử tế ("Bạn chấm mình mức 3 ở phần này, bài kiểm tra cho thấy mức 2. Mình ôn nhanh phần này trước nha.").

### Nhóm 4. Điều kiện học

| Thông tin | Mức | Khoá | Dùng để |
|---|---|---|---|
| Mỗi buổi bao nhiêu phút | B | `phut_moi_ngay` | Độ dài buổi học |
| Mấy buổi mỗi tuần, những ngày nào | B | `ngay_moi_tuan`, `ngay_hoc` | Lịch học, lịch nhắc |
| Học lúc mấy giờ | N | `gio_hoc` | Lịch nhắc |
| Thiết bị: máy tính, điện thoại, cả hai | N | `thiet_bi` (`ca-hai`, `may-tinh`, `dien-thoai`) | Bài thực hành làm được trên thiết bị nào |
| Mạng: ổn định hay chập chờn | T | `mang` (mới) | Ưu tiên tài liệu đọc, tải về được |
| Ngân sách mỗi tháng (mặc định: chỉ miễn phí, không hỏi khi tạo khoá) | T | `ngan_sach` | Lọc nguồn miễn phí hay trả phí |

### Nhóm 5. Cách học và tâm lý

| Thông tin | Mức | Khoá | Dùng để |
|---|---|---|---|
| Thích học bằng gì: đọc, video, làm thử, nghe | N | `thich_hoc_bang` | **Chỉ để chiều sở thích** (xem lưu ý dưới) |
| Từng bỏ dở khoá học nào, vì sao | N | mục `## Ghi chú động lực` | Tránh lặp lại lý do bỏ cuộc |
| Tự tin học được tới đâu (thang 1–5) | N | `tu_tin` | Người ít tự tin: bài đầu dễ hơn, khen cụ thể hơn |
| Điều lo ngại khi học (sợ khó, sợ không có thời gian, sợ quên...) | T | mục `## Ghi chú động lực` | Noe trấn an đúng chỗ |
| Nhu cầu riêng: chữ to, khó đọc, khó tập trung lâu... | T | `nhu_cau_rieng` | Chia buổi ngắn hơn, cỡ chữ, cách trình bày |

**Lưu ý về "kiểu học":** thuyết "mỗi người có một kiểu học riêng, dạy đúng kiểu thì học tốt hơn" (ví dụ VARK) **chưa có bằng chứng khoa học vững** (Pashler và cộng sự, 2008, *Learning Styles: Concepts and Evidence*). Vì vậy sở thích chỉ dùng để chọn nguồn người học thích, **không** dùng để bỏ hẳn một cách học. Bài nào cũng nên có chữ, hình, và việc để làm.

Nhu cầu riêng là thông tin nhạy cảm: luôn **tuỳ chọn**, ghi rõ để làm gì, người học xoá được.

### Nhóm 6. Đồng hành

| Thông tin | Mức | Khoá | Dùng để |
|---|---|---|---|
| Muốn được nhắc qua đâu: lịch, thông báo, không nhắc | N | `kenh_nhac` (mới) | Kênh nhắc |
| Giờ không muốn bị làm phiền | N | `gio_yen_lang` (mới) | Không nhắc giờ này |
| Noe nói chuyện kiểu nào: vui vẻ / nhẹ nhàng / ngắn gọn | T | `giong_noe` | Giọng của Noe |
| Muốn Noe hỏi cảm xúc mỗi buổi không | T | `hoi_cam_xuc` | Xem `docs/quy-trinh-dong-hanh.md` |

## 3. Thứ tự hỏi

**Tạo khoá mới: mỗi trang MỘT câu, chỉ hỏi ý chính** (theo chủ dự án, 19/11/2026). Chưa nối AI thì vào màn nối AI trước, nối xong mới tạo khoá. Có thanh tiến độ đầy dần tới 100% khi xong; Noe ghi từng câu trả lời vào "Sổ tay của Noe" (dòng mới hiện như đang gõ). Bấm Tiếp tục là lưu ngay; tắt app giữa chừng thì lần sau làm tiếp đúng câu đang dở (`buoc_tao` trong `tien-do.json`). Quay lại = về câu trước. Thứ tự 8 câu:

1. Muốn học gì · 2. Học xong muốn làm được gì · 3. Cấp (Sơ cấp, Trung cấp, Chuyên sâu) · 4. Thời gian (phút/buổi, buổi/tuần, giờ) · 5. Đọc tiếng Anh tới đâu · 6. Tên gọi, nhóm tuổi · 7. Đã biết gì (có nút Lấy dữ liệu từ AI của tôi) · 8. Bài kiểm tra đầu vào (làm ngay hoặc để sau).

**Không hỏi khi tạo khoá, để mặc định** (sửa được trong Hồ sơ học): ngân sách = chỉ miễn phí (dự án không nhằm kiếm tiền), thiết bị = máy tính và điện thoại, Noe nói chuyện vui vẻ, có hỏi tâm trạng, tự tin 3/5. Vì sao học, hạn chót, chứng chỉ, điểm mạnh và khó khăn, lưu ý riêng: tuỳ chọn, điền trong Hồ sơ học khi muốn.

Đã có lộ trình thì "Mục đích" và "Đang ở đâu" mở dạng biểu mẫu để xem và sửa (không mất tiến độ).

| Lúc | Hỏi gì | Thời gian |
|---|---|---|
| **Tạo khoá** (8 trang, mỗi trang một câu) | Ý chính của nhóm 1–4 | ~2–3 phút |
| Câu 8 (nên làm) | **Bài kiểm tra đầu vào**: làm TRƯỚC khi tìm nguồn để lộ trình bỏ qua phần đã biết. Lưu ở `khoa-hoc/<mã>/dau-vao.json` và mục `## Kết quả kiểm tra đầu vào` | ~5 phút |
| **Buổi học đầu tiên** | Tự chấm kỹ năng con, phần Nên có còn lại | Vài câu |
| **Khi cần** | Phần Tuỳ chọn, hỏi đúng lúc liên quan (ví dụ hỏi giờ yên lặng khi bật nhắc lịch) | Một câu |

Mỗi câu hỏi phải: một ý, có ví dụ trả lời, có lựa chọn sẵn khi được, và có nút **Bỏ qua** nếu không phải Bắt buộc.

## 4. Bài kiểm tra đầu vào

- 5–10 câu, mỗi câu gắn với **một** kỹ năng con trong khung chuẩn của ngành.
- Đi từ dễ tới khó. Sai 2 câu liên tiếp ở một mức thì dừng mức đó, không bắt làm tiếp.
- Có lựa chọn **"Tôi chưa biết"** để người học không phải đoán bừa.
- Không tính sao, không tính Thông tuệ. Nói rõ với người học: "Bài này để Noe biết bắt đầu từ đâu, không có điểm đậu rớt."

## 5. Hồ sơ đủ để đi tiếp khi nào

AI chỉ chuyển sang giai đoạn 3 (tìm nguồn) khi hồ sơ có đủ **mọi trường Bắt buộc**. Thiếu trường nào thì hỏi đúng trường đó, không hỏi lại từ đầu.

## 6. Cập nhật hồ sơ trong lúc học

Hồ sơ không đứng yên. AI cập nhật (và báo người học) khi:
- Kết quả kiểm tra cho thấy người học giỏi hơn hoặc yếu hơn mức đã ghi.
- Người học đổi mục đích, đổi thời gian học, đổi ngân sách.
- Người học lỡ nhiều buổi liền (xem lại thời gian học có thực tế không).

## 7. Riêng tư và pháp lý

- **Bản chạy trên máy (GitHub):** dữ liệu ở `Tài liệu/Hoc cung Noe/` trên máy người học; khoá API ở thư mục cài đặt riêng. Gói không gửi dữ liệu về cho ai. Khi nhờ AI, chỉ gửi phần hồ sơ cần cho việc đó.
- **Bản online:** phải tuân theo **Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15** (hiệu lực từ 01/01/2026). Điều 24 của luật này nói về dữ liệu của trẻ em; độ tuổi và cách xin đồng ý của người giám hộ **cần đọc văn bản gốc trước khi làm bản online** (chưa xác minh chi tiết). Tối thiểu cần: xin đồng ý rõ ràng trước khi lưu, nói rõ lưu gì và để làm gì, cho người học tải về và xoá toàn bộ dữ liệu, có chính sách riêng tư.
- Tài liệu này không phải tư vấn pháp lý.

Nguồn luật đã tra ngày 19/11/2026: [Luật 91/2025/QH15, bản PDF trên luatvietnam.vn](https://static3.luatvietnam.vn/uploaded/others/2025/08/21/luat-91-2025-qh15_2108094941.pdf), [tin hiệu lực trên cổng Hà Tĩnh](https://hatinh.gov.vn/vi/bai-viet/luat-bao-ve-du-lieu-ca-nhan-chinh-thuc-co-hieu-luc-thi-hanh-tu-ngay-112026).

## Cập nhật 21/11/2026: bản 2 (bảo đảm chất lượng)

Xem `docs/bao-dam-chat-luong.md`. Tóm tắt: trước bài đầu vào AI viết **Hợp đồng đầu ra** (3–6 việc làm được + cách đo + cấp) và **bản đồ kỹ năng chung** (KN1…), người học sửa và xác nhận (`muc-tieu.json`). Câu 2 hỏi thêm "Vì sao bạn học lúc này?" (không bắt buộc); câu 6 hỏi mức tự tin 1–5 thay vì mặc định 3. Bài đầu vào lưu cả câu hỏi (`dau-vao.json` > `cau`) để đo lại cuối chặng.
