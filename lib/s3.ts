import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_REGION as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS as string,
    secretAccessKey: process.env.S3_SECRET as string,
  },
});

export const downloadCVFromS3 = async (id: string) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${id}_CV`,
    });

    const data = await s3Client.send(command);
    console.log(data.ContentType);
    return data;
  } catch (e) {
    return null;
  }
};

export const uploadImageToS3 = async (
  file: Buffer,
  id: string,
  type: "Job" | "User",
): Promise<boolean> => {
  try {
    const fileBuffer = file;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: `${type}/${id}`,
      Body: fileBuffer,
      ContentType: "image/jpg",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return true;
  } catch (e) {
    return false;
  }
};

export const uploadPDFToS3 = async (
  file: Buffer,
  id: string,
): Promise<boolean> => {
  try {
    const fileBuffer = file;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: `${id}_CV`,
      Body: fileBuffer,
      ContentType: "application/pdf",
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return true;
  } catch (e) {
    return false;
  }
};
