-- 用户数据
INSERT INTO users (id, openid, nickname, avatar_url, gender, country, province, city, language, create_time, update_time) VALUES
(1, 'openid_001', '张三', 'https://example.com/avatar1.jpg', '男', '中国', '北京', '北京', 'zh_CN', NOW(), NOW()),
(2, 'openid_002', '李四', 'https://example.com/avatar2.jpg', '女', '中国', '上海', '上海', 'zh_CN', NOW(), NOW());

-- 非遗项目数据
INSERT INTO heritage (id, name, description, image_url, region, category, level, create_time, update_time) VALUES
(1, '京剧', '京剧，又称平剧、京戏，是中国影响最大的戏曲剧种，分布地以北京为中心，遍及全国各地。', 'https://example.com/heritage1.jpg', '北京', '传统戏剧', 1, NOW(), NOW()),
(2, '书法', '中国书法是中国特有的一种传统艺术，被誉为：无言的诗，无行的舞；无图的画，无声的乐等。', 'https://example.com/heritage2.jpg', '全国', '传统技艺', 1, NOW(), NOW()),
(3, '太极拳', '太极拳是基于阴阳循环、天人合一的中国传统哲学思想和养生观念，以中正圆活为运动特征的传统体育实践。', 'https://example.com/heritage3.jpg', '全国', '传统体育', 1, NOW(), NOW()),
(4, '端午节', '端午节，又称端阳节、龙舟节等，是中国四大传统节日之一，本世界多个国家都有庆祝端午节的习俗。', 'https://example.com/heritage4.jpg', '全国', '传统节日', 1, NOW(), NOW());

-- 传承人数据
INSERT INTO inheritor (id, name, skill, description, image_url, level, create_time, update_time) VALUES
(1, '梅兰芳', '京剧表演', '著名京剧表演艺术家，创立了独特的艺术流派', 'https://example.com/inheritor1.jpg', '国家级传承人', NOW(), NOW()),
(2, '启功', '书法', '著名书法家、教育家，北京师范大学教授', 'https://example.com/inheritor2.jpg', '国家级传承人', NOW(), NOW());

-- 新闻数据
INSERT INTO news (id, title, description, image_url, date, create_time, update_time) VALUES
(1, '非遗进校园活动启动', '为传承中华优秀传统文化，本市启动非遗进校园系列活动', 'https://example.com/news1.jpg', '2024-01-15', NOW(), NOW()),
(2, '传统技艺大展成功举办', '为期一周的传统技艺大展圆满落幕，吸引了数万市民参观', 'https://example.com/news2.jpg', '2024-01-10', NOW(), NOW());

-- AR体验数据
INSERT INTO ar_experience (id, name, description, image_url, is_hot, create_time, update_time) VALUES
(1, '虚拟书法体验', '通过AR技术体验书法写作，提供多种字体选择', 'https://example.com/ar1.jpg', true, NOW(), NOW()),
(2, '京剧脸谱识别', '扫描脸谱图片，通过AR展示对应角色的介绍和表演片段', 'https://example.com/ar2.jpg', true, NOW(), NOW());