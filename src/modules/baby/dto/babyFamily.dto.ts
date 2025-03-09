import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class BabyFamilyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '性别',
  })
  id: number;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: 'gender',
    description: '昵称',
  })
  name: string;
}

export class BabyFamilyCreateDTO extends BabyFamilyDTO {}

export class BabyFamilyUpdateDTO extends BabyFamilyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: 1,
    description: 'id',
  })
  id: number;
}

export class BabyFamilyPageDTO extends BabyFamilyUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
