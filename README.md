# Learn Everything with AI · Học mọi thứ cùng AI

Gói mã nguồn công khai, dùng miễn phí, giúp bất kỳ ai đang dùng AI tự học một lĩnh vực mới, có lộ trình rõ ràng và có người bạn học đi cùng mỗi ngày.

Linh vật: **Noe**, một đốm sáng nhỏ. Học càng chắc, Noe càng sáng.

> Trạng thái: **bản dùng thử.** App đã chạy được trọn: tạo khoá, lộ trình 3 cấp, học mỗi ngày, sao, nhắc lịch. Gặp lỗi thì mở mục Issues trên GitHub.

## Cài và mở (không cần biết lập trình)

1. **Tải gói:** trên trang GitHub này bấm nút xanh **Code** → **Download ZIP**, rồi giải nén ra một thư mục (ví dụ Desktop).
2. **Cài Python 3.10 trở lên** (chỉ làm một lần): vào https://www.python.org/downloads/, tải bản mới nhất. Khi cài, **nhớ tick ô "Add Python to PATH"**.
3. **Mở app:**
   - Windows: bấm đúp file `MO-APP.bat`. Lần đầu máy tự cài thư viện cần thiết, rồi trình duyệt tự mở Noe.
   - Mac/Linux: mở Terminal trong thư mục gói, gõ `python3 app/server.py`.
4. **Nối AI** ngay trong app (xem mục dưới), rồi trả lời vài câu để Noe xếp lộ trình cho bạn.

Muốn tắt app thì đóng cửa sổ đen (Windows) hoặc bấm Ctrl+C trong Terminal.

## Gói làm gì

| Chặng | Việc | Ai làm |
|---|---|---|
| B. Đích đến | Hỏi bạn muốn học gì, học xong làm được gì, học tới cấp nào (Sơ cấp, Trung cấp, Chuyên sâu) | AI hỏi, bạn trả lời |
| A. Điểm xuất phát | Hỏi bạn đã biết gì, làm bài kiểm tra đầu vào ngắn | AI hỏi, bạn trả lời |
| C1. Nghiên cứu nguồn | Tìm nguồn uy tín theo 4 tầng, mở thử từng link, ghi ngày kiểm | AI |
| C2. Dựng lộ trình | Chia chặng, module, buổi học, ghi nguồn từng bài | AI soạn, bạn duyệt |
| D. Học mỗi ngày | Ôn, học bài, làm thử, kiểm tra 3–5 câu, ghi lại 1 câu | Bạn học, Noe đi cùng |
| E. Chỉnh lộ trình | Sai nhiều thì ôn thêm, đúng nhiều thì đi nhanh hơn | AI đề xuất, bạn duyệt |

## Chạy ở đâu

Trên máy của bạn, trong một app mở bằng trình duyệt. Bấm đúp `MO-APP.bat` (Windows) hoặc gõ `py app/server.py`. Mọi việc diễn ra trong app, xem `app/README.md`.

Mở app là nối AI trước. Các cách nối:
- **Sao chép và dán** với AI chat bạn đang có (ChatGPT, Gemini, Claude trên web): miễn phí, không cần khoá.
- **Liên kết một nút qua OpenRouter**, hoặc **khoá miễn phí** của Google Gemini, Groq.
- **Dán khoá API** của Claude, OpenAI, Gemini, DeepSeek, Groq, OpenRouter.
- **Ollama, LM Studio** chạy AI ngay trên máy bạn.
- **Claude Code** nếu máy đã cài.

Nhắc lịch: tải file lịch (.ics) để thêm vào điện thoại; nối Google Lịch là tuỳ chọn (cần tự tạo mã app Google, xem `docs/google-lich.md`).

Dữ liệu học nằm ở `Tài liệu/Hoc cung Noe/` theo `docs/chuan-du-lieu.md`; khoá API nằm riêng trong thư mục cài đặt của app. Gói không gửi dữ liệu học của bạn về cho ai; trình duyệt chỉ tải phông chữ từ Google Fonts và thư viện vẽ mã QR từ cdnjs (hai nơi này thấy địa chỉ mạng của bạn, không thấy dữ liệu học).

