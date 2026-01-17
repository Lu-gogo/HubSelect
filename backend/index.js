require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectRoutes = require('./src/routes/projectRoutes');

// 补丁：处理 BigInt 序列化
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/projects', projectRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 后端服务已启动: http://0.0.0.0:${port}`);
});