# Chuẩn dữ liệu "Hoc cung Noe" (phiên bản 1)

Mọi AI và mọi bản cài của gói đọc, ghi dữ liệu học theo đúng chuẩn này. Nhờ vậy đổi AI (OpenRouter, Claude, ChatGPT…) hay đổi máy, tiến độ vẫn giữ nguyên.

## Hai nơi lưu

| Nơi | Đường dẫn mặc định | Chứa gì | Ai thấy |
|---|---|---|---|
| Thư mục học | Windows, macOS, Linux: `<Tài liệu (Documents)>/Hoc cung Noe/` | Hồ sơ, khoá học, lộ trình, bài, tiến độ | Người học mở được, sao lưu được |
| Thư mục cài đặt | Windows: `%APPDATA%\HocCungNoe\` · macOS: `~/Library/Application Support/HocCungNoe/` · Linux: `~/.config/hoc-cung-noe/` | `cai-dat.json` (cách nối AI), `bi-mat.json` (khoá API) | Chỉ app đọc |

Đổi nơi lưu bằng biến môi trường `LEWA_DATA` và `LEWA_CONFIG`.
**Khoá API không bao giờ nằm trong thư mục học**, không bao giờ gửi ra trình duyệt.

## Thư mục học

```
Hoc cung Noe/
  chuan.json            {"ten": "Hoc cung Noe", "phien_ban": 1}
  ho-so.md              người học: khối YAML + các mục Markdown
  khoa-hoc.json         {"hien_tai": "khoa-1", "ds": [{"ma": "khoa-1", "ten": "..."}]}
  khoa-hoc/<mã khoá>/
    nguon.json · nguon.md            danh sách nguồn đã kiểm
    lo-trinh-3.json                  3 lộ trình: nhanh, can_doi, chuyen_sau
    lo-trinh.json · lo-trinh.md      lộ trình đang học (có miễn trừ trách nhiệm)
    bai/<mã buổi>.json · .md         bài học
    cau-hoi/<mã buổi>.json           câu hỏi
    tien-do.json                     tiến độ, lịch ôn, Thông tuệ theo module
    nhat-ky.md                       mỗi buổi một câu
    lich-hoc.ics                     lịch nhắc
    ho-so-khoa.md                    bản cất ho-so.md của khoá này lúc chuyển sang khoá khác
```

`ho-so.md` ở ngoài luôn là hồ sơ của khoá đang mở (`hien_tai`). Bấm "Bắt đầu khoá học mới" thì app cất `ho-so.md` vào `khoa-hoc/<mã cũ>/ho-so-khoa.md`, tạo khoá mới trắng; "Học tiếp" khoá cũ thì đưa bản cất ra lại. Không file nào bị xoá. `ten_goi` và `ngon_ngu` là của người học nên giữ nguyên qua mọi khoá.

## ho-so.md

Khối YAML: `ten_goi`, `ngon_ngu` (mã: vi, en…), `linh_vuc`, `muc_dich` (danh sách), `cap_do` (`nhanh` | `can-doi` | `chuyen-sau`), `phut_moi_ngay`, `ngay_moi_tuan`, `gio_hoc`, `ngay_hoc` (MO, TU…), `ngan_sach`, `tieng_anh`.
Mục: `## Đích đến (B)`, `## Điểm xuất phát (A)` (gồm `### Về bạn`, `### Đã biết, đã làm`, `### Điểm mạnh, khó khăn`, `### Bổ sung`).

## Lộ trình (lo-trinh.json, mỗi mục trong lo-trinh-3.json)

```json
{"ten": "...", "cap_do": "can-doi", "tuong_duong": "chứng chỉ nghề bậc 3", "thoi_gian": "...", "trang_thai": "da-duyet",
 "chang": [{"ma": "c1", "ten": "...", "xong_khi": "...",
   "module": [{"ma": "m1-1", "ten": "...", "dau_ra": "...", "thuc_hanh": "...", "so_buoi": 4, "nguon": ["N1"],
     "buoi": [{"ma": "m1-1-b1", "ten": "...", "muc_tieu": "...", "loi_ich": "học xong được lợi gì", "nguon": ["N1"]}]}]}]}
```

