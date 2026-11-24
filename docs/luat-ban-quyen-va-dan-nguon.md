# Luật bản quyền và dẫn nguồn

AI phải theo đúng luật này mỗi khi tìm nguồn, viết bài, ra đề trong gói Learn Everything with AI.

## 1. Nguyên tắc gốc

Quyền tác giả bảo hộ **cách thể hiện** (câu chữ, hình ảnh, video, âm thanh), không bảo hộ **ý tưởng**. Luật Sở hữu trí tuệ Việt Nam, Điều 15 khoản 3, ghi: quy trình, hệ thống, phương pháp hoạt động, khái niệm, nguyên lý, số liệu không thuộc phạm vi bảo hộ quyền tác giả. Hầu hết các nước theo cùng nguyên tắc.

Vì vậy gói học **ý tưởng, kiến thức, từ khoá, thứ tự môn học** từ nhiều nơi, rồi **tự viết bài bằng lời mới**.

> Lưu ý: Luật SHTT có lần sửa năm 2025, nội dung Điều 15 sau sửa đổi chưa được kiểm lại. Đây không phải tư vấn pháp lý.

## 2. Được làm

- Đọc nhiều nguồn để hiểu một khái niệm, rồi giải thích lại bằng lời của mình, ví dụ của mình.
- Lấy từ khoá, khái niệm, thứ tự học từ nhiều chương trình rồi tự sắp xếp lại.
- Dẫn link tới nguồn chính chủ để người học tự đọc, tự xem.
- Trích **một câu ngắn** khi thật cần (định nghĩa chuẩn, câu nói nổi tiếng), để trong ngoặc kép, ghi tác giả và link.
- Tự vẽ hình minh hoạ.

## 3. Không được làm

- Chép nguyên văn đoạn văn, bài giảng, đề thi, đáp án của người khác vào bài.
- Viết lại sát từng câu, chỉ đổi vài chữ.
- Chép hình, video, slide, sơ đồ của người khác vào bài (chỉ dẫn link).
- Chép nguyên một danh sách tuyển chọn của người khác (ví dụ một "awesome list" hay giáo trình của trường) rồi coi như lộ trình của mình. Được tham khảo, phải tự chọn lọc và sắp xếp lại, và ghi đã tham khảo từ đâu.
- Dẫn link tới bản lậu: khoá học trả phí bị đăng lại, sách lậu, video đăng lại không phải kênh gốc.
- Dùng tên trường, tên hãng như thể họ hợp tác hay bảo trợ cho gói. Chỉ dùng tên để gọi đúng nguồn.
- Tải hàng loạt nội dung trang web bằng máy khi điều khoản trang cấm.

## 4. Thế nào là nguồn chính chủ

Trang của chính tác giả hoặc tổ chức làm ra nội dung, hoặc nơi được họ cho phép đăng:
- Trang của trường, của khoa, của giảng viên (ví dụ ocw.mit.edu, cs50.harvard.edu).
- Nền tảng học chính thức (Coursera, edX, Khan Academy, freeCodeCamp, F8...).
- Kênh YouTube chính thức của người giảng hoặc tổ chức.
- Tài liệu chính thức của hãng (docs của Google, Microsoft, Anthropic...).
- Kho GitHub của chính tác giả.

## 5. Bốn tầng uy tín

| Tầng | Loại nguồn | Dùng thế nào |
|---|---|---|
| 1 | Khung chuẩn ngành, chương trình đại học, tài liệu chính thức | Xương sống của lộ trình |
| 2 | Nền tảng học lớn | Bài học chính |
| 3 | Chuyên gia, giảng viên nổi tiếng, sách kinh điển, trung tâm lớn | Bổ sung, giải thích thêm |
| 4 | Cộng đồng (danh sách trên GitHub, diễn đàn, blog) | Chỉ dùng sau khi đối chiếu với tầng trên |

Ưu tiên nguồn **miễn phí, công khai**. Nguồn trả phí chỉ đưa vào khi người học nói có ngân sách, và ghi rõ giá (chưa xác minh nếu chưa kiểm).

## 6. Mỗi nguồn phải ghi đủ

Trong `hoc-cua-toi/nguon.md`, mỗi nguồn một dòng:

| Cột | Ý nghĩa |
|---|---|
| Mã | N1, N2... dùng để gọi trong lộ trình và bài |
| Tên | Tên khoá, bài, sách, video |
| Link | Đường dẫn tới trang chính chủ |
| Ai làm | Trường, tổ chức, tác giả |
| Tầng | 1 đến 4 |
| Cấp | nhanh, nen-tang, chuyen-sau (có thể nhiều) |
| Tiếng | vi, en, ... |
| Phí | mien-phi, tra-phi (giá), mot-phan |
| Ngày kiểm | Ngày mở thử link gần nhất (YYYY-MM-DD) |
| Vì sao chọn | Một câu |

Chạy `py tools/kiem_link.py hoc-cua-toi/nguon.md` để mở thử mọi link và ghi ngày kiểm. Link không mở được thì đánh dấu, không dùng trong bài cho tới khi thay bằng link khác.

## 7. Trong bài học

- Cuối mỗi bài có mục **Nguồn** liệt kê mã nguồn đã dùng (N3, N7) kèm link.
- Câu nào lấy số liệu, định nghĩa từ một nguồn cụ thể thì ghi mã nguồn ngay sau câu đó.
- Không tìm được nguồn cho một ý thì ghi "(chưa xác minh)", không bịa.

## 8. Cuối mỗi lộ trình

Luôn có đoạn miễn trừ trách nhiệm:

> Lộ trình này do AI tổng hợp để tư vấn, có thể có sai sót hoặc nguồn đã thay đổi. Bạn hãy đọc kỹ và tự kiểm tra các nguồn trước khi học theo. Bạn có thể điều chỉnh lộ trình theo nhu cầu của mình bất cứ lúc nào.
