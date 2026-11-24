# Bảo đảm chất lượng lộ trình

Bản 1, 21/11/2026. Viết sau khi rà toàn bộ bộ máy lên lộ trình và thấy nhiều bước chưa đo được chất lượng.

Mục tiêu: người học **chưa biết gì**, học theo app một thời gian, phải **làm được đúng việc mình muốn**. App chỉ được coi là tốt khi đo được điều đó, không chỉ khi lộ trình "nhìn hay".

## 1. Vòng khép kín

```
Mục đích → Hợp đồng đầu ra (đo được, người học xác nhận) → Bản đồ kỹ năng chung (KN1, KN2…)
→ Kiểm tra đầu vào (gắn mã KN) → Tìm nguồn (gắn mã KN) → AI thứ hai kiểm nội dung nguồn
→ Xếp 3 lộ trình nối tiếp (mỗi module gắn mã KN, có bài đo cuối, tự soát 9 mục) → Code kiểm, tự sửa
→ Người học duyệt (thấy kết quả soát) → Soạn bài (câu hỏi gắn KN) → AI thứ hai kiểm đáp án
→ Học, nộp thực hành cho AI xem → Đo cuối chặng (so với đầu vào) → Bài đo cuối lộ trình → Hỏi lại sau 2 tuần
```

## 2. Từng chốt chặn

| Chốt | Làm gì | Ở đâu |
|---|---|---|
| Hợp đồng đầu ra | AI biến mục đích (kể cả mơ hồ) thành 3–6 việc "làm được" + cách đo + cấp; người học sửa và xác nhận trước bài đầu vào | `chat-luong.js` (`loiDanMucTieu`, `damBaoMucTieu`), `muc-tieu.json` |
| Bản đồ kỹ năng chung | 6–14 kỹ năng con có mã, cấp, học trước sau, phục vụ việc nào. Bài đầu vào, tìm nguồn, lộ trình, câu hỏi bài học đều dùng chung mã | `muc-tieu.json` |
| Kiểm tra đầu vào V2 | Mức 1 là nền trên đúng thiết bị; câu là tình huống; chữ tiếng Anh có nghĩa; xáo lựa chọn; "đúng thì rút gọn gì, sai thì học gì"; lưu câu hỏi để đo lại | `app.js` (`loiDanDauVao`) |
| Kiểm nội dung nguồn | AI thứ hai mở từng trang, kiểm chính chủ, đúng chủ đề, tiếng, phí, cấp; sai thì bỏ nguồn và ghi lý do. Từ 14/20 điểm là [NGUỒN CHÍNH] | `chat-luong.js` (`loiDanKiemNguon`), `server.py` |
| Lộ trình | Có `ky_nang`, `bai_do_cuoi`, `tu_soat`; Trung cấp bao trùm Sơ cấp, Chuyên sâu bao trùm Trung cấp | `app.js` (`loiDanLoTrinh`) |
| Code kiểm lộ trình | Thiếu xong_khi, thiếu đầu ra/thực hành, động từ "biết/nắm", kỹ năng chưa dạy, việc chưa được đo, mục tự soát chưa đạt → nhờ AI sửa đúng lỗi đó một lần; lỗi còn lại hiện cho người học | `kiemLoTrinh` (JS) = `kiem_lo_trinh` (Python) |
| Kiểm đáp án | AI thứ hai tự giải lại từng câu; đáp án sai thì sửa, câu mơ hồ thì bỏ (giữ ít nhất 3 câu kiểm tra) | `server.py` (`ap_dung_kiem_dap_an`), chỉ khi nối AI tự động |
| Thực hành | Người học nộp bài (kể lại, dán kết quả, link); AI xem, đạt mới tính "Làm thật" | `nopThucHanh` |
| Đo cuối chặng | Làm lại đúng câu đầu vào của các kỹ năng chặng đó; thiếu thì AI soạn 5 câu; hiện trước → sau | `doCuoiChang`, `do-luong.json` |
| Bài đo cuối lộ trình | 2 câu tình huống mỗi việc trong hợp đồng + người học làm thật và tự báo; đạt = làm được và đúng ít nhất nửa số câu | `doCuoiLoTrinh` |
| Hỏi lại sau 2 tuần | "Bạn có tự làm được việc này ngoài đời không?" cho từng việc | `hoiLaiSauHoc` |

Mọi kết quả AI ghi kèm tên AI đã dùng (`ai`) để so giữa các AI.

## 3. Cách chấm một phiên bản lời dặn

1. Xuất nguyên văn lời dặn bản cũ và bản mới cho cùng hồ sơ thử (hồ sơ giả lập ghi rõ là giả lập).
2. Mỗi lời dặn cho **nhiều AI chạy riêng** soạn ra kết quả.
3. **5–6 AI chấm độc lập**, mỗi AI một vai: giáo sư đo lường, giảng viên đại học, chuyên gia thiết kế chương trình, người đi làm trong nghề, người dùng lớn tuổi, bạn trẻ mới bắt đầu. Chấm **mù** (bản A, bản B không ghi tên, thứ tự ngẫu nhiên) và **chéo** (không AI nào chấm bài mình soạn).
4. Đạt: điểm trung bình từ 4/5, không tiêu chí nào dưới 3,5. Bản mới chỉ thay bản cũ khi điểm cao hơn.
5. Ghi điểm vào Google Sheet "Noe - Bo may len lo trinh".

AI chấm chỉ để so phiên bản. Trước khi cho học viên thật học: ít nhất 3 người thật học thử 1 tuần, chấm từ 4/5.

## 4. Giới hạn đã biết

- Kiểm đáp án và tự sửa lộ trình chỉ chạy khi **nối AI tự động**. Cách sao chép và dán thì code vẫn kiểm và hiện lỗi, nhưng không gọi thêm AI (người học phải dán thêm nhiều lần).
- Bài thực hành nộp bằng chữ; nộp ảnh chưa có.
- Bài đo cuối dựa một phần vào người học tự báo "làm được".

## 5. Kết quả chấm 21/11/2026

5 vòng chấm mù (vòng 2–5 mỗi vòng 12 lượt: 2 hồ sơ thử × 6 vai). Điểm trung bình 1–5:

| Phần | Bản cũ | Bản mới nhất | Chọn bản mới |
|---|---|---|---|
| Hợp đồng đầu ra | (chưa có) | 4,02 (bản 3) | 9/12 |
| Lộ trình | 3,33 | 4,13 (bản 3) | 12/12 |
| Bài học | 3,62 | 4,17 (bản 3) | 12/12 |
| Bài kiểm tra đầu vào | 2,73 | 3,97 (bản 5) | 12/12 |

Bài đầu vào bản 5 sát mốc nhưng **chưa chạm 4,0**; sau vòng 5 đã thêm 2 dòng dặn (lựa chọn sai hấp dẫn với người chưa biết, mức theo độ khó thật), chưa chấm lại. Bài đầu vào bản 5: đo liền 4–5 kỹ năng từ kỹ năng đầu bản đồ, mỗi kỹ năng 2 câu; code đi lần theo bản đồ, gặp kỹ năng chưa vững hoặc chưa đo thì bắt đầu từ đó; dừng sớm khi 2 kỹ năng liền nhau sai hết. Dữ liệu chấm: thư mục bộ não `production/nhap/kiem-tra-ai-ban-sua-2026-11-21/`.

## 6. Chạy thử khoá trọn vẹn (chốt 21/11/2026)

Trước khi đổi bộ máy hay lời dặn AI, chạy thử vài khoá trọn vẹn (đúng lời dặn và đúng hàm kiểm của app), in ra, người duyệt đọc từng bài.
