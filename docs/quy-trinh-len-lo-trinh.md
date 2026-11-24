# Quy trình lên lộ trình

Giai đoạn 4 trong phương pháp 5 giai đoạn của Learn Everything with AI. Bản 1, 19/11/2026.

Đầu vào: hồ sơ người học (`docs/tieu-chuan-thong-tin-hoc-vien.md`) và danh sách nguồn đã chốt (`docs/quy-trinh-tim-nguon.md`).
Đầu ra: 3 lộ trình (Sơ cấp, Trung cấp, Chuyên sâu) theo định dạng `lo-trinh-3.json` trong `docs/chuan-du-lieu.md`.

Quy trình này làm theo cách một **nhà thiết kế chương trình đại học** làm việc, kết hợp những gì **khoa học về việc học** đã chứng minh. Mỗi quy tắc có ghi tên phương pháp gốc để người đọc tự tìm hiểu thêm.

## 1. Mười bước dựng một lộ trình

### Bước 1. Viết đầu ra cuối trước (Thiết kế ngược)
Bắt đầu từ **"học xong làm được gì"**, không bắt đầu từ "học những gì". Đầu ra cuối = mục đích người học + mức tương đương trong khung chuẩn (ví dụ "Bậc 1 (A1) Khung năng lực ngoại ngữ 6 bậc", "Chuẩn kỹ năng CNTT cơ bản").
*Gốc: Understanding by Design, Wiggins & McTighe, 1998.*

### Bước 2. Chọn cách đo đầu ra
Với mỗi đầu ra, viết **bằng chứng** cho thấy người học đã đạt: làm được sản phẩm gì, trả lời được loại câu hỏi nào. Bài kiểm tra và bài thực hành phải đo **đúng** đầu ra đó.
*Gốc: Constructive Alignment, Biggs, 1996: mục tiêu, hoạt động học và cách đánh giá phải khớp nhau.*

### Bước 3. Vẽ bản đồ kỹ năng con và thứ tự học trước sau
Tách đầu ra thành **kỹ năng con** (lấy từ khung chuẩn). Với mỗi kỹ năng: cần biết gì trước. Kỹ năng nền xếp trước. Người học đã biết (theo bài kiểm tra đầu vào) thì rút gọn hoặc bỏ qua.

### Bước 4. Chia chặng, mỗi chặng kết bằng một sản phẩm thật
Chặng là một mốc người học **thấy được mình đã làm ra gì**: một đoạn tự giới thiệu ghi âm, một trang web nhỏ, một bảng tính chi tiêu. `xong_khi` của chặng ghi đúng sản phẩm đó.
*Gốc: học qua dự án (Project-based learning); First Principles of Instruction, Merrill, 2002: học tốt nhất khi giải quyết vấn đề thật.*

### Bước 5. Chia module, mỗi module một đầu ra đo được
- Mỗi module có `dau_ra` viết bằng **động từ làm được**, theo thang Bloom: nhớ → hiểu → áp dụng → phân tích → đánh giá → sáng tạo. Không dùng "biết", "nắm được" (không đo được). Dùng "kể ra", "giải thích", "dùng ... để ...", "so sánh", "tự làm ...".
- Sơ cấp dừng chủ yếu ở **hiểu, áp dụng**; Trung cấp tới **phân tích**; Chuyên sâu tới **đánh giá, sáng tạo**.
- Mỗi module có `thuc_hanh` cuối module: một việc làm thật, nhỏ, làm được trên thiết bị người học có.
*Gốc: thang Bloom bản sửa đổi, Anderson & Krathwohl, 2001.*

### Bước 6. Chia buổi vừa sức
- Mỗi buổi **2–4 ý mới**, không hơn. Buổi càng ngắn thì càng ít ý.
- Ý khó: có **ví dụ giải sẵn từng bước** trước, rồi mới cho tự làm.
- Mỗi buổi là **một bài ngắn học trong vài phút** (đọc vài ý chính, làm thử, kiểm tra 5 câu). App không ghi thời lượng buổi; `phut_moi_ngay` chỉ dùng cho lịch nhắc.
*Gốc: Cognitive Load Theory, Sweller, 1988 (trí nhớ làm việc có hạn); Worked example effect.*

### Bước 7. Mỗi buổi đi theo một khung cố định
App đã dùng khung 5 phần, ứng với 9 bước dạy của Gagné (1965) rút gọn:

