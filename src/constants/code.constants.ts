export const codeMap = {
  // 100- 5000 业务操作错误
  1000: '确实必填参数',
  1001: '系统用户已存在',
  1002: '填写验证码有误',
  1003: '用户名密码有误',
  1004: '节点路由已存在',
  1005: '权限必须包含父节点',

  20001: '当前创建的文件或目录已存在',
} as const;

type NewKeys = `CODE_${keyof typeof codeMap}`;

export const httpCode = Object.keys(codeMap).reduce((errMap, code) => {
  errMap['CODE_' + code] = Number(code);
  return errMap;
}, {} as Record<NewKeys, number>);
