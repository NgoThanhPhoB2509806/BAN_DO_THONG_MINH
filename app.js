let scene, camera, renderer, controls;
let buildingMeshes = [];
let buildingsData = [];
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedMesh = null;
let routeGroup = null;
let roadGraph = new Map();
let gatesData = [];
let pointerDownPosition = null;
let mapPointerMoved = false;
const ROUTE_Y = 1.35;
const REFERENCE_CAMERA_ASPECT = 1.5;
let viewportCameraScale = 1;
const buildingMaterials = {
    glass: new THREE.MeshStandardMaterial({ color: 0x5d91ac, roughness: 0.25, metalness: 0.25 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.72 }),
    roof: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.82 }),
    door: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.48 }),
    dome: new THREE.MeshStandardMaterial({ color: 0xdbeafe, roughness: 0.42, metalness: 0.12 })
};

// Dữ liệu đầy đủ 33 khu vực đã cập nhật thực tế hiện tại
const FALLBACK_DATA = {
    buildings: [
        {"id": 1, "name": "Ký túc xá B", "category": "Ký túc xá", "x": -115, "z": -130, "w": 65, "d": 38, "h": 18, "color": "#d1d5db", "desc": "Khu nội trú sinh viên phía Tây Bắc."},
        {"id": 2, "name": "Trường Thủy sản", "category": "Trường", "x": -45, "z": -135, "w": 58, "d": 35, "h": 16, "color": "#0ea5e9", "desc": "Đào tạo và nghiên cứu lĩnh vực nuôi trồng, chế biến thủy sản."},
        {"id": 3, "name": "Trường Bách khoa", "category": "Trường", "x": 20, "z": -115, "w": 38, "d": 34, "h": 18, "color": "#ea580c", "desc": "Trường Bách khoa (tiền thân là Khoa Công nghệ) - Khối ngành kỹ thuật, cơ khí, điện tử, xây dựng."},
        {"id": 4, "name": "Ký túc xá A", "category": "Ký túc xá", "x": 145, "z": -105, "w": 62, "d": 48, "h": 20, "color": "#cbd5e1", "desc": "Khu nội trú sinh viên phía Đông Bắc."},
        {"id": 5, "name": "Viện Nghiên cứu Phát triển ĐBSCL", "category": "Viện nghiên cứu", "x": -115, "z": -95, "w": 42, "d": 22, "h": 12, "color": "#f8fafc", "desc": "Nghiên cứu phát triển kinh tế - xã hội Đồng bằng sông Cửu Long."},
        {"id": 6, "name": "Khoa Môi trường và Tài nguyên thiên nhiên", "category": "Trường / Khoa", "x": -175, "z": -60, "w": 22, "d": 34, "h": 14, "color": "#15803d", "desc": "Nằm ở góc cực Tây của Khu 2."},
        {"id": 7, "name": "Khu Nhà lưới", "category": "Khu thực nghiệm", "x": -105, "z": -45, "w": 36, "d": 42, "h": 8, "color": "#f59e0b", "desc": "Khu thực nghiệm nông nghiệp công nghệ cao."},
        {"id": 8, "name": "Trường Nông nghiệp", "category": "Trường", "x": -45, "z": -45, "w": 66, "d": 48, "h": 16, "color": "#4d7c0f", "desc": "Khu vực giảng đường, phòng thí nghiệm và trại thực nghiệm Nông nghiệp."},
        {"id": 9, "name": "Nhà học B1", "category": "Nhà học", "x": 22, "z": -78, "w": 38, "d": 20, "h": 16, "color": "#dc2626", "desc": "Tòa nhà học tập chung B1."},
        {"id": 10, "name": "Nhà thi đấu cũ", "category": "Thể chất", "x": 55, "z": -78, "w": 20, "d": 18, "h": 12, "color": "#eab308", "desc": "Nhà tập luyện thể dục thể thao."},
        {"id": 11, "name": "Nhà thi đấu mới", "category": "Thể chất", "x": 95, "z": -82, "w": 46, "d": 24, "h": 16, "color": "#facc15", "desc": "Nhà thi đấu đa năng quy mô lớn."},
        {"id": 12, "name": "Trường Công nghệ Thông tin và Truyền thông", "category": "Trường", "x": 45, "z": -35, "w": 44, "d": 38, "h": 18, "color": "#fde047", "desc": "Đào tạo CNTT, Kỹ thuật phần mềm, Mạng máy tính & Truyền thông."},
        {"id": 13, "name": "Văn phòng Đoàn trường", "category": "Hành chính", "x": 42, "z": -18, "w": 16, "d": 14, "h": 10, "color": "#1e3a8a", "desc": "Văn phòng Đoàn Thanh niên - Hội Sinh viên trường."},
        {"id": 14, "name": "Nhà học C1", "category": "Nhà học", "x": 58, "z": -8, "w": 26, "d": 12, "h": 14, "color": "#06b6d4", "desc": "Khu giảng đường C1."},
        {"id": 15, "name": "Trường Khoa học Tự nhiên", "category": "Trường", "x": 98, "z": -25, "w": 44, "d": 62, "h": 18, "color": "#3b6998", "desc": "Đào tạo Toán, Lý, Hóa, Sinh học."},
        {"id": 16, "name": "Trường Kinh tế", "category": "Trường", "x": 155, "z": -45, "w": 48, "d": 38, "h": 16, "color": "#10b981", "desc": "Đào tạo Quản trị kinh doanh, Tài chính, Kế toán, Kinh tế."},
        {"id": 17, "name": "Khoa Khoa học Chính trị", "category": "Trường / Khoa", "x": 142, "z": -8, "w": 22, "d": 22, "h": 14, "color": "#fde047", "desc": "Đào tạo Triết học, Chính trị học, Giáo dục công dân."},
        {"id": 18, "name": "Khoa Dự bị Dân tộc", "category": "Trường / Khoa", "x": -110, "z": -5, "w": 26, "d": 14, "h": 12, "color": "#db2777", "desc": "Hệ dự bị đại học dân tộc."},
        {"id": 19, "name": "Trường Sư phạm", "category": "Trường", "x": -85, "z": 5, "w": 22, "d": 28, "h": 16, "color": "#ea580c", "desc": "Đào tạo giáo viên các bậc học."},
        {"id": 20, "name": "Nhà học C2", "category": "Nhà học", "x": -65, "z": 0, "w": 16, "d": 22, "h": 14, "color": "#facc15", "desc": "Khu giảng đường C2."},
        {"id": 21, "name": "THPT Thực hành Sư phạm", "category": "Trường học", "x": -105, "z": 22, "w": 24, "d": 16, "h": 14, "color": "#bbf7d0", "desc": "Trường Trung học phổ thông Thực hành Sư phạm."},
        {"id": 22, "name": "Hội trường Rùa", "category": "Hội trường", "x": -22, "z": 18, "w": 22, "d": 18, "h": 12, "color": "#0284c7", "isRound": true, "desc": "Biểu tượng kiến trúc hình mai rùa, nơi tổ chức các sự kiện lớn."},
        {"id": 23, "name": "Khoa Luật", "category": "Trường / Khoa", "x": -42, "z": 48, "w": 20, "d": 14, "h": 14, "color": "#dc2626", "desc": "Đào tạo Cử nhân Luật học, Luật Kinh tế."},
        {"id": 24, "name": "Trung tâm Ngoại ngữ", "category": "Trung tâm", "x": -44, "z": 62, "w": 16, "d": 14, "h": 12, "color": "#2563eb", "desc": "Đào tạo và tổ chức thi chứng chỉ ngoại ngữ."},
        {"id": 25, "name": "Nhà điều hành (Tòa nhà trung tâm)", "category": "Hành chính", "x": 45, "z": 45, "w": 30, "d": 36, "h": 26, "color": "#f1f5f9", "desc": "Trụ sở Ban Giám hiệu và các phòng ban chức năng."},
        {"id": 26, "name": "Giảng đường D2", "category": "Nhà học", "x": 45, "z": 24, "w": 26, "d": 10, "h": 14, "color": "#e2e8f0", "desc": "Khu phòng học D2 phía sau Nhà điều hành."},
        {"id": 27, "name": "Giảng đường D1 & Khoa Sau đại học", "category": "Trường / Khoa", "x": 45, "z": 66, "w": 28, "d": 12, "h": 14, "color": "#ffffff", "desc": "Quản lý đào tạo Thạc sĩ, Tiến sĩ và khu giảng đường D1."},
        {"id": 28, "name": "Trung tâm Học liệu (LRC)", "category": "Thư viện", "x": 78, "z": 60, "w": 22, "d": 28, "h": 20, "color": "#94a3b8", "desc": "Thư viện hiện đại 4 tầng phục vụ học tập và nghiên cứu."},
        {"id": 29, "name": "Vườn bàng & Công viên cây xanh", "category": "Cảnh quan", "x": 112, "z": 26, "w": 30, "d": 24, "h": 3, "color": "#166534", "desc": "Không gian xanh thư giãn đặc trưng của sinh viên CTU."},
        {"id": 30, "name": "Khu phòng học A3", "category": "Nhà học", "x": 106, "z": 58, "w": 24, "d": 16, "h": 12, "color": "#fdba74", "desc": "Dãy phòng học A3 gần Cổng A."},
        {"id": 31, "name": "Khoa Khoa học Xã hội và Nhân văn", "category": "Trường / Khoa", "x": 135, "z": 58, "w": 22, "d": 18, "h": 15, "color": "#f472b6", "desc": "Đào tạo Văn học, Du lịch, Xã hội học, Thông tin - Thư viện."},
        {"id": 32, "name": "Viện Sinh học và Thực phẩm & Tòa nhà Phức hợp", "category": "Viện / Tòa nhà phức hợp", "x": -45, "z": -95, "w": 58, "d": 26, "h": 22, "color": "#0d9488", "desc": "Tổ hợp Viện Công nghệ Sinh học và Thực phẩm cùng Tòa nhà Phức hợp nghiên cứu - thí nghiệm hiện đại phía Nam Trường Thủy sản."},
        {"id": 33, "name": "Tòa nhà Công nghệ cao", "category": "Tòa nhà Công nghệ cao", "x": -8, "z": 58, "w": 34, "d": 36, "h": 24, "color": "#6366f1", "desc": "Tòa nhà Công nghệ cao (ATL) hiện đại nằm tại khu vực mặt tiền đường 3/2, giữa Cổng B và Cổng C."}
    ],
    gates: [
        {"name": "Cổng A", "x": 92, "z": 84, "color": "#ef4444"},
        {"name": "Cổng B (Cổng chính)", "x": 18, "z": 84, "color": "#eab308"},
        {"name": "Cổng C", "x": -56, "z": 84, "color": "#3b82f6"}
    ]
};

