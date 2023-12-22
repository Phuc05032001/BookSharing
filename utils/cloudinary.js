const cloudinary = require('./cloudinaryConfig');

//upload photo
exports.coverToCloudinary = (fileBuffer, fileName) =>
  new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: 'BookCover',
          public_id: fileName,
          width: 800,
          height: 1280,
          crop: 'fill',
          quality: 90,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      )
      .end(fileBuffer);
  });

exports.photoToCloudinary = (fileBuffer, fileName) =>
  new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream(
        {
          folder: 'UserPhotos',
          public_id: fileName,
          width: 500,
          height: 500,
          gravity: 'faces',
          crop: 'thumb',
          quality: 90,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      )
      .end(fileBuffer);
  });

//delete photo
exports.deleteFromCloudinary = (publicId) => {
  cloudinary.v2.uploader.destroy(publicId, (error) => {
    if (error) {
      return error;
    }
  });
};
