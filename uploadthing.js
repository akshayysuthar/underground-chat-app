import { createUploadthing, FileRouter } from "@uploadthing/next";

const f = createUploadthing();

export const ChatFileRouter = f.router({
  imageUploader: f
    .fileTypes(["image"])
    .maxSize("4MB")
    .middleware(({ req }) => ({ userId: req.user.id })) // Attach userId to the upload
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file info to DB with userId
      console.log("Upload complete:", { metadata, file });
    }),
  documentUploader: f
    .fileTypes(["application/pdf", "application/msword"])
    .maxSize("10MB")
    .middleware(({ req }) => ({ userId: req.user.id })) // Attach userId to the upload
    .onUploadComplete(async ({ metadata, file }) => {
      // Save file info to DB with userId
      console.log("Upload complete:", { metadata, file });
    }),
});

export default ChatFileRouter;
