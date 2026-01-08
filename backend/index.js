require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projectRoutes = require('./src/routes/projectRoutes');

// 补丁：处理 BigInt 序列化
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/projects', projectRoutes);

app.listen(port, () => {
  console.log(`🚀 后端服务已启动: http://localhost:${port}`);
});