function init() {
    const container = document.getElementById('canvas-container');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f8f7);
    scene.fog = null;

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(0, 340, 20);
    camera.up.set(0, 1, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.minDistance = 50;
    controls.maxDistance = 550;
    setCameraView(controls.target.clone(), camera.position.clone());
    renderer.domElement.addEventListener('contextmenu', event => event.preventDefault());
    renderer.domElement.addEventListener('pointerdown', event => {
        pointerDownPosition = { x: event.clientX, y: event.clientY };
        mapPointerMoved = false;
    });
    renderer.domElement.addEventListener('pointermove', event => {
        if (!pointerDownPosition) return;
        const dx = event.clientX - pointerDownPosition.x;
        const dy = event.clientY - pointerDownPosition.y;
        if (Math.hypot(dx, dy) > 5) mapPointerMoved = true;
    });
    renderer.domElement.addEventListener('pointerup', () => {
        pointerDownPosition = null;
    });
    renderer.domElement.addEventListener('pointercancel', () => {
        pointerDownPosition = null;
        mapPointerMoved = false;
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(120, 250, 150);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 700;
    const d = 250;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    buildBaseEnvironment();
    loadMapData();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    if (window.matchMedia('(max-width: 700px)').matches) {
        toggleSidebar();
    }
    animate();
}

function buildBaseEnvironment() {
    const groundGeo = new THREE.PlaneGeometry(1200, 1200);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0xf7f8f7 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const mainRoadGeo = new THREE.BoxGeometry(520, 1.2, 22);
    const mainRoadMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const mainRoad = new THREE.Mesh(mainRoadGeo, mainRoadMat);
    mainRoad.position.set(0, 0.6, 98);
    mainRoad.receiveShadow = true;
    scene.add(mainRoad);

    const roadLabel = createTextSprite("ĐƯỜNG 3/2", "#ffffff", "rgba(51, 65, 85, 0.85)", 26);
    roadLabel.position.set(-120, 4, 98);
    scene.add(roadLabel);

    buildRoadNetwork();

    const boundaryPoints = [
        new THREE.Vector3(-195, 1, -20),
        new THREE.Vector3(-175, 1, -110),
        new THREE.Vector3(-125, 1, -155),
        new THREE.Vector3(20, 1, -162),
        new THREE.Vector3(110, 1, -152),
        new THREE.Vector3(135, 1, -195),
        new THREE.Vector3(175, 1, -185),
        new THREE.Vector3(195, 1, -70),
        new THREE.Vector3(165, 1, 86),
        new THREE.Vector3(-115, 1, 86),
        new THREE.Vector3(-115, 1, 45),
        new THREE.Vector3(-195, 1, -20)
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
    const lineMat = new THREE.LineDashedMaterial({ color: 0x1e293b, dashSize: 5, gapSize: 3 });
    const boundaryLine = new THREE.Line(lineGeo, lineMat);
    boundaryLine.computeLineDistances();
    scene.add(boundaryLine);
}


// Mạng đường nội bộ Khu 2 ĐHCT căn chỉnh chuẩn xác theo bản đồ vệ tinh & vị trí các cổng/tòa nhà
function roadKey(p) { return `${p.x.toFixed(2)},${p.z.toFixed(2)}`; }

function addRoadEdge(a, b, width = 5.2, isRoundabout = false) {
    const pa = new THREE.Vector3(a[0], ROUTE_Y, a[1]);
    const pb = new THREE.Vector3(b[0], ROUTE_Y, b[1]);
    const ka = roadKey(pa), kb = roadKey(pb);
    if (!roadGraph.has(ka)) roadGraph.set(ka, { point: pa, edges: [] });
    if (!roadGraph.has(kb)) roadGraph.set(kb, { point: pb, edges: [] });
    const length = pa.distanceTo(pb);
    if (length < 0.01) return;
    if (isRoundabout) {
        // Roundabout points are generated clockwise; reverse graph edges for counterclockwise travel.
        roadGraph.get(kb).edges.push({ to: ka, length });
    } else {
        roadGraph.get(ka).edges.push({ to: kb, length });
        roadGraph.get(kb).edges.push({ to: ka, length });
    }

    const dx = pb.x - pa.x, dz = pb.z - pa.z;
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(length + (isRoundabout ? 0.5 : 1.8), 0.65, width),
        new THREE.MeshLambertMaterial({ color: 0x64748b })
    );
    mesh.position.set((pa.x + pb.x) / 2, 0.34, (pa.z + pb.z) / 2);
    mesh.rotation.y = -Math.atan2(dz, dx);
    mesh.receiveShadow = true;
    scene.add(mesh);
}

function addRoundabout(cx, cz, radius, segments = 16) {
    // Vẽ đảo tròn trung tâm (bùng binh) và nối các node thành vòng kín
    const island = new THREE.Mesh(
        new THREE.CylinderGeometry(radius - 2.6, radius - 2.4, 0.9, 24),
        new THREE.MeshLambertMaterial({ color: 0x16a34a })
    );
    island.position.set(cx, 0.45, cz);
    island.receiveShadow = true;
    scene.add(island);

    const pts = [];
    for (let i = 0; i < segments; i++) {
        const ang = (i / segments) * Math.PI * 2;
        pts.push([
            Number((cx + Math.cos(ang) * radius).toFixed(2)),
            Number((cz + Math.sin(ang) * radius).toFixed(2))
        ]);
    }
    for (let i = 0; i < segments; i++) {
        addRoadEdge(pts[i], pts[(i + 1) % segments], 4.6, true);
    }
    return pts;
}

function buildRoadNetwork() {
    roadGraph.clear();

    // Bùng binh trung tâm (giao trục Cổng A - đường trước Nhà điều hành - trục KHTN/CNTT)
    // Vị trí: phía Bắc Nhà điều hành (45,45), Tây Vườn bàng (112,26), Đông Nam CNTT (45,-35)
    const rbCx = 78, rbCz = 12, rbR = 11;
    const rbPts = addRoundabout(rbCx, rbCz, rbR, 16);
    // Các điểm nối trực tiếp vào vòng xuyến (theo góc 0, 90, 180, 270 độ)
    const rbEast  = rbPts[0];  // (89, 12)  -> hướng ra Cổng A / Vườn bàng
    const rbSouth = rbPts[4];  // (78, 23)  -> hướng xuống Nhà điều hành / LRC
    const rbWest  = rbPts[8];  // (67, 12)  -> hướng sang Hội trường Rùa / Cổng B
    const rbNorth = rbPts[12]; // (78, 1)   -> hướng lên CNTT / KHTN / Nhà thi đấu

    const roads = [
        // 1. Đường gom dọc mặt tiền Đường 3/2 (nối Cổng A z=84, Cổng B z=84, Cổng C z=84)
        [[-115, 84], [-56, 84], [-25, 84], [18, 84], [62, 84], [92, 84], [155, 84]],

        // 2. TRỤC CỔNG A (x=92, z=84) -> đi qua giữa LRC/A3 và Vườn bàng -> nhập Bùng binh trung tâm
        [[92, 84], [92, 58], [92, 26], rbEast],

        // 3. TRỤC CỔNG B (x=18, z=84) -> đi giữa Tòa Công nghệ cao (-8,58) và Nhà điều hành (45,45) -> Hội trường Rùa (-22,18) & nối vòng xuyến
        [[18, 84], [18, 58], [18, 35], [18, 12], rbWest],
        [[18, 12], [-22, 5], [-42, 5]], // Nhánh sang Hội trường Rùa & Trường Sư phạm / C2

        // 4. TRỤC CỔNG C (x=-56, z=84) -> đi qua Trung tâm Ngoại ngữ / Khoa Luật -> Hội trường Rùa -> Trường Sư phạm / Dự bị Dân tộc
        [[-56, 84], [-56, 58], [-56, 35], [-42, 20], [-42, 5], [-42, -18]],

        // 5. Đường ngang trước Nhà điều hành & LRC (z=35): nối trục Cổng C, Cổng B, Nhà điều hành, LRC, trục Cổng A và phía Đông
        [[-56, 35], [-22, 35], [18, 35], [45, 35], [62, 35], [92, 35], [125, 35], [155, 35]],
        [[62, 84], [62, 58], [62, 35], [62, 23], rbSouth], // Nhánh giữa Nhà điều hành và LRC lên bùng binh
        [[125, 84], [125, 58], [125, 35], [125, 10], [125, -18]], // Nhánh Đông qua A3, KHXH&NV, Vườn bàng, KHCT

        // 6. Trục chính từ Bùng binh lên phía Bắc (qua CNTT, KHTN, Nhà thi đấu, KTX A)
        [rbNorth, [78, -18], [78, -45], [78, -65], [78, -95], [78, -125]],
        [[78, -18], [125, -18], [165, -18]], // Nhánh rẽ sang KHTN, KH Chính trị, Kinh tế
        [[125, -18], [125, -45], [125, -65], [125, -95], [145, -125]], // Đường trục phía Đông lên KTX A

        // 7. Đường ngang trục giữa (z=-18): nối Dự bị Dân tộc, Sư phạm, C2, Đoàn trường, C1, CNTT, KHTN, KHCT
        [[-115, -18], [-85, -18], [-42, -18], [18, -18], [45, -18], [78, -18]],

        // 8. Đường ngang khu Nông nghiệp - Nhà lưới - B1 - Nhà thi đấu - Kinh tế (z=-65)
        [[-165, -65], [-115, -65], [-85, -65], [-15, -65], [22, -65], [55, -65], [78, -65], [125, -65], [175, -65]],

        // 9. Trục dọc trung tâm Tây (x=-15): nối Hội trường Rùa/C2 lên giữa Nông nghiệp & B1, Viện SH&TP & Bách khoa
        [[-15, 5], [-15, -18], [-15, -65], [-15, -95], [-15, -125], [-15, -150]],

        // 10. Trục dọc phía Tây (x=-85 và x=-115): khu Nông nghiệp, Nhà lưới, Viện ĐBSCL, KTX B, Môi trường
        [[-85, 35], [-85, 5], [-85, -18], [-85, -65], [-85, -95], [-85, -125], [-85, -150]],
        [[-115, 35], [-115, 10], [-115, -18], [-115, -65], [-115, -110], [-115, -150]],
        [[-165, -35], [-165, -65], [-165, -105], [-115, -110]], // Đường bao phía Tây (giáp Hồ Bún Xáng / Khoa Môi trường)

        // 11. Đường ngang phía Bắc (z=-110 và z=-150): nối KTX B, Viện SH&TP, Thủy sản, Bách khoa, Nhà thi đấu, KTX A
        [[-115, -110], [-85, -110], [-15, -110], [45, -110], [78, -110], [125, -110]],
        [[-115, -150], [-85, -150], [-45, -150], [-15, -150], [45, -150], [115, -150], [145, -125]]
    ];

    roads.forEach(path => {
        for (let i = 0; i < path.length - 1; i++) {
            addRoadEdge(path[i], path[i + 1]);
        }
    });
}

function nearestRoadNode(position) {
    let best = null, distance = Infinity;
    for (const [key, node] of roadGraph) {
        const d = Math.hypot(node.point.x - position.x, node.point.z - position.z);
        if (d < distance) { distance = d; best = key; }
    }
    return best;
}

function aStarRoadPath(startKey, endKey) {
    const open = [];
    const gScore = new Map();
    const prev = new Map();
    const closed = new Set();
    const endPoint = roadGraph.get(endKey).point;

    const heuristic = (key) => {
        const point = roadGraph.get(key).point;
        return point.distanceTo(endPoint);
    };

    const openPush = (key, score) => {
        open.push({ key, score });
        let i = open.length - 1;
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (open[p].score <= open[i].score) break;
            [open[p], open[i]] = [open[i], open[p]];
            i = p;
        }
    };

    const openPop = () => {
        if (open.length === 0) return null;
        const root = open[0];
        const last = open.pop();
        if (open.length > 0) {
            open[0] = last;
            let i = 0;
            while (true) {
                const left = i * 2 + 1;
                const right = i * 2 + 2;
                let smallest = i;
                if (left < open.length && open[left].score < open[smallest].score) smallest = left;
                if (right < open.length && open[right].score < open[smallest].score) smallest = right;
                if (smallest === i) break;
                [open[i], open[smallest]] = [open[smallest], open[i]];
                i = smallest;
            }
        }
        return root.key;
    };

    gScore.set(startKey, 0);
    openPush(startKey, heuristic(startKey));

    while (open.length > 0) {
        const current = openPop();
        if (closed.has(current)) continue;
        if (current === endKey) break;
        closed.add(current);

        const currentDistance = gScore.get(current);
        for (const edge of roadGraph.get(current).edges) {
            if (closed.has(edge.to)) continue;
            const alternative = currentDistance + edge.length;
            if (alternative < (gScore.get(edge.to) ?? Infinity)) {
                gScore.set(edge.to, alternative);
                prev.set(edge.to, current);
                openPush(edge.to, alternative + heuristic(edge.to));
            }
        }
    }

    if (startKey !== endKey && !prev.has(endKey)) return null;
    const keys = [endKey];
    while (keys[0] !== startKey) {
        const p = prev.get(keys[0]);
        if (!p) return null;
        keys.unshift(p);
    }
    return { keys, distance: gScore.get(endKey) };
}

function populateRouteSelectors() {
    const start = document.getElementById('routeStart'), end = document.getElementById('routeEnd');
    if (!start || !end) return;
    const opts = [
        ...gatesData.map((g, i) => ({ value: `gate:${i}`, label: g.name })),
        ...buildingsData.map(b => ({ value: `building:${b.id}`, label: `${b.id}. ${b.name}` }))
    ];
    [start, end].forEach((sel, i) => {
        sel.innerHTML = '';
        opts.forEach(o => {
            const op = document.createElement('option');
            op.value = o.value;
            op.textContent = o.label;
            sel.appendChild(op);
        });
        sel.value = i === 0 ? 'gate:0' : 'building:12';
    });
}

function getRoutePlace(value) {
    const [type, id] = value.split(':');
    if (type === 'gate') {
        const g = gatesData[Number(id)];
        return g ? { name: g.name, position: new THREE.Vector3(g.x, 0, g.z) } : null;
    }
    const b = buildingsData.find(x => x.id === Number(id));
    return b ? { name: b.name, position: new THREE.Vector3(b.x, 0, b.z) } : null;
}

function findRoute() {
    const start = getRoutePlace(document.getElementById('routeStart').value);
    const end = getRoutePlace(document.getElementById('routeEnd').value);
    const status = document.getElementById('routeStatus');
    if (!start || !end) { status.textContent = 'Không tìm thấy địa điểm đã chọn.'; return; }
    if (routeGroup) scene.remove(routeGroup);
    routeGroup = new THREE.Group();

    const startNodeKey = nearestRoadNode(start.position);
    const endNodeKey = nearestRoadNode(end.position);
    const result = aStarRoadPath(startNodeKey, endNodeKey);
    if (!result) { status.textContent = 'Chưa tìm được tuyến nối giữa hai điểm.'; return; }

    // Nối từ tâm điểm xuất phát -> nút đường gần nhất -> đường đi ngắn nhất -> tâm điểm đến
    const rawPts = [
        new THREE.Vector3(start.position.x, ROUTE_Y, start.position.z),
        ...result.keys.map(k => roadGraph.get(k).point.clone()),
        new THREE.Vector3(end.position.x, ROUTE_Y, end.position.z)
    ];
    // Loại bỏ các điểm trùng liên tiếp để đường vẽ mượt, không gãy khúc
    const pts = rawPts.filter((p, idx) => idx === 0 || p.distanceTo(rawPts[idx - 1]) > 0.5);

    const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.15);
    routeGroup.add(new THREE.Mesh(
        new THREE.TubeGeometry(curve, Math.max(32, pts.length * 10), 1.35, 8, false),
        new THREE.MeshBasicMaterial({ color: 0xef3340 })
    ));

    [[pts[0], 0x16a34a], [pts[pts.length - 1], 0xef3340]].forEach(([p, c]) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(2.8, 16, 12), new THREE.MeshBasicMaterial({ color: c }));
        m.position.set(p.x, 3.4, p.z);
        routeGroup.add(m);
    });
    scene.add(routeGroup);

    const target = buildingsData.find(b => b.name === end.name);
    const fx = target ? target.x : end.position.x;
    const fz = target ? target.z : end.position.z;
    const routeTarget = new THREE.Vector3(fx, 0, fz);
    setCameraView(routeTarget, new THREE.Vector3(fx + 75, 115, fz + 95));
    status.textContent = `${start.name} → ${end.name}. A*: ~${Math.round(result.distance * 2.5)}m.`;
}

