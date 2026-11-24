# Quy trình đồng hành

Giai đoạn 5 trong phương pháp 5 giai đoạn của Learn Everything with AI. Bản 1, 19/11/2026.

Mục tiêu: người học **không học một mình**. Noe nhắc đúng lúc, hỏi han đúng mức, khen đúng chỗ, và giúp người học quay lại khi lỡ nhịp. Noe là **bạn đồng hành**, không phải người giám sát.

## 1. Năm nguyên tắc

1. **Tôn trọng trước, nhắc sau.** Người học chọn có được nhắc không, nhắc qua đâu, giờ nào không làm phiền. Mặc định nhắc ít.
2. **Không trách, không doạ, không gây áp lực.** Không "Bạn đã bỏ lỡ 3 ngày!", không đếm ngược, không làm người học thấy có lỗi. Chuỗi tính **theo tuần**, không theo ngày, để một ngày bận không làm mất hết.
3. **Khen cụ thể, khen nỗ lực và cách làm.** "Bạn giải thích đúng vì sao dùng *am* chứ không phải *is*" tốt hơn "Giỏi quá!".
   *Gốc: Feedback, Hattie & Timperley, 2007; Kluger & DeNisi, 1996: lời khen chung chung về con người ít giúp học tốt hơn.*
4. **Hỏi cảm xúc ngắn, dùng câu trả lời thật.** Hỏi một chạm, và câu trả lời phải làm buổi học thay đổi, không hỏi cho có.
   *Gốc: Lý thuyết cảm xúc trong học tập (Control-value theory), Pekrun, 2006: lo âu, chán, hứng thú ảnh hưởng trực tiếp tới việc học.*
5. **Noe biết giới hạn của mình.** Noe không phải chuyên gia tâm lý, không chẩn đoán, không tư vấn y tế (mục 6).

## 2. Nhắc lịch

| Kênh | Trạng thái | Ghi chú |
|---|---|---|
| File lịch `.ics` nhập vào ứng dụng lịch | **Đã có** | Chuỗi lặp có điểm dừng, xem `docs/chuan-du-lieu.md` |
| Google Lịch | **Đã có** | Chỉ xin quyền tạo lịch riêng "Học cùng Noe" |
| Thông báo trên trình duyệt / điện thoại (web push) | Chưa có | Trên iPhone chỉ nhận được khi người học đã **thêm app ra màn hình chính** (chưa xác minh phiên bản iOS tối thiểu, kiểm lại khi làm) |
| Email | Chưa có | Chỉ bản online, người học bật mới gửi |

**Quy tắc nhắc:**
- Nhắc **trước giờ học 10–15 phút**, một lần. Không nhắc lại trong ngày nếu người học không trả lời.
- Không nhắc trong **giờ yên lặng** người học chọn.
- Tối đa **1 tin mỗi ngày** và **4 tin mỗi tuần**, tính cả tin hỏi han.
- Mỗi tin có nút làm được ngay: **Học ngay**, **Để mai**, **Dời lịch**.

## 3. Hỏi han trong buổi học

### Đầu buổi: lời chào theo bối cảnh, bấm là học
**Không hỏi tâm trạng** (bỏ từ 19/11/2026 theo chủ dự án: vui buồn gì cũng cho học, không có nhánh buổi ngắn). Màn trước buổi học gồm:
- Trên: **một câu chào đổi theo bối cảnh**, vui vẻ, tích cực: buổi đầu tiên, quay lại sau nhiều ngày, học thêm buổi nữa trong ngày, chuỗi ngày đang giữ, buổi trước đúng hết, sang module mới, buổi cuối module, giờ trong ngày.
- Dưới, làm nổi bật: **Buổi số mấy** (đánh số liên tục cả lộ trình, giống bản đồ), **học về gì**, **mục tiêu**, **lợi ích** (`loi_ich` của bài hoặc của buổi; chưa có thì lấy đầu ra module).
- Một nút **Học ngay**. Không lặp lại hướng dẫn 5 bước, không ghi thời lượng (một buổi chỉ vài phút, nhanh chậm tuỳ người).

