# VH Investigation — prototype

Website phụ trợ cho bộ case file **Vínculo Humano**. Bản này giữ nguyên UI/giao diện demo mới nhất, bao gồm background X-ray, hồ sơ đỏ, tờ giấy, ghim và chat với đồng điều tra viên.

## Chạy thử

- Mở `index.html` trên trình duyệt, hoặc
- Chạy `python -m http.server 8000` ở thư mục dự án và mở `http://localhost:8000`.

Đây là **website tĩnh** (HTML/CSS/JavaScript), không cần cài npm hay build.

## Cấu trúc

- `index.html`: màn hình và cấu trúc giao diện.
- `styles.css`: toàn bộ style responsive.
- `app.js`: gameplay mẫu, chat, gợi ý, lưu tiến trình trong trình duyệt.
- `assets/`: hình ảnh gốc nhúng trong bản HTML, được tách thành file độc lập.
- `vercel.json`: cấu hình cho Vercel.

## Thiết lập GitHub → Vercel

1. Tạo **private repository** có tên `vh-investigation` trên GitHub (không thêm README vì thư mục này đã có).
2. Đưa toàn bộ các file trong thư mục này lên nhánh `main`. Nếu dùng Git:

   ```bash
   git init
   git add .
   git commit -m "Initial VH investigation prototype"
   git branch -M main
   git remote add origin https://github.com/USERNAME/vh-investigation.git
   git push -u origin main
   ```

3. Trên Vercel: **Add New → Project → Import Git Repository → chọn `vh-investigation`**.
4. Framework Preset: **Other**. Không cần Build Command; không đặt Output Directory.
5. Deploy. Mỗi commit push vào `main` sẽ tự cập nhật Vercel khi kết nối Git thành công.

## Lưu ý quan trọng trước khi phát hành

- Nội dung câu hỏi và lời giải hiện là **demo**, chưa phải logic VH chính thức.
- `app.js` có chứa đáp án mẫu. Vì game chạy client-side, người chơi có thể xem đáp án qua mã nguồn. Với phiên bản phát hành, cần chuyển xác thực đáp án sang backend/serverless.
- Repo private **không** đồng nghĩa website Vercel tự động private. Nếu chưa muốn cho người chơi thấy, bật Deployment Protection trước khi chia sẻ URL.
- Tiến trình hiện lưu ở `localStorage` của từng trình duyệt. Chưa đồng bộ giữa thiết bị.