function clearRoute() {
    if (routeGroup) { scene.remove(routeGroup); routeGroup = null; }
    const s = document.getElementById('routeStatus');
    if (s) s.textContent = 'Đã xóa tuyến đường. Chọn điểm đi và điểm đến.';
}

async function loadMapData() {
    let data = FALLBACK_DATA;
    try {
        const response = await fetch('/api/map-data');
        if (response.ok) {
            data = await response.json();
        }
    } catch (e) {
        console.log("Chạy chế độ dữ liệu nội bộ (Static Mode).");
    }

    buildingsData = data.buildings;
    gatesData = data.gates || [];
    renderSidebarList(buildingsData);
    populateRouteSelectors();

    buildingsData.forEach(b => {
        let geometry;
        if (b.isRound) {
            geometry = new THREE.CylinderGeometry(b.w / 2, b.w / 1.8, b.h, 24);
        } else {
            geometry = new THREE.BoxGeometry(b.w, b.h, b.d);
        }

        const material = new THREE.MeshStandardMaterial({
            color: b.color,
            roughness: 0.6,
            metalness: 0.1
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(b.x, b.h / 2 + 0.5, b.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const detailGroup = createBuildingDetails(b);
        mesh.add(detailGroup);
        mesh.userData = {
            ...b,
            originalColor: b.color,
            originalHeight: b.h,
            detailGroup
        };

        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 }));
        mesh.add(line);

        scene.add(mesh);
        buildingMeshes.push(mesh);

        const label = createTextSprite(b.name, "#0f172a", "rgba(255,255,255,0.88)", 16);
        label.position.set(b.x, b.isRound ? b.h + b.w * 0.55 + 4 : b.h + 6, b.z);
        scene.add(label);

        if (b.id === 29) {
            addTrees(b.x, b.z, b.w, b.d);
        }
    });

    data.gates.forEach(g => {
        const coneGeo = new THREE.ConeGeometry(4, 10, 4);
        const coneMat = new THREE.MeshLambertMaterial({ color: g.color });
        const gateMesh = new THREE.Mesh(coneGeo, coneMat);
        gateMesh.position.set(g.x, 6, g.z);
        gateMesh.rotation.x = Math.PI;
        scene.add(gateMesh);

        const gateLabel = createTextSprite(g.name, "#ffffff", g.color, 15);
        gateLabel.position.set(g.x, 15, g.z);
        scene.add(gateLabel);
    });

    applyPlanAppearance(true);
}