| Phần trong app | Việc | Vì sao |
|---|---|---|
| Khởi động ôn | 1–3 câu ôn bài cũ đến hạn | Gợi lại kiến thức nền, nhớ lâu hơn |
| Bài chính | Mở bằng **một vấn đề, một câu hỏi thật**, rồi mới giảng. Chia **2–4 ý chính**, mỗi ý một tiêu đề và 1–3 câu ngắn, ví dụ gần đời người học; **1–2 nguyên lý quan trọng** đóng khung; **Tóm tắt cần nhớ** (quan trọng nhất) làm nổi bật; **Đào sâu** gấp lại cho ai muốn hiểu kỹ; **Nguồn** cuối bài | Gây chú ý, ít chữ dễ đọc, cho biết học để làm gì |
| Làm thử | 2–3 câu trắc nghiệm tình huống (không tính sao) + 1 câu tự luận ngắn 1–2 câu (gõ hoặc nói); gợi ý từng bước, đáp án mẫu sau, rồi chọn **Học lại bài** hoặc **Làm bài kiểm tra luôn**. Việc dài làm ngoài app để ở thực hành cuối module | Học bằng làm, không chỉ đọc; trên điện thoại không phải gõ dài |
| Kiểm tra | 3–5 câu, có câu giải thích bằng lời | Tự nhớ lại là cách học mạnh nhất |
| Ghi lại | Một câu "hôm nay mình hiểu được gì", AI chấm đúng chưa | Tự giải thích giúp hiểu sâu |

### Bước 8. Xếp ôn giãn cách và học xen kẽ
- Câu kiểm tra vào **lịch ôn giãn cách** (app: 1, 3, 7, 14, 30, 60 ngày). Ôn đúng lúc sắp quên nhớ lâu hơn học dồn.
- Từ module thứ 2 trở đi, bài làm thử **trộn một ít** kiến thức module trước, để người học phải tự nhận ra dùng cái gì.
- Chủ đề lớn được **quay lại ở mức sâu hơn** ở chặng sau (học xoắn ốc), không học một lần rồi thôi.
*Gốc: Spacing effect, Cepeda và cộng sự, 2006; Testing effect, Roediger & Karpicke, 2006; Interleaving, Rohrer & Taylor, 2007; Spiral curriculum, Bruner, 1960; tổng hợp: Dunlosky và cộng sự, 2013, "Improving Students' Learning With Effective Learning Techniques".*

### Bước 9. Học chắc rồi mới đi tiếp
Module chỉ tính là xong khi đạt mốc Hiểu (kiểm tra đúng từ 80%, tổng kết không bị "chưa đúng"). Chưa đạt thì có đường **học lại**, không bị phạt.
*Gốc: Mastery learning, Bloom, 1968.*

### Bước 10. Gắn nguồn và kiểm cả lộ trình
- Mỗi module, mỗi buổi ghi mã nguồn (`nguon`), chỉ dùng mã có trong danh sách đã kiểm.
- Kiểm cả lộ trình theo bảng ở mục 3.
- Cuối lộ trình luôn có đoạn **miễn trừ trách nhiệm** (`docs/luat-ban-quyen-va-dan-nguon.md` mục 8).

## 2. Chống nhàm chán: 8 quy tắc

Dựa trên **Thuyết Tự quyết** (Self-Determination Theory, Deci & Ryan, 1985 và 2000): người ta muốn học tiếp khi được **tự chọn**, thấy **mình giỏi lên**, và **có người đồng hành**. Cộng thêm mô hình **ARCS** của Keller (1987): Chú ý, Liên quan, Tự tin, Hài lòng.

1. **Mở bằng vấn đề thật.** Mỗi buổi bắt đầu bằng một tình huống người học có thể gặp ngoài đời, không bắt đầu bằng định nghĩa.
2. **Liên quan tới chính người học.** Ví dụ lấy từ công việc, sở thích, mục đích trong hồ sơ.
3. **Cho tự chọn.** Chọn 1 trong 3 lộ trình, chọn ví dụ, chọn bài thực hành, đổi lộ trình bất cứ lúc nào.
4. **Khó vừa sức.** "Hơi quá sức một chút": làm được khi có gợi ý. Quá dễ thì chán, quá khó thì nản. Kết quả kiểm tra cao liên tục thì đi nhanh hơn; thấp liên tục thì thêm ví dụ, chia nhỏ hơn.
   *Gốc: Vùng phát triển gần, Vygotsky; trạng thái Flow, Csikszentmihalyi, 1990; Desirable difficulties, Bjork, 1994.*
5. **Thắng sớm.** Buổi đầu tiên phải có một việc người học làm được ngay, nhất là người ít tự tin.
6. **Tiến bộ nhìn thấy được.** Hai thanh Tiến độ và Thông tuệ, sao, sản phẩm cuối chặng, Noe sáng dần.
7. **Đổi nhịp.** Không 3 buổi liền cùng một kiểu. Xen đọc, xem, làm, nói, viết.
8. **Kể chuyện.** Cả lộ trình có một mạch: người học đi từ đâu tới đâu, mỗi chặng là một bước trên đường đó. Noe là bạn đồng hành, không phải giáo viên chấm điểm.

