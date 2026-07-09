# SZERP Scanner App

App WebView nhẹ cho máy scan Honeywell (Android 4.4+), giúp xuất kho vải mộc
ngay tại chỗ mà không cần quay về PC.

## Cách app hoạt động

1. Chọn 1 trong 3 IP máy chủ (167 / 162 / 152) → bấm **"Vào ERP"** → trang
   `login.htm` hiện ra y hệt PC, mỗi nhân viên tự đăng nhập bằng tài khoản
   riêng (app không lưu, không tự điền tài khoản/mật khẩu nào cả).
2. Sau khi login, vào tay menu **坯布出库 (Xuất kho vải mộc)** như bình thường
   (bước này hiện tại vẫn thao tác tay 1 lần mỗi phiên vì cấu trúc menu dùng
   cây YUI phức tạp, tự động hoá không chắc ăn 100% nếu chưa test trực tiếp
   trên máy thật).
3. Ngay khi vào tới màn hình đó, app tự động:
   - **Ẩn bảng danh sách pallet** (`#jsontb`), thay bằng 1 ô **quét mã pallet**
     to, dễ bấm.
   - Máy scan Honeywell quét mã → gõ thẳng vào ô đó → Enter (cơ chế bàn phím
     phần cứng, không cần can thiệp gì thêm) → app tìm đúng dòng pallet có
     `TRAYNO` trùng mã vừa quét, rồi **kích hoạt lại đúng hàm click gốc của
     ERP** (không viết lại logic nghiệp vụ) → bảng chi tiết, nút xuất
     kho/lưu/xóa hiện ra như khi bấm tay vào dòng đó.
4. Nút **"Quét nhanh"** phóng to khung danh sách pallet (đã đơn giản hoá)
   lên toàn màn hình, tạm ẩn phần layout ERP gốc cho đỡ rối trên màn hình bé.
   Bấm lại để quay về layout ERP đầy đủ (nếu cần sửa tay).
5. Nút **"Thoát"** (và cả khi tắt app / bị hệ thống dọn khỏi Recents) sẽ tự
   xoá sạch cookie + session + cache → nhân viên sau mở app phải đăng nhập
   lại, không dính tên nhân viên của người trước.

## Build ra file APK (không cần Android Studio / PC)

Vì máy tính công ty không có mạng và bạn chỉ thao tác trên điện thoại, dùng
**GitHub Actions** để build APK trên cloud:

1. Tạo 1 repo GitHub mới (vd `szerp-scanner`), qua app GitHub hoặc trình
   duyệt điện thoại.
2. Upload toàn bộ nội dung thư mục này lên repo (giữ nguyên cấu trúc thư mục,
   kể cả `.github/workflows/build-apk.yml`).
3. Vào tab **Actions** của repo → workflow **"Build APK"** sẽ tự chạy sau khi
   push, hoặc bấm **Run workflow** để chạy tay.
4. Đợi build xong (vài phút) → vào lại workflow run đó → mục **Artifacts**
   → tải file `szerp-scanner-debug-apk` (file zip chứa `app-debug.apk`).
5. Giải nén, chuyển file `.apk` vào máy scan Honeywell, bật
   **"Cài từ nguồn không xác định"** trong Settings, rồi cài như bình thường.

## Cần bạn xác nhận / chỉnh lại nếu thao tác thực tế không giống

- Nếu ô quét không nhận đúng mã (do cấu trúc bảng `#jsontb` / tên cột khác
  với bản ERP đã save), gửi lại mình đoạn HTML mới nhất của khung danh sách
  pallet lúc đó để chỉnh `inject.js`.
- Việc tự động nhảy thẳng vào menu 坯布出库 sau login có thể làm được tiếp
  (dò đúng chuỗi hàm JS của cây menu YUI), nhưng cần bạn lấy giúp source của
  trang ngay sau khi bấm vào menu đó lần đầu (View source / save as) để mình
  biết chính xác URL/action được gọi.
