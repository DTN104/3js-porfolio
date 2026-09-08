# Feature Specification: Website portfolio developer dạng thế giới 3D tương tác

**Feature Branch**: `001-3d-world-portfolio`
**Created**: 2026-09-08
**Status**: Draft
**Version**: 0.2 (2026-09-08) — chốt 3 câu hỏi chặn: liên hệ chỉ qua email/social link, chế độ 2D đầy đủ nội dung, nội dung song ngữ Việt–Anh
**Input**: User description: "Dựng website portfolio cá nhân của developer dưới dạng thế giới 3D isometric tương tác — khách truy cập điều khiển nhân vật đi lại trong một không gian 3D, tương tác với các vật thể để xem giới thiệu bản thân, kỹ năng, dự án, kinh nghiệm và thông tin liên hệ. Tham chiếu: worawork.vercel.app"

---

## 1. Bối cảnh & Mục tiêu

### 1.1 Hiện trạng

Portfolio của developer hiện nay phần lớn là trang cuộn dọc theo khuôn mẫu giống nhau: ảnh đại diện, đoạn giới thiệu, danh sách kỹ năng, lưới dự án, form liên hệ. Nhà tuyển dụng và khách hàng tiềm năng xem hàng chục trang như vậy mỗi tuần, nên trang portfolio gần như không tạo được khác biệt và không tự chứng minh được năng lực kỹ thuật của chủ trang. Thời gian ở lại trang thường rất ngắn và phần lớn khách rời đi trước khi tới được phần dự án hoặc thông tin liên hệ.

### 1.2 Định hướng

Thay khuôn mẫu trang cuộn bằng một **thế giới 3D nhỏ, tương tác được**: khách truy cập điều khiển một nhân vật đi lại trong không gian, tới gần và tương tác với các vật thể để mở từng phần nội dung portfolio. Bản thân trải nghiệm là bằng chứng năng lực front-end/3D của chủ portfolio, đồng thời biến việc đọc CV thành hoạt động khám phá chủ động.

Trải nghiệm tham chiếu (worawork.vercel.app) có các đặc trưng: màn hình khởi động với một hành động bắt đầu, thế giới isometric phong cách hoạt hình, nhân vật điều khiển bằng bàn phím (di chuyển, giữ phím để chạy), tương tác vật thể bằng phím hoặc chuột, phóng to/thu nhỏ góc nhìn, nhạc nền bật/tắt được, và bảng hướng dẫn điều khiển gọi ra bất kỳ lúc nào.

### 1.3 Mục tiêu

| ID | Mục tiêu |
|----|----------|
| BO-01 | Tạo ấn tượng khác biệt so với portfolio dạng trang cuộn thông thường, để người xem nhớ được chủ portfolio |
| BO-02 | Tự chứng minh năng lực kỹ thuật của chủ portfolio thông qua chính sản phẩm, không chỉ qua mô tả |
| BO-03 | Kéo dài thời gian ở lại trang và tăng tỷ lệ khách xem tới phần dự án |
| BO-04 | Tăng số lượt liên hệ và lượt tải CV từ nhà tuyển dụng, khách hàng tiềm năng |
| BO-05 | Cho phép chủ portfolio cập nhật nội dung (dự án, kinh nghiệm) mà không phải dựng lại thế giới 3D |

### 1.4 Actors

| Actor | Mô tả | Loại |
|-------|-------|------|
| Nhà tuyển dụng / HR | Xem nhanh để đánh giá mức độ phù hợp, thường cần CV và thông tin liên hệ | Người dùng cuối |
| Tuyển dụng kỹ thuật (tech lead, hiring manager) | Quan tâm chi tiết dự án, vai trò đảm nhận, công nghệ sử dụng, mã nguồn | Người dùng cuối |
| Khách hàng / đối tác tiềm năng | Đánh giá năng lực để thuê làm dự án | Người dùng cuối |
| Đồng nghiệp trong ngành | Xem vì tò mò kỹ thuật, có khả năng chia sẻ lại | Người dùng cuối |
| Chủ portfolio (developer) | Sở hữu và cập nhật nội dung, quyết định phạm vi hiển thị | Nội bộ |
| Công cụ tìm kiếm & nền tảng chia sẻ | Thu thập nội dung và hiển thị bản xem trước khi liên kết được chia sẻ | Hệ thống bên ngoài |

---

## 2. User Scenarios & Testing *(mandatory)*

### US-01 — Vào trang và khởi động thế giới 3D (Priority: P1)

**As a** khách truy cập lần đầu, **I want** mở đường dẫn và vào được thế giới 3D một cách rõ ràng, **so that** tôi biết mình đang ở đâu và bắt đầu như thế nào thay vì nhìn một màn hình trống trong lúc chờ.

**Why this priority**: Không vào được thế giới thì toàn bộ phần còn lại vô nghĩa. Đây là điểm rơi khách nhiều nhất.

**Independent Test**: Mở đường dẫn trên máy tính để bàn với kết nối mạng thông thường, quan sát màn hình khởi động và tiến trình tải, thực hiện hành động bắt đầu, xác nhận thế giới 3D hiển thị và nhân vật xuất hiện.

**Acceptance Scenarios**:

1. **Given** khách mở đường dẫn lần đầu, **When** trang tải xong phần khởi động, **Then** hệ thống hiển thị màn hình khởi động kèm một hành động bắt đầu rõ ràng, chưa phát âm thanh và chưa vào thế giới.
2. **Given** khách đang ở màn hình khởi động, **When** tài nguyên bắt buộc chưa tải xong, **Then** hệ thống hiển thị trạng thái tiến trình tải và không cho phép bắt đầu.
3. **Given** tài nguyên bắt buộc đã sẵn sàng, **When** khách thực hiện hành động bắt đầu, **Then** hệ thống chuyển vào thế giới 3D và hiển thị nhân vật ở vị trí xuất phát.
4. **Given** một tài nguyên bắt buộc tải thất bại, **When** hệ thống phát hiện lỗi, **Then** hệ thống hiển thị thông báo dễ hiểu kèm hành động thử lại, không để màn hình treo vô thời hạn.

---

### US-02 — Điều khiển nhân vật đi lại trong thế giới (Priority: P1)

**As a** khách truy cập, **I want** tự điều khiển nhân vật đi và chạy trong thế giới, **so that** tôi chủ động khám phá thay vì bị dẫn dắt theo một kịch bản cố định.

**Why this priority**: Đây là cơ chế điều hướng chính; mọi nội dung đều tiếp cận qua nó.

**Independent Test**: Vào thế giới, dùng bàn phím di chuyển nhân vật theo cả bốn hướng và hướng chéo, giữ phím bổ trợ để chạy, phóng to/thu nhỏ góc nhìn, đi tới ranh giới thế giới và đâm vào vật thể đặc.

**Acceptance Scenarios**:

