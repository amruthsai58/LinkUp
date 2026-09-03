/**
 * Converts a file to an optimized permanent Base64 Data URL
 * Ensures the image never expires or gets removed upon reload or re-login
 * @param {File} file - User uploaded image file
 * @param {number} maxWidth - Maximum width for optimization
 * @param {number} maxHeight - Maximum height for optimization
 * @param {number} quality - JPEG compression quality (0.0 to 1.0)
 * @returns {Promise<string>} Permanent Base64 Data URL
 */
export const fileToBase64 = (file, maxWidth = 500, maxHeight = 500, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    // For non-image files or if FileReader isn't supported
    if (!file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        // Fallback to direct dataURL if canvas fails
        resolve(readerEvent.target.result);
      };
      img.src = readerEvent.target.result;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
