# 部署指南

## 🚀 部署到Vercel

### 第一步：创建GitHub仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 仓库名称填写：`HydroTestGen`
4. 描述填写：`基于Hydro的测试数据生成器 - 独立Web应用`
5. 选择 "Public"（公开仓库）
6. **不要**勾选 "Add a README file"（我们已经有了）
7. 点击 "Create repository"

### 第二步：推送代码到GitHub

创建仓库后，在项目目录中运行：

```bash
# 如果还没有初始化git
git init
git add .
git commit -m "Initial commit: Hydro测试数据生成器"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/你的用户名/HydroTestGen.git
git branch -M main
git push -u origin main
```

### 第三步：在Vercel中部署

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 选择 "Import Git Repository"
4. 找到你的 `HydroTestGen` 仓库，点击 "Import"
5. 配置项目设置：
   - **Framework Preset**: Next.js ✅
   - **Build Command**: `npm run build` ✅
   - **Output Directory**: `.next` ✅
   - **Install Command**: `npm install` ✅
6. 点击 "Deploy"

### 第四步：等待部署完成

- 部署通常需要1-3分钟
- 完成后会获得一个域名，如：`https://hydro-test-gen-xxx.vercel.app`

## 🛠 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 📋 项目特性

### ✅ 已实现功能
- 🔧 Python生成器编辑器
- ✅ 标准程序编辑器
- 📊 实时测试数据生成
- 💾 代码保存和加载
- 📚 丰富的示例模板
- 📥 测试数据下载
- 📱 响应式设计
- 🔒 安全的代码执行环境

### 🎨 界面特色
- 类似Hydro的蓝色主题
- Monaco编辑器支持语法高亮
- 文件管理界面
- 标签页切换
- 测试数据预览卡片

### 🔧 技术亮点
- Next.js 14 App Router
- TypeScript类型安全
- Tailwind CSS样式
- JavaScript模拟Python执行
- 安全的沙箱环境

## 🌟 使用场景

- **教育用途**: 算法竞赛培训、编程课程
- **比赛准备**: ACM、OI等竞赛数据准备
- **在线判题**: 为OJ系统生成测试数据
- **学习工具**: 理解测试数据生成原理

## 📖 与Hydro的关系

本项目提取了Hydro中测试数据生成的核心功能：
- 保持了Hydro的界面风格
- 支持Python生成器和标准程序
- 提供了类似的用户体验
- 独立部署，无需完整的Hydro环境

## 🔗 相关链接

- **Hydro项目**: https://github.com/hydro-dev/Hydro
- **Vercel部署**: https://vercel.com
- **Next.js文档**: https://nextjs.org/docs

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 发起Pull Request

## 📞 获取帮助

如果遇到问题：
1. 查看浏览器控制台错误
2. 检查Vercel部署日志
3. 提交GitHub Issue
4. 参考Hydro官方文档

---

**项目状态**: ✅ 可用于生产环境  
**最后更新**: 2024年12月  
**版本**: v1.0.0