function createBuildingDetails(building) {
    const details = new THREE.Group();
    const { w, d, h } = building;
    const halfHeight = h / 2;
    const front = d / 2;

    if (building.id === 29 || h < 7) return details;

    if (building.isRound) {
        const radius = Math.min(w, d) * 0.48;
        const roofRim = new THREE.Mesh(
            new THREE.CylinderGeometry(radius + 0.35, radius + 0.35, 0.55, 32),
            buildingMaterials.roof
        );
        roofRim.position.y = halfHeight + 0.1;
        details.add(roofRim);

        const dome = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
            buildingMaterials.dome
        );
        dome.position.y = halfHeight + 0.38;
        details.add(dome);
    } else {
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(w + 1.2, 0.65, d + 1.2),
            buildingMaterials.roof
        );
        roof.position.y = halfHeight + 0.12;
        details.add(roof);

        const floors = Math.max(1, Math.min(5, Math.floor(h / 4.2)));
        const floorHeight = h / floors;
        const rows = Math.max(1, floors - 1);
        const windowHeight = Math.min(1.8, floorHeight * 0.42);

        function addFacadeWindows(length, isSide) {
            const columns = Math.max(2, Math.min(8, Math.floor(length / 6.5)));
            const spacing = length / (columns + 1);
            const windowWidth = Math.min(2.6, spacing * 0.58);
            const windowGeometry = isSide
                ? new THREE.BoxGeometry(0.18, windowHeight, windowWidth)
                : new THREE.BoxGeometry(windowWidth, windowHeight, 0.18);

            for (let row = 0; row < rows; row++) {
                const y = -halfHeight + floorHeight * (row + 0.58);
                for (let column = 0; column < columns; column++) {
                    const offset = -length / 2 + spacing * (column + 1);
                    const windowMesh = new THREE.Mesh(windowGeometry, buildingMaterials.glass);
                    windowMesh.position.set(
                        isSide ? w / 2 + 0.12 : offset,
                        y,
                        isSide ? offset : front + 0.12
                    );
                    details.add(windowMesh);
                }
            }
        }

        addFacadeWindows(w, false);
        addFacadeWindows(d, true);

        for (let floor = 1; floor < floors; floor++) {
            const y = -halfHeight + floorHeight * floor;
            const frontBand = new THREE.Mesh(
                new THREE.BoxGeometry(w + 0.25, 0.16, 0.24),
                buildingMaterials.trim
            );
            frontBand.position.set(0, y, front + 0.06);
            details.add(frontBand);

            const sideBand = new THREE.Mesh(
                new THREE.BoxGeometry(0.24, 0.16, d + 0.25),
                buildingMaterials.trim
            );
            sideBand.position.set(w / 2 + 0.06, y, 0);
            details.add(sideBand);
        }
    }

    const doorHeight = Math.min(3.2, h * 0.3);
    const door = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(2.8, w * 0.22), doorHeight, 0.22),
        buildingMaterials.door
    );
    door.position.set(0, -halfHeight + doorHeight / 2, front + 0.14);
    details.add(door);

    const canopy = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(6, w * 0.42), 0.35, 1.5),
        buildingMaterials.trim
    );
    canopy.position.set(0, -halfHeight + doorHeight + 0.35, front + 0.72);
    details.add(canopy);

    const steps = new THREE.Mesh(
        new THREE.BoxGeometry(Math.min(5, w * 0.36), 0.3, 1.1),
        buildingMaterials.roof
    );
    steps.position.set(0, -halfHeight + 0.15, front + 0.9);
    details.add(steps);

    details.traverse(part => {
        if (part.isMesh) {
            part.castShadow = true;
            part.receiveShadow = true;
        }
    });
    return details;
}

