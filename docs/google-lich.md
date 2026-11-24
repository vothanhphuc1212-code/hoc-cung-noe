# Nối Google Lịch: cho người làm gói

Mục tiêu: học viên chỉ bấm **Nối Google Lịch → chọn Gmail → Cho phép**. Không phải tạo gì trên Google Cloud.

## Cách hoạt động
- App xin đúng một quyền `https://www.googleapis.com/auth/calendar.app.created`. Google Cloud xếp quyền này vào nhóm **không nhạy cảm** (kiểm ngày 18/11/2026 trên trang Accès aux données của dự án).
- App tạo một lịch riêng "Học cùng Noe", ghi chuỗi buổi học có điểm dừng, tự dời khi lỡ buổi, đổi lịch, học xong.
- Đăng nhập kiểu ứng dụng máy tính: PKCE, quay về `http://127.0.0.1:<cổng>/ket-noi/google/xong`.

## Mã app gói sẵn
- File `app/google-app.json` (mẫu: `app/google-app.mau.json`): `client_id`, `client_secret` của mã loại **Desktop app** thuộc dự án Google Cloud của gói.
- Google ghi rõ ứng dụng máy tính không giữ bí mật được mã `client_secret`, nên mã này được phép đi kèm app; an toàn dựa vào việc mỗi người phải tự bấm Cho phép bằng tài khoản của họ.
- Có file này thì màn Nhắc lịch chỉ hiện 3 bước và nút Nối. Không có file thì hiện hướng dẫn tạo mã riêng (6 bước) và ô dán mã.
- Mã riêng người học tự dán (lưu trong `bi-mat.json`) được ưu tiên hơn mã gói sẵn.
- Máy học viên chỉ lưu `refresh_token`, `lich_id`, `mui_gio` của chính họ, không chép mã gói sẵn.

## Đưa dự án Google lên chế độ chính thức (Publish)
Ở chế độ Test: chỉ người dùng thử (tối đa 100) dùng được, quyền hết hạn sau 7 ngày. Muốn mở cho mọi người:
1. Đăng một trang chủ và một trang chính sách riêng tư của bạn lên một địa chỉ công khai (Google đòi khi xét duyệt), có email liên hệ.
2. Google Cloud → Google Auth Platform → **Branding**: điền Trang chủ, Chính sách riêng tư, thêm tên miền vào Domaines autorisés.
3. **Audience** → **Publier l'application** (Publish app).
4. Không tải logo lên màn đồng ý nếu chưa muốn qua bước xác minh thương hiệu (Google ghi: tải logo thì phải xác minh, trừ khi app ở chế độ Test hoặc chỉ dùng nội bộ).
5. Thử lại bằng một Gmail khác (không phải người dùng thử).

Chưa xác minh: quyền không nhạy cảm và không có logo thì Google có bắt xác minh thương hiệu hay không. Kiểm lại ở mục Centre de validation sau khi Publish.

## Thử không cần Google thật
Biến môi trường: `LEWA_GOOGLE_AUTH`, `LEWA_GOOGLE_TOKEN`, `LEWA_GOOGLE_API`, `LEWA_GOOGLE_REVOKE` (máy giả), `LEWA_GOOGLE_APP` (file mã gói sẵn khác).
