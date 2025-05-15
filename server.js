import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3101;

// Phục vụ các file tĩnh từ thư mục dist
app.use(express.static(join(__dirname, 'dist')));

// Đảm bảo route này được viết đúng - không có dấu ":" ở cuối URL
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});