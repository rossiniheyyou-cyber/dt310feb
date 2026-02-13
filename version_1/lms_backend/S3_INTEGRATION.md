# AWS S3 Secure Content Storage - Implementation Guide

## Overview

Secure S3 storage has been fully integrated into the DigitalT3 Learning Insights Platform. All file access is mediated by the backend using presigned URLs. No AWS credentials are exposed to the frontend.

---

## Architecture

### Storage Structure
- **Bucket Type**: Private (no public access)
- **Folder Structure**:
  - `/courses/{courseId}/lessons/{lessonId}/videos/` - Lesson videos
  - `/assignments/{assignmentId}/submissions/` - Assignment submissions
  - `/resources/{resourceId}/files/` - Resource files

### Security Model
- ✅ All access via presigned URLs (time-limited, 15 minutes)
- ✅ Backend validates JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ No AWS credentials in frontend
- ✅ Metadata stored in MySQL (not file binaries)

---

## Backend Implementation

### 1. Environment Variables

Add to `version_1/lms_backend/.env`:

```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=your-bucket-name
```

**Important**: These are read from `process.env` - no hardcoding.

### 2. Database Schema

**Table**: `media_metadata`
- Stores S3 object keys, file metadata, and associations
- Created via migration: `1700000000400-CreateMediaMetadataTable.js`
- Run migration: `npm run db:migrate`

**Entity**: `MediaMetadataEntity` in `src/entities/MediaMetadata.js`

### 3. API Endpoints

#### POST `/media/upload-url`
- **Auth**: Required (JWT)
- **Role**: Instructor/Admin only
- **Purpose**: Get presigned PUT URL for uploading files
- **Request Body**:
  ```json
  {
    "contentTypeCategory": "lesson_video",
    "fileName": "video.mp4",
    "contentType": "video/mp4",
    "courseId": 123,
    "lessonId": 456
  }
  ```
- **Response**:
  ```json
  {
    "fileKey": "courses/123/lessons/456/videos/video.mp4",
    "uploadUrl": "https://s3.amazonaws.com/...",
    "expiresIn": 900
  }
  ```

#### POST `/media/download-url`
- **Auth**: Required (JWT)
- **Role**: Learner/Instructor/Admin
- **Purpose**: Get presigned GET URL for downloading/viewing files
- **Request Body**:
  ```json
  {
    "fileKey": "courses/123/lessons/456/videos/video.mp4"
  }
  ```
- **Response**:
  ```json
  {
    "fileKey": "courses/123/lessons/456/videos/video.mp4",
    "downloadUrl": "https://s3.amazonaws.com/...",
    "expiresIn": 900
  }
  ```

#### GET `/media/download-url/:contentId`
- **Auth**: Required (JWT)
- **Role**: Learner/Instructor/Admin
- **Purpose**: Get download URL using media metadata ID
- **Response**: Same as POST `/media/download-url` plus metadata

### 4. Access Control

**Upload (Write)**:
- ✅ Requires `admin` or `instructor` role
- ✅ Validates JWT token
- ✅ Enforced via `rbac(WRITE_ROLES)` middleware

**Download (Read)**:
- ✅ Requires `admin`, `instructor`, or `learner` role
- ✅ Validates JWT token
- ✅ Checks user has access to content (course enrollment, etc.)
- ✅ Enforced via `rbac(READ_ROLES)` middleware + `checkContentAccess()`

### 5. Error Handling

- **503**: S3 not configured (missing `AWS_S3_BUCKET_NAME`)
- **400**: Validation error (invalid category, missing fields)
- **401**: Missing/invalid JWT token
- **403**: Insufficient permissions or no access to content
- **404**: File not found in metadata

All errors return JSON with `{ message: "..." }` format.

---

## Frontend Implementation (Placeholder)

### 1. Dependencies

Added to `version_keerthana/package.json`:
- `react-player`: ^2.13.0 (for video playback)

### 2. API Service

**File**: `lib/api/media.ts`
- `getUploadUrl()` - Get presigned upload URL
- `getDownloadUrl()` - Get presigned download URL
- `getDownloadUrlById()` - Get download URL by content ID
- `uploadFileToS3()` - Helper to upload file (gets URL + uploads)

### 3. Components