`buoi` được soạn dần: module nào chưa soạn thì `buoi: []`; nối AI tự động thì máy chủ soạn ngầm buổi 1 ngay khi lộ trình vừa xong (chưa cần duyệt), các module còn lại sau khi duyệt (`docs/quy-trinh-len-lo-trinh.md` mục 5b). `loi_ich` có từ 19/11/2026 (buổi cũ không có thì app lấy đầu ra module); `phut` của buổi cũ không còn dùng. Chỉ dùng mã nguồn có trong `nguon.json` và đã kiểm mở được.

## tien-do.json

```json
{"phien_ban": 1, "chang_hien_tai": "hoc", "buoi_tiep_theo": "m1-1-b1",
 "buoi_da_hoc": [{"ma": "m1-1-b1", "module": "m1-1", "ngay": "2026-11-18", "diem": 2, "tong": 3, "bo_qua_kiem_tra": false, "lam_thu_duoc": true}],
 "sao": 2,
 "lich_on": [{"id_cau_hoi": "m1-1-b1-q1", "bac": 1, "lan_cuoi": "2026-11-18", "han_on": "2026-11-21"}],
 "module": {"m1-1": {"hieu": false, "nho": false, "dung": true, "lam_that": true}}}
```

`chang_hien_tai`: `muc-dich` → `dang-o-dau` → `tim` → `lo-trinh` → `hoc`.

Mỗi phần tử `buoi_da_hoc` có thêm `tong_ket`: mức hiểu do AI chấm phần tổng kết của người học (`dung`, `dung-mot-phan`, `chua-dung`, hoặc `null` nếu bỏ qua).
Mỗi phần tử `buoi_da_hoc` còn có: `do_kho` (`de`, `vua`, `kho` hoặc `null`), `sai` (mã các câu kiểm tra làm sai). Buổi được ghi ngay khi học xong với `tong_ket: null`, AI chấm xong thì điền `tong_ket`. Dữ liệu cũ có thể còn `tam_trang`, `buoi_ngan`, `chuoi_tuan`, `tuan_gan_nhat_dat`: không còn dùng (bỏ hỏi tâm trạng, chuyển sang chuỗi ngày ngày 19/11/2026).
`buoc_tao`: câu đang tới khi tạo khoá (mỗi trang một câu). Mã buổi Trung cấp bắt đầu bằng `tc-`, Chuyên sâu bằng `cs-` (Sơ cấp giữ nguyên) để tiến độ mỗi cấp tách riêng.
**Sao:** `sao` = sao vàng (mỗi câu kiểm tra đúng 1 sao, kiểm tra cố định 5 câu), `sao_on` = sao xanh (mỗi câu ôn đầu buổi đúng 1 sao, tối đa 3). Mỗi phần tử `buoi_da_hoc` có `sao_on` của buổi đó. Một buổi tối đa 5 vàng + 3 xanh. **`Hoc cung Noe/noe.json`** (chung cho mọi khoá): `da_dung` (số sao đã dùng), `do` (đồ đã có), `dang_mac` (các món đang mặc, cách nhau dấu phẩy, ví dụ `vuong-mien,ao-choang-do,truong-vang`; mỗi chỗ một món, app lo việc thay món cùng chỗ), `mac_cuoi` (món vừa mặc gần nhất, để kể chuyện), `ve` (vé giữ chuỗi ngày), `huy_hieu` (mốc đã nhận, 11 nấc: 10, 30, 75, 150, 250, 400, 600, 900, 1300, 1800, 2500; dữ liệu cũ có thể còn 50, 100, 500, 1000, vô hại), `chuoi_ngay` (số ngày học liên tiếp), `ngay_dat` (ngày gần nhất có học), `chuoi_dai_nhat`, `nen` (nền bản đồ học đang dùng: mã bộ sưu tập như `phap-su`, `xuan`, chỉ dùng được khi có đủ bộ; hoặc nền huy hiệu `ho-den`, `thien-ha`, `big-bang`, chỉ dùng được khi tổng sao đạt 1300, 1800, 2500 hoặc mốc đó có trong `huy_hieu`; để trống là nền thường). `/api/trang-thai` trả thêm `nen_huy_hieu` (mã nền → mốc sao). Mua cả bộ gửi `{"mua_bo": "xuan"}`. Ví sao = tổng `sao` + `sao_on` mọi khoá − `da_dung`. Giá do máy chủ giữ (`/api/noe`). Học xong gửi `{"hoc_xong": "YYYY-MM-DD"}`: máy chủ cộng chuỗi ngày, lỡ ngày thì tự dùng vé (mỗi ngày lỡ một vé).
`nhip`: mức nhịp người học đã đồng ý (-1 chậm, 0 bình thường, 1 nhanh). `soan_lai`: mã các buổi cần soạn lại theo mức mới. Xem `docs/quy-trinh-len-lo-trinh.md` mục 5.
`hoc_lai`: danh sách các lần học lại, cùng dạng với `buoi_da_hoc` (`ma`, `module`, `ngay`, `diem`, `tong`, `lam_thu_duoc`, `tong_ket`). Học lại không thêm lịch ôn. Học lại với bộ câu hỏi mới (`cau_moi: true`) thì được thêm phần sao còn thiếu, tối đa 5 sao mỗi buổi.

