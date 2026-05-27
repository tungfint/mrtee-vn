# mrtee.vn

mrtee.vn là website kỷ yếu số và kho lưu trữ giáo dục cho thầy Tee. Website dùng
để lưu ảnh, video, bài viết, album, thông tin lớp học, đội tuyển, hồ sơ học sinh,
lưu bút, blog và nhạc nền trong cùng một hệ thống.

Bản tiếng Anh nằm ở [README.md](./README.md).

## Mục Lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc project](#cấu-trúc-project)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Biến môi trường](#biến-môi-trường)
- [Cài đặt local](#cài-đặt-local)
- [Quy trình database](#quy-trình-database)
- [Các lệnh thường dùng](#các-lệnh-thường-dùng)
- [Các route public](#các-route-public)
- [Quy trình quản trị nội dung](#quy-trình-quản-trị-nội-dung)
- [Phân quyền](#phân-quyền)
- [Ảnh, video, album và nhạc](#ảnh-video-album-và-nhạc)
- [Kiến trúc giao diện](#kiến-trúc-giao-diện)
- [Kiểm tra chất lượng](#kiểm-tra-chất-lượng)
- [Ghi chú triển khai](#ghi-chú-triển-khai)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)

## Tính năng

- Trang chủ có hero carousel, điều hướng nhanh, bài viết nổi bật, album và video tổng hợp.
- Trang lớp học như `/tin2023`, `/tin2326`.
- Trang nhóm đội tuyển như `/hsg-tin`, `/ftc`, `/ai`.
- Trang đội tuyển theo năm như `/hsg-tin/2026`.
- Layout dùng chung cho trang lớp và trang đội tuyển theo năm.
- Trang blog public và trang chi tiết bài lưu bút.
- Trang hồ sơ học sinh.
- Dashboard quản trị lớp học, đội tuyển, học sinh, bài viết, lưu bút, album, playlist và thứ tự hiển thị.
- Nội dung hỗ trợ Markdown hoặc HTML.
- Bộ render HTML có lọc các tag nguy hiểm hoặc tag ảnh hưởng toàn trang.
- Gallery hỗ trợ xem slide, xem grid, lightbox ảnh, modal video, phím mũi tên và phím `Escape`.
- Hỗ trợ Google Drive thumbnail/preview cho ảnh, video, audio và folder.
- Hỗ trợ nhạc nền mặc định và playlist riêng theo album.
- Phân quyền theo vai trò admin, lớp trưởng/monitor đội tuyển và học sinh.

## Công nghệ sử dụng

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Lucide React icons
- MySQL/MariaDB
- Prisma 7
- NextAuth.js 4
- bcryptjs cho đăng nhập bằng mật khẩu
- react-markdown và remark-gfm cho Markdown
- Cloudinary-ready dependencies cho hướng mở rộng upload ảnh cloud

## Cấu trúc project

```text
.
├── prisma/
│   ├── schema.prisma              # Schema database
│   ├── seed.mjs                   # Dữ liệu seed ban đầu
│   ├── demo-content.mjs           # Dữ liệu demo/minh họa
│   └── migrations/                # Prisma migrations
├── public/
│   ├── templates/                 # Template CSV import thành viên
│   └── uploads/                   # File upload local
├── src/
│   ├── app/
│   │   ├── (public)/              # Route public
│   │   ├── (auth)/                # Route đăng nhập
│   │   ├── (dashboard)/           # Dashboard quản trị/người dùng
│   │   └── api/                   # API routes
│   ├── components/
│   │   ├── admin/                 # Component admin/dashboard
│   │   ├── audio/                 # Trình phát nhạc nền
│   │   ├── auth/                  # Form đăng nhập
│   │   ├── content/               # Component public dùng chung
│   │   ├── home/                  # Các phần của trang chủ
│   │   └── ui/                    # UI primitive nhỏ
│   ├── lib/
│   │   ├── auth.ts                # Cấu hình NextAuth
│   │   ├── permissions.ts         # Helper phân quyền
│   │   ├── media-urls.ts          # Helper URL media/Google Drive
│   │   ├── public-media.ts        # Helper media public dùng chung
│   │   ├── prisma.ts              # Prisma client
│   │   └── uploads.ts             # Helper upload
│   └── types/
│       └── next-auth.d.ts         # Mở rộng type NextAuth
├── .env.example
├── package.json
└── README.md
```

## Yêu cầu môi trường

- Node.js phù hợp với Next.js 16 và React 19.
- npm.
- MySQL/MariaDB. Với Tenten SSD Hosting Linux, tạo database MySQL và user trong control panel của hosting.
- Google OAuth app nếu muốn dùng đăng nhập Google.
- Cloudinary account nếu muốn bật luồng upload Cloudinary.

Project có `package-lock.json`, nên nên dùng npm thống nhất.

## Biến môi trường

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Trên Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Nội dung mẫu:

```env
DATABASE_URL="mysql://mrtee_user:mrtee_password@localhost:3306/mrtee_vn"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
LOCAL_UPLOADS_ENABLED="true"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="true"
```

### Bắt buộc

- `DATABASE_URL`: chuỗi kết nối MySQL/MariaDB. Với Tenten, thay `mrtee_user`, `mrtee_password`, host, port và tên database bằng thông tin trong hosting panel.
- `NEXTAUTH_URL`: khi chạy local thường là `http://localhost:3000`.
- `NEXTAUTH_SECRET`: chuỗi bí mật dài dùng cho NextAuth.

### Tùy chọn

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: cần khi dùng Google OAuth.
- `CLOUDINARY_*`: cần khi bật upload qua Cloudinary.
- `LOCAL_UPLOADS_ENABLED`: điều khiển việc upload có được ghi vào
  `public/uploads` trên server hay không. Thiết lập mặc định của project là
  `true`.
- `NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED`: công tắc phía client để hiện nút upload
  local. Nên để cùng giá trị với `LOCAL_UPLOADS_ENABLED`.

Tạo secret local:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Cài đặt local

Cài dependencies:

```bash
npm install
```

Tạo `.env`:

```bash
cp .env.example .env
```

Sửa `.env`, sau đó generate Prisma Client:

```bash
npm run prisma:generate
```

Chạy migration:

```bash
npm run prisma:migrate
```

Seed dữ liệu ban đầu:

```bash
npm run db:seed
```

Nạp thêm dữ liệu demo nếu cần:

```bash
npm run db:demo
```

Chạy dev server:

```bash
npm run dev
```

Mở trình duyệt:

```text
http://localhost:3000
```

## Quy trình database

Kiểm tra schema Prisma:

```bash
npm run prisma:validate
```

Tạo/chạy migration khi sửa `prisma/schema.prisma`:

```bash
npm run prisma:migrate
```

Generate lại Prisma Client:

```bash
npm run prisma:generate
```

Mở Prisma Studio:

```bash
npm run prisma:studio
```

Seed dữ liệu:

```bash
npm run db:seed
npm run db:demo
```

Các model quan trọng:

- `User`: tài khoản, email, mật khẩu, vai trò.
- `Class`: lớp học, slug, ảnh bìa, slogan, thứ tự hiển thị, lớp trưởng.
- `StudentProfile`: hồ sơ/kỷ yếu của học sinh.
- `Team`: đội tuyển theo nhóm và năm.
- `TeamMember`: liên kết thành viên với đội tuyển theo năm.
- `Post`: bài blog public.
- `MemoryPost`: bài giới thiệu lớp, lưu bút lớp, bài đội tuyển, bài kỷ yếu học sinh.
- `MediaAsset`: media gắn với `MemoryPost`.
- `Album`: album thuộc lớp hoặc đội tuyển, có chế độ xem và tùy chọn hiện ở trang chủ.
- `AlbumItem`: ảnh/video/audio/link/file trong album.
- `MusicPlaylist`, `MusicTrack`: playlist và bài nhạc nền.

## Các lệnh thường dùng

```bash
npm run dev
```

Chạy server development.

```bash
npm run build
```

Build production và kiểm tra TypeScript trong quá trình build.

```bash
npm run start
```

Chạy server production sau khi build.

```bash
npm run lint
```

Chạy ESLint.

```bash
npx tsc --noEmit
```

Kiểm tra TypeScript riêng, không sinh file.

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

Các lệnh Prisma.

```bash
npm run db:seed
npm run db:demo
```

Nạp dữ liệu seed/demo.

## Các route public

Trang chủ:

- `/`

Trang lớp học:

- `/tin2023`
- `/tin2326`
- `/class/[slug]`

Trang đội tuyển:

- `/hsg-tin`
- `/hsg-tin/2026`
- `/ftc`
- `/ftc/[year]`
- `/ai`
- `/ai/[year]`
- `/team/[category]`
- `/team/[category]/[year]`

Blog, lưu bút, học sinh:

- `/blog`
- `/blog/[slug]`
- `/memory/[slug]`
- `/student/[id]`

Các route tương thích:

- `src/app/(public)/[slug]/page.tsx` chuyển tiếp các slug lớp/đội tuyển quen thuộc.
- `src/app/(public)/[slug]/[year]/page.tsx` chuyển tiếp các slug đội tuyển theo năm.

## Quy trình quản trị nội dung

Dashboard nằm dưới `/dashboard`.

Các khu vực admin chính:

- `/dashboard/admin`
- `/dashboard/admin/classes`
- `/dashboard/admin/classes/new`
- `/dashboard/admin/classes/[id]`
- `/dashboard/admin/teams`
- `/dashboard/admin/teams/new`
- `/dashboard/admin/teams/[id]`
- `/dashboard/admin/posts`
- `/dashboard/admin/memories`
- `/dashboard/admin/albums`
- `/dashboard/admin/music`
- `/dashboard/admin/students`

Quy trình tạo/sửa lớp học:

1. Tạo hoặc sửa lớp.
2. Nhập slug, thứ tự hiển thị, ảnh bìa, ảnh card, slogan, thành tích.
3. Gán lớp trưởng nếu cần.
4. Thêm hoặc import học sinh.
5. Thêm bài lưu bút:
   - `CLASS_INTRO`: bài giới thiệu chính.
   - `CLASS_STORY`: câu chuyện/lưu bút lớp.
   - `STUDENT_YEARBOOK`: bài gắn với học sinh.
6. Gắn media cho bài viết.
7. Tạo album và thêm album item.
8. Chọn bài/album có hiện ở trang chủ hay không.

Quy trình tạo/sửa đội tuyển:

1. Tạo đội tuyển theo category và năm.
2. Cài ảnh bìa, ảnh nền, ảnh card.
3. Nhập mô tả, intro content, thành tích.
4. Gán monitor nếu cần.
5. Thêm thành viên từ hồ sơ học sinh.
6. Thêm bài viết/lưu bút đội tuyển.
7. Tạo album, thêm ảnh/video.
8. Cài thứ tự hiển thị và tùy chọn hiện ở trang chủ.

## Phân quyền

Vai trò nằm trong `prisma/schema.prisma`:

- `ADMIN`: toàn quyền quản trị nội dung.
- `MONITOR`: quản lý nội dung lớp/đội tuyển được gán.
- `STUDENT`: quản lý hồ sơ/nội dung cá nhân trong phạm vi cho phép.

Helper phân quyền:

```text
src/lib/permissions.ts
src/lib/admin-auth.ts
```

Cấu hình NextAuth:

```text
src/lib/auth.ts
src/app/api/auth/[...nextauth]/route.ts
```

## Ảnh, video, album và nhạc

### Loại media

Các loại media hỗ trợ:

- `IMAGE`
- `VIDEO`
- `AUDIO`
- `LINK`
- `FILE`

### Google Drive

Helper Google Drive nằm ở:

```text
src/lib/media-urls.ts
```

Hệ thống có thể chuyển các link Drive hợp lệ thành:

- thumbnail ảnh/video
- preview embed file/video
- folder embed
- audio URL qua API proxy cho file audio Google Drive

Để media hiển thị ổn định, file/folder Google Drive nên được chia sẻ public hoặc
ở chế độ trình duyệt có thể truy cập.

### Chính sách lưu trữ

Project cho phép upload local mặc định vì website chủ yếu do một nhóm nhỏ đáng
tin cậy sử dụng. Upload local tiện cho ảnh nhỏ, nhưng với album/video lớn vẫn
nên dùng lưu trữ ngoài.

- Ảnh nhỏ hoặc media dùng thỉnh thoảng có thể upload local vào `public/uploads`.
- Album lớn, video và audio nên lưu trên Google Drive, Cloudinary hoặc CDN rồi
  dán URL public vào form quản trị.
- Database chỉ lưu URL hoặc đường dẫn local, tiêu đề, chú thích, loại media và
  thứ tự.
- App không tải media Google Drive về database.

Thiết lập mặc định:

```env
LOCAL_UPLOADS_ENABLED="true"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="true"
```

Nếu hosting quá ít dung lượng, có thể tắt upload local và chỉ cho nhập URL:

```env
LOCAL_UPLOADS_ENABLED="false"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="false"
```

Khi bật upload local, nên nhắc người nhập liệu giữ file nhỏ và dùng Google
Drive/Cloudinary cho media số lượng lớn.

### Chế độ xem album

Album hỗ trợ:

- `SLIDE`: xem ảnh/video dạng trình chiếu.
- `GRID`: xem dạng lưới có cuộn.

Người dùng có thể đổi giữa `Xem slide` và `Xem grid` ở UI public.

### Trải nghiệm ảnh

- Ảnh mở bằng lightbox.
- Phím mũi tên trái/phải chuyển ảnh.
- Phím `Escape` đóng lightbox.

### Trải nghiệm video

- Video có thumbnail từ Drive/YouTube nếu helper lấy được.
- Bấm video mở modal player.
- Phím `Escape` đóng modal video.

### Nhạc nền

Nhạc dùng các model:

- `MusicPlaylist`
- `MusicTrack`

Website có thể dùng playlist mặc định toàn site và playlist riêng theo album.

## Kiến trúc giao diện

Component dùng chung quan trọng:

- `src/components/content/collection-page.tsx`
  - Layout chung cho trang lớp và trang đội tuyển theo năm.
- `src/components/content/media-gallery.tsx`
  - Gallery slide/grid, lightbox ảnh, modal video, audio và link/file.
- `src/components/content/album-showcase.tsx`
  - Wrapper album có nút đổi slide/grid và playlist.
- `src/components/content/memory-post-card.tsx`
  - Card preview bài lưu bút/câu chuyện.
- `src/components/ui/background-card.tsx`
  - Card nền ảnh dùng chung.
- `src/components/home/home-navigation.tsx`
  - Điều hướng nhanh ở trang chủ.
- `src/components/home/home-posts-carousel.tsx`
  - Carousel bài viết ở trang chủ.
- `src/components/home/home-hero-carousel.tsx`
  - Hero carousel trang chủ.

Quy ước thiết kế:

- Ưu tiên component/hàm dùng chung, tránh copy layout giữa các page.
- Trang lớp và trang đội tuyển phải đi qua `CollectionPage` để giữ đồng bộ.
- Các card public nên có ảnh nền nếu có dữ liệu.
- Mô tả trong card lặp lại nên giới hạn 2 dòng.
- Phần album nhiều media nên cuộn nội bộ, không kéo toàn trang quá dài.
- Dùng icon từ `lucide-react`.
- Ưu tiên helper trong `src/lib` trước khi viết logic mới.

## Kiểm tra chất lượng

Trước khi bàn giao thay đổi UI/content, chạy:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Nên kiểm tra các route:

- `/`
- `/tin2023`
- `/tin2326`
- `/hsg-tin`
- `/hsg-tin/2026`
- `/blog`

Checklist giao diện:

- Không có scroll ngang.
- Text không tràn khỏi nút/card.
- Mô tả card clamp 2 dòng đúng.
- Album nhiều ảnh/video cuộn bên trong.
- Lightbox ảnh mở/đóng được.
- Modal video mở/đóng được.
- `Escape` đóng modal/lightbox.
- Phím mũi tên chuyển ảnh trong lightbox.

## Ghi chú triển khai

1. Chuẩn bị MySQL/MariaDB.
2. Cài biến môi trường production.
3. Chạy Prisma migrations.
4. Build app.
5. Chạy production server.

Trình tự thường dùng:

```bash
npm install
npm run prisma:deploy
npm run prisma:generate
npm run build
npm run start
```

Nếu deploy lên Vercel hoặc nền tảng tương tự, cần cài:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- Google OAuth variables nếu dùng Google login
- Cloudinary variables nếu dùng Cloudinary

Migration nên được chạy trong workflow deploy hoặc chạy thủ công trước khi mở traffic.

## Xử lý lỗi thường gặp

### Prisma không kết nối được database

Kiểm tra:

- MySQL/MariaDB đang chạy.
- `DATABASE_URL` đúng.
- Database đã tồn tại.
- Network/firewall không chặn kết nối.

Sau đó chạy:

```bash
npm run prisma:validate
npm run prisma:generate
```

### Không đăng nhập được

Kiểm tra:

- `NEXTAUTH_URL` đúng URL hiện tại.
- `NEXTAUTH_SECRET` đã được set.
- Google OAuth callback đúng nếu dùng Google login.
- User tồn tại và có đúng role/password nếu dùng credentials login.

### Thumbnail Google Drive không hiện

Kiểm tra:

- File Drive đã share public hoặc trình duyệt truy cập được.
- URL đúng dạng Drive file/folder được hỗ trợ.
- Với video thumbnail, nên dùng link file Google Drive hoặc YouTube URL được helper hỗ trợ.

### Nội dung HTML làm vỡ layout

Nội dung HTML được render qua `RichContent`. Component này loại bỏ các tag có
thể ảnh hưởng toàn trang như `script`, `style`, `head`, `html`, `body`.

Nếu bài viết vẫn hiển thị xấu, kiểm tra HTML có style layout phức tạp hay không.
Nên chuyển sang Markdown hoặc HTML đã scope gọn trong nội dung.

### Cảnh báo hydration với `bis_skin_checked`

Một số browser extension tự chèn attribute như `bis_skin_checked` vào DOM. Điều
này có thể tạo warning hydration ở môi trường dev. App có script cleanup nhỏ,
nhưng warning vẫn có thể xuất hiện nếu extension sửa DOM trước khi React hydrate.

### Port 3000 đang bị chiếm

Chạy Next.js ở port khác:

```bash
npx next dev -p 3001
```

Trên Windows PowerShell, kiểm tra process đang nghe port 3000:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```
