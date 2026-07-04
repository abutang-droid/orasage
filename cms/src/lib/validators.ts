/** 文本必填校验，返回中文错误提示 */
export function requiredText(value: unknown, message: string): true | string {
  if (value === null || value === undefined || !String(value).trim()) {
    return message;
  }
  return true;
}
