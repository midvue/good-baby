-- 积分规则初始 seed 数据
-- 触发方式: 10=手动领取(MANUAL), 20=自动到账(AUTO)
-- 任务类型: 10=每日(DAILY), 20=一次性(ONCE), 30=行为触发(ACTION)

INSERT INTO `points_rule` (`code`, `title`, `description`, `points`, `triggerType`, `taskType`, `limitPerDay`, `status`, `create_time`, `update_time`) VALUES
('daily_feed', '每日喂养', '每次记录喂养自动获得积分，每日上限30积分', 5, '20', '30', 6, 1, NOW(3), NOW(3)),
('follow_official_account', '关注公众号', '关注公众号获得积分', 200, '10', '20', 0, 1, NOW(3), NOW(3)),
('share_to_friend', '分享给好友', '每天分享一次获得积分', 30, '10', '10', 0, 1, NOW(3), NOW(3)),
('complete_profile', '完善资料', '完善个人资料获得积分', 100, '10', '20', 0, 1, NOW(3), NOW(3));