## 3. Bảng kiểm trước khi đưa người học duyệt

- [ ] Đầu ra cuối khớp mục đích người học và có mức tương đương trong khung chuẩn.
- [ ] Mỗi chặng có `xong_khi` là một sản phẩm thật.
- [ ] Mỗi module có `dau_ra` dùng động từ đo được và có `thuc_hanh`.
- [ ] Thứ tự module đúng quan hệ học trước sau.
- [ ] Phần người học đã biết được rút gọn hoặc bỏ.
- [ ] Tổng thời gian khớp `phut_moi_ngay` × số buổi mỗi tuần × số tuần, và khớp `han_chot` nếu có.
- [ ] Sơ cấp / Trung cấp / Chuyên sâu khác nhau thật về độ sâu, không chỉ khác số buổi.
- [ ] Mọi mã nguồn có trong danh sách đã kiểm; không nguồn trả phí khi người học chỉ học miễn phí.
- [ ] Có đoạn miễn trừ trách nhiệm.

## 4. Ba cấp khác nhau thế nào

Định nghĩa theo chủ dự án (19/11/2026). Mã trong dữ liệu giữ như cũ: `nhanh` = Sơ cấp, `can-doi` = Trung cấp, `chuyen-sau` = Chuyên sâu.

| | Sơ cấp: **xài được** | Trung cấp: **xài tốt** | Chuyên sâu: **cấp chuyên gia** |
|---|---|---|---|
| Giống như | Khoá ngắn | Trung cấp nghề | Đào tạo đại học |
| Mục tiêu | Biết thuật ngữ, thông tin cơ bản, hiểu nguyên lý để vận dụng nhanh | Cân đối hiểu và làm; làm được một kỹ năng, một việc của nghề ở mức cơ bản | Đào sâu mọi thứ liên quan tới ngành; nhiều module, nhiều giáo trình, ghép nối toàn bộ nguyên lý |
| Ví dụ IT | Biết IT là gì, ở đâu, các thuật ngữ cơ bản | Bắt đầu tự làm, xài được công cụ cơ bản | Học xong lập trình được |
| Ví dụ ứng dụng AI | Hiểu thuật ngữ, làm được việc cơ bản với AI | Hiểu và xài ở mức sâu hơn | Trở thành chuyên gia |
| Mức Bloom chủ yếu | Hiểu, áp dụng | Áp dụng, phân tích | Phân tích, đánh giá, sáng tạo |
| Khung chuẩn | Bậc đầu của khung | Bậc giữa | Bậc cao, có lý thuyết nền |
| Sản phẩm cuối chặng | Nhỏ, làm trong 1 buổi | Vừa, làm trong vài buổi | Dự án lớn, có báo cáo |

Thời gian cụ thể (bao nhiêu tuần, tháng) AI tính theo thời gian học của người học, không ghi cứng.

**Ba lộ trình riêng, đổi qua lại được.** Mỗi cấp có mã buổi riêng (Trung cấp thêm `tc-`, Chuyên sâu thêm `cs-` trước mã) nên tiến độ mỗi cấp giữ riêng. Trang chủ có 3 nút cấp; chuyển cấp thì lộ trình đang học (có các buổi đã soạn) được cất lại đúng cấp của nó.

## 5. Khi nào chỉnh mức độ và lộ trình

**Nguyên tắc (theo ý chủ dự án, 19/11/2026):** app tự **đánh giá**, rồi **hỏi người học**. Người học bấm **Đồng ý** thì mới **nâng** hoặc **hạ** mức độ, gộp buổi, thêm buổi ôn. Không bao giờ tự đổi khi chưa hỏi, không trừ sao, không chê.

Cuối mỗi buổi, người học chấm **Dễ quá / Vừa / Khó quá**. App ghép với điểm kiểm tra (**cao** = đúng từ 80%):

| Người học chấm | Điểm cao | Điểm thấp |
|---|---|---|
| **Dễ quá** | Hỏi: "Bạn đã nắm chắc kiến thức chưa? Nâng mức cho các buổi sau?" | Không đổi mức. Báo: các câu sai được ôn sớm và gợi lại ở buổi sau |
| **Vừa** | Không đổi | Không đổi (câu sai vẫn được ôn) |
| **Khó quá** | Hỏi: "Hạ mức cho các buổi sau?" (thêm ví dụ, chia ý nhỏ, 5 phút gợi lại ý nền) | Hỏi hạ mức như bên trái |

Bỏ qua kiểm tra hoặc không chấm độ khó thì không đề xuất gì.