1. **Given** khách đang ở trong thế giới, **When** khách nhấn phím di chuyển, **Then** nhân vật di chuyển theo hướng tương ứng với hoạt ảnh đi bộ và camera bám theo giữ nhân vật trong khung hình.
2. **Given** nhân vật đang di chuyển, **When** khách giữ phím bổ trợ chạy, **Then** tốc độ di chuyển tăng và hoạt ảnh chuyển sang trạng thái chạy.
3. **Given** khách nhấn đồng thời hai phím hướng, **When** hai hướng vuông góc nhau, **Then** nhân vật di chuyển theo hướng chéo, không bị kẹt hay giật hướng.
4. **Given** nhân vật đi tới ranh giới thế giới hoặc một vật thể đặc, **When** khách tiếp tục nhấn hướng đó, **Then** nhân vật dừng lại tại vật cản, không đi xuyên qua và không rơi ra ngoài thế giới.
5. **Given** khách đang ở trong thế giới, **When** khách thực hiện thao tác phóng to hoặc thu nhỏ, **Then** góc nhìn thay đổi trong giới hạn cho phép và không mất dấu nhân vật.

---

### US-03 — Tương tác vật thể để mở nội dung (Priority: P1)

**As a** khách truy cập, **I want** biết vật thể nào tương tác được và mở được nội dung gắn với nó, **so that** tôi tìm thấy thông tin mình cần mà không phải đoán.

**Why this priority**: Là cầu nối duy nhất giữa trải nghiệm 3D và nội dung portfolio.

**Independent Test**: Đi tới gần một vật thể tương tác, xác nhận có chỉ dấu, kích hoạt tương tác, đọc nội dung trong bảng, đóng bảng và tiếp tục điều khiển nhân vật.

**Acceptance Scenarios**:

1. **Given** nhân vật đi vào phạm vi tương tác của một vật thể, **When** phạm vi được kích hoạt, **Then** hệ thống hiển thị chỉ dấu trực quan cho biết vật thể này tương tác được và bằng thao tác nào.
2. **Given** chỉ dấu tương tác đang hiển thị, **When** khách nhấn phím tương tác hoặc chạm/bấm vào vật thể, **Then** hệ thống mở bảng nội dung tương ứng.
3. **Given** một bảng nội dung đang mở, **When** khách nhấn phím di chuyển, **Then** nhân vật không di chuyển và thao tác không lọt xuống thế giới phía sau.
4. **Given** một bảng nội dung đang mở, **When** khách nhấn phím thoát hoặc bấm nút đóng, **Then** bảng đóng lại và quyền điều khiển nhân vật được khôi phục ngay.
5. **Given** nhân vật đứng trong phạm vi của hai vật thể tương tác, **When** khách kích hoạt tương tác, **Then** hệ thống mở nội dung của vật thể gần nhất.

---

### US-04 — Xem giới thiệu bản thân và kỹ năng (Priority: P1)

**As a** nhà tuyển dụng, **I want** biết nhanh chủ portfolio là ai, làm vai trò gì và mạnh về công nghệ nào, **so that** tôi quyết định có đọc tiếp hay không.

**Why this priority**: Là thông tin sàng lọc đầu tiên của mọi nhóm khách.

**Independent Test**: Mở khu vực giới thiệu và khu vực kỹ năng, xác nhận có tên, vai trò nghề nghiệp, mô tả ngắn và danh sách kỹ năng đã phân nhóm.

**Acceptance Scenarios**:

1. **Given** khách mở khu vực giới thiệu, **When** bảng nội dung hiển thị, **Then** khách thấy tên, vai trò nghề nghiệp và mô tả ngắn về chủ portfolio.
2. **Given** khách mở khu vực kỹ năng, **When** bảng nội dung hiển thị, **Then** kỹ năng được trình bày theo nhóm, không phải một danh sách phẳng không phân loại.

---

### US-05 — Xem danh sách dự án và chi tiết từng dự án (Priority: P1)

**As a** tuyển dụng kỹ thuật hoặc khách hàng tiềm năng, **I want** xem các dự án đã làm kèm vai trò và công nghệ sử dụng, **so that** tôi đánh giá được năng lực thực tế chứ không chỉ lời tự mô tả.

**Why this priority**: Là bằng chứng năng lực có sức nặng nhất và là mục tiêu chuyển đổi chính của trang.

**Independent Test**: Mở khu vực dự án, duyệt danh sách, mở chi tiết một dự án, xác nhận có mô tả, vai trò, công nghệ, hình ảnh; mở liên kết ngoài của dự án và quay lại thế giới.

**Acceptance Scenarios**:

1. **Given** khách mở khu vực dự án, **When** bảng nội dung hiển thị, **Then** khách thấy danh sách dự án theo thứ tự do chủ portfolio sắp xếp.
2. **Given** khách chọn một dự án, **When** chi tiết hiển thị, **Then** khách thấy tên dự án, mô tả, vai trò của chủ portfolio, danh sách công nghệ sử dụng và ít nhất một hình ảnh minh họa.
3. **Given** một dự án có liên kết ngoài, **When** khách mở liên kết đó, **Then** liên kết mở ở cửa sổ mới và thế giới 3D ở tab hiện tại giữ nguyên trạng thái.
4. **Given** một dự án không có liên kết bản chạy thử hoặc mã nguồn, **When** chi tiết hiển thị, **Then** hệ thống không hiển thị liên kết rỗng hoặc nút không hoạt động.

---

### US-06 — Xem kinh nghiệm làm việc (Priority: P2)

**As a** nhà tuyển dụng, **I want** xem quá trình làm việc theo trình tự thời gian, **so that** tôi đánh giá được độ dày kinh nghiệm và mức độ phù hợp với vị trí đang tuyển.

**Why this priority**: Quan trọng với nhóm tuyển dụng nhưng vẫn xem được qua CV nếu thiếu.

**Independent Test**: Mở khu vực kinh nghiệm, xác nhận các mục hiển thị theo trình tự thời gian với tổ chức, vai trò, khoảng thời gian và mô tả ngắn.

**Acceptance Scenarios**:

1. **Given** khách mở khu vực kinh nghiệm, **When** bảng nội dung hiển thị, **Then** các mục kinh nghiệm hiển thị theo trình tự thời gian, mỗi mục gồm tổ chức, vai trò, khoảng thời gian và mô tả ngắn.

---

### US-07 — Liên hệ và tải CV (Priority: P1)

**As a** nhà tuyển dụng hoặc khách hàng tiềm năng, **I want** lấy được thông tin liên hệ và bản CV, **so that** tôi liên lạc được với chủ portfolio ngay khi thấy phù hợp.

**Why this priority**: Là hành động chuyển đổi cuối cùng; thiếu nó thì mọi ấn tượng tạo ra đều không dẫn tới kết quả.

**Independent Test**: Mở khu vực liên hệ, xác nhận thấy các kênh liên hệ công khai, tải được tệp CV và mở được tệp đó.

**Acceptance Scenarios**:

