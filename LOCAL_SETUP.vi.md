# Huong dan chay local WEB-MRTEE

Tai lieu nay la duong chay nhanh cho may Windows/PowerShell.

## Yeu cau

- Node.js va npm.
- MySQL hoac MariaDB dang chay local, hoac bo MariaDB local da duoc cau hinh trong `.mariadb-data`.
- File `.env`. Neu chua co, script se tu copy tu `.env.example`.

## Cach nhanh nhat

Chay:

```powershell
npm run local:dev
```

Script se lam cac viec sau:

1. Kiem tra `node` va `npm`.
2. Tao `.env` tu `.env.example` neu thieu.
3. Chay `npm install` neu chua co `node_modules`.
4. Thu khoi dong MariaDB local bang `scripts/start-local-mariadb.ps1`.
5. Chay `prisma generate`, `prisma validate`, va `prisma migrate deploy`.
6. Mo Next.js dev server tai `http://localhost:3000`.

## Neu can seed du lieu

Chay base seed:

```powershell
npm run local:dev:seed
```

Hoac chay truc tiep script voi demo content:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-local.ps1 -Seed -Demo
```

Neu chi muon setup database/dependencies ma chua muon mo dev server:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-local.ps1 -NoServer
```

## Neu da co MySQL/MariaDB rieng

Sua `.env` cho dung database cua ban:

```env
DATABASE_URL="mysql://user:password@localhost:3306/mrtee_vn"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="mot-chuoi-bi-mat-dai"
LOCAL_UPLOADS_ENABLED="true"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="true"
```

Sau do chay, bo qua buoc khoi dong MariaDB bundled:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-local.ps1 -SkipDb
```

## Chay port khac

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev-local.ps1 -Port 3001
```

Mo trinh duyet tai:

```text
http://localhost:3001
```

## Lenh kiem tra chat luong

```powershell
npm run check
```

Lenh nay gom `lint`, `prisma validate`, va `tsc --noEmit`.

## Tai khoan va du lieu

Tai khoan mac dinh phu thuoc vao `prisma/seed.mjs`. Neu database moi hoan toan, hay chay:

```powershell
npm run db:seed
```

Neu muon nap them noi dung minh hoa:

```powershell
npm run db:demo
```

## Loi thuong gap

Neu script bao khong tim thay MariaDB tai `C:\Program Files\MariaDB 12.2\bin\mariadbd.exe`, co hai cach:

- Cai MariaDB dung duong dan do va tao `.mariadb-data` theo setup hien co.
- Dung MySQL/MariaDB rieng, sua `DATABASE_URL`, roi chay voi `-SkipDb`.

Neu upload local khong hoat dong, kiem tra hai bien nay trong `.env`:

```env
LOCAL_UPLOADS_ENABLED="true"
NEXT_PUBLIC_LOCAL_UPLOADS_ENABLED="true"
```
