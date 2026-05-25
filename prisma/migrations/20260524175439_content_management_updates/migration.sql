-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "cardBackgroundImageCrop" TEXT,
ADD COLUMN     "coverImageCrop" TEXT;

-- AlterTable
ALTER TABLE "MemoryPost" ADD COLUMN     "backgroundImageCrop" TEXT,
ADD COLUMN     "coverImageCrop" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "backgroundImageCrop" TEXT,
ADD COLUMN     "coverImageCrop" TEXT;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "avatarCrop" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "coverImageCrop" TEXT,
ADD COLUMN     "customPhoto1Crop" TEXT,
ADD COLUMN     "customPhoto2Crop" TEXT,
ADD COLUMN     "photoWithTeacherCrop" TEXT,
ADD COLUMN     "postGraduateWork" TEXT,
ADD COLUMN     "school" TEXT,
ADD COLUMN     "university" TEXT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "backgroundImageCrop" TEXT,
ADD COLUMN     "cardBackgroundImage" TEXT,
ADD COLUMN     "cardBackgroundImageCrop" TEXT,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "coverImageCrop" TEXT,
ADD COLUMN     "introContent" TEXT,
ADD COLUMN     "introFormat" "ContentFormat" NOT NULL DEFAULT 'MARKDOWN',
ADD COLUMN     "monitorId" TEXT;

-- CreateTable
CREATE TABLE "StudentYearRecord" (
    "id" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "className" TEXT,
    "school" TEXT,
    "email" TEXT,
    "nickname" TEXT,
    "dob" DATE,
    "avatar" TEXT,
    "photoWithTeacher" TEXT,
    "customPhoto1" TEXT,
    "customPhoto2" TEXT,
    "coverImage" TEXT,
    "university" TEXT,
    "postGraduateWork" TEXT,
    "futureGoal" TEXT,
    "shortMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentYearRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentYearRecord_year_idx" ON "StudentYearRecord"("year");

-- CreateIndex
CREATE UNIQUE INDEX "StudentYearRecord_studentProfileId_year_key" ON "StudentYearRecord"("studentProfileId", "year");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentYearRecord" ADD CONSTRAINT "StudentYearRecord_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