1. **Given** khách mở khu vực liên hệ, **When** bảng nội dung hiển thị, **Then** khách thấy các kênh liên hệ công khai mà chủ portfolio đã cấu hình.
2. **Given** khách muốn lưu hồ sơ, **When** khách chọn tải CV, **Then** hệ thống cung cấp tệp CV ở định dạng tài liệu phổ biến, mở được mà không cần cài thêm phần mềm.
3. **Given** chủ portfolio đã cấu hình trạng thái sẵn sàng nhận cơ hội, **When** khách mở khu vực liên hệ, **Then** trạng thái đó hiển thị rõ ràng.

---

### US-08 — Biết cách điều khiển (Priority: P2)

**As a** khách truy cập chưa từng dùng loại trang này, **I want** tra được cách điều khiển bất cứ lúc nào, **so that** tôi không rời trang chỉ vì không biết cách đi.

**Why this priority**: Ảnh hưởng trực tiếp tỷ lệ rời trang sớm, nhưng chỉ có giá trị khi US-02 đã chạy.

**Independent Test**: Từ trong thế giới, mở bảng hướng dẫn, xác nhận mô tả đủ các thao tác, đóng bảng và điều khiển lại bình thường.

**Acceptance Scenarios**:

1. **Given** khách đang ở trong thế giới, **When** khách mở bảng hướng dẫn, **Then** bảng liệt kê đủ thao tác di chuyển, chạy, tương tác và phóng to/thu nhỏ.
2. **Given** khách truy cập bằng thiết bị cảm ứng, **When** bảng hướng dẫn hiển thị, **Then** nội dung mô tả thao tác chạm, không mô tả phím bàn phím.
3. **Given** khách vừa vào thế giới lần đầu, **When** phiên bắt đầu, **Then** hệ thống hiển thị một gợi ý ngắn cho biết khách điều khiển được nhân vật.

---

### US-09 — Trải nghiệm trên điện thoại và máy tính bảng (Priority: P2)

**As a** khách truy cập từ điện thoại, **I want** vẫn đi lại và xem được nội dung, **so that** tôi không phải chuyển sang máy tính mới xem được portfolio.

**Why this priority**: Một phần đáng kể lượt xem đến từ liên kết chia sẻ mở trên điện thoại.

**Independent Test**: Mở trang trên điện thoại, dùng bộ điều khiển trên màn hình để di chuyển, chạm vật thể để mở nội dung, xoay ngang màn hình và xác nhận bố cục tự điều chỉnh.

**Acceptance Scenarios**:

1. **Given** khách truy cập bằng thiết bị cảm ứng, **When** khách vào thế giới, **Then** hệ thống hiển thị bộ điều khiển di chuyển trên màn hình.
2. **Given** khách đang ở trong thế giới trên thiết bị cảm ứng, **When** khách chạm vào một vật thể tương tác, **Then** hệ thống mở nội dung tương ứng.
3. **Given** khách xoay thiết bị hoặc thay đổi kích thước cửa sổ, **When** kích thước hiển thị thay đổi, **Then** bố cục tự điều chỉnh, không cần tải lại trang và không mất trạng thái hiện tại.

---

### US-10 — Truy cập đầy đủ nội dung ở chế độ 2D (Priority: P2)

**As a** khách truy cập trên máy cấu hình yếu hoặc trình duyệt hạn chế, **I want** vẫn đọc được nội dung portfolio, **so that** tôi không bỏ qua ứng viên chỉ vì thiết bị của tôi.

**Why this priority**: Bảo vệ mục tiêu kinh doanh khi trải nghiệm chính không khả dụng; là rủi ro lớn nhất của hướng tiếp cận 3D.

**Independent Test**: Mở trang trên môi trường không hiển thị được đồ họa 3D, xác nhận hệ thống chuyển sang chế độ 2D và toàn bộ nội dung portfolio vẫn tiếp cận được; từ thế giới 3D, chủ động chuyển sang chế độ 2D và ngược lại.

**Acceptance Scenarios**:

1. **Given** thiết bị không đáp ứng điều kiện hiển thị thế giới 3D, **When** khách mở trang, **Then** hệ thống chuyển sang chế độ 2D chứa đầy đủ nội dung portfolio, thay vì hiển thị màn hình lỗi hoặc màn hình trắng.
2. **Given** khách chỉ dùng bàn phím, **When** một bảng nội dung đang mở, **Then** khách di chuyển được qua toàn bộ nội dung và các liên kết trong bảng bằng bàn phím.
3. **Given** khách muốn tới thẳng một khu vực nội dung, **When** khách sử dụng lối vào trực tiếp, **Then** hệ thống mở khu vực đó mà không bắt buộc phải điều khiển nhân vật đi tới.
4. **Given** khách đang ở trong thế giới 3D, **When** khách chủ động chuyển sang chế độ 2D, **Then** khách xem được đúng những nội dung đã có trong thế giới 3D và quay lại được chế độ 3D.
5. **Given** khách đang ở chế độ 2D, **When** chủ portfolio cập nhật một dự án, **Then** nội dung mới hiển thị ở cả chế độ 2D và thế giới 3D mà không phải cập nhật hai lần.

---

### US-11 — Chủ portfolio cập nhật nội dung (Priority: P2)

**As a** chủ portfolio, **I want** thêm và sửa dự án, kinh nghiệm, kỹ năng, thông tin liên hệ mà không phải dựng lại thế giới 3D, **so that** portfolio luôn cập nhật với chi phí thấp.

**Why this priority**: Quyết định tuổi thọ sử dụng của sản phẩm sau khi phát hành.

**Independent Test**: Thêm một dự án mới, xuất bản, mở trang và xác nhận dự án xuất hiện đúng vị trí mà không có thay đổi nào ở mô hình 3D.

**Acceptance Scenarios**:

1. **Given** chủ portfolio thêm một dự án mới, **When** nội dung được xuất bản, **Then** dự án hiển thị trong khu vực dự án mà không cần thay đổi mô hình hay bố cục thế giới 3D.
2. **Given** một khu vực nội dung chưa có dữ liệu, **When** khách mở khu vực đó, **Then** hệ thống hiển thị trạng thái rỗng có thông báo hoặc ẩn khu vực, không hiển thị lỗi.
3. **Given** chủ portfolio nhập thiếu trường bắt buộc của một dự án, **When** thực hiện xuất bản, **Then** hệ thống báo lỗi và không xuất bản nội dung không hợp lệ.

---

### US-12 — Chia sẻ liên kết portfolio (Priority: P3)

**As a** khách truy cập hoặc chủ portfolio, **I want** chia sẻ liên kết và thấy bản xem trước hấp dẫn, **so that** người nhận có lý do để bấm vào.

**Why this priority**: Khuếch đại lượt truy cập nhưng không phải điều kiện để sản phẩm hoạt động.

**Independent Test**: Dán đường dẫn vào nền tảng nhắn tin và mạng xã hội phổ biến, xác nhận hiển thị đúng tiêu đề, mô tả và ảnh xem trước.

**Acceptance Scenarios**:

1. **Given** đường dẫn được chia sẻ, **When** nền tảng nhận tạo bản xem trước, **Then** bản xem trước hiển thị đúng tiêu đề, mô tả và ảnh đại diện của portfolio.
2. **Given** khách nhận được liên kết trỏ thẳng tới một khu vực nội dung, **When** khách mở liên kết đó, **Then** hệ thống mở đúng khu vực nội dung được trỏ tới.