#### `FileUploadButton.tsx`
- Placeholder upload button for Instructor/Admin
- Handles file selection and upload to S3
- Shows upload progress
- Callbacks: `onUploadSuccess`, `onUploadError`

**Usage**:
```tsx
<FileUploadButton
  contentTypeCategory="lesson_video"
  courseId={123}
  lessonId={456}
  onUploadSuccess={(fileKey) => console.log('Uploaded:', fileKey)}
/>
```

#### `VideoPlayer.tsx`
- Placeholder video player using ReactPlayer
- Fetches presigned URL from backend
- Handles loading and error states

**Usage**:
```tsx
<VideoPlayer
  fileKey="courses/123/lessons/456/videos/video.mp4"
  className="w-full h-96"
  controls={true}
/>
```

---

## Setup Instructions

### Backend

1. **Configure AWS Credentials**:
   ```bash
   cd version_1/lms_backend
   # Edit .env and add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME
   ```

2. **Run Migration**:
   ```bash
   npm run db:migrate
   ```

3. **Start Backend**:
   ```bash
   npm run dev
   ```

### Frontend

1. **Install Dependencies**:
   ```bash
   cd version_keerthana
   npm install
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

---

## Testing

### Test Upload Flow

1. **Get Upload URL** (as Instructor/Admin):
   ```bash
   curl -X POST http://localhost:3001/media/upload-url \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "contentTypeCategory": "lesson_video",
       "fileName": "test.mp4",
       "contentType": "video/mp4",
       "courseId": 1,
       "lessonId": 1
     }'
   ```

2. **Upload File** (using returned `uploadUrl`):
   ```bash
   curl -X PUT "PRESIGNED_UPLOAD_URL" \
     -H "Content-Type: video/mp4" \
     --upload-file test.mp4
   ```

3. **Get Download URL**:
   ```bash
   curl -X POST http://localhost:3001/media/download-url \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "fileKey": "courses/1/lessons/1/videos/test.mp4"
     }'
   ```

### Test Frontend Components

1. **Upload Button**: Add to instructor course/lesson page
2. **Video Player**: Add to lesson detail page

---

## Security Checklist

- ✅ AWS credentials only in backend `.env` (not committed)
- ✅ No hardcoded credentials in code
- ✅ All access via presigned URLs (time-limited)
- ✅ JWT authentication required
- ✅ Role-based access control enforced
- ✅ Content access verification (course enrollment, etc.)
- ✅ Private S3 bucket (no public access)
- ✅ Metadata stored in MySQL (not file binaries)

---

## Swagger Documentation

All endpoints are documented in Swagger:
- Visit: http://localhost:3001/docs
- Look for "Media" tag
- See request/response schemas

---

## Troubleshooting

### "AWS_S3_BUCKET_NAME_MISSING"
- **Cause**: `AWS_S3_BUCKET_NAME` not set in `.env`
- **Fix**: Add `AWS_S3_BUCKET_NAME=your-bucket-name` to backend `.env`

### "Access denied to this content"
- **Cause**: User doesn't have access to the course/lesson
- **Fix**: Verify user enrollment or role

### "File not found"
- **Cause**: File metadata not in database or `fileKey` incorrect
- **Fix**: Ensure metadata was created during upload

### Presigned URL expired
- **Cause**: URL expired (15 minutes)
- **Fix**: Frontend should request new URL when needed

---

## Future Enhancements

- [ ] CloudFront CDN integration
- [ ] File size limits
- [ ] Content type validation
- [ ] Upload progress tracking
- [ ] Thumbnail generation
- [ ] Video transcoding
- [ ] Batch upload support

---

## Files Created/Modified

### Backend
- ✅ `src/entities/MediaMetadata.js` - Entity definition
- ✅ `src/migrations/1700000000400-CreateMediaMetadataTable.js` - Migration
- ✅ `src/routes/media.js` - Media API routes
- ✅ `src/config/db.js` - Added MediaMetadata entity
- ✅ `src/routes/index.js` - Added media routes
- ✅ `.env` - Added AWS S3 variables (commented)

### Frontend
- ✅ `lib/api/media.ts` - Media API service
- ✅ `components/media/FileUploadButton.tsx` - Upload component
- ✅ `components/media/VideoPlayer.tsx` - Video player component
- ✅ `package.json` - Added react-player dependency

---

**Status**: ✅ Complete and Ready for Testing
**Last Updated**: 2026-02-02
