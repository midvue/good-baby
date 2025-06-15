1. 框架使用 MidwayJS(不是 Nestjs,不要用 Nestjs 语法),[文档地址](https://www.midwayjs.org/docs/intro) , typescript，数据库使用 MySQL，ORM 使用 TypeORM。
2. 回答问题时,要绝对自信,要绝对可用的代码,生成代码前要参考已有的代码。不要用 Nestjs 语法,不要用 Nestjs 语法,不要用 Nestjs 语法。
3. 代码要遵守 eslint,代码要符合规范。
4. 代码主要内容需要使用注释,函数需要有注释。
5. 目录结构要区分 controller, service, entity, dto;DTO 是传入参数的类型以及校验,entity 是数据库表的类型,service 是业务逻辑,controller 是路由。
6. 生成的 entity 都要继承 base.entity 模块的 BaseEntity,就会有 createtime 和 updateTime,每个 entity 都要有主键 id, 用@PrimaryGeneratedColumn() ,另外索引不要乱加,除非我们有特殊需求。数据库的名字不要乱加前缀 gb* ,tb*,tb\_ 等等。
7. 这是一个母婴喂养相关的项目,modules/base 是公共模块,modules/account 是账号模块,modules/baby 是宝宝管理模块,以及喂养记录(feedRecord),宝宝与家庭关系(babyFamily)
8. dto 的校验是用的@midwayjs/validate,基于着 joi 封装, 另外要用@midwayjs/swagger 库生成 swagger 文档， 一个 controller 文件 对应一个 dto 文件
9. dayjs,类型判断,lodash 等常用库统一使用 @mid-vue/shared 中的 useDate()等等之类的函数,具体看 ts 文件类型
10. 数据库的表名,字段名,字段类型,字段注释,表注释,都要符合规范,字段的类型,长度,是否可以为空,是否唯一,是否有默认值,都要符合规范。
11. controller 使用 @midwayjs/core 中的注解定义请求,@Provide,@Post, @Del 等等之类的,具体看文档,参数是复杂类型的查询,都使用 post 代替 get https://midwayjs.cn/docs/container
12. Midway 的本地任务是 @midwayjs/cron ,其他 mysql,redis,orm 相关的组件 ,都有文档,https://midwayjs.cn/docs/extensions/orm 等等。
13. entity 的对应一张表,一个 entity 文件就要要对应有一个 service ,一个 controller 文件(且自动实现单表分页查询,新增,更新) , 除非多对多的关系的中间表,不需要单独的 service 和 controller。
14. entity 的字段,涉及枚举,type 类型的,统一用 type: 'varchar' 类型,值为(10,20,30)比如 changeType,gender,feedType。所有的 string 字段,都要有长度限制,比如 varchar(25),text 类型的字段,都要有注释。
15. 生成的代码,要绝对可用,要绝对可用,要绝对可用。
16. 目录结构修正 ：补充后端代码目录结构。生成 md 文件到根目录
17. 数据库使用 typeorm,对于只涉及到库中的单表操作,typeorm 不要先使用 createQueryBuilder,优先使用 findOne,find,findAndCount,update,delete ,save,count,sum 等方法
