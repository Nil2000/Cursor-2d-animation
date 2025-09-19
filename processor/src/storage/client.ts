import { Client } from "minio";

let minioClient: Client | null = null;

export const getMinioClient = (): Client => {
  if (
    !process.env.S3_ENDPOINT ||
    !process.env.S3_ACCESS_KEY ||
    !process.env.S3_SECRET_KEY
  ) {
    throw new Error(
      "S3 not properly configured. Missing one of those variables: S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY"
    );
  }

  const minioclient = new Client({
    endPoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    port: parseInt(process.env.S3_PORT || "9000"),
    useSSL: process.env.S3_USE_SSL === "true",
  });

  return minioclient;
};
