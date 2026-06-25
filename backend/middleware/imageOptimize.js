const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const SIZES = {
  thumbnail: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
};

/**
 * Process an uploaded image: create thumbnail and medium variants.
 * Original is kept as-is for full-size views.
 */
async function processImage(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);

  const results = { original: filePath };

  for (const [sizeName, dims] of Object.entries(SIZES)) {
    const outPath = path.join(dir, `${name}_${sizeName}${ext}`);
    try {
      await sharp(filePath)
        .resize(dims.width, dims.height, {
          fit: "cover",
          position: "center",
        })
        .toFile(outPath);

      results[sizeName] = outPath;
    } catch (err) {
      console.error(`Failed to create ${sizeName} for ${filePath}:`, err.message);
    }
  }

  return results;
}

/**
 * Express middleware that runs after multer upload.
 * Processes each uploaded file and attaches variant paths to req.processedFiles.
 */
function processUploads(req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  const processing = req.files.map((file) =>
    processImage(file.path).then((variants) => {
      file.variants = variants;
      return file;
    })
  );

  Promise.all(processing)
    .then((processedFiles) => {
      req.processedFiles = processedFiles;
      next();
    })
    .catch((err) => {
      console.error("Image processing error:", err);
      next(); // Don't block upload on processing failure
    });
}

module.exports = { processImage, processUploads, SIZES };
