# Build APK bằng GitHub Actions (build trên cloud, máy không nóng)

Cách này: bạn chỉ upload code lên GitHub qua trình duyệt điện thoại — việc
biên dịch (compile) diễn ra trên máy chủ của GitHub, KHÔNG chạy trên điện
thoại bạn, nên không nóng máy, không tốn pin.

## Bước 1 — Tạo tài khoản GitHub (nếu chưa có)
Vào https://github.com/signup bằng trình duyệt điện thoại, đăng ký (miễn phí).

## Bước 2 — Tạo repository mới
1. Bấm nút "+" góc trên phải → "New repository"
2. Đặt tên, ví dụ: `scannerapp`
3. Chọn **Private** (để không ai ngoài công ty xem được code/URL nội bộ)
4. Bấm "Create repository"

## Bước 3 — Upload các file
Trong repo vừa tạo, bấm "Add file" → "Upload files".
Bạn cần upload đúng theo cấu trúc thư mục sau (bấm "Add file" nhiều lần,
mỗi lần cho từng thư mục, hoặc nếu trình duyệt hỗ trợ kéo cả thư mục thì
kéo nguyên thư mục `gh-project` này vào):

```
build.gradle
settings.gradle
gradle.properties
app/build.gradle
app/src/main/AndroidManifest.xml
app/src/main/java/com/sonycab/scannerapp/MainActivity.java
app/src/main/res/drawable/ic_launcher.xml
.github/workflows/build.yml
```

Lưu ý: GitHub web upload tự tạo thư mục theo đường dẫn nếu bạn gõ path đầy đủ
vào ô tên file lúc kéo thả — hoặc dùng app "Working Copy" / "GitHub Mobile"
để upload cả cây thư mục dễ hơn.

## Bước 4 — Chờ build tự động chạy
Sau khi bạn upload xong và commit (bấm "Commit changes"), GitHub Actions sẽ
tự động chạy vì có file `.github/workflows/build.yml`.

1. Vào tab **"Actions"** trên đầu trang repo
2. Sẽ thấy 1 job đang chạy (chấm vàng xoay) tên "Build APK"
3. Đợi khoảng 3-6 phút cho tới khi chấm chuyển thành ✔ xanh

## Bước 5 — Tải APK về
1. Bấm vào job vừa chạy xong (dòng có dấu ✔ xanh)
2. Kéo xuống mục **"Artifacts"** ở cuối trang
3. Bấm tải **"app-debug-apk"** (file .zip chứa app-debug.apk bên trong)
4. Giải nén, lấy file `app-debug.apk`, chép qua máy scan (Bluetooth/thẻ nhớ/USB)
   và cài như bình thường.

## Sau này muốn sửa code / build lại
Chỉ cần sửa trực tiếp file trên GitHub (bấm vào file → nút bút chì "Edit") rồi
Commit — GitHub Actions tự động build lại bản mới, không cần làm lại từ đầu.

## Vì sao cách này không làm nóng máy?
Toàn bộ Gradle, Android SDK, quá trình biên dịch chạy trên server Ubuntu của
GitHub (miễn phí cho repo cá nhân, ~2000 phút/tháng). Điện thoại bạn chỉ
đóng vai trò gửi code lên và tải file .apk kết quả về — không có tiến trình
nặng nào chạy trên máy.