**Mức nhịp** (`nhip` trong `tien-do.json`): -1 chậm, 0 bình thường, +1 nhanh. Mỗi lần đồng ý đổi một bậc. Đồng ý đổi mức thì buổi kế tiếp đã soạn sẵn được **soạn lại** theo mức mới (`soan_lai`).

**Cấp module (luôn hỏi):**
- Đã ở nhịp nhanh mà **3 buổi liền** "dễ + điểm cao" → hỏi gộp 2 buổi kế tiếp thành 1.
- **2 buổi liền** "khó + điểm thấp" → hỏi thêm 1 buổi ôn ngay sau buổi vừa học (mã `<module>-on<n>`).

**Lời dặn AI khi soạn bài** chỉ đổi theo mức người học đã đồng ý, cộng thêm các câu sai buổi trước (để gợi lại).

## 5b. Soạn ngầm ở máy chủ (cho nhanh)

Chỉ khi nối AI tự động (không phải sao chép và dán). App soạn sẵn lời dặn rồi gửi lên `/api/soan-ngam`; máy chủ xếp hàng chạy từng việc, ghi kết quả vào đúng thư mục khoá học lúc gửi. Người học thoát ra, tắt tab vẫn chạy tiếp; việc đã xong hoặc đang chờ thì bỏ qua (gọi lại không tốn lượt AI).
- **Lộ trình vừa xong, chưa duyệt** (người học còn đang đọc): soạn sẵn NGAY **buổi 1 của lộ trình đang chọn** (module 1 chưa có buổi thì soạn danh sách buổi rồi soạn luôn bài 1), để duyệt xong bấm Học là vào học luôn, không phải đợi. Danh sách buổi soạn lúc này được ghi vào cả `lo-trinh.json` và `lo-trinh-3.json`; khi app gửi lộ trình lên (`/api/lo-trinh`, `/api/lo-trinh-3`) máy chủ giữ các buổi đã soạn, chỉ khi cùng mã VÀ cùng tên module (AI sửa lộ trình làm module đổi thì không dính buổi cũ).
- **Duyệt lộ trình xong** (bài 1 của lộ trình vừa chọn được đưa lên đầu hàng; và mỗi lần đổi cấp, mỗi lần về trang chủ): soạn sẵn **bài số 1** (bài kế tiếp) trước, rồi **danh sách buổi của mọi module chưa soạn**. Module kế tiếp chưa có buổi thì soạn module xong soạn luôn bài đầu của module đó.
- **Mở một buổi học** (bài của buổi đó đã có): gửi soạn ngay **buổi SAU nó** lên đầu hàng (module sau chưa có danh sách buổi thì soạn module rồi soạn luôn bài đầu). Người học đọc bài, làm thử, làm kiểm tra mất vài phút, học xong thì bài sau thường đã sẵn.
- **Màn kết quả:** nút **Học buổi tiếp theo**. Bài sau còn đang soạn thì nút mờ, ghi "Noe đang soạn bài kế tiếp…"; soạn xong nút tự sáng lên, bấm là vào học. Soạn lỗi thì nút vẫn bấm được để Noe soạn tiếp.
- **Học xong một buổi:** lưu kết quả ngay, rồi **trong lúc AI chấm tổng kết** máy chủ soạn ngầm bài kế tiếp. Người học đồng ý đổi mức thì bài kế tiếp được soạn lại theo mức mới (`nhip` ghi trong bài).
- Bấm vào học mà bài chưa xong: màn chờ hiện nhật ký soạn, xong là vào học; lỗi thì báo và cho thử lại.

**Khác:**
- Lỡ lịch nhiều → đề xuất giảm số buổi mỗi tuần.
- Người học đổi mục đích, đổi thời gian → dựng lại từ bước 1.

## Cập nhật 21/11/2026: bản 2

- Lời dặn thêm quy tắc 9–13: module gắn `ky_nang`; `bai_do_cuoi` đo mọi việc trong Hợp đồng đầu ra tới cấp đó; ba cấp nối tiếp (cấp sau bao trùm cấp trước); ưu tiên [NGUỒN CHÍNH]; `tu_soat` đủ 9 mục của bảng kiểm mục 3.
- Nối tự động: xếp lần lượt Sơ cấp → Trung cấp → Chuyên sâu, cấp sau nhận tóm tắt cấp trước. **Code kiểm** (`kiemLoTrinh` / `kiem_lo_trinh`) mỗi cấp; có lỗi thì nhờ AI sửa đúng lỗi đó một lần; ghi `kiem` (lỗi ban đầu, lỗi còn lại). Màn lộ trình có thẻ "Noe đã soát" và bài đo cuối.
- Bài học: câu kiểm tra gắn `ky_nang`; máy chủ nhờ AI thứ hai giải lại, sửa đáp án sai, bỏ câu mơ hồ (`kiem_dap_an`).