### Cuối buổi: hỏi độ khó
Dễ quá · Vừa · Khó quá. Dùng cùng kết quả kiểm tra để chỉnh độ khó buổi sau (xem `docs/quy-trinh-len-lo-trinh.md` mục 5).

### Trong lúc làm bài
- Sai: Noe "nổ" vui (đã có), rồi **gợi ý từng bước**, không đưa đáp án ngay.
- Sai 2 lần cùng chỗ: đổi cách giải thích, cho ví dụ khác.
- Đúng câu khó: khen cụ thể cách làm.

## 4. Khi người học lỡ nhịp

| Tình huống | Noe làm gì |
|---|---|
| Lỡ 1 buổi | Không nhắn gì thêm. Lần mở app sau: "Chào mừng quay lại! Mình học tiếp từ chỗ dở nha." |
| Lỡ 2 buổi liền | Một tin nhẹ nhàng: rủ học **một buổi** (chỉ vài phút) |
| Lỡ 1 tuần | Một tin: hỏi lịch có còn hợp không, đề xuất **dời lịch** hoặc **giảm số buổi mỗi tuần** |
| Lỡ 3 tuần | Một tin cuối, rồi **dừng nhắc**: "Noe vẫn ở đây khi bạn sẵn sàng." Không nhắn tiếp cho tới khi người học quay lại |
| Quay lại sau lâu | Bắt đầu bằng **buổi ôn ngắn** những gì đã học, không vào thẳng bài mới |

Lỡ lịch nhiều lần là dấu hiệu **lịch không thực tế**, không phải người học lười. Noe đề xuất chỉnh lịch, không thúc ép.
*Gốc: Implementation intentions, Gollwitzer, 1999: kế hoạch "khi nào, ở đâu, làm gì" cụ thể giúp làm được việc đã định.*

## 5. Ăn mừng và nhìn lại

- **Mỗi buổi:** sao, Thông tuệ tăng (đã có), Noe phản ứng theo kết quả, báo **chuỗi ngày**.
- **Lên nấc huy hiệu:** màn ăn mừng **toàn màn hình**, hình và hiệu ứng riêng từng nấc (đom đóm bay, nến lung linh, đèn bật sáng, tia lửa trại bay lên, sao lấp lánh, trăng mọc, mặt trời toả tia, thiên hà xoay), chữ vinh danh "Chúc mừng ... đã trở thành ...". Hiệu ứng **đẹp dần theo nấc** (nấc càng cao càng nhiều hạt sáng; từ nấc 4 có hào quang, nấc 6 có tia sáng xoay, nấc 7 có sóng loé và chớp sáng); Thiên hà là cả một vũ trụ: tinh vân đổi màu, sao lấp lánh, sao băng, xoáy thiên hà, hai hành tinh bay quanh quỹ đạo, chữ ánh nhiều màu. Lên nhiều nấc một lúc thì chỉ hiện nấc cao nhất. Màn này cũng tự bật khi mở trang chủ khoá hoặc Cửa hàng mà đã đủ sao lên nấc chưa nhận. Xem lại được bằng cách bấm huy hiệu đã đạt trong bảng **Huy hiệu thành tích** (bấm nút Huy hiệu ở trang chủ khoá).
- **Mỗi module xong:** Noe ăn mừng, mở bài thực hành cuối module (đã có).
- **Mỗi chặng xong:** xem lại sản phẩm người học đã làm, so với lúc bắt đầu.
- **Mỗi tuần (tuỳ chọn):** một trang tóm tắt ngắn: học mấy buổi, hiểu thêm gì (lấy từ câu "hôm nay mình hiểu được gì"), sắp tới học gì.
- **Nhắc lại lý do học** (lấy từ "Vì sao học lúc này" trong hồ sơ) khi người học nản.

## 5b. Sao và Cửa hàng của Noe

