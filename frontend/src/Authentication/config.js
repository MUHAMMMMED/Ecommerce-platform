// const apiUrl = 'http://127.0.0.1:8000';
const apiUrl = 'https://www.altaurea.com';
// console.log("Current API URL:", apiUrl);


const Config = {
  allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
  maxFileSize: 5 * 1024 * 1024, // 5MB

  baseURL: apiUrl,
  MEDIA_URL: apiUrl,
};

export default Config;
