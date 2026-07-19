# 后台管理员密码刷数说明

1. 先执行 `sql/secure_admin_password_hash.sql` 中的字段扩容 SQL。
2. 在 `good-baby-midway` 目录执行：

```bash
node scripts/migrateSysUserPassword.js
```

脚本会读取 `sys_user.id` 和当前明文 `password`，在内存中生成 `scrypt$14$8$1$...` 哈希后回写。脚本只输出迁移数量，不打印、导出或记录明文密码。

刷数后执行检查 SQL：

```sql
SELECT COUNT(*) AS plain_password_count
FROM sys_user
WHERE status = 1
  AND password NOT LIKE 'scrypt$%';
```

结果应为 `0`。脚本会通过查询条件和循环内判断双重跳过已经以 `scrypt$` 开头的记录，可以重复执行。