- Mỗi buổi: **sao vàng** = số câu kiểm tra đúng (kiểm tra cố định 5 câu, nên tối đa 5; mỗi lần làm, kể cả học lại, app **xáo thứ tự câu hỏi và thứ tự lựa chọn** (câu ôn, làm thử, kiểm tra) để người học phải đọc hiểu chứ không nhớ vị trí mà lấy sao; lời dặn AI soạn bài cấm lựa chọn kiểu "Cả A và B", "Tất cả các ý trên" và giải thích không nhắc vị trí); **sao xanh** = số câu ôn đầu buổi đúng (tối đa 3). Trên bản đồ, mỗi buổi đã học có 5 sao vàng sáng theo điểm và "+n" sao xanh nếu có.
- **Khuyến khích học lại:** kiểm tra đúng **dưới 2 câu** (dưới 2 sao), hoặc AI chấm phần tổng kết là "chưa hiểu đúng", thì màn kết quả hiện thẻ "Mình xem lại buổi này nha?" (lời động viên, không trách) với nút chính **Học lại buổi này**; nút Học buổi tiếp theo vẫn còn nhưng không phải nút chính. Bỏ qua kiểm tra thì không hiện thẻ này. Học lại không mất sao đã có.
- **Cửa hàng của Noe** (nút có biểu tượng cửa hàng ở trang chủ khoá, hoặc bấm ô Sao): dùng sao đổi **đồ cho Noe**, chia theo **bộ sưu tập**: Phụ kiện thường ngày (21 món: nơ, kính tròn, khăn quàng, tai nghe, mũ tốt nghiệp, kẹp sao, bút chì, sách, mũ lưỡi trai, dây chuyền, ba lô; thêm 20/11/2026: kính râm trái tim, ô che mưa, dù che nắng, mũ tai bèo, kẹp hoa tím, đồng hồ đeo tay, túi đeo chéo, ly trà sữa, bóng bay, điện thoại; mọi món vẽ cùng phong cách khối phẳng của Noe trong `app/web/noe.js`), Xuân, Hạ, Thu, Đông, Pháp sư (áo choàng, trượng, mũ, quả cầu), Hoàng gia (vương miện, áo choàng, trượng vàng, huân chương), Áo dài Việt Nam (khăn đóng, áo dài đỏ, quạt giấy, hoa sen), Bộ trang phục chủ đề (trọn gói, 23 bộ: nón lá, đầu bếp, hoạ sĩ, cướp biển, ảo thuật gia, tay đua, phi hành gia, siêu nhân, bác sĩ, ninja, cao bồi, lính cứu hoả, hiệp sĩ; thêm 20/11/2026: thuỷ thủ, cảnh sát, nhà khoa học, ca sĩ, thợ lặn, ông già Noel, thiên thần, thám tử, cầu thủ, chú ong). Giá do máy chủ giữ (`GIA_DO` trong `app/server.py`). Trang Cửa hàng gọn: Noe đang mặc, vé giữ chuỗi, rồi **lưới ô bộ sưu tập** (mỗi ô là hình Noe mặc nguyên bộ trên nền của bộ, số món đã có, giá mua cả bộ); bấm ô mới mở **trang chi tiết bộ** (bìa, chuyện của bộ, các món, Mua cả bộ, Mặc cả bộ, nền bản đồ). Phụ kiện thường ngày và Bộ trang phục chủ đề cũng là ô. Mỗi bộ sưu tập (Áo dài, Pháp sư, Không gian, Xuân, Hạ, Thu, Đông, Hoàng gia) có nút **Mua cả bộ**: mua một lần các món còn thiếu, giảm 10% khi mua từ 2 món, mua xong Noe mặc luôn cả bộ (`BO_SUU_TAP` và `gia_bo` trong `app/server.py`). **Đủ bộ thì mở khoá nền bản đồ học** của bộ đó (hoa văn và màu theo mùa, theo chủ đề); trong cửa hàng có ô xem trước nền, bấm "Dùng nền này" hoặc "Bỏ nền". Máy chủ chỉ cho dùng nền khi đã có đủ bộ.
- **Mặc nhiều món cùng lúc**, mỗi chỗ một món (đầu, kẹp tóc, tai, mắt, cổ, thân, găng, tay phải, tay trái, lưng); bộ trọn gói thì thay hết. Mỗi bộ sưu tập (trừ phụ kiện và trọn gói) mặc đủ 4 món cùng lúc được; có đủ bộ thì có nút **Mặc cả bộ**.
- **Câu chuyện:** khu "Noe đang mặc" không ghi hướng dẫn mà kể chuyện có cảm xúc. Chưa mặc gì: Noe thấy trống trải, rủ người học học để có sao mua đồ. Mỗi món có một câu chuyện riêng (hiện khi xem, khi mua, và khi đang mặc món vừa mặc gần nhất); mặc đủ bộ thì kể chuyện cả bộ.
- **Vé giữ chuỗi ngày** (25 sao): hôm nào không học thì lần học sau Noe tự dùng vé, mỗi ngày lỡ một vé, chuỗi không mất.
- **Huy hiệu 11 nấc ánh sáng**, tính theo tổng sao kiếm được ở **mọi khoá** (100 buổi khoảng 500 sao, tối đa ước 1.000–1.500): Đốm sáng nhỏ 10 · Đom đóm 30 · Ngọn nến 75 · Ngọn đèn 150 · Đống lửa trại 250 · Ngôi sao 400 · Vầng trăng 600 · Mặt trời 900 · Hố đen 1300 · Thiên hà 1800 · Vụ nổ Big Bang 2500 (Hố đen trước Thiên hà vì hố đen chỉ là một phần nằm giữa thiên hà) (11 nấc; Hố đen và Big Bang có màn ăn mừng riêng: hạt sáng bị hút xoáy vào tâm; chớp trắng, rung màn hình, sóng cầu vồng, tiếng bùm). Mỗi nấc một hình riêng (vẽ phẳng, `hinhHuyHieu` trong `app/web/noe.js`). Ở trang chủ khoá, ngay dưới nút Cửa hàng có **nút Huy hiệu thành tích** (cùng dáng nút Cửa hàng: hình nấc cao nhất đã đạt và số nấc trên 9); bấm vào mới mở bảng 11 nấc. **Ba nấc cao mở khoá nền bản đồ học riêng**: Hố đen (nấc 9, 1.300 sao: vòng sáng cam tím, sao bị hút), Thiên hà (nấc 10, 1.800 sao: xoắn ốc tím hồng, tinh vân), Vụ nổ Big Bang (nấc 11, 2.500 sao: tia nhiều màu, đốm sáng, thiên hà nhỏ). Ba nền mang **màu galaxy** (tím than, tím hồng, xanh vũ trụ) và **phân cấp rõ**, nấc càng cao càng nhiều lớp: Hố đen có 1 lớp bụi sao, 2 quầng màu, khung viền cam tím 3px; Thiên hà thêm dải Ngân Hà chéo, 2 lớp sao, 3 quầng, khung tím hồng xanh 4px; Big Bang thêm tia cầu vồng toả từ đỉnh bản đồ, 3 lớp sao (có sao nhiều màu), 4 quầng, khung cầu vồng 5px. Đồ vật vẫn vẽ khối phẳng kiểu Noe, tĩnh (không chuyển động) cho nhẹ máy. Khi dùng nền huy hiệu, cạnh chữ "Bản đồ học của bạn" có nhãn nhỏ hình huy hiệu và "Nấc 9/10/11". Dưới bảng nấc có mục "Nền bản đồ học của nấc cao": ô xem trước nền, đạt nấc thì bấm **Dùng nền này** / **Bỏ nền** ngay tại đó, chưa đạt thì hiện ổ khoá. Máy chủ chỉ cho dùng khi tổng sao đạt mốc hoặc mốc đó đã có trong `huy_hieu` (`NEN_HUY_HIEU` trong `app/server.py`). Trong Cửa hàng, **Vé giữ chuỗi ngày** đứng ngay dưới khu "Noe đang mặc", trước các bộ sưu tập; thứ tự ô: Phụ kiện thường ngày, Bộ trang phục chủ đề (hai ô này đứng đầu, mỗi ô một nền riêng: bạc hà chấm bi, xanh tím sọc chéo hồng), rồi Áo dài, Pháp sư, Không gian, Xuân, Hạ, Thu, Đông, Hoàng gia.
- **Chuỗi ngày** (thay chuỗi tuần từ 19/11/2026): ngày nào học xong ít nhất một buổi (hoặc một lượt ôn) là giữ chuỗi; chung cho mọi khoá.
- Sao là phần thưởng cho việc hiểu và nhớ, không bán, không đổi ra tiền.

