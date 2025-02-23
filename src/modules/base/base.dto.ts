import { RuleType } from '@midwayjs/validate';

export const requiredString = RuleType.string().required();
export const requiredNumber = RuleType.number().required();

export const maxString = length => RuleType.string().max(length);

export class pageDTO {}
