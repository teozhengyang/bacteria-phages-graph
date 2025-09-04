interface FileUploadConfig {
    maxFileSize: number;
}

// File upload configuration from environment variables
const fileUploadConfig: FileUploadConfig = {
    // Maximum file size in bytes (default: 10MB)
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE ?? '10485760'), // 10 * 1024 * 1024
};

export default fileUploadConfig;