---

### US-13 — Chuyển ngôn ngữ hiển thị (Priority: P2)

**As a** khách truy cập, **I want** đọc portfolio bằng tiếng Việt hoặc tiếng Anh tùy nhu cầu, **so that** tôi hiểu đúng nội dung mà không phải tự dịch.

**Why this priority**: Mở rộng tập khách sang cả nhà tuyển dụng trong nước và quốc tế; không phải điều kiện để sản phẩm chạy nhưng ảnh hưởng trực tiếp BO-04.

**Independent Test**: Mở trang bằng trình duyệt đặt tiếng Việt và bằng trình duyệt đặt tiếng Anh, xác nhận ngôn ngữ ban đầu đúng; chuyển ngôn ngữ trong khi một bảng nội dung đang mở; tải lại trang và xác nhận lựa chọn được giữ.

**Acceptance Scenarios**:

1. **Given** khách mở trang lần đầu, **When** trình duyệt đặt tiếng Việt, **Then** hệ thống hiển thị nội dung tiếng Việt; nếu không xác định được ngôn ngữ trình duyệt thì hiển thị tiếng Anh.
2. **Given** một bảng nội dung đang mở, **When** khách chuyển ngôn ngữ, **Then** nội dung trong bảng đổi sang ngôn ngữ mới, bảng vẫn mở và vị trí nhân vật không thay đổi.
3. **Given** khách đã chọn một ngôn ngữ, **When** khách tải lại trang, **Then** hệ thống giữ nguyên ngôn ngữ đã chọn.
4. **Given** một mục nội dung chưa có bản dịch ở ngôn ngữ đang chọn, **When** khách mở mục đó, **Then** hệ thống hiển thị nội dung ở ngôn ngữ còn lại kèm chỉ dấu, không để chỗ trống.

---

### Edge Cases

| ID | Tình huống | Kỳ vọng |
|----|-----------|---------|
| EC-01 | Thiết bị hoặc trình duyệt không hiển thị được đồ họa 3D | Chuyển sang chế độ 2D đầy đủ nội dung (mục 3.15), không hiện màn hình trắng hay lỗi kỹ thuật |
| EC-02 | Kết nối chậm, tài nguyên tải lâu | Hiển thị tiến trình tải; nếu vượt ngưỡng chờ thì đề nghị chuyển sang chế độ 2D |
| EC-03 | Tải tài nguyên thất bại giữa chừng | Thông báo dễ hiểu kèm hành động thử lại |
| EC-04 | Thiết bị đáp ứng thấp, hiển thị giật | Tự hạ mức chi tiết hiển thị thay vì giữ nguyên và giật |
| EC-05 | Khách giữ phím di chuyển rồi mở bảng nội dung | Nhân vật dừng lại, không tiếp tục trôi khi bảng đóng |
| EC-06 | Khách nhấn nhiều phím cùng lúc hoặc chuyển tab khi đang giữ phím | Không kẹt trạng thái phím; nhân vật dừng khi tab mất tiêu điểm |
| EC-07 | Nhân vật bị kẹt trong hình học của vật thể | Có cơ chế đưa nhân vật về vị trí hợp lệ gần nhất |
| EC-08 | Trình duyệt chặn tự phát âm thanh | Không phát âm thanh cho tới khi khách chủ động bật; không hiện lỗi |
| EC-09 | Tab bị ẩn hoặc thiết bị khóa màn hình | Dừng vòng lặp hiển thị và tạm dừng âm thanh; khôi phục khi quay lại |
| EC-10 | Khách xoay màn hình hoặc thay đổi kích thước cửa sổ giữa phiên | Bố cục tự điều chỉnh, không mất trạng thái |
| EC-11 | Một khu vực nội dung không có dữ liệu | Trạng thái rỗng có thông báo hoặc ẩn khu vực; không hiển thị lỗi |
| EC-12 | Liên kết ngoài của dự án hỏng hoặc bị gỡ | Hệ thống không tự kiểm tra được; cần cơ chế để chủ portfolio rà soát định kỳ (OQ) |
| EC-13 | Khách dùng bố cục bàn phím khác (không phải QWERTY) | Điều khiển vẫn dùng được; phím mũi tên luôn là phương án thay thế |
| EC-14 | Khách chỉ dùng bàn phím hoặc trình đọc màn hình | Truy cập được toàn bộ nội dung văn bản qua lối vào trực tiếp (FR-050) |
| EC-15 | Khách tải lại trang giữa phiên | Quay về màn hình khởi động; không yêu cầu khôi phục vị trí nhân vật, nhưng giữ nguyên ngôn ngữ và chế độ hiển thị đã chọn |
| EC-16 | Khách chuyển ngôn ngữ khi một bảng nội dung đang mở | Bảng vẫn mở, chỉ nội dung đổi ngôn ngữ; không đóng bảng, không dịch chuyển nhân vật |
| EC-17 | Một mục nội dung chưa có bản dịch ở ngôn ngữ đang chọn | Hiển thị bản ngôn ngữ còn lại kèm chỉ dấu (FR-070) |
| EC-18 | Khách mở liên kết gắn ngôn ngữ này trong khi trình duyệt đặt ngôn ngữ khác | Ưu tiên ngôn ngữ chỉ định trong liên kết |
| EC-19 | Khách chuyển qua lại giữa chế độ 3D và 2D nhiều lần trong một phiên | Không tải lại toàn bộ tài nguyên mỗi lần chuyển; giữ nguyên khu vực nội dung đang xem |

---

## 3. Requirements *(mandatory)*

### 3.1 Khởi động và tải tài nguyên

- **FR-001**: Hệ thống MUST hiển thị màn hình khởi động với một hành động bắt đầu rõ ràng trước khi vào thế giới 3D.
- **FR-002**: Hệ thống MUST hiển thị trạng thái tiến trình tải tài nguyên và chỉ cho phép bắt đầu khi nhóm tài nguyên bắt buộc đã sẵn sàng.
- **FR-003**: Hệ thống MUST phân biệt nhóm tài nguyên bắt buộc cho lần hiển thị đầu tiên và nhóm tài nguyên tải bổ sung sau khi vào thế giới.
- **FR-004**: Hệ thống MUST hiển thị thông báo lỗi dễ hiểu kèm hành động thử lại khi tải tài nguyên thất bại.
- **FR-005**: Hệ thống MUST kiểm tra khả năng hiển thị 3D của thiết bị trước khi vào thế giới và chuyển sang chế độ 2D (mục 3.15) khi không đáp ứng.
- **FR-006**: Hệ thống MUST hiển thị vị trí xuất phát cố định của nhân vật ở mỗi phiên mới; hệ thống KHÔNG bắt buộc khôi phục vị trí của phiên trước.

### 3.2 Điều khiển nhân vật và camera

