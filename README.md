# Hydro 测试数据生成器

基于Hydro的测试数据生成功能的独立Web应用，支持在线编写Python生成器和标准程序来生成测试数据。

## 🎯 项目特色

- **🔧 Python生成器**: 使用Python编写数据生成逻辑
- **✅ 标准程序**: 自动生成期望输出
- **📊 实时预览**: 即时查看生成的测试数据
- **💾 代码保存**: 本地保存和加载代码
- **📚 丰富示例**: 多种算法类型的模板
- **📱 响应式设计**: 支持各种设备访问

## 🚀 功能特性

### 核心功能
- 在线Python代码编辑器（Monaco Editor）
- 支持生成器和标准程序
- 实时测试数据生成
- 支持1-20个测试点
- 测试数据下载（合并文件/分离文件）

### 安全特性
- 沙箱环境执行
- 危险函数过滤
- 输入验证和XSS防护
- 资源使用限制

### 用户体验
- 类似Hydro的界面设计
- 文件管理功能
- 代码示例模板
- 详细的使用说明

## 🛠 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **编辑器**: Monaco Editor
- **后端**: Next.js API Routes
- **代码执行**: JavaScript模拟Python环境
- **部署**: Vercel

## 📦 本地开发

1. **克隆项目**:
```bash
git clone <repository-url>
cd HydroTestGen
```

2. **安装依赖**:
```bash
npm install
```

3. **启动开发服务器**:
```bash
npm run dev
```

4. **访问应用**:
打开浏览器访问 `http://localhost:3000`

## 🌐 部署到Vercel

### 方法一：GitHub集成
1. 将代码推送到GitHub仓库
2. 在Vercel中导入项目
3. 自动部署完成

### 方法二：Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## 📖 使用指南

### 1. 编写数据生成器
```python
import random

def generate_test_case():
    n = random.randint(1, 100)
    print(n)
    
    arr = [random.randint(1, 1000) for _ in range(n)]
    print(' '.join(map(str, arr)))

if __name__ == '__main__':
    generate_test_case()
```

### 2. 编写标准程序
```python
def solve():
    n = int(input())
    arr = list(map(int, input().split()))
    
    result = sum(arr)
    print(result)

if __name__ == '__main__':
    solve()
```

### 3. 生成测试数据
1. 设置测试点数量
2. 点击"生成"按钮
3. 查看生成结果
4. 下载测试数据

## 📚 示例模板

应用内置了多种常用算法的示例模板：

- **基础数组**: 数组生成和求和
- **图论算法**: 树生成和遍历
- **字符串处理**: 随机字符串生成
- **区间查询**: 数组区间操作
- **排序算法**: 数组排序问题

## 🔧 支持的Python功能

### 内置模块
- `random`: 随机数生成
- `string`: 字符串操作（部分）
- 基础数据类型和函数

### 支持的语法
- 函数定义和调用
- 循环语句（for, while）
- 条件语句（if, elif, else）
- 列表推导式（简化版）
- 基础数学运算

### 限制
- 不支持文件操作
- 不支持网络请求
- 不支持系统调用
- 不支持复杂的第三方库

## 🎨 界面设计

界面设计参考了Hydro的风格：
- 蓝色主题色调
- 清晰的功能分区
- 直观的操作流程
- 响应式布局

## 🔒 安全考虑

- 代码在沙箱环境中执行
- 过滤危险的Python函数
- 限制代码执行时间
- 防止XSS攻击

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📞 联系方式

- 项目仓库: GitHub
- 问题反馈: GitHub Issues
- 功能建议: GitHub Discussions

---

**基于Hydro项目**: https://github.com/hydro-dev/Hydro