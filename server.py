from flask import Flask, send_from_directory, jsonify

app = Flask(__name__, static_folder='.', static_url_path='')

# Dữ liệu 33 phân khu, trường, khoa, viện, tòa nhà & tiện ích Khu 2 ĐH Cần Thơ (Cập nhật thực tế)
BUILDINGS_DATA = [
    # --- NHÓM KÝ TÚC XÁ & CÁC TRƯỜNG/KHOA PHÍA BẮC / ĐÔNG BẮC ---
    {"id": 1, "name": "Ký túc xá B", "category": "Ký túc xá", "x": -115, "z": -130, "w": 65, "d": 38, "h": 18, "color": "#d1d5db", "desc": "Khu nội trú sinh viên phía Tây Bắc."},
    {"id": 2, "name": "Trường Thủy sản", "category": "Trường", "x": -45, "z": -135, "w": 58, "d": 35, "h": 16, "color": "#0ea5e9", "desc": "Đào tạo và nghiên cứu lĩnh vực nuôi trồng, chế biến thủy sản."},
    {"id": 3, "name": "Trường Bách khoa", "category": "Trường", "x": 20, "z": -115, "w": 38, "d": 34, "h": 18, "color": "#ea580c", "desc": "Trường Bách khoa (tiền thân là Khoa Công nghệ) - Khối ngành kỹ thuật, cơ khí, điện tử, xây dựng."},
    {"id": 4, "name": "Ký túc xá A", "category": "Ký túc xá", "x": 145, "z": -105, "w": 62, "d": 48, "h": 20, "color": "#cbd5e1", "desc": "Khu nội trú sinh viên phía Đông Bắc."},

    # --- NHÓM PHÍA TÂY & TRUNG TÂM TRÊN ---
    {"id": 5, "name": "Viện Nghiên cứu Phát triển ĐBSCL", "category": "Viện nghiên cứu", "x": -115, "z": -95, "w": 42, "d": 22, "h": 12, "color": "#f8fafc", "desc": "Nghiên cứu phát triển kinh tế - xã hội Đồng bằng sông Cửu Long."},
    {"id": 6, "name": "Khoa Môi trường và Tài nguyên thiên nhiên", "category": "Trường / Khoa", "x": -175, "z": -60, "w": 22, "d": 34, "h": 14, "color": "#15803d", "desc": "Nằm ở góc cực Tây của Khu 2."},
    {"id": 7, "name": "Khu Nhà lưới", "category": "Khu thực nghiệm", "x": -105, "z": -45, "w": 36, "d": 42, "h": 8, "color": "#f59e0b", "desc": "Khu thực nghiệm nông nghiệp công nghệ cao."},
    {"id": 8, "name": "Trường Nông nghiệp", "category": "Trường", "x": -45, "z": -45, "w": 66, "d": 48, "h": 16, "color": "#4d7c0f", "desc": "Khu vực giảng đường, phòng thí nghiệm và trại thực nghiệm Nông nghiệp."},
    {"id": 9, "name": "Nhà học B1", "category": "Nhà học", "x": 22, "z": -78, "w": 38, "d": 20, "h": 16, "color": "#dc2626", "desc": "Tòa nhà học tập chung B1."},
    {"id": 10, "name": "Nhà thi đấu cũ", "category": "Thể chất", "x": 55, "z": -78, "w": 20, "d": 18, "h": 12, "color": "#eab308", "desc": "Nhà tập luyện thể dục thể thao."},
    {"id": 11, "name": "Nhà thi đấu mới", "category": "Thể chất", "x": 95, "z": -82, "w": 46, "d": 24, "h": 16, "color": "#facc15", "desc": "Nhà thi đấu đa năng quy mô lớn."},

    # --- NHÓM TRUNG TÂM & PHÍA ĐÔNG ---
    {"id": 12, "name": "Trường Công nghệ Thông tin và Truyền thông", "category": "Trường", "x": 45, "z": -35, "w": 44, "d": 38, "h": 18, "color": "#fde047", "desc": "Đào tạo CNTT, Kỹ thuật phần mềm, Mạng máy tính & Truyền thông."},
    {"id": 13, "name": "Văn phòng Đoàn trường", "category": "Hành chính", "x": 42, "z": -18, "w": 16, "d": 14, "h": 10, "color": "#1e3a8a", "desc": "Văn phòng Đoàn Thanh niên - Hội Sinh viên trường."},
    {"id": 14, "name": "Nhà học C1", "category": "Nhà học", "x": 58, "z": -8, "w": 26, "d": 12, "h": 14, "color": "#06b6d4", "desc": "Khu giảng đường C1."},
    {"id": 15, "name": "Trường Khoa học Tự nhiên", "category": "Trường", "x": 98, "z": -25, "w": 44, "d": 62, "h": 18, "color": "#3b6998", "desc": "Đào tạo Toán, Lý, Hóa, Sinh học."},
    {"id": 16, "name": "Trường Kinh tế", "category": "Trường", "x": 155, "z": -45, "w": 48, "d": 38, "h": 16, "color": "#10b981", "desc": "Đào tạo Quản trị kinh doanh, Tài chính, Kế toán, Kinh tế."},
    {"id": 17, "name": "Khoa Khoa học Chính trị", "category": "Trường / Khoa", "x": 142, "z": -8, "w": 22, "d": 22, "h": 14, "color": "#fde047", "desc": "Đào tạo Triết học, Chính trị học, Giáo dục công dân."},

    # --- NHÓM TÂY NAM & NAM TRUNG TÂM ---
    {"id": 18, "name": "Khoa Dự bị Dân tộc", "category": "Trường / Khoa", "x": -110, "z": -5, "w": 26, "d": 14, "h": 12, "color": "#db2777", "desc": "Hệ dự bị đại học dân tộc."},
    {"id": 19, "name": "Trường Sư phạm", "category": "Trường", "x": -85, "z": 5, "w": 22, "d": 28, "h": 16, "color": "#ea580c", "desc": "Đào tạo giáo viên các bậc học."},
    {"id": 20, "name": "Nhà học C2", "category": "Nhà học", "x": -65, "z": 0, "w": 16, "d": 22, "h": 14, "color": "#facc15", "desc": "Khu giảng đường C2."},
    {"id": 21, "name": "THPT Thực hành Sư phạm", "category": "Trường học", "x": -105, "z": 22, "w": 24, "d": 16, "h": 14, "color": "#bbf7d0", "desc": "Trường Trung học phổ thông Thực hành Sư phạm."},
    {"id": 22, "name": "Hội trường Rùa", "category": "Hội trường", "x": -22, "z": 18, "w": 22, "d": 18, "h": 12, "color": "#0284c7", "isRound": True, "desc": "Biểu tượng kiến trúc hình mai rùa, nơi tổ chức các sự kiện lớn."},
    {"id": 23, "name": "Khoa Luật", "category": "Trường / Khoa", "x": -42, "z": 48, "w": 20, "d": 14, "h": 14, "color": "#dc2626", "desc": "Đào tạo Cử nhân Luật học, Luật Kinh tế."},
    {"id": 24, "name": "Trung tâm Ngoại ngữ", "category": "Trung tâm", "x": -44, "z": 62, "w": 16, "d": 14, "h": 12, "color": "#2563eb", "desc": "Đào tạo và tổ chức thi chứng chỉ ngoại ngữ."},

    # --- NHÓM KHU VỰC NHÀ ĐIỀU HÀNH & CỔNG A, B, C ---
    {"id": 25, "name": "Nhà điều hành (Tòa nhà trung tâm)", "category": "Hành chính", "x": 45, "z": 45, "w": 30, "d": 36, "h": 26, "color": "#f1f5f9", "desc": "Trụ sở Ban Giám hiệu và các phòng ban chức năng."},
    {"id": 26, "name": "Giảng đường D2", "category": "Nhà học", "x": 45, "z": 24, "w": 26, "d": 10, "h": 14, "color": "#e2e8f0", "desc": "Khu phòng học D2 phía sau Nhà điều hành."},
    {"id": 27, "name": "Giảng đường D1 & Khoa Sau đại học", "category": "Trường / Khoa", "x": 45, "z": 66, "w": 28, "d": 12, "h": 14, "color": "#ffffff", "desc": "Quản lý đào tạo Thạc sĩ, Tiến sĩ và khu giảng đường D1."},
    {"id": 28, "name": "Trung tâm Học liệu (LRC)", "category": "Thư viện", "x": 78, "z": 60, "w": 22, "d": 28, "h": 20, "color": "#94a3b8", "desc": "Thư viện hiện đại 4 tầng phục vụ học tập và nghiên cứu."},
    {"id": 29, "name": "Vườn bàng & Công viên cây xanh", "category": "Cảnh quan", "x": 112, "z": 26, "w": 30, "d": 24, "h": 3, "color": "#166534", "desc": "Không gian xanh thư giãn đặc trưng của sinh viên CTU."},
    {"id": 30, "name": "Khu phòng học A3", "category": "Nhà học", "x": 106, "z": 58, "w": 24, "d": 16, "h": 12, "color": "#fdba74", "desc": "Dãy phòng học A3 gần Cổng A."},
    {"id": 31, "name": "Khoa Khoa học Xã hội và Nhân văn", "category": "Trường / Khoa", "x": 135, "z": 58, "w": 22, "d": 18, "h": 15, "color": "#f472b6", "desc": "Đào tạo Văn học, Du lịch, Xã hội học, Thông tin - Thư viện."},

    # --- CÁC TÒA NHÀ HIỆN ĐẠI MỚI HOÀN THIỆN (THAY THẾ CÁC KHU ĐANG XÂY DỰNG CŨ) ---
    {"id": 32, "name": "Viện Sinh học và Thực phẩm & Tòa nhà Phức hợp", "category": "Viện / Tòa nhà phức hợp", "x": -45, "z": -95, "w": 58, "d": 26, "h": 22, "color": "#0d9488", "desc": "Tổ hợp Viện Công nghệ Sinh học và Thực phẩm cùng Tòa nhà Phức hợp nghiên cứu - thí nghiệm hiện đại phía Nam Trường Thủy sản."},
    {"id": 33, "name": "Tòa nhà Công nghệ cao", "category": "Tòa nhà Công nghệ cao", "x": -8, "z": 58, "w": 34, "d": 36, "h": 24, "color": "#6366f1", "desc": "Tòa nhà Công nghệ cao (ATL) hiện đại nằm tại khu vực mặt tiền đường 3/2, giữa Cổng B và Cổng C."}
]

GATES_DATA = [
    {"name": "Cổng A", "x": 92, "z": 84, "color": "#ef4444"},
    {"name": "Cổng B (Cổng chính)", "x": 18, "z": 84, "color": "#eab308"},
    {"name": "Cổng C", "x": -56, "z": 84, "color": "#3b82f6"},
]


@app.route("/")
def index():
    return send_from_directory('.', 'index.html')

@app.route("/api/map-data")
def get_map_data():
    return jsonify({
        "buildings": BUILDINGS_DATA,
        "gates": GATES_DATA
    })

if __name__ == "__main__":
    print("Đang khởi chạy Bản đồ 3D Khu 2 ĐH Cần Thơ tại: http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
