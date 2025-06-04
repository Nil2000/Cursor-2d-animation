import { getMinioClient } from "./client";
export async function uploadToS3Bucket(
  filePath: string,
  key: string
): Promise<{ status: string; url?: string; error?: string }> {
  const s3Client = getMinioClient();

  try {
    const fileBuffer = Buffer.from(filePath, "utf-8");

    await s3Client.putObject(
      process.env.S3_BUCKET!,
      "public/" + key,
      fileBuffer,
      fileBuffer.length,
      {
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=86400",
      }
    );

    return {
      status: "success",
      url: `${parseS3PublicBaseUrl()}/public/${key}`,
    };
  } catch (error: any) {
    console.error("Error uploading to S3 bucket:", error.message);
    return { status: "error", error: error.message };
  }
}

const parseS3PublicBaseUrl = () =>
  process.env.S3_PUBLIC_CUSTOM_DOMAIN
    ? process.env.S3_PUBLIC_CUSTOM_DOMAIN
    : `http${process.env.S3_SSL === "true" ? "s" : ""}://${
        process.env.S3_ENDPOINT
      }${process.env.S3_PORT ? `:${process.env.S3_PORT}` : ""}/${
        process.env.S3_BUCKET
      }`;
