# Định dạng thư mục học

Mỗi người học có một thư mục `hoc-cua-toi/`. AI viết, app đọc, người học đọc được bằng mắt. Mẫu nằm ở `mau/hoc-cua-toi/`.

```
hoc-cua-toi/
  ho-so.md          điểm B (đích đến) và điểm A (xuất phát)
  nguon.md          danh sách nguồn đã kiểm
  lo-trinh.md       chặng → module → buổi học
  bai/              mỗi buổi học một file .md
  cau-hoi/          mỗi buổi học một file .json câu hỏi
  tien-do.json      chặng hiện tại, buổi đã học, điểm, lịch ôn
  nhat-ky.md        mỗi buổi một dòng "hôm nay mình hiểu được gì"
```

Ngày luôn viết `YYYY-MM-DD`. Mã định danh chỉ dùng chữ thường không dấu, số và gạch nối.

## ho-so.md

Phần đầu là khối thông tin (YAML) để app đọc, phần dưới là chữ cho người đọc.

```yaml
---
ten_goi: Việt                     # người học muốn được gọi là gì
ngon_ngu: vi
linh_vuc: Công nghệ thông tin nền tảng
muc_tieu: Vận hành được hệ thống công nghệ cho doanh nghiệp
cap_do: chuyen-sau                # nhanh | nen-tang | chuyen-sau
han_chot: 2030-12-31              # có thể để trống
phut_moi_ngay: 120
ngay_moi_tuan: 6
gio_hoc: "20:00"
ngan_sach: mien-phi               # mien-phi | <số tiền mỗi tháng>
can_bang_cap: false
thich_hoc_bang: [video, lam-thu]
thiet_bi: [may-tinh, dien-thoai]
---
```

Bên dưới có các mục: `## Đích đến (B)`, `## Điểm xuất phát (A)`, `## Kỹ năng con tự chấm` (bảng: kỹ năng, mức 0–3, ghi chú), `## Kết quả kiểm tra đầu vào`, `## Ghi chú động lực`.

Mức tự chấm: 0 chưa nghe tên · 1 biết tên · 2 làm được khi có hướng dẫn · 3 tự làm được.

## nguon.md

Một bảng duy nhất, đúng thứ tự cột như `docs/luat-ban-quyen-va-dan-nguon.md` mục 6:

```
| Mã | Tên | Link | Ai làm | Tầng | Cấp | Tiếng | Phí | Ngày kiểm | Vì sao chọn |
```

`tools/kiem_link.py` đọc bảng này, mở thử cột Link, ghi lại cột Ngày kiểm. Link hỏng thì cột Ngày kiểm ghi `LOI <mã lỗi>`.

## lo-trinh.md

```markdown
---
ten: Lộ trình Công nghệ nền tảng
cap_do: chuyen-sau
bat_dau: 2026-12-01
phut_moi_buoi: 120
trang_thai: cho-duyet            # cho-duyet | da-duyet
---

# Chặng 1: Làm quen {#c1}
Xong khi: tự giải thích được máy tính, internet, tên miền.

## Module 1.1: Máy tính hoạt động thế nào {#m1-1}
- Đầu ra: vẽ được sơ đồ CPU, RAM, ổ cứng và giải thích bằng lời
- Số buổi: 4
- Nguồn chính: N1, N3

### Buổi 1: CPU, RAM, ổ cứng {#m1-1-b1}
- Bài: bai/m1-1-b1.md
- Câu hỏi: cau-hoi/m1-1-b1.json
- Nguồn: N1
```

Cuối file luôn có mục `## Miễn trừ trách nhiệm` với đoạn văn chuẩn.

Mã: chặng `c<số>`, module `m<chặng>-<số>`, buổi `m<chặng>-<số>-b<số>`.

## bai/<mã buổi>.md

```markdown
---
ma: m1-1-b1
tieu_de: CPU, RAM, ổ cứng
phut: 45
nguon: [N1]
---

## Nhanh
(3–6 câu: ý chính, một ví dụ đời thường. Người học muốn nhanh chỉ cần đọc phần này.)

## Đào sâu
(giải thích đầy đủ, hình tự vẽ, ví dụ thêm)

## Làm thử
(bài tập nhỏ; AI chỉ gợi ý, không làm hộ)

## Tóm tắt cần nhớ
- ...

## Nguồn
- N1: <tên> — <link>
```

## cau-hoi/<mã buổi>.json

```json
{
  "ma_buoi": "m1-1-b1",
  "cau_hoi": [
    {
      "id": "m1-1-b1-q1",
      "loai": "chon",
      "de": "Bộ phận nào giữ dữ liệu khi tắt máy?",
      "lua_chon": ["RAM", "Ổ cứng", "CPU"],
      "dap_an": 1,
      "giai_thich": "RAM mất dữ liệu khi tắt điện; ổ cứng thì không.",
      "ky_nang": "phan-cung-co-ban"
    },
    {
      "id": "m1-1-b1-q2",
      "loai": "tu-luan",
      "de": "Giải thích bằng lời của bạn: vì sao máy nhiều RAM chạy nhiều chương trình mượt hơn?",
      "y_can_co": ["RAM là chỗ làm việc tạm", "nhiều RAM thì ít phải đổi dữ liệu ra ổ cứng"],
      "ky_nang": "phan-cung-co-ban"
    }
  ]
}
```

`loai`: `chon` (app tự chấm), `tu-luan` (AI chấm theo `y_can_co`), `doc-to` (đọc to, dùng cho học ngôn ngữ).

## tien-do.json

```json
{
  "phien_ban": 1,
  "chang_hien_tai": "B",
  "buoi_tiep_theo": null,
  "buoi_da_hoc": [],
  "sao": 0,
  "chuoi_tuan": 0,
  "tuan_gan_nhat_dat": null,
  "ky_nang": {},
  "lich_on": []
}
```

- `buoi_da_hoc`: mỗi phần tử `{"ma": "m1-1-b1", "ngay": "2026-12-01", "diem": 4, "tong": 5, "bo_qua_kiem_tra": false}`.
- `ky_nang`: `{"phan-cung-co-ban": {"da_hoc": true, "nam_chac": false}}`. "Nắm chắc" chỉ bật khi làm đúng bài ôn sau ít nhất 3 ngày.
- `lich_on`: mỗi phần tử `{"id_cau_hoi": "...", "han_on": "2026-12-04", "the_fsrs": {...}}`. Lịch ôn tính bằng thuật toán FSRS (giai đoạn 2).
- Thanh tiến độ: "Đã học" = số buổi đã học / tổng số buổi; "Nắm chắc" = số kỹ năng nắm chắc / tổng số kỹ năng.

## nhat-ky.md

```
- 2026-12-01 · m1-1-b1 · Hôm nay mình hiểu RAM là bàn làm việc, ổ cứng là tủ hồ sơ.
```
