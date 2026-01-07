# 密码存储迁移指南 / Password Storage Migration Guide

## 中文说明

### 概述

✅ **迁移已完成** - 系统现在将密码存储在数据库中，而不是环境变量中。这样修改密码后无需重新部署应用。

### 当前状态

- ✅ 密码存储在 `system_settings` 表中
- ✅ 支持在设置页面直接修改密码
- ✅ 无需重新部署即可生效
- ✅ 保持向后兼容性（环境变量作为备用）

### 如果需要重新初始化

如果遇到密码问题，可以重新初始化系统设置：

#### 方法 1：通过浏览器（推荐，适用于 Vercel 部署）

1. 部署应用到 Vercel
2. 在浏览器中访问：`https://your-app.vercel.app/api/admin/init-settings`
3. 查看返回的 JSON 响应，确认初始化成功

示例响应：

```json
{
  "success": true,
  "message": "System settings initialized successfully",
  "settings": [
    { "key": "password_hash", "description": "Bcrypt hash of the admin password" },
    { "key": "app_name", "description": "Application display name" }
  ]
}
```

#### 方法 2：本地运行脚本（需要本地数据库连接）

如果你有本地数据库连接：

```bash
npm run init-system-settings
```

**注意**：需要在 `.env.local` 中设置 `DATABASE_URL`

#### 2. 验证迁移

1. 登录应用
2. 进入"设置"页面
3. 尝试修改密码

#### 3. 清理环境变量（可选）

迁移成功后，可以从 Vercel 环境变量中删除 `QMS_PASSWORD_HASH`。系统会自动使用数据库中的密码。

### 新功能

#### 修改密码

1. 进入"设置"页面
2. 点击"修改密码"按钮
3. 输入当前密码和新密码
4. 点击"修改密码"
5. 密码立即生效，无需重新部署

#### 应用程序名称

- 可以在设置页面修改应用程序名称
- 修改后会保存到数据库
- 刷新页面后生效

#### 实时数据库统计

- 被子总数
- 使用记录总数
- 当前使用中的数量
- 每分钟自动刷新

---

## English Instructions

### Overview

✅ **Migration Complete** - The system now stores passwords in the database instead of environment variables. This allows password changes without redeploying the application.

### Current Status

- ✅ Passwords stored in `system_settings` table
- ✅ Support for direct password changes in Settings page
- ✅ Changes take effect immediately without redeployment
- ✅ Maintains backward compatibility (environment variables as fallback)

### If Re-initialization is Needed

If you encounter password issues, you can re-initialize system settings:

#### Method 1: Via Browser (Recommended for Vercel deployment)

1. Deploy the application to Vercel
2. Visit in browser: `https://your-app.vercel.app/api/admin/init-settings`
3. Check the JSON response to confirm successful initialization

Example response:

```json
{
  "success": true,
  "message": "System settings initialized successfully",
  "settings": [
    { "key": "password_hash", "description": "Bcrypt hash of the admin password" },
    { "key": "app_name", "description": "Application display name" }
  ]
}
```

#### Method 2: Run Script Locally (Requires local database connection)

If you have local database connection:

```bash
npm run init-system-settings
```

**Note**: Requires `DATABASE_URL` to be set in `.env.local`

#### 2. Verify Migration

1. Log in to the application
2. Go to "Settings" page
3. Try changing the password

#### 3. Clean Up Environment Variables (Optional)

After successful migration, you can remove `QMS_PASSWORD_HASH` from Vercel environment variables. The system will automatically use the password from the database.

### New Features

#### Change Password

1. Go to "Settings" page
2. Click "Change Password" button
3. Enter current password and new password
4. Click "Change Password"
5. Password takes effect immediately, no redeployment needed

#### Application Name

- Can modify application name in Settings page
- Changes are saved to database
- Takes effect after page refresh

#### Live Database Statistics

- Total quilts count
- Total usage records count
- Active usage count
- Auto-refreshes every minute

---

## Technical Details

### Database Schema

```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Settings Keys

- `password_hash`: Bcrypt hash of admin password
- `app_name`: Application display name

### Fallback Mechanism

The system maintains backward compatibility:

1. First checks database for password hash
2. Falls back to `QMS_PASSWORD_HASH` environment variable if not found in database
3. Returns error if neither exists

This ensures the application continues to work during migration.

---

## Troubleshooting

### Issue: Cannot log in after migration

**Solution**: Visit `/api/admin/init-settings` again to ensure the password hash is properly stored in the database.

### Issue: "Password hash not configured" error

**Solution**:

1. Check if the `system_settings` table exists
2. Visit `/api/admin/init-settings` to initialize
3. Verify `QMS_PASSWORD_HASH` environment variable exists (as fallback)

### Issue: Password change doesn't work

**Solution**:

1. Check database connection
2. Verify the `system_settings` table has write permissions
3. Check browser console for error messages

### Issue: "DATABASE_URL is not set" when running local script

**Solution**:

1. Add `DATABASE_URL` to your `.env.local` file
2. Or use the browser method instead: visit `/api/admin/init-settings`

---

## Security Notes

- Passwords are hashed using bcrypt with 12 salt rounds
- Password hashes are never exposed to the client
- Current password verification is required before changing password
- All password operations are logged for security auditing
- The `/api/admin/init-settings` endpoint can be called multiple times safely (uses UPSERT)
