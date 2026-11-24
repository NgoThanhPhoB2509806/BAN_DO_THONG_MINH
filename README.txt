BẢN ĐỒ 3D KHU 2 - ĐẠI HỌC CẦN THƠ (BẢN ĐÃ CHỈNH LẠI MẠNG ĐƯỜNG)

Các cập nhật trong bản này:
- Căn chỉnh lại toàn bộ mạng lưới đường nội bộ theo đúng hệ tọa độ các tòa nhà & ảnh vệ tinh Khu 2 ĐHCT (khắc phục lỗi đường cắt xuyên qua tòa nhà do lệch hệ tọa độ `mapPoint` trước đó).
- Bổ sung Bùng binh (vòng xuyến) trung tâm nối trục Cổng A - Vườn bàng - Nhà điều hành - Trường CNTT&TT - Khoa KHTN.
- Kết nối chuẩn xác cả 3 cổng (Cổng A, Cổng B, Cổng C) vào các trục đường chính dẫn tới Hội trường Rùa, Nhà học B1, Trường Nông nghiệp, KTX A/B...
- Nối mượt điểm xuất phát và điểm đến vào mạng lưới giao thông khi tìm đường bằng thuật toán A*.
- Sửa lỗi lặp khung tìm đường trong giao diện sidebar (`index.html` & `style.css`).

Cách chạy:
1. Cài Python và Flask: pip install flask
2. Mở terminal tại thư mục dự án (`ctu_khu2_3d`).
3. Chạy: python server.py
4. Mở trình duyệt tại http://127.0.0.1:5000