Mốc Thông tuệ của module tính trên **kết quả tốt nhất** của mỗi buổi (lần đầu hoặc các lần học lại):
- `hieu`: trung bình tỉ lệ đúng ≥ 80% và không buổi nào có tổng kết tốt nhất là `chua-dung`.
- `dung`: buổi nào cũng có ít nhất một lần làm thử được.

## Bài học (bai/<mã buổi>.json)

```json
{"tieu_de": "...", "nguon": ["N1"], "mo_dau": "tình huống mở bài", "loi_ich": "học xong bạn ...",
 "y_chinh": [{"tieu_de": "...", "noi_dung": "1–3 câu ngắn", "vi_du": "..."}],
 "nguyen_ly": [{"ten": "...", "noi_dung": "1–2 câu"}],
 "dao_sau": "...", "tom_tat": ["..."],
 "lam_thu": {"trac_nghiem": [...], "de": "...", "goi_y": ["..."], "dap_an_mau": "..."},
 "cau_hoi": [...], "giai_thich_bang_loi": {"de": "...", "y_can_co": ["..."]},
 "buoi_ten": "...", "module": "m1-1", "nhip": 0}
```

Từ 19/11/2026 bài chia **ý chính** (`y_chinh`) và **nguyên lý** đóng khung (`nguyen_ly`); bài cũ chỉ có `nhanh` (một đoạn) và `vi_du` vẫn đọc được. `nhip`: mức nhịp lúc soạn, để biết bài có cần soạn lại sau khi người học đồng ý đổi mức không.

## Hai thanh

- **Tiến độ** = số buổi đã học / tổng số buổi (module chưa soạn tính theo `so_buoi`).
- **Thông tuệ** = tổng số mốc đạt / (4 × số module). Bốn mốc mỗi module:
  - `hieu`: học xong module, đúng ≥ 80% câu kiểm tra.
  - `nho`: ôn đúng một câu của module sau ít nhất 3 ngày.
  - `dung`: mọi bài làm thử của module được người học tự đánh giá "làm được".
  - `lam_that`: làm xong bài thực hành cuối module.
  Đầy 100% nghĩa là đạt trình độ ghi ở `tuong_duong` của lộ trình đang học.

## Lịch ôn

Bậc 0..5 tương ứng 1, 3, 7, 14, 30, 60 ngày. Đúng lên một bậc, sai về bậc 0. (Thuật toán FSRS sẽ thay ở phiên bản sau, giữ nguyên các trường.)

## Lịch nhắc (tien-do.json → `lich`, file lich-hoc.ics)

