export const StorageConfig = {
  photo: {
    destination: '../storage/photos/',
    maxSize: 1024 * 1024 * 3, // u bajtovima = 3MB
    resize: {
      thumb: {
        width: 120,
        height: 100,
        directory: 'thumb/',
      },
      small: {
        width: 320,
        height: 240,
        directory: 'small/',
      },
    },
  },
};
