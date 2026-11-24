---
name: hoi-diem-xuat-phat
description: Chặng A của Learn Everything with AI. Tìm hiểu người học đã biết gì, đã làm được gì về lĩnh vực họ chọn, bằng câu hỏi, lời kể, dữ liệu họ cho phép đọc và bài kiểm tra đầu vào ngắn. Dùng khi tien-do.json có chang_hien_tai là A.
---

> Cập nhật 18/11/2026: app (`app/`) là cách chính và đã làm các bước này. Kỹ năng này dùng khi người học làm việc trực tiếp với AI. Mọi đường dẫn theo `docs/chuan-du-lieu.md`: `hoc-cua-toi/ho-so.md` nay là `Hoc cung Noe/ho-so.md`; các file `nguon`, `lo-trinh`, `bai/`, `cau-hoi/`, `tien-do.json`, `nhat-ky.md` nằm trong `Hoc cung Noe/khoa-hoc/<mã khoá>/`. Chặng: B = `muc-dich`, A = `dang-o-dau`, C1 = `tim`, C2 = `lo-trinh`, D và E = `hoc`. Mức `nen-tang` nay là `can-doi`.

> Tiêu chuẩn 19/11/2026: làm đúng `docs/tieu-chuan-thong-tin-hoc-vien.md` (phương pháp 5 giai đoạn). Chỗ nào kỹ năng này khác tài liệu đó thì theo tài liệu.

# Chặng A: Điểm xuất phát

## 1. Câu hỏi
1. Kể ngắn về bạn: công việc, đã học tới đâu.
2. Bạn đã học hoặc làm gì liên quan tới lĩnh vực này? Kể **một việc** bạn từng làm được.
3. Bạn từng bỏ dở khoá học nào? Vì sao? (để biết chỗ hay nản)
4. Bạn học trên máy tính hay điện thoại? Mạng ổn không?

## 2. Tự chấm kỹ năng con
- Từ lĩnh vực và cấp độ ở chặng B, lập danh sách 8–15 kỹ năng con cốt lõi (lấy từ khung chương trình chuẩn của ngành nếu có; chưa nghiên cứu nguồn thì ghi đây là danh sách tạm).
- Người học chấm từng kỹ năng: 0 chưa nghe tên · 1 biết tên · 2 làm được khi có hướng dẫn · 3 tự làm được.

## 3. Dữ liệu sẵn có (chỉ khi người học cho phép)
- Hỏi: "Bạn có ghi chú, bộ não thứ 2, hồ sơ, hay trí nhớ của AI về việc học không? Cho phép mình đọc phần liên quan không?"
- Chỉ đọc khi họ nói đồng ý, chỉ đọc mục liên quan tới lĩnh vực. Không chép mật khẩu, số tài khoản, giấy tờ cá nhân.

## 4. Kiểm tra đầu vào
- Khoảng 10 câu chọn đáp án, dễ dần lên khó, rải đều các kỹ năng con.
- Sai 3 câu liên tiếp thì dừng sớm, nói nhẹ nhàng: "Phần này mình sẽ học từ đầu nhé."
- Có lựa chọn "Mình chưa biết" ở mỗi câu, để không phải đoán bừa.
- Câu tự viết theo luật `docs/luat-ban-quyen-va-dan-nguon.md`, không lấy nguyên đề của nơi khác.

## 5. Ghi lại
- Điền `## Điểm xuất phát (A)`, `## Kỹ năng con tự chấm`, `## Kết quả kiểm tra đầu vào`, `## Ghi chú động lực` trong `ho-so.md`.
- Chỗ tự chấm và kết quả kiểm tra lệch nhau thì ghi cả hai, ưu tiên kết quả kiểm tra khi xếp lộ trình.
- Đọc lại "Hồ sơ của bạn" cho người học sửa.
- Cập nhật `tien-do.json`: `chang_hien_tai` = `C1`.
