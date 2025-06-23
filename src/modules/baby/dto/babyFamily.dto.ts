import { ApiProperty } from '@midwayjs/swagger';
import { PickDto, Rule, RuleType } from '@midwayjs/validate';

export class BabyFamilyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: '1',
    description: '家庭id',
  })
  id: string;

  @Rule(RuleType.string().allow(''))
  @ApiProperty({
    example: '家庭',
    description: '家庭名字',
  })
  name: string;
}

export class BabyFamilyCreateDTO extends BabyFamilyDTO {}

export class BabyFamilyListDTO extends BabyFamilyDTO {
  @Rule(RuleType.number().allow(''))
  @ApiProperty({
    example: '1',
    description: '用户id',
  })
  userId: string;
}

export class BabyFamilyUpdateDTO extends BabyFamilyDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: '65504852926530560',
    description: 'id',
  })
  id: string;
}

export class BabyFamilyIdDTO {
  @Rule(RuleType.string().required())
  @ApiProperty({
    example: '65504852926530560',
    description: 'id',
  })
  id: string;
}

export class BabyFamilyPageDTO extends BabyFamilyUpdateDTO {
  @Rule(RuleType.number().required().default(20))
  @ApiProperty({ example: 20, description: '每页条数' })
  size: number;

  @Rule(RuleType.number().required().default(1))
  @ApiProperty({ example: 1, description: '当前页码' })
  current: number;
}