## Bản quyền Noe

Tên và hình linh vật **Noe** có giấy phép riêng, xem `linh-vat/GIAY-PHEP-NOE.md`.

## Cấu trúc

```
CLAUDE.md                 lời dặn cho AI khi làm việc trong gói này
.claude/skills/           6 kỹ năng: hỏi B, hỏi A, nghiên cứu nguồn, dựng lộ trình, dạy buổi học, chỉnh lộ trình
docs/                     luật bản quyền và dẫn nguồn, định dạng thư mục học, bộ tiêu chuẩn 5 giai đoạn:
                            tieu-chuan-thong-tin-hoc-vien.md · quy-trinh-tim-nguon.md
                            quy-trinh-len-lo-trinh.md · quy-trinh-dong-hanh.md
mau/hoc-cua-toi/          mẫu các file học (chép ra để bắt đầu)
tools/kiem_link.py        mở thử từng link trong danh sách nguồn, ghi kết quả và ngày kiểm
app/                      app học trên máy
linh-vat/                 bản vẽ và bộ cảm xúc của Noe
```

## Nguyên tắc

1. **Luôn dẫn nguồn.** Mỗi bài, mỗi lộ trình ghi rõ học từ đâu, bấm vào là tới. Link nào chưa mở thử được thì ghi "(chưa xác minh)".
2. **Không chép.** AI học ý tưởng, kiến thức, cách sắp xếp lộ trình từ nhiều nơi, rồi tự viết bài bằng lời mới. Chỉ dẫn link tới nguồn chính chủ. Xem `docs/luat-ban-quyen-va-dan-nguon.md`.
3. **AI gợi ý, không làm hộ.** Khi bạn làm bài, AI hỏi gợi mở trước, đưa đáp án sau.
4. **Thưởng khi hiểu, không thưởng vì ngồi lâu.**
5. **Dữ liệu của bạn ở máy bạn.**

## Miễn trừ trách nhiệm

Lộ trình do AI tổng hợp để tư vấn, có thể có sai sót hoặc nguồn đã thay đổi. Hãy đọc kỹ và tự kiểm tra các nguồn trước khi học theo. Bạn có thể điều chỉnh lộ trình bất cứ lúc nào.

## English (short)

Learn Everything with AI is a free, source-available, local-first kit that turns the AI you already use into a study partner: it asks where you want to go and where you are now, researches reputable sources (with checked, dated links), builds a roadmap at one of three depths, and studies with you every day alongside Noe, a small glowing mascot. Usable preview: open MO-APP.bat (Windows) or run `python3 app/server.py`, then connect your AI in the app. Needs Python 3.10+.

## Giấy phép

**PolyForm Noncommercial 1.0.0** (xem `LICENSE.md`). Nói ngắn gọn:

| Được làm (miễn phí) | Không được làm (khi chưa xin phép) |
|---|---|
| Tải về, dùng để tự học, học cùng gia đình, bạn bè | Bán gói này, hoặc bán bản đã sửa |
| Dùng ở trường học, thư viện, tổ chức phi lợi nhuận, cơ quan nhà nước | Dùng trong khoá học, dịch vụ, app thu tiền |
| Đọc mã, sửa theo ý mình, chia sẻ lại miễn phí (kèm giấy phép này) | Công ty dùng để kiếm tiền, kể cả dùng nội bộ |

Muốn dùng vào việc kinh doanh: mở một Issue trong kho GitHub này để xin phép tác giả.

Đây là giấy phép "mã nguồn công khai" (source-available), không phải "mã nguồn mở" theo định nghĩa OSI, vì có hạn chế dùng thương mại.

**English:** PolyForm Noncommercial License 1.0.0. Free for personal, educational, charitable and government use; commercial use requires permission from the author (open an Issue).
