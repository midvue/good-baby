import { HttpStatus, MidwayHttpError } from '@midwayjs/core';
import type { ResOrMessage } from '@midwayjs/core';
import { codeMap } from '../constants/code.constants';

export class CommHttpError extends MidwayHttpError {
  constructor(code: number, resOrMessage?: ResOrMessage) {
    if (!resOrMessage) {
      resOrMessage = codeMap[code];
    }
    super(resOrMessage, HttpStatus.OK, code + '');
  }
}