function applyPlanAppearance(isFlat) {
    buildingMeshes.forEach(mesh => {
        const b = mesh.userData;
        if (b.detailGroup) b.detailGroup.visible = !isFlat;
        if (isFlat) {
            mesh.scale.y = 0.08;
            mesh.position.y = b.id === 29 ? 0.7 : 1.1;
            mesh.material.color.setHex(b.id === 29 ? 0x166534 : 0xfefefe);
            mesh.castShadow = false;
            mesh.children.forEach(child => {
                if (child.isLineSegments) {
                    child.material.color.setHex(0xe11d48);
                    child.material.opacity = b.id === 29 ? 0.75 : 0.9;
                }
            });
        } else {
            mesh.scale.y = 1;
            mesh.position.y = b.originalHeight / 2 + 0.5;
            mesh.material.color.set(b.originalColor);
            mesh.castShadow = true;
            mesh.children.forEach(child => {
                if (child.isLineSegments) {
                    child.material.color.setHex(0x334155);
                    child.material.opacity = 0.4;
                }
            });
        }
    });
}

function addTrees(cx, cz, w, d) {
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    for (let i = 0; i < 10; i++) {
        const tx = cx + (Math.random() - 0.5) * (w - 6);
        const tz = cz + (Math.random() - 0.5) * (d - 6);

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 5), trunkMat);
        trunk.position.set(tx, 5, tz);
        scene.add(trunk);

        const leaves = new THREE.Mesh(new THREE.SphereGeometry(3.2, 8, 8), leafMat);
        leaves.position.set(tx, 8.5, tz);
        leaves.castShadow = true;
        scene.add(leaves);
    }
}

