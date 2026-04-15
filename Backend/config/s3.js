import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (localPath, fileName, mimeType) => {
  const fileStream = fs.createReadStream(localPath);

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `resumes/${fileName}`,
    Body: fileStream,
    ContentType: mimeType,
  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);

  // Return the public URL for the newly uploaded object
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/resumes/${fileName}`;
};
