---
name: nghien-cuu-nguon
description: Chặng C1 của Learn Everything with AI. Xác định lĩnh vực thuộc ngành nào, tìm khung chuẩn của ngành, rồi tìm nguồn học uy tín theo 4 tầng, mở thử từng link và ghi vào nguon.md. Dùng khi tien-do.json có chang_hien_tai là C1.
---

> Cập nhật 18/11/2026: app (`app/`) là cách chính và đã làm các bước này. Kỹ năng này dùng khi người học làm việc trực tiếp với AI. Mọi đường dẫn theo `docs/chuan-du-lieu.md`: `hoc-cua-toi/ho-so.md` nay là `Hoc cung Noe/ho-so.md`; các file `nguon`, `lo-trinh`, `bai/`, `cau-hoi/`, `tien-do.json`, `nhat-ky.md` nằm trong `Hoc cung Noe/khoa-hoc/<mã khoá>/`. Chặng: B = `muc-dich`, A = `dang-o-dau`, C1 = `tim`, C2 = `lo-trinh`, D và E = `hoc`. Mức `nen-tang` nay là `can-doi`.

> Tiêu chuẩn 19/11/2026: làm đúng `docs/quy-trinh-tim-nguon.md` (phương pháp 5 giai đoạn). Chỗ nào kỹ năng này khác tài liệu đó thì theo tài liệu.

# Chặng C1: Nghiên cứu nguồn

Bản nháp giai đoạn 0. Sẽ viết kỹ và chạy thử ở giai đoạn 1.

## Các bước
1. **Xác định ngành.** Lĩnh vực của người học thuộc ngành nào, ngành con nào. Ví dụ: "làm web bán hàng" thuộc Công nghệ thông tin → Phát triển web.
2. **Tìm khung chuẩn của ngành** (tầng 1): khung chương trình của hiệp hội nghề, chương trình đại học công khai, khung kỹ năng nghề nghiệp. Ghi khung nào được dùng làm xương sống.
3. **Tìm nguồn theo 4 tầng** (xem `docs/luat-ban-quyen-va-dan-nguon.md` mục 5), lọc theo ràng buộc ở `ho-so.md`: cấp độ, tiếng, ngân sách, kiểu học.
4. **Mỗi kỹ năng con** ở chặng A cần ít nhất một nguồn tầng 1 hoặc 2. Thiếu thì ghi rõ.
5. **Ghi vào `nguon.md`** đủ 10 cột.
6. **Kiểm link:** chạy `py tools/kiem_link.py hoc-cua-toi/nguon.md`. Link lỗi thì tìm link thay ở trang chính chủ, không dùng bản lậu.
7. Báo người học: đã tìm bao nhiêu nguồn, mỗi tầng bao nhiêu, nguồn nào trả phí, chỗ nào còn thiếu.
8. Cập nhật `tien-do.json`: `chang_hien_tai` = `C2`.

## Không được
- Bịa tên khoá, giá, thời lượng. Không thấy trên trang chính chủ thì ghi "(chưa xác minh)".
- Dùng nội dung của nguồn để viết bài ở chặng này. Chặng này chỉ lập danh sách.
