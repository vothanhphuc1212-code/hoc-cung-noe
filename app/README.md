# App Học cùng Noe

App là nơi hiển thị và giữ việc học. AI của người học (nối vào app) làm việc hỏi, tìm, soạn. Noe là gương mặt của app.

## Mở app
- Windows: bấm đúp `MO-APP.bat`. Lần đầu, nếu chưa có thư viện của Claude, file này tự cài (`pip install -r requirements.txt`).
- Hoặc gõ: `py app/server.py`, trình duyệt tự mở `http://localhost:8765`.
- Cần Python 3.10 trở lên.

## Luồng
1. **Nối AI** (hiện ngay khi mở app):
   - **Liên kết một nút qua OpenRouter** (OAuth PKCE): người học đăng nhập OpenRouter, bấm cho phép, app nhận khoá riêng của họ. Có tìm web.
   - **Dán khoá Claude** (Anthropic API): gọi `claude-opus-5-5` qua thư viện chính thức `anthropic`, công cụ tìm web `web_search_20260209`, bật dự phòng phía máy chủ khi model từ chối (`fallbacks: "default"`). Hiện từng câu Claude đang tìm.
   - **Sao chép và dán** với mọi AI chat (miễn phí).
   - **Claude Code trên máy** (nếu máy có).
   - Không dùng đăng nhập gói Claude Pro/Max: Anthropic không cho app bên thứ ba dùng.
2. **Mục đích**: muốn học gì, danh sách mục đích, mức học (Sơ cấp, Trung cấp, Chuyên sâu), thời gian và điều kiện.
3. **Đang ở đâu**: nút "Lấy dữ liệu từ AI của tôi" (sao chép một câu hỏi qua AI chat, vì trí nhớ của AI chỉ nằm trong khung chat), sửa lại, ô "Tôi muốn bổ sung".
4. **Noe đi tìm**: tìm nguồn trên mạng → mở thử từng link → xếp 3 lộ trình cùng lúc. Màn hình hiện từng bước, từng nơi đang tìm.
5. **Lộ trình**: xem cả 3, chọn một, sửa theo góp ý, miễn trừ trách nhiệm; nhắc lịch (.ics).
6. **Trang chủ, Khoá học của tôi**: hai thanh Tiến độ và Thông tuệ, sao, chuỗi tuần.
7. **Học mỗi ngày**: ôn câu đến hạn, bài Nhanh / Đào sâu, làm thử (tự đánh giá), kiểm tra, câu giải thích bằng lời, nhật ký, bài thực hành cuối module. Module chưa có buổi thì nhờ AI soạn khi học tới.
8. **Noe**: bấm vào thì nhảy, xoay, lắc và nói một câu; làm sai thì giả vờ tức, nổ cái đùng thành pháo giấy rồi lành lại; gọi người học bằng tên.
9. **Mở trên điện thoại**: mở thêm cổng `8766` (http) trong mạng nhà, có mã ghép đôi (cookie), hiện mã QR. Không đưa lên mạng công khai. **Nút Nói trên điện thoại:** bản chạy trên máy (bản GitHub) **tắt sẵn** https cho điện thoại, vì chứng chỉ tự tạo làm điện thoại hiện cảnh báo đỏ. Trên điện thoại nút Nói ẩn đi, học viên gõ hoặc bấm micro trên bàn phím điện thoại; trên máy tính (Chrome, Edge) nút Nói chạy bình thường. Mã https vẫn giữ: đặt biến môi trường `LEWA_HTTPS=1` thì mở cổng `8767` (chứng chỉ tự tạo bằng `openssl`). Bản có micro trên điện thoại sẽ là **bản website** (chứng chỉ thật, làm riêng).

Dữ liệu theo `docs/chuan-du-lieu.md`.

## Ngôn ngữ giao diện
- Nút chọn ngôn ngữ (Tiếng Việt / English) ở góc trên mọi màn; lưu vào `ho-so.md` (`ngon_ngu`) nên AI cũng soạn bài bằng ngôn ngữ đó.
- Trang giới thiệu có bản dịch riêng (`GT` trong `app.js`). Các màn khác dịch tự động lúc hiện ra theo từ điển `web/dich-en.js` (bộ dịch: `web/dich.js`). Thêm chữ mới vào app thì thêm một dòng vào từ điển; `{}` là phần thay đổi (tên, số, ngày).
- Thông báo lỗi từ máy chủ (`server.py`) vẫn là tiếng Việt.

## Cấu trúc
- `server.py`: máy chủ nhỏ; nối AI, chạy việc AI ở luồng nền và báo từng bước, kiểm link, đọc ghi thư mục học.
- `web/`: `index.html`, `app.js`, `style.css`, `noe.js` (vẽ Noe, phản ứng khi bấm, nổ đùng).

## Chưa có
- Kho lộ trình chia sẻ.
- Lịch ôn FSRS (đang dùng bậc cố định).