- **FR-007**: Người dùng MUST di chuyển được nhân vật theo bốn hướng bằng bàn phím, hỗ trợ đồng thời cụm phím WASD và cụm phím mũi tên.
- **FR-008**: Người dùng MUST chuyển được giữa trạng thái đi và chạy bằng cách giữ một phím bổ trợ.
- **FR-009**: Hệ thống MUST hiển thị hoạt ảnh nhân vật tương ứng ba trạng thái: đứng yên, đi, chạy.
- **FR-010**: Camera MUST bám theo nhân vật và giữ nhân vật trong khung hình ở mọi vị trí hợp lệ trong thế giới.
- **FR-011**: Người dùng MUST phóng to và thu nhỏ được góc nhìn trong khoảng giới hạn do hệ thống đặt.
- **FR-012**: Hệ thống MUST chặn nhân vật đi xuyên vật thể đặc và đi ra ngoài ranh giới thế giới.
- **FR-013**: Hệ thống MUST xử lý được nhiều phím hướng nhấn đồng thời để tạo chuyển động chéo, và MUST đưa nhân vật về trạng thái đứng yên khi cửa sổ mất tiêu điểm.
- **FR-014**: Hệ thống MUST có cơ chế đưa nhân vật về vị trí hợp lệ gần nhất khi phát hiện nhân vật ở vị trí không hợp lệ.

### 3.3 Thế giới 3D và vật thể tương tác

- **FR-015**: Thế giới MUST là một không gian liền mạch, kích thước hữu hạn, có ranh giới nhận biết được bằng thị giác.
- **FR-016**: Mỗi khu vực nội dung MUST được đại diện bởi ít nhất một vật thể tương tác đặt trong thế giới.
- **FR-017**: Hệ thống MUST hiển thị chỉ dấu trực quan khi nhân vật nằm trong phạm vi tương tác của một vật thể, kèm chỉ dẫn thao tác cần thực hiện.
- **FR-018**: Người dùng MUST kích hoạt được tương tác bằng phím tương tác hoặc bằng cách bấm/chạm trực tiếp vào vật thể.
- **FR-019**: Khi nhiều vật thể cùng nằm trong phạm vi tương tác, hệ thống MUST chọn vật thể gần nhân vật nhất.
- **FR-020**: Hệ thống MUST vô hiệu hóa điều khiển di chuyển khi một bảng nội dung đang mở và khôi phục ngay khi bảng đóng.
- **FR-021**: Người dùng MUST đóng được bảng nội dung bằng ít nhất hai cách: nút đóng và phím thoát.
- **FR-022**: Hệ thống MUST hiển thị một gợi ý ngắn ở đầu phiên cho biết người dùng đang điều khiển nhân vật.

### 3.4 Nội dung portfolio

- **FR-023**: Hệ thống MUST cung cấp khu vực giới thiệu gồm tên, vai trò nghề nghiệp và mô tả ngắn về chủ portfolio.
- **FR-024**: Hệ thống MUST cung cấp khu vực kỹ năng, trình bày theo nhóm phân loại.
- **FR-025**: Hệ thống MUST cung cấp danh sách dự án theo thứ tự do chủ portfolio sắp xếp.
- **FR-026**: Mỗi dự án MUST gồm tên, mô tả, vai trò của chủ portfolio trong dự án, danh sách công nghệ sử dụng và ít nhất một hình ảnh minh họa.
- **FR-027**: Mỗi dự án MUST hỗ trợ tối đa hai liên kết ngoài (bản chạy thử và mã nguồn); liên kết không có giá trị thì không được hiển thị.
- **FR-028**: Liên kết ngoài MUST mở ở cửa sổ hoặc tab mới và MUST không làm mất trạng thái thế giới 3D ở tab hiện tại.
- **FR-029**: Hệ thống MUST cung cấp khu vực kinh nghiệm làm việc theo trình tự thời gian; mỗi mục gồm tổ chức, vai trò, khoảng thời gian và mô tả ngắn.
- **FR-030**: Nội dung dài trong một bảng MUST cuộn được bên trong bảng và MUST không làm vỡ bố cục của thế giới phía sau.
- **FR-031**: Toàn bộ nội dung hiển thị cho khách truy cập MUST có sẵn ở cả tiếng Việt và tiếng Anh; yêu cầu chi tiết ở mục 3.14.

### 3.5 Liên hệ và CV

- **FR-032**: Hệ thống MUST cung cấp khu vực liên hệ hiển thị các kênh liên hệ công khai do chủ portfolio cấu hình.
- **FR-033**: Người dùng MUST tải được CV của chủ portfolio ở định dạng tài liệu phổ biến, mở được mà không cần cài thêm phần mềm.
- **FR-034**: Hệ thống MUST hiển thị trạng thái sẵn sàng nhận cơ hội của chủ portfolio khi trạng thái này được cấu hình.
- **FR-035**: Cơ chế để khách chủ động liên hệ MUST là hiển thị địa chỉ thư điện tử và các liên kết mạng xã hội công khai của chủ portfolio; hệ thống MUST không cung cấp form nhập và gửi liên hệ trên trang.
- **FR-036**: Hệ thống MUST cho phép sao chép nhanh địa chỉ thư điện tử và MUST hiển thị xác nhận rõ ràng khi thao tác sao chép thành công.

### 3.6 Hướng dẫn và trợ giúp

- **FR-037**: Hệ thống MUST cung cấp bảng hướng dẫn điều khiển, truy cập được bất kỳ lúc nào khi đang ở trong thế giới.
- **FR-038**: Bảng hướng dẫn MUST mô tả đủ các thao tác: di chuyển, chạy, tương tác, phóng to và thu nhỏ.
- **FR-039**: Bảng hướng dẫn MUST hiển thị bộ thao tác tương ứng loại thiết bị đang sử dụng (bàn phím hoặc cảm ứng).

### 3.7 Âm thanh

- **FR-040**: Hệ thống MUST cung cấp nhạc nền có thể bật hoặc tắt bất kỳ lúc nào từ trong thế giới.
- **FR-041**: Hệ thống MUST không phát bất kỳ âm thanh nào trước khi người dùng có hành động tương tác đầu tiên với trang.
- **FR-042**: Hệ thống MUST giữ nguyên lựa chọn bật/tắt âm thanh trong suốt phiên truy cập.
- **FR-043**: Hệ thống MUST tạm dừng âm thanh khi tab không còn hiển thị và khôi phục theo lựa chọn cũ khi quay lại.

### 3.8 Thiết bị cảm ứng và hiển thị đáp ứng

- **FR-044**: Trên thiết bị cảm ứng, hệ thống MUST cung cấp bộ điều khiển di chuyển trên màn hình và thao tác chạm để tương tác với vật thể.
- **FR-045**: Hệ thống MUST hiển thị đầy đủ nội dung portfolio trên mọi kích thước màn hình được hỗ trợ, không cắt bớt nội dung theo kích thước.
- **FR-046**: Hệ thống MUST tự điều chỉnh bố cục khi kích thước cửa sổ hoặc hướng màn hình thay đổi, không cần tải lại trang và không mất trạng thái hiện tại.

### 3.9 Khả năng tiếp cận và lối vào nội dung

