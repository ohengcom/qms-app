# 清除缓存说明

## 问题原因

当前的控制台错误主要是由于：
1. 浏览器缓存了旧版本的 Service Worker 和 manifest.json
2. 旧的 Service Worker 尝试加载不存在的路由（/import, /export, /seasonal）
3. 旧的 manifest.json 引用了 PNG 图标，但现在使用的是 SVG

## 解决方案

### 方法 1: 使用清除缓存页面（推荐）

1. 访问: `http://localhost:3000/clear-cache.html`
2. 点击 "Clear Everything & Reload" 按钮
3. 等待页面自动刷新

### 方法 2: 手动清除（Chrome/Edge）

1. 打开开发者工具（F12）
2. 进入 "Application" 标签
3. 在左侧找到 "Storage" 部分
4. 点击 "Clear storage"
5. 勾选所有选项：
   - Application cache
   - Cache storage
   - Service workers
   - Local storage
   - Session storage
   - IndexedDB
6. 点击 "Clear site data" 按钮
7. 硬刷新页面（Ctrl+Shift+R 或 Cmd+Shift+R）

### 方法 3: 使用浏览器设置

1. 打开浏览器设置
2. 进入 "隐私和安全" > "清除浏览数据"
3. 选择 "高级" 标签
4. 时间范围选择 "全部时间"
5. 勾选：
   - 缓存的图片和文件
   - Cookie 和其他网站数据
6. 点击 "清除数据"
7. 重新访问网站

## 已修复的问题

✅ 移除了不存在的路由（/import, /export, /seasonal）
✅ 更新了 manifest.json 使用 SVG 图标
✅ 清理了 Service Worker 中的 console.log
✅ 更新了 Service Worker 版本到 v4

## 验证修复

清除缓存后，你应该看到：
- ✅ 没有 404 错误（icon-192x192.png）
- ✅ 没有 /import, /export, /seasonal 路由错误
- ✅ Service Worker 正常注册
- ✅ 控制台干净，没有多余的日志

## 注意事项

- 清除缓存后需要重新登录
- 所有离线数据将被清除
- 首次加载可能会稍慢（需要重新缓存资源）
