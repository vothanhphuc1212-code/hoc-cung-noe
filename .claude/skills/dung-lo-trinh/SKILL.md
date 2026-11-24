---
name: dung-lo-trinh
description: Chặng C2 của Learn Everything with AI. Dựng lộ trình chi tiết theo chặng, module, buổi học từ hồ sơ và danh sách nguồn đã kiểm, kèm miễn trừ trách nhiệm, rồi chờ người học duyệt. Dùng khi tien-do.json có chang_hien_tai là C2 hoặc người học muốn sửa lộ trình.
---

> Cập nhật 18/11/2026: app (`app/`) là cách chính và đã làm các bước này. Kỹ năng này dùng khi người học làm việc trực tiếp với AI. Mọi đường dẫn theo `docs/chuan-du-lieu.md`: `hoc-cua-toi/ho-so.md` nay là `Hoc cung Noe/ho-so.md`; các file `nguon`, `lo-trinh`, `bai/`, `cau-hoi/`, `tien-do.json`, `nhat-ky.md` nằm trong `Hoc cung Noe/khoa-hoc/<mã khoá>/`. Chặng: B = `muc-dich`, A = `dang-o-dau`, C1 = `tim`, C2 = `lo-trinh`, D và E = `hoc`. Mức `nen-tang` nay là `can-doi`.

> Tiêu chuẩn 19/11/2026: làm đúng `docs/quy-trinh-len-lo-trinh.md` (phương pháp 5 giai đoạn). Chỗ nào kỹ năng này khác tài liệu đó thì theo tài liệu.

# Chặng C2: Dựng lộ trình

Bản nháp giai đoạn 0. Sẽ viết kỹ và chạy thử ở giai đoạn 1.

## Các bước
1. Đọc `ho-so.md` và `nguon.md`.
2. Bỏ qua kỹ năng người học đã nắm (kiểm tra đầu vào đúng, hoặc tự chấm mức 3).
3. Chia **chặng** (mỗi chặng có "Xong khi" là một việc làm được), **module** (đầu ra, số buổi, nguồn chính), **buổi học** (vừa với `phut_moi_ngay`).
4. Xếp theo thứ tự kiến thức nền trước, khớp với khung chuẩn đã chọn ở C1.
5. Tính ngày xong dự kiến từ số buổi, số ngày học mỗi tuần, ngày bắt đầu. Ghi là ước tính.
6. Viết `lo-trinh.md` đúng `docs/dinh-dang-thu-muc-hoc.md`, `trang_thai: cho-duyet`, cuối file có miễn trừ trách nhiệm.
7. Đưa người học xem bản tóm tắt: số chặng, số module, số buổi, ngày xong dự kiến, nguồn chính. Họ được đổi thứ tự, bỏ module, đổi nguồn, đổi số phút.
8. Khi người học nói duyệt: đổi `trang_thai: da-duyet`, đặt `buoi_tiep_theo` trong `tien-do.json` là buổi đầu tiên, `chang_hien_tai` = `D`. Đề nghị tạo file lịch nhắc (.ics) theo `gio_hoc`.