- **FR-047**: Khi thiết bị không hiển thị được thế giới 3D, hệ thống MUST chuyển sang chế độ 2D cung cấp đầy đủ toàn bộ nội dung portfolio; yêu cầu chi tiết ở mục 3.15.
- **FR-048**: Người dùng MUST duyệt được toàn bộ nội dung văn bản và liên kết trong một bảng nội dung chỉ bằng bàn phím.
- **FR-049**: Hình ảnh mang thông tin MUST có mô tả thay thế bằng văn bản.
- **FR-050**: Hệ thống MUST cung cấp lối vào trực tiếp tới từng khu vực nội dung, không bắt buộc người dùng điều khiển nhân vật đi tới vật thể tương ứng.
- **FR-051**: Hệ thống MUST cho phép giảm hoặc tắt các hiệu ứng chuyển động không thiết yếu khi người dùng đã đặt tùy chọn hạn chế chuyển động ở thiết bị.

### 3.10 Hiệu năng

- **FR-052**: Hệ thống MUST duy trì nhịp hiển thị mượt trên cấu hình thiết bị mục tiêu do chủ portfolio xác định.
- **FR-053**: Hệ thống MUST tự hạ mức chi tiết hiển thị hoặc hiệu ứng khi phát hiện thiết bị không đáp ứng, thay vì giữ nguyên và để trải nghiệm giật.
- **FR-054**: Tổng dung lượng nhóm tài nguyên bắt buộc cho lần vào đầu tiên MUST nằm trong ngưỡng do chủ portfolio đặt.
- **FR-055**: Hệ thống MUST dừng vòng lặp hiển thị khi tab không hiển thị và khôi phục khi tab hiển thị trở lại.

### 3.11 Tìm kiếm và chia sẻ

- **FR-056**: Hệ thống MUST cung cấp tiêu đề, mô tả và ảnh xem trước cho liên kết khi được chia sẻ trên các nền tảng phổ biến.
- **FR-057**: Nội dung portfolio dạng văn bản MUST đọc được bởi công cụ tìm kiếm mà không cần chạy thế giới 3D.
- **FR-058**: Hệ thống MUST hỗ trợ liên kết trỏ trực tiếp tới một khu vực nội dung cụ thể và mở đúng khu vực đó khi liên kết được truy cập.

### 3.12 Quản trị nội dung

- **FR-059**: Chủ portfolio MUST thêm, sửa và gỡ được dự án, mục kinh nghiệm, nhóm kỹ năng và kênh liên hệ mà không phải thay đổi mô hình hoặc bố cục thế giới 3D.
- **FR-060**: Hệ thống MUST kiểm tra tính hợp lệ của nội dung trước khi xuất bản và MUST từ chối xuất bản khi thiếu trường bắt buộc.
- **FR-061**: Hệ thống MUST xử lý được khu vực nội dung không có dữ liệu bằng trạng thái rỗng có thông báo hoặc ẩn khu vực, không hiển thị lỗi.
- **FR-062**: Hệ thống MUST cho phép chủ portfolio cấu hình thứ tự hiển thị của danh sách dự án và danh sách kinh nghiệm.

### 3.13 Quyền riêng tư và đo lường

- **FR-063**: Hệ thống MUST không yêu cầu đăng nhập và MUST không thu thập dữ liệu định danh cá nhân của khách truy cập, ngoài dữ liệu khách chủ động cung cấp qua kênh liên hệ.
- **FR-064**: Nếu sử dụng công cụ đo lường, hệ thống MUST giới hạn ở dữ liệu tổng hợp và MUST công bố việc sử dụng trên trang.
- **FR-065**: Dữ liệu khách gửi qua kênh liên hệ MUST chỉ được dùng để phản hồi khách và MUST không chuyển cho bên thứ ba ngoài dịch vụ nhận thư.

### 3.14 Đa ngôn ngữ (song ngữ Việt – Anh)

- **FR-066**: Hệ thống MUST cung cấp toàn bộ nội dung dành cho khách truy cập ở hai ngôn ngữ: tiếng Việt và tiếng Anh.
- **FR-067**: Hệ thống MUST cung cấp thao tác chuyển ngôn ngữ, truy cập được cả trong thế giới 3D và trong chế độ 2D.
- **FR-068**: Hệ thống MUST chọn ngôn ngữ hiển thị ban đầu theo thiết lập ngôn ngữ của trình duyệt và MUST dùng tiếng Anh khi không xác định được.
- **FR-069**: Hệ thống MUST giữ nguyên lựa chọn ngôn ngữ của khách khi chuyển giữa các khu vực nội dung và khi tải lại trang.
- **FR-070**: Khi một nội dung chưa có bản dịch ở ngôn ngữ đang chọn, hệ thống MUST hiển thị nội dung ở ngôn ngữ còn lại kèm chỉ dấu, MUST không để chỗ trống.
- **FR-071**: Mỗi ngôn ngữ MUST có địa chỉ truy cập riêng, để công cụ tìm kiếm thu thập được và để chia sẻ được liên kết đúng ngôn ngữ.
- **FR-072**: Thao tác chuyển ngôn ngữ MUST không làm mất trạng thái hiện tại của khách (vị trí nhân vật, khu vực nội dung đang mở, chế độ hiển thị).

### 3.15 Chế độ 2D đầy đủ nội dung

- **FR-073**: Hệ thống MUST cung cấp chế độ 2D chứa đầy đủ toàn bộ nội dung portfolio, tương đương nội dung tiếp cận được trong thế giới 3D.
- **FR-074**: Hệ thống MUST tự chuyển sang chế độ 2D khi thiết bị không đáp ứng điều kiện hiển thị thế giới 3D hoặc khi tải nhóm tài nguyên bắt buộc thất bại.
- **FR-075**: Người dùng MUST chủ động chuyển được sang chế độ 2D từ trong thế giới 3D, và quay lại thế giới 3D khi thiết bị đáp ứng.
- **FR-076**: Chế độ 2D MUST sử dụng được hoàn toàn bằng bàn phím và MUST không phụ thuộc vào thao tác điều khiển nhân vật.
- **FR-077**: Chế độ 2D MUST hiển thị được trên mọi kích thước màn hình được hỗ trợ và MUST không yêu cầu tải nhóm tài nguyên 3D bắt buộc.
- **FR-078**: Nội dung ở chế độ 2D và nội dung trong thế giới 3D MUST lấy từ cùng một nguồn nội dung, để một lần cập nhật có hiệu lực ở cả hai chế độ.
- **FR-079**: Hệ thống MUST giữ nguyên lựa chọn chế độ hiển thị của khách trong suốt phiên truy cập.

### 3.16 Key Entities