```json
"lich": {"ngay": ["TU", "TH", "SA"], "gio": "20:00", "tu_ngay": "2026-11-18", "buoi_dau": "2026-11-19",
         "so_buoi": 4, "ket_thuc": "2026-11-26", "lan": 2, "tao_luc": "2026-11-18", "hoan": null}
```

- `lich-hoc.ics` là MỘT chuỗi lặp hằng tuần **có điểm dừng**: `COUNT` = số buổi còn lại lúc tạo. Không bao giờ lặp vô hạn.
- `UID` cố định theo khoá (`lich-<mã khoá>@hoc-cung-noe`), `SEQUENCE` = `lan`, tăng mỗi lần tạo lại.
- Tạo lại khi: người học đổi ngày giờ; lỡ buổi (từ `tu_ngay` tới hôm qua, số buổi lịch hẹn > số buổi đã học); lịch đã hết mà còn buổi. App báo trên trang chủ, nút "Dời lịch" xếp các buổi còn lại từ hôm nay (hoặc từ mai nếu hôm nay đã học hay đã qua giờ). `hoan` = ngày người học bấm "Để mai".
- File lịch nhập vào ứng dụng lịch không tự cập nhật được, nên khi tạo lại, app nhắc xoá chuỗi cũ (Xoá → Tất cả sự kiện) rồi nhập file mới.

## Google Lịch (tuỳ chọn)

- Quyền xin: chỉ `https://www.googleapis.com/auth/calendar.app.created` (tạo lịch riêng "Học cùng Noe" và sửa sự kiện trong lịch đó; không đọc lịch khác).
- Đăng nhập: OAuth cho ứng dụng máy tính, PKCE, quay về `http://127.0.0.1:<cổng>/ket-noi/google/xong`.
- `bi-mat.json` → `google`: `client_id`, `client_secret` (mã app Google loại Desktop app), `refresh_token`, `lich_id`, `mui_gio`. Không gửi ra trình duyệt; `/api/trang-thai` chỉ trả `co_ma_app`, `da_noi`.
- `tien-do.json` → `lich.google_su_kien`: mã chuỗi sự kiện đang dùng. Mỗi lần tạo lại lịch: chuỗi cũ đã bắt đầu thì dừng ở hôm qua (`UNTIL`), chưa bắt đầu thì xoá; rồi tạo chuỗi mới `COUNT` = số buổi còn lại, nhắc trước 10 phút. `lich.tu_dong`: ngày app đã tự dời (mỗi ngày tối đa một lần).
- Đã nối Google: lỡ buổi, hết lịch hoặc học xong thì trang chủ tự dời, không cần bấm. Chưa nối: hiện thẻ "Dời lịch" và file .ics như cũ.
- Thử không cần Google thật: biến môi trường `LEWA_GOOGLE_AUTH`, `LEWA_GOOGLE_TOKEN`, `LEWA_GOOGLE_API`, `LEWA_GOOGLE_REVOKE` trỏ sang máy giả.

## Cập nhật 21/11/2026: tệp mới trong thư mục khoá học

- `muc-tieu.json`: `lam_ro`, `hop_dong[]` (`ma` D1…, `lam_duoc`, `cach_do`, `cap`), `khung`, `ky_nang[]` (`ma` KN1…, `ten`, `cap`, `can_truoc`, `phuc_vu`), `xac_nhan` (ngày), `ai`.
- `do-luong.json`: `chang.<mã chặng>` (`truoc`, `sau`: `dung`, `tong`), `cuoi` (`dat`, `tong`, `theo_viec`), `hoi_lai` (`ngay`, `tra_loi`).
- Lộ trình thêm `bai_do_cuoi`, `tu_soat`, `kiem`; module thêm `ky_nang`; nguồn thêm `ky_nang`, `kiem_noi_dung`, `ly_do_bo`; bài học thêm `kiem_dap_an`; `dau-vao.json` thêm `cau`, `ai`. Lưu qua `POST /api/luu` (`ten`: `muc-tieu` hoặc `do-luong`).
