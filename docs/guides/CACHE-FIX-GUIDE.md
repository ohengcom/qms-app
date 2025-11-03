# 🔧 缓存和 Service Worker 问题修复指南

## 问题描述

### 问题 1: 部署后浏览器显示旧版本

**症状**: Vercel 重新部署后，浏览器仍然显示旧版本的应用

**原因**:

- Service Worker 使用 cache-first 策略缓存了页面
- 浏览器缓存了 Service Worker 文件本身
- 没有强制更新机制

### 问题 2: Service Worker 重定向错误

**症状**: 在 incognito 模式下访问 `/quilts` 时出现错误：

```
The FetchEvent for "https://qms-app-omega.vercel.app/quilts" resulted in a network error response:
a redirected response was used for a request whose redirect mode is not "follow".
```

**原因**:

- Service Worker 默认的 fetch 没有设置 `redirect: 'follow'`
- 认证系统重定向到 `/login` 时被 Service Worker 拦截
- Service Worker 缓存了重定向响应

## ✅ 已实施的修复

### 1. Service Worker 修复

#### 更新版本号（强制更新）

```javascript
// 从 v2 更新到 v3
const CACHE_NAME = 'qms-app-v3';
const STATIC_CACHE_NAME = 'qms-static-v3';
const API_CACHE_NAME = 'qms-api-v3';
const IMAGE_CACHE_NAME = 'qms-images-v3';
```

#### 修复重定向处理

```javascript
// 所有 fetch 请求添加 redirect: 'follow'
const networkResponse = await fetch(request, {
  redirect: 'follow',
  credentials: 'same-origin',
});
```

#### 改变缓存策略

- **之前**: Cache-first（先查缓存，再查网络）
- **现在**: Network-first（先查网络，失败才用缓存）

#### 跳过跨域请求

```javascript
// 跳过跨域请求，避免 CORS 问题
if (url.origin !== self.location.origin) {
  return;
}
```

#### 不缓存重定向响应

```javascript
// 只缓存成功的响应，不缓存重定向
if (networkResponse.ok && networkResponse.type !== 'opaqueredirect') {
  cache.put(request, networkResponse.clone());
}
```

### 2. 自动更新机制

#### Service Worker 注册更新

```javascript
// 每 60 秒检查一次更新
setInterval(function () {
  registration.update();
}, 60000);

// 发现新版本时自动重载
registration.addEventListener('updatefound', function () {
  const newWorker = registration.installing;
  if (newWorker) {
    newWorker.addEventListener('statechange', function () {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });
  }
});
```

### 3. 缓存控制头

#### Service Worker 文件

```javascript
// sw.js 永不缓存
'Cache-Control': 'no-cache, no-store, must-revalidate'
'Pragma': 'no-cache'
'Expires': '0'
```

#### 认证路由

```javascript
// 认证路由不缓存
source: '/(quilts|usage|seasonal|import|export|settings|analytics|reports|maintenance)'
'Cache-Control': 'no-cache, no-store, must-revalidate'
```

### 4. 手动清理工具

创建了 `/clear-cache.html` 页面，提供：

- 清除所有缓存
- 注销 Service Worker
- 清除并重载
- 手动清理步骤指南

## 🚀 使用方法

### 方法 1: 自动更新（推荐）

1. 等待 60 秒，Service Worker 会自动检查更新
2. 发现新版本后会自动重载页面
3. 无需手动操作

### 方法 2: 手动刷新

1. 按 `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
2. 这会跳过缓存，强制从服务器加载

### 方法 3: 使用清理工具

1. 访问 `https://qms-app-omega.vercel.app/clear-cache.html`
2. 点击 "Clear Everything & Reload"
3. 等待 2 秒后自动重载

### 方法 4: 使用 DevTools

1. 打开 DevTools (F12)
2. 进入 Application 标签
3. 点击 "Clear storage"
4. 勾选所有选项
5. 点击 "Clear site data"
6. 刷新页面

### 方法 5: Incognito 模式

1. 打开 Incognito/Private 窗口
2. 访问应用
3. 每次都会加载最新版本（无缓存）

## 🔍 验证修复

### 检查 Service Worker 版本

1. 打开 DevTools (F12)
2. 进入 Console 标签
3. 查看 "QMS Service Worker loaded" 消息
4. 进入 Application > Service Workers
5. 确认版本为 v3

### 检查缓存

1. 打开 DevTools (F12)
2. 进入 Application > Cache Storage
3. 应该看到：
   - qms-app-v3
   - qms-static-v3
   - qms-api-v3
   - qms-images-v3

### 测试重定向

1. 在 Incognito 模式下访问 `/quilts`
2. 应该正常重定向到 `/login`
3. 不应该出现 "redirect mode is not follow" 错误

## 📊 修复效果

### 之前的问题：

- ❌ 部署后需要手动清理缓存
- ❌ Incognito 模式下重定向失败
- ❌ Service Worker 缓存了认证重定向
- ❌ 用户看到旧版本

### 修复后：

- ✅ 自动检测并更新到最新版本
- ✅ Incognito 模式正常工作
- ✅ 认证重定向正常
- ✅ 用户始终看到最新版本
- ✅ 提供多种清理缓存方法

## 🎯 最佳实践

### 开发时

1. 使用 Incognito 模式测试
2. 或者在 DevTools 中禁用缓存
3. 定期清理 Service Worker

### 生产环境

1. 每次重大更新时更新 Service Worker 版本号
2. 监控 Service Worker 更新日志
3. 告知用户如何清理缓存（如果需要）

### 部署后

1. 等待 1-2 分钟让 Vercel 完成部署
2. 访问 `/clear-cache.html?clear=true` 强制清理
3. 或者使用 Incognito 模式验证

## 🔗 相关链接

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Fetch API - redirect](https://developer.mozilla.org/en-US/docs/Web/API/fetch#redirect)
- [Next.js Caching](https://nextjs.org/docs/app/building-your-application/caching)

## 📝 技术细节

### Service Worker 生命周期

```
Install → Activate → Fetch → Update → Install (new version)
```

### 缓存策略对比

| 策略                   | 优点      | 缺点           | 适用场景 |
| ---------------------- | --------- | -------------- | -------- |
| Cache-first            | 快速加载  | 可能显示旧内容 | 静态资源 |
| Network-first          | 始终最新  | 离线时失败     | 动态内容 |
| Stale-while-revalidate | 快速+最新 | 复杂度高       | 平衡场景 |

### 我们的选择

- **认证路由**: Network-first（确保最新）
- **API 请求**: Network-first with cache fallback
- **图片**: Cache-first（性能优先）
- **Service Worker**: No cache（确保更新）

---

**修复日期**: 2025-11-03  
**状态**: ✅ 已修复并部署  
**影响**: 所有用户将在 60 秒内自动更新到最新版本
