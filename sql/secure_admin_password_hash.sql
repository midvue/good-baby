-- 扩容后台管理员密码字段，刷数前先执行
ALTER TABLE sys_user
  MODIFY COLUMN password varchar(128) NOT NULL COMMENT '密码哈希';

-- 刷数后检查仍未迁移的启用账号数量，应为 0
SELECT COUNT(*) AS plain_password_count
FROM sys_user
WHERE status = 1
  AND password NOT LIKE 'scrypt$%';
