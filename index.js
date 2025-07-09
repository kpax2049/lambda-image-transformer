const sharp = require("sharp");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({ region: "us-east-1" }); // specify your bucket's region

exports.handler = async (event) => {
  try {
    const request = event.Records[0].cf.request;
    const uri = request.uri.startsWith("/")
      ? request.uri.slice(1)
      : request.uri; // remove leading /
    const query = new URLSearchParams(request.querystring);
    const bucket = "gallerybook-images";

    const w = parseInt(query.get("w"), 10) || null;
    const h = parseInt(query.get("h"), 10) || null;
    const format = query.get("format") || "jpeg";

    const object = await s3.getObject({ Bucket: bucket, Key: uri }).promise();
    console.log(`Fetched ${uri} from S3, size: ${object.ContentLength}`);

    let image = sharp(object.Body);
    if (w || h) {
      image = image.resize(w, h);
      console.log(`Resizing to width=${w} height=${h}`);
    }
    if (format) {
      image = image.toFormat(format);
      console.log(`Converting format to: ${format}`);
    }

    const buffer = await image.toBuffer();
    console.log(`Transformed image size: ${buffer.length}`);

    return {
      status: "200",
      statusDescription: "OK",
      headers: {
        "content-type": [{ key: "Content-Type", value: `image/${format}` }],
        "cache-control": [{ key: "Cache-Control", value: "max-age=31536000" }],
      },
      body: buffer.toString("base64"),
      bodyEncoding: "base64",
    };
  } catch (err) {
    console.error("Error processing image:", err);

    return {
      status: "500",
      statusDescription: "Internal Server Error",
      headers: {
        "content-type": [{ key: "Content-Type", value: "text/plain" }],
      },
      body: "Error processing image",
    };
  }
};
