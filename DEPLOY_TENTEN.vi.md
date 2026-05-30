# Deploy WEB-MRTEE len Tenten

Project da co Git remote:

```text
origin: https://github.com/tungfint/mrtee-vn.git
```

Tenten shared hosting hien dang chay bang cach upload file runtime da build san. Khong build Next.js tren host vi de cham gioi han RAM/process cua CloudLinux/CageFS.

## Deploy nhanh sau moi lan sua code

Tren may local:

```powershell
npm run check
npm run deploy:build
npm run deploy:package
```

File can upload len Tenten:

```text
Web-MrTee-tenten-runtime.tar.gz
```

Tren cPanel/Tenten:

1. Vao `Setup Node.js App`.
2. `Stop App`.
3. Vao `File Manager`, mo thu muc app `mrtee-vn`.
4. Upload `Web-MrTee-tenten-runtime.tar.gz`.
5. Extract ngay trong thu muc `mrtee-vn`.
6. Quay lai `Setup Node.js App`.
7. Bam `Restart` hoac `Start App`.

Neu chi sua giao dien/component/text/logic, khong can import database lai.

## Khi nao can Run NPM Install?

Chi can chay `Run NPM Install` tren Tenten khi `package.json` co thay doi dependencies.

Neu chi sua file trong `src`, `public`, CSS, component, page thi khong can.

## Khi nao can cap nhat database?

Neu sua `prisma/schema.prisma` va tao migration moi, can cap nhat database.

Do host hien bi gioi han khi chay Prisma qua `Run JS Script`, cach on dinh hon la tao/import SQL qua phpMyAdmin.

Lan dau da dung file:

```text
mrtee_tenten_import_utf8_case_correct.sql
```

Khong import lai file seed SQL vao site dang co du lieu that, vi no co the ghi de/xoa du lieu tren host.

## Tao lai SQL seed/import neu can reset database

Chi dung khi muon reset database ve du lieu local/demo.

Tren local, dam bao MariaDB dang chay va database local co du lieu dung, sau do tao SQL bang quy trinh trong `scripts` hoac nho Codex tao lai file `mrtee_tenten_import_utf8_case_correct.sql`.

Import bang phpMyAdmin:

1. Chon database `rbehtsy72q3o_mrtee_vn`.
2. Tab `Import`.
3. Chon file SQL dung UTF-8.
4. Charset neu co thi chon `utf8mb4`.
5. Bam `Go`.

## Bien moi truong tren Node.js App

Thiet lap trong `Setup Node.js App`, khong upload file `.env` local len host.

```env
NODE_ENV=production
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
NEXTAUTH_URL=https://mrtee.vn
NEXTAUTH_SECRET=replace-with-a-long-random-secret
LOCAL_UPLOADS_ENABLED=true
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED=true
```

Neu dung Google login thi them:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Tao `NEXTAUTH_SECRET` tren local:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Git workflow khuyen dung

Sau khi sua code va test local:

```powershell
git status
npm run check
git add .
git commit -m "Mo ta thay doi"
git push origin main
```

GitHub dung de luu version code. Tenten khong tu dong pull Git trong quy trinh hien tai; deploy van la build local va upload `Web-MrTee-tenten-runtime.tar.gz`.

## Cac file khong commit

Cac file nay da duoc ignore:

```text
Web-MrTee-*.tar.gz
Web-MrTee-*.zip
mrtee_tenten_import*.sql
.codex-artifacts/
.next/
node_modules/
.env
```

## Xu ly loi nhanh

- `Internal Server Error`: tai `stderr.log` trong thu muc app va doc 50-100 dong cuoi.
- Loi thieu Prisma runtime: goi `Web-MrTee-tenten-runtime.tar.gz` moi da chua san `.next/node_modules/@prisma` va `.next/node_modules/.prisma`.
- Loi font tieng Viet trong DB: import lai SQL dung UTF-8, khong dung file cu bi mojibake.
- `cagefs_enter: Unable to fork`: host cham gioi han tai nguyen, tranh chay build/migration nang tren host.
