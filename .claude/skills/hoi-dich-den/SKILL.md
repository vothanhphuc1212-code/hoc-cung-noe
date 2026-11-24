---
name: hoi-dich-den
description: Chặng B của Learn Everything with AI. Hỏi người học muốn học gì, học xong làm được gì, học tới cấp nào (Sơ cấp, Trung cấp, Chuyên sâu) và các ràng buộc thực tế. Dùng khi tien-do.json có chang_hien_tai là B, hoặc người học nói muốn bắt đầu học một thứ mới.
---

> Cập nhật 18/11/2026: app (`app/`) là cách chính và đã làm các bước này. Kỹ năng này dùng khi người học làm việc trực tiếp với AI. Mọi đường dẫn theo `docs/chuan-du-lieu.md`: `hoc-cua-toi/ho-so.md` nay là `Hoc cung Noe/ho-so.md`; các file `nguon`, `lo-trinh`, `bai/`, `cau-hoi/`, `tien-do.json`, `nhat-ky.md` nằm trong `Hoc cung Noe/khoa-hoc/<mã khoá>/`. Chặng: B = `muc-dich`, A = `dang-o-dau`, C1 = `tim`, C2 = `lo-trinh`, D và E = `hoc`. Mức `nen-tang` nay là `can-doi`.

> Tiêu chuẩn 19/11/2026: làm đúng `docs/tieu-chuan-thong-tin-hoc-vien.md` (phương pháp 5 giai đoạn). Chỗ nào kỹ năng này khác tài liệu đó thì theo tài liệu.

# Chặng B: Đích đến

## Cách hỏi
- Hỏi **từng câu một**. Câu trả lời mơ hồ thì hỏi thêm một câu cho rõ, không đoán.
- Người học có thể gõ, nói (giọng nói đã chuyển thành chữ), hoặc dán một đoạn tự giới thiệu. Đã có câu trả lời trong đoạn dán thì không hỏi lại.
- Giọng thân thiện, ngắn. Noe chào ở câu đầu.

## Bộ câu hỏi
1. Bạn muốn học gì? (một câu tự do)
2. Học xong bạn muốn **làm được việc gì cụ thể**? Gợi ý ví dụ: tự làm web cho tiệm, thi chứng chỉ, đổi nghề, hiểu đủ để quản lý nhân viên.
3. Vì sao bạn muốn học lúc này?
4. Bạn muốn học tới mức nào? Đưa 3 lựa chọn, giải thích bằng đầu ra:
   - **Học nhanh**: hiểu nguyên lý, giải thích lại được, biết khi nào dùng. Bài ngắn, nhiều hình.
   - **Nền tảng** (như trung cấp nghề): tự làm được việc thật, có 2–3 sản phẩm để khoe. Học đi đôi với làm.
   - **Chuyên sâu** (như đại học): hiểu tới gốc, tự nghiên cứu tiếp được, theo khung chương trình chuẩn.
   Nói rõ: có thể đổi cấp bất cứ lúc nào.
5. Bạn cần xong trước ngày nào? (có thể không có)
6. Mỗi ngày học được bao nhiêu phút, mấy ngày một tuần, giờ nào?
7. Bạn học bằng tiếng gì? Đọc được tiếng Anh tới đâu? (chưa đọc được thì nguồn phải giảng tiếng Việt hoặc có phụ đề)
8. Chỉ học nguồn miễn phí, hay trả phí được? Khoảng bao nhiêu mỗi tháng?
9. Bạn thích học kiểu nào: xem video, đọc, làm thử ngay, nghe khi đi đường?
10. Bạn có cần bằng hoặc chứng chỉ không?

## Ghi lại
- Điền khối YAML đầu `hoc-cua-toi/ho-so.md` và mục `## Đích đến (B)` (tóm tắt 3–5 câu bằng lời của người học).
- Đọc lại bản tóm tắt cho người học, hỏi "Đúng chưa?". Sửa tới khi họ đồng ý.
- Cập nhật `tien-do.json`: `chang_hien_tai` = `A`.