function createTextSprite(text, textColor, bgColor, fontSize = 18) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    canvas.width = textWidth + 24;
    canvas.height = fontSize + 16;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 6);
    ctx.fill();

    ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(canvas.width * 0.22, canvas.height * 0.22, 1);
    return sprite;
}

function renderSidebarList(list) {
    const ul = document.getElementById('locationList');
    ul.innerHTML = '';
    list.forEach(item => {
        const li = document.createElement('li');
        li.className = 'location-item';
        li.innerHTML = `<span class="color-dot" style="background:${item.color}"></span><span>${item.id}. ${item.name}</span>`;
        li.onclick = () => focusBuilding(item.id);
        ul.appendChild(li);
    });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const kw = e.target.value.toLowerCase();
    const filtered = buildingsData.filter(b => b.name.toLowerCase().includes(kw) || b.category.toLowerCase().includes(kw));
    renderSidebarList(filtered);
});

function focusBuilding(id) {
    const targetMesh = buildingMeshes.find(m => m.userData.id === id);
    if (!targetMesh) return;

    highlightMesh(targetMesh);
    showInfoCard(targetMesh.userData);

    const pos = targetMesh.position;
    const target = new THREE.Vector3(pos.x, pos.y, pos.z);
    setCameraView(target, new THREE.Vector3(pos.x, pos.y + 75, pos.z + 90));
}