## 6. Ranh giới và an toàn

- Noe **không** chẩn đoán, không khuyên về thuốc, sức khoẻ tâm thần, pháp lý, tài chính cá nhân.
- Nếu người học viết điều cho thấy **nguy hiểm tới bản thân hoặc người khác**, hoặc đang khủng hoảng: Noe dừng bài học, nói chuyện tử tế, và khuyên liên hệ ngay người thân, cơ sở y tế, hoặc gọi **115** (cấp cứu). Với trẻ em: **Tổng đài quốc gia bảo vệ trẻ em 111**. Bản online nên có thêm danh sách đường dây hỗ trợ tâm lý đã kiểm chứng (chưa xác minh, cần tra trước khi đưa vào).
- Câu trả lời cảm xúc là **thông tin nhạy cảm**: chỉ dùng để chỉnh buổi học, không gửi cho ai, người học xoá được, không đưa vào báo cáo cho người khác.
- Người học dưới 16 tuổi: không nhắn ngoài giờ học, không dùng tin hỏi han cá nhân; bản online theo quy định về dữ liệu trẻ em (`docs/tieu-chuan-thong-tin-hoc-vien.md` mục 7).

## 7. Giọng của Noe

- Gọi tên người học, dùng ngôn ngữ người học chọn.
- Câu ngắn, ấm áp, vui vừa đủ. Theo `giong_noe` trong hồ sơ: vui vẻ / nhẹ nhàng / ngắn gọn.
- Thay đổi theo giờ (chào sáng, trưa, tối, "khuya rồi nè" — đã có).
- Không dùng chữ gây áp lực: "phải", "bắt buộc", "đáng lẽ", "lại quên".

