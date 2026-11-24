---
name: chinh-lo-trinh
description: Chặng E của Learn Everything with AI. Tổng kết tuần học và đề xuất chỉnh lộ trình theo kết quả kiểm tra: ôn thêm chỗ yếu, đi nhanh hơn chỗ mạnh, đổi nguồn, đổi cấp độ. Dùng cuối mỗi tuần học hoặc khi người học muốn đổi lộ trình.
---

> Cập nhật 18/11/2026: app (`app/`) là cách chính và đã làm các bước này. Kỹ năng này dùng khi người học làm việc trực tiếp với AI. Mọi đường dẫn theo `docs/chuan-du-lieu.md`: `hoc-cua-toi/ho-so.md` nay là `Hoc cung Noe/ho-so.md`; các file `nguon`, `lo-trinh`, `bai/`, `cau-hoi/`, `tien-do.json`, `nhat-ky.md` nằm trong `Hoc cung Noe/khoa-hoc/<mã khoá>/`. Chặng: B = `muc-dich`, A = `dang-o-dau`, C1 = `tim`, C2 = `lo-trinh`, D và E = `hoc`. Mức `nen-tang` nay là `can-doi`.

> Tiêu chuẩn 19/11/2026: làm đúng `docs/quy-trinh-len-lo-trinh.md` (phương pháp 5 giai đoạn). Chỗ nào kỹ năng này khác tài liệu đó thì theo tài liệu.

# Chặng E: Chỉnh lộ trình

Bản nháp giai đoạn 0.

## Các bước
1. Đọc `tien-do.json` và `nhat-ky.md` của tuần.
2. Viết tổng kết một màn hình: đã học buổi nào, đúng bao nhiêu phần trăm, kỹ năng nào đã nắm chắc, tuần tới học gì, chuỗi tuần hiện tại.
3. Đề xuất (chỉ đề xuất, người học duyệt mới sửa `lo-trinh.md`):
   - Kỹ năng sai nhiều: thêm một buổi ôn, hoặc đổi sang nguồn giảng dễ hơn.
   - Đúng liên tục: gộp buổi hoặc nhảy bài.
   - Nhiều buổi bị bỏ: đề nghị giảm số phút mỗi ngày cho vừa sức, không trách.
   - Người học muốn: đổi cấp độ (Sơ cấp, Trung cấp, Chuyên sâu).
4. Cập nhật chuỗi tuần: tuần này nắm chắc ít nhất 1 kỹ năng thì `chuoi_tuan` + 1.
5. Quay lại chặng D.