function highlightMesh(mesh) {
    if (selectedMesh) {
        selectedMesh.material.emissive.setHex(0x000000);
    }
    selectedMesh = mesh;
    selectedMesh.material.emissive.setHex(0x333333);
}

function onMouseClick(event) {
    if (mapPointerMoved) {
        mapPointerMoved = false;
        return;
    }
    if (event.target.tagName !== 'CANVAS') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(buildingMeshes);

    if (intersects.length > 0) {
        const clicked = intersects[0].object;
        highlightMesh(clicked);
        showInfoCard(clicked.userData);
    }
}

function showInfoCard(data) {
    document.getElementById('cardCategory').innerText = data.category;
    document.getElementById('cardTitle').innerText = `${data.id}. ${data.name}`;
    document.getElementById('cardDesc').innerText = data.desc;
    document.getElementById('infoCard').classList.remove('hidden');
}

function closeInfoCard() {
    document.getElementById('infoCard').classList.add('hidden');
    if (selectedMesh) {
        selectedMesh.material.emissive.setHex(0x000000);
        selectedMesh = null;
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('sidebarToggle');
    const collapsed = sidebar.classList.toggle('collapsed');

    toggleButton.setAttribute('aria-expanded', String(!collapsed));
    toggleButton.setAttribute('aria-label', collapsed ? 'Mở rộng bảng điều khiển' : 'Thu gọn bảng điều khiển');
    toggleButton.querySelector('span').textContent = collapsed ? '›' : '‹';
}

function resetCamera() {
    const target = new THREE.Vector3(0, 0, 0);
    setCameraView(target, new THREE.Vector3(0, 230, 260));
    applyPlanAppearance(false);
}

function topDownView() {
    const target = new THREE.Vector3(0, 0, -15);
    setCameraView(target, new THREE.Vector3(0, 340, 20));
    applyPlanAppearance(true);
}

function getViewportCameraScale() {
    const aspect = window.innerWidth / window.innerHeight;
    return Math.max(1, REFERENCE_CAMERA_ASPECT / aspect);
}

function setCameraView(target, basePosition) {
    viewportCameraScale = getViewportCameraScale();
    const offset = basePosition.sub(target).multiplyScalar(viewportCameraScale);
    controls.target.copy(target);
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    controls.maxDistance = 550 * viewportCameraScale;
}

function updateCameraForViewport() {
    const nextScale = getViewportCameraScale();
    if (nextScale === viewportCameraScale) return;

    const scaleRatio = nextScale / viewportCameraScale;
    camera.position.sub(controls.target).multiplyScalar(scaleRatio).add(controls.target);
    viewportCameraScale = nextScale;
    controls.maxDistance = 550 * viewportCameraScale;
    camera.lookAt(controls.target);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updateCameraForViewport();
    if (window.innerWidth <= 700 && !document.querySelector('.sidebar').classList.contains('collapsed')) {
        toggleSidebar();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();