## 8. Trong app

**Đã có (19/11/2026):**
1. Hỏi độ khó cuối buổi; lưu `do_kho` trong mỗi phần tử `buoi_da_hoc`. (Hỏi tâm trạng và buổi ngắn đã bỏ ngày 19/11/2026.)
2. Màn trước buổi học: câu chào theo bối cảnh + thẻ nổi bật buổi số mấy, học gì, mục tiêu, lợi ích; bấm Học ngay.
3. Lời chào khi quay lại sau 7 ngày trở lên.
4. Câu tự luận: học viên gõ, hoặc nói thành chữ. **Máy tính** (Chrome, Edge): có nút **Nói** của Noe, nghe tiếng Việt; Noe xin quyền micro một lần rồi nhớ. **Điện thoại:** không có nút Nói, không xin quyền micro; Noe nhắc bấm micro trên bàn phím điện thoại (chủ chốt 24/11/2026).
5. So đáp án câu tự luận làm thử xong: chọn **Học lại bài** (đọc lại rồi kiểm tra) hoặc **Làm bài kiểm tra luôn**.
6. Kết quả buổi lưu ngay khi học xong, trước lúc AI chấm tổng kết: thoát ra giữa chừng không mất tiến trình. Màn chờ ghi "Noe đang chấm điểm và chuẩn bị bài tiếp theo".
7. Lời đáp khi người học khủng hoảng: AI chấm tổng kết trả `an_toan`; `false` thì hiện hộp chỉ đường 115, 111.

**Chưa có:**
1. Thông báo trên trình duyệt / điện thoại, giờ yên lặng, giới hạn số tin.
2. Tin nhắn chủ động khi lỡ 2 buổi, 1 tuần, 3 tuần (cần thông báo ở mục trên).
3. Trang tóm tắt tuần.

## Cập nhật 21/11/2026: bản 2

- Thực hành cuối module: người học **nộp bài** (kể lại, dán kết quả, link), AI xem; đạt mới tính "Làm thật" (`tien-do.json` > `module.<mã>.thuc_hanh`).
- Chặng học xong: nút **Đo cuối chặng** trên bản đồ, làm lại câu đầu vào của các kỹ năng chặng đó, hiện trước → sau (`do-luong.json` > `chang`).
- Học hết lộ trình: **Bài đo cuối lộ trình** theo Hợp đồng đầu ra (`do-luong.json` > `cuoi`). Sau 14 ngày Noe hỏi lại từng việc có dùng được ngoài đời không (`hoi_lai`).
