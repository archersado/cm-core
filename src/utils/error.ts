export enum CmError {
  DEPENDENCY_NOT_FOUND = 'DEPENDENCY_NOT_FOUND',
  CONTENT_TEMPLATE = 'CONTENT_TEMPLATE_ERR',
  PRODUCE_MSG_CONTENT_FAIL = 'PRODUCE_MSG_CONTENT_FAIL',
  VALIDATE_FAIL = 'VALIDATE_FAIL',
  NOT_FOUND = 'NOT_FOUND',
  CHANNEL_AUTH_FAIL = 'CHANNEL_AUTH_FAIL',
  PRODUCE_CHANNEL_VO_FAIL = 'PRODUCE_CHANNEL_VO_FAIL',
  STRATEGY_OVER_FATIGUE_THRESHOLD = 'STRATEGY_OVER_FATIGUE_THRESHOLD'
};

class CoreError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorFactory(message: string, code: string) {
  return new CoreError(message, code);
}