| Entity | Mô tả | Thuộc tính chính |
|--------|-------|------------------|
| Thế giới (World) | Không gian 3D chứa toàn bộ trải nghiệm | Ranh giới, vị trí xuất phát, danh sách vật thể |
| Vật thể tương tác (Interactive Object) | Điểm chạm giữa thế giới và nội dung | Vị trí, phạm vi kích hoạt, khu vực nội dung liên kết, chỉ dấu |
| Khu vực nội dung (Content Zone) | Một phần nội dung portfolio | Mã định danh, tiêu đề, loại nội dung, trạng thái rỗng |
| Bảng nội dung (Content Panel) | Lớp hiển thị nội dung chồng lên thế giới | Trạng thái mở/đóng, nội dung, cách đóng |
| Nhân vật (Avatar) | Đối tượng do người dùng điều khiển | Vị trí, hướng, trạng thái chuyển động |
| Hồ sơ (Profile) | Thông tin giới thiệu chủ portfolio | Tên, vai trò, mô tả ngắn, trạng thái sẵn sàng nhận cơ hội |
| Dự án (Project) | Một dự án đã thực hiện | Tên, mô tả, vai trò, công nghệ, hình ảnh, liên kết ngoài, thứ tự |
| Mục kinh nghiệm (Experience Item) | Một giai đoạn làm việc | Tổ chức, vai trò, khoảng thời gian, mô tả |
| Nhóm kỹ năng (Skill Group) | Tập kỹ năng cùng loại | Tên nhóm, danh sách kỹ năng |
| Kênh liên hệ (Contact Channel) | Một cách liên hệ công khai | Loại kênh, giá trị hiển thị, đích đến |
| Tài liệu CV (CV Document) | Bản CV tải về được | Tệp, phiên bản, ngày cập nhật |
| Cấu hình trải nghiệm (Experience Settings) | Lựa chọn của người dùng trong phiên | Bật/tắt âm thanh, mức chi tiết hiển thị, loại thiết bị điều khiển |
| Gói tài nguyên (Asset Bundle) | Tập tài nguyên 3D, hình ảnh, âm thanh | Nhóm bắt buộc / bổ sung, dung lượng |
| Bản dịch nội dung (Content Translation) | Bản nội dung theo từng ngôn ngữ | Ngôn ngữ, khóa nội dung, trạng thái đã dịch |
| Chế độ hiển thị (Display Mode) | Chế độ khách đang xem | 3D hoặc 2D, cách chuyển đổi, lý do chuyển tự động |

---

## 4. Success Criteria *(mandatory)*

### Measurable Outcomes

| ID | Tiêu chí |
|----|----------|
| SC-001 | Trên máy tính để bàn với kết nối băng thông thông thường, khách vào được thế giới và điều khiển được nhân vật trong vòng 10 giây kể từ khi mở đường dẫn |
| SC-002 | 90% khách mới, không đọc bảng hướng dẫn, tự di chuyển được nhân vật trong 15 giây đầu sau khi vào thế giới |
| SC-003 | 80% khách mới mở được ít nhất một khu vực nội dung trong 60 giây đầu của phiên |
| SC-004 | 80% khách tìm được thông tin liên hệ hoặc bản CV trong vòng 2 phút kể từ khi vào thế giới |
| SC-005 | Trải nghiệm giữ nhịp hiển thị mượt trong ít nhất 95% thời lượng phiên trên cấu hình thiết bị mục tiêu đã xác định |
| SC-006 | 100% nội dung portfolio tiếp cận được mà không bắt buộc phải điều khiển nhân vật đi tới vật thể |
| SC-007 | Trên thiết bị không hiển thị được thế giới 3D, khách nhận được lối truy cập nội dung thay thế trong vòng 3 giây kể từ khi mở trang |
| SC-008 | Thời lượng phiên trung bình đạt tối thiểu 90 giây |
| SC-009 | Tỷ lệ khách rời trang mà không mở bất kỳ khu vực nội dung nào không vượt quá 30% |
| SC-010 | Tỷ lệ khách thực hiện hành động liên hệ hoặc tải CV đạt tối thiểu 5% tổng lượt truy cập |
| SC-011 | Không ghi nhận trường hợp người dùng không thoát được bảng nội dung hoặc mất quyền điều khiển nhân vật trong toàn bộ bộ kịch bản kiểm thử |
| SC-012 | Chủ portfolio thêm một dự án mới và xuất bản trong không quá 15 phút, không cần thay đổi thế giới 3D |
| SC-013 | Liên kết chia sẻ hiển thị đúng tiêu đề, mô tả và ảnh xem trước trên tối thiểu 3 nền tảng chia sẻ phổ biến |
| SC-014 | Trên điện thoại, khách di chuyển được nhân vật và mở được ít nhất một khu vực nội dung mà không phải phóng to thủ công |
| SC-015 | 100% khu vực nội dung có sẵn ở cả tiếng Việt và tiếng Anh; mọi mục chưa có bản dịch đều hiển thị chỉ dấu, không có mục nào để trống |
| SC-016 | Khách chuyển ngôn ngữ và thấy nội dung ở ngôn ngữ mới trong vòng 1 giây, không mất trạng thái đang xem |
| SC-017 | Ở chế độ 2D, khách xem được 100% nội dung portfolio và tìm được thông tin liên hệ trong vòng 60 giây |

---

## 5. Assumptions

| ID | Giả định | Ảnh hưởng nếu sai |
|----|----------|-------------------|
| AS-01 | Portfolio thuộc về **một cá nhân developer**, không phải nhóm hay công ty; không có nhu cầu nhiều hồ sơ trên cùng một trang | Phải bổ sung mô hình nhiều hồ sơ, điều hướng giữa các hồ sơ |
| AS-02 | Trang công khai, không có đăng nhập, không có tài khoản người dùng | Kéo theo toàn bộ miền xác thực, phân quyền và bảo vệ dữ liệu |
| AS-03 | Nội dung tĩnh, không có nghiệp vụ giao dịch phía sau; ngoài kênh liên hệ, hệ thống không xử lý dữ liệu người dùng | Phải bổ sung backend nghiệp vụ và yêu cầu bảo mật tương ứng |
| AS-04 | Các khu vực nội dung của phiên bản đầu gồm: giới thiệu, kỹ năng, dự án, kinh nghiệm, liên hệ & CV | Thay đổi số lượng vật thể tương tác và bố cục thế giới |
| AS-05 | Thiết bị mục tiêu chính là máy tính để bàn và laptop; điện thoại là trải nghiệm phụ nhưng bắt buộc dùng được | Nếu điện thoại là kênh chính, phải đảo ưu tiên thiết kế điều khiển và ngân sách tài nguyên |
| AS-06 | Toàn bộ tài nguyên 3D, hình ảnh và âm thanh do chủ portfolio cung cấp và đã có quyền sử dụng hợp lệ | Rủi ro pháp lý về bản quyền; tài liệu này không xử lý vấn đề bản quyền |
| AS-07 | Nội dung được nạp từ nguồn cấu hình tách rời khỏi mô hình 3D | Mỗi lần cập nhật nội dung sẽ phải sửa cảnh 3D, phá vỡ BO-05 và SC-012 |
| AS-08 | Thế giới là một không gian duy nhất, không chia nhiều màn hay nhiều tầng | Phải bổ sung cơ chế chuyển cảnh và tải tài nguyên theo màn |
| AS-09 | Trải nghiệm dành cho một người tại một thời điểm, không có yếu tố nhiều người cùng lúc | Kéo theo hạ tầng đồng bộ trạng thái thời gian thực |
| AS-10 | Các ngưỡng định lượng (thời gian tải tối đa, nhịp hiển thị mục tiêu, dung lượng tài nguyên bắt buộc, cấu hình thiết bị mục tiêu) là tham số cấu hình, **chưa chốt giá trị** | Cần chốt trước khi thiết kế kỹ thuật và trước khi viết test case hiệu năng |
| AS-11 | Không có yêu cầu tuân thủ pháp lý đặc thù ngoài nguyên tắc chung về dữ liệu cá nhân | Nếu có nghĩa vụ cụ thể, phần 3.13 phải viết lại theo yêu cầu được xác nhận |
| AS-12 | Bản dịch tiếng Việt và tiếng Anh do chủ portfolio cung cấp; hệ thống không tự dịch nội dung | Phải bổ sung cơ chế dịch tự động và quy trình kiểm duyệt bản dịch |
| AS-13 | Chế độ 2D dùng chung nguồn nội dung với thế giới 3D, không phải một trang riêng biệt bảo trì tách rời | Chi phí bảo trì nhân đôi và rủi ro hai chế độ lệch nội dung |

> **Lưu ý**: Toàn bộ giả định trên **chưa được xác nhận**. Cần chủ portfolio xác nhận trước khi chuyển sang giai đoạn thiết kế.

---

## 6. Dependencies

| ID | Phụ thuộc | Loại | Ghi chú |
|----|-----------|------|---------|
| DEP-01 | Bộ tài nguyên 3D: mô hình thế giới, vật thể, nhân vật và hoạt ảnh | Nội bộ / bên thứ ba | Điều kiện bắt buộc để dựng thế giới; cần xác nhận nguồn và quyền sử dụng |
| DEP-02 | Nhạc nền và hiệu ứng âm thanh có quyền sử dụng hợp lệ | Bên thứ ba | Phục vụ mục 3.7 |
| DEP-03 | Nội dung portfolio thực tế: hồ sơ, danh sách dự án, hình ảnh dự án, kinh nghiệm, kỹ năng, CV | Nội bộ | Điều kiện để phát hành; thiếu thì chỉ dựng được khung |
| DEP-04 | Hạ tầng lưu trữ và phân phối nội dung tĩnh, đáp ứng tài nguyên dung lượng lớn | Bên thứ ba | Ảnh hưởng trực tiếp SC-001 |
| DEP-05 | Tên miền và chứng chỉ bảo mật | Bên thứ ba | Điều kiện phát hành |
| DEP-06 | Hộp thư điện tử công khai và các tài khoản mạng xã hội của chủ portfolio | Nội bộ | Chốt OQ-01: không dùng dịch vụ nhận form |
| DEP-08 | Bản dịch tiếng Việt và tiếng Anh của toàn bộ nội dung portfolio | Nội bộ | Điều kiện để phát hành; xem AS-12, mục 3.14 |
| DEP-07 | Công cụ đo lường hành vi truy cập | Bên thứ ba | Điều kiện để đo SC-003, SC-004, SC-008, SC-009, SC-010 |

---

## 7. Out of Scope

Các nội dung sau **không** thuộc phạm vi phiên bản đầu tiên:

| ID | Hạng mục | Lý do |
|----|----------|-------|
| OOS-01 | Nhiều người cùng có mặt trong thế giới, nhìn thấy nhau hoặc trò chuyện | Không phục vụ mục tiêu portfolio; kéo theo hạ tầng thời gian thực |
| OOS-02 | Tài khoản, đăng nhập, bình luận, sổ lưu bút | Trái với AS-02 |
| OOS-03 | Blog hoặc hệ quản trị nội dung đầy đủ | Ngoài phạm vi; nội dung phiên bản đầu là tập cố định |
| OOS-04 | Thương mại điện tử, thanh toán, đặt lịch | Không thuộc mục tiêu |
| ~~OOS-05~~ | ~~Đa ngôn ngữ và chuyển đổi ngôn ngữ~~ | **Retire 2026-09-08** — chốt OQ-03: song ngữ Việt–Anh thuộc phạm vi phiên bản đầu, xem mục 3.14 |
| OOS-06 | Thực tế ảo (VR) và thực tế tăng cường (AR) | Ngoài phạm vi |
| OOS-07 | Trình chỉnh sửa thế giới 3D trực tuyến cho chủ portfolio | Chi phí lớn, không phục vụ mục tiêu; chủ portfolio chỉ cần sửa nội dung |
| OOS-08 | Mini-game có tính điểm, thành tích, bảng xếp hạng | Ngoài phạm vi phiên bản đầu; có thể xem xét ở giai đoạn sau |
| OOS-09 | Khôi phục vị trí nhân vật của phiên trước | Xem FR-006 |
| OOS-10 | Form nhập và gửi liên hệ trực tiếp trên trang | Chốt OQ-01 ngày 2026-09-08: chỉ hiển thị thư điện tử và liên kết mạng xã hội |
| OOS-11 | Ngôn ngữ thứ ba ngoài tiếng Việt và tiếng Anh | Ngoài phạm vi phiên bản đầu |

---

## 8. Open Questions

Danh sách câu hỏi cần chủ portfolio trả lời được tách ra file riêng: `specs/001-3d-world-portfolio/open-questions.md`.

Toàn bộ câu hỏi chặn của phiên bản 0.1 đã được chủ portfolio chốt ngày 2026-09-08 (OQ-01, OQ-02, OQ-03). Spec **không còn câu hỏi chặn** và không còn marker `[NEEDS CLARIFICATION]`. Các lựa chọn triển khai và giá trị ngưỡng còn lại được theo dõi ở nhóm non-blocking (OQ-04 … OQ-18).

---

## 9. Change Log

| Phiên bản | Ngày | Thay đổi |
|-----------|------|----------|
| 0.1 | 2026-09-08 | Bản đầu tiên: 12 User Story, 15 edge case, FR-001…FR-065, SC-001…SC-014, AS-01…AS-11, DEP-01…DEP-07, OOS-01…OOS-09. Còn 3 câu hỏi chặn |
| 0.2 | 2026-09-08 | Chốt OQ-01, OQ-02, OQ-03: (a) liên hệ chỉ qua thư điện tử và liên kết mạng xã hội — cập nhật FR-035, FR-036, DEP-06, thêm OOS-10; (b) chế độ 2D đầy đủ nội dung — cập nhật FR-047, thêm mục 3.15 (FR-073…FR-079), cập nhật US-10, EC-01, EC-02, thêm EC-19, SC-017, AS-13; (c) nội dung song ngữ Việt–Anh — cập nhật FR-031, thêm mục 3.14 (FR-066…FR-072), US-13, EC-16…EC-18, SC-015, SC-016, AS-12, DEP-08; retire OOS-05, thêm OOS-11. Key Entities chuyển thành mục 3.16, bổ sung 2 entity. Mã FR cũ giữ nguyên để bảo toàn traceability |
