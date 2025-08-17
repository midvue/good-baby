import { HttpStatus, MidwayHttpError } from '@midwayjs/core';
import type { ResOrMessage } from '@midwayjs/core';
import { RespCodeMap } from '../constants/errorCode';

export class CommHttpError extends MidwayHttpError {
  constructor(code: number, resOrMessage?: ResOrMessage) {
    if (!resOrMessage) {
      resOrMessage = RespCodeMap[code];
    }
    super(resOrMessage, HttpStatus.OK, code + '');
  }
}
