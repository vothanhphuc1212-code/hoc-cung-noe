---
name: day-buoi-hoc
description: Chặng D của Learn Everything with AI. Dạy một buổi học: ôn câu đến hạn, viết bài (lớp Nhanh và Đào sâu) bằng lời mới có dẫn nguồn, cho làm thử với gợi ý, kiểm tra 3–5 câu, ghi tiến độ và nhật ký. Dùng khi người học nói "học", "hôm nay học gì", hoặc tien-do.json có chang_hien_tai là D.
---

> Cập nhật 18/11/2026: app (`app/`) là cách chính và đã làm các bước này. Kỹ năng này dùng khi người học làm việc trực tiếp với AI. Mọi đường dẫn theo `docs/chuan-du-lieu.md`: `hoc-cua-toi/ho-so.md` nay là `Hoc cung Noe/ho-so.md`; các file `nguon`, `lo-trinh`, `bai/`, `cau-hoi/`, `tien-do.json`, `nhat-ky.md` nằm trong `Hoc cung Noe/khoa-hoc/<mã khoá>/`. Chặng: B = `muc-dich`, A = `dang-o-dau`, C1 = `tim`, C2 = `lo-trinh`, D và E = `hoc`. Mức `nen-tang` nay là `can-doi`.

> Tiêu chuẩn 19/11/2026: làm đúng `docs/quy-trinh-dong-hanh.md` (phương pháp 5 giai đoạn). Chỗ nào kỹ năng này khác tài liệu đó thì theo tài liệu.

# Chặng D: Một buổi học

Bản nháp giai đoạn 0. Sẽ viết kỹ ở giai đoạn 1–2, khi có app.

## Thứ tự buổi học (ví dụ buổi 45 phút)
1. **Khởi động ôn (khoảng 5 phút):** hỏi 2–3 câu trong `lich_on` đã đến hạn.
2. **Bài chính (khoảng 20 phút):** chưa có `bai/<mã>.md` thì viết theo định dạng, lấy ý từ nguồn trong lộ trình, **viết bằng lời mới**, có mục Nguồn. Người học chọn đọc lớp Nhanh hay mở Đào sâu.
3. **Làm thử (khoảng 12 phút):** bài tập nhỏ. Hỏi gợi mở, gợi ý từng bước, chỉ đưa đáp án khi người học đã thử hoặc tự xin.
4. **Kiểm tra (khoảng 5 phút):** 3–5 câu trong `cau-hoi/<mã>.json` (chưa có thì soạn). Chấm ngay, giải thích câu sai. Người học được bỏ qua; bỏ qua thì ghi `bo_qua_kiem_tra: true`.
5. **Tự ghi lại (khoảng 3 phút):** mời người học viết 1 câu "hôm nay mình hiểu được gì", thêm vào `nhat-ky.md`.

Thời gian từng phần co giãn theo `phut_moi_ngay`.

## Ghi tiến độ
- Thêm buổi vào `buoi_da_hoc` với điểm. Cộng sao theo số câu đúng (không cộng vì thời gian).
- Đặt lịch ôn cho các câu vừa làm (giai đoạn 2 dùng FSRS; trước đó tạm ôn lại sau 1, 3, 7 ngày).
- Chuyển `buoi_tiep_theo` sang buổi sau trong lộ trình.
- Hết tuần thì nhắc chạy chặng E.

## Noe nói gì
Chọn trạng thái theo tình huống (các biểu cảm vẽ trong `app/web/noe.js`): Vui khi mở bài, Suy nghĩ khi đang soạn, Khen khi đúng, Buồn khi sai (kèm lời động viên), Xong module khi hết module.
