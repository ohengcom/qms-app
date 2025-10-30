# Vercel 部署缓存问题解决方案

## 问题描述

在 Vercel 上部署新版本后，浏览器总是显示旧版本，需要使用隐私模式（Incognito）才能看到新版本。

## 原因分析

这是由于浏览器缓存和 CDN 缓存导致的：

1. **浏览器缓存**: 浏览器缓存了旧的 JavaScript、CSS 等静态资源
2. **CDN 缓存**: Vercel 的 CDN 可能缓存了旧的构建文件
3. **Service Worker**: 如果使用了 Service Worker，可能缓存了旧版本

## 解决方案

### 1. 立即解决方法（用户端）

**清除浏览器缓存：**

- Chrome/Edge: `Ctrl + Shift + Delete` (Windows) 或 `Cmd + Shift + Delete` (Mac)
- 或者使用硬刷新: `Ctrl + F5` (Windows) 或 `Cmd + Shift + R` (Mac)

**使用隐私模式测试：**

- 这是临时验证新版本的好方法，但不是长期解决方案

### 2. Next.js 自动解决方案（已内置）

Next.js 已经内置了很好的缓存破坏机制：

✅ **构建哈希**: Next.js 为每次构建生成唯一的哈希值

- 文件名格式: `_next/static/[buildId]/...`
- 每次部署都会生成新的 buildId
- 浏览器会自动请求新文件

✅ **HTML 不缓存**: 页面 HTML 默认不被缓存

- 每次访问都会获取最新的 HTML
- HTML 中包含最新的资源链接

### 3. 优化 next.config.js 缓存策略

当前配置已经比较合理，但可以进一步优化：

```javascript
// 在 next.config.js 的 headers() 中添加
{
  // Next.js 构建文件 - 使用 immutable 缓存
  source: '/_next/static/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
},
{
  // 页面 HTML - 不缓存，总是获取最新
  source: '/:path*',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=0, must-revalidate',
    },
  ],
},
```

### 4. Vercel 特定配置

在项目根目录创建或更新 `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 5. 添加版本号显示（推荐）

在应用中显示当前版本，方便确认是否是最新版本：

**在 package.json 中：**

```json
{
  "version": "0.2.1"
}
```

**在页面中显示：**

```tsx
// 在 footer 或 settings 页面
import packageJson from '../../package.json';

<div className="text-xs text-gray-500">Version: {packageJson.version}</div>;
```

### 6. 强制刷新机制（高级）

如果需要强制用户刷新，可以实现版本检查：

```typescript
// src/lib/version-check.ts
export async function checkVersion() {
  try {
    const response = await fetch('/api/version');
    const { version } = await response.json();
    const currentVersion = localStorage.getItem('app-version');

    if (currentVersion && currentVersion !== version) {
      // 提示用户刷新
      if (confirm('发现新版本，是否刷新页面？\nNew version available, refresh?')) {
        localStorage.setItem('app-version', version);
        window.location.reload();
      }
    } else {
      localStorage.setItem('app-version', version);
    }
  } catch (error) {
    console.error('Version check failed:', error);
  }
}
```

### 7. Vercel 部署后的验证步骤

1. **检查部署状态**: 在 Vercel Dashboard 确认部署成功
2. **查看构建日志**: 确认没有错误
3. **检查 buildId**: 在浏览器开发者工具中查看 `/_next/static/` 路径
4. **清除 CDN 缓存**: 在 Vercel Dashboard 中可以手动清除缓存
5. **硬刷新测试**: 使用 `Ctrl + F5` 强制刷新

## 最佳实践

### ✅ 推荐做法

1. **依赖 Next.js 的内置机制**: Next.js 的 buildId 已经足够好
2. **HTML 不缓存**: 确保页面 HTML 总是最新的
3. **静态资源长缓存**: 使用 immutable 标记，配合 buildId
4. **显示版本号**: 方便用户和开发者确认版本
5. **使用 Vercel Analytics**: 监控实际用户看到的版本

### ❌ 避免做法

1. **不要禁用所有缓存**: 会严重影响性能
2. **不要在文件名中手动添加时间戳**: Next.js 已经处理了
3. **不要过度依赖 Service Worker**: 可能导致更复杂的缓存问题

## 当前项目状态

✅ Next.js 配置正确
✅ 构建哈希机制已启用
✅ 静态资源缓存策略合理
⚠️ 建议添加版本号显示
⚠️ 建议优化 vercel.json 配置

## 快速检查清单

部署新版本后，按以下步骤验证：

- [ ] Vercel Dashboard 显示部署成功
- [ ] 在浏览器中硬刷新 (`Ctrl + F5`)
- [ ] 检查开发者工具 Network 标签，确认请求了新的 buildId
- [ ] 检查 Console 是否有错误
- [ ] 在隐私模式中测试（作为最后验证）

## 总结

这个问题主要是浏览器缓存导致的，Next.js 和 Vercel 的默认配置已经很好地处理了缓存破坏。用户只需要：

1. **开发者**: 确保每次部署后使用硬刷新测试
2. **最终用户**: 通常不需要任何操作，浏览器会自动加载新版本
3. **如果遇到问题**: 清除浏览器缓存或使用硬刷新

如果问题持续存在，可能需要检查：

- Vercel 的 CDN 缓存设置
- 是否有 Service Worker 干扰
- 网络代理或公司防火墙缓存
