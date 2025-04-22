/**
 * Return string description of Error object
 * @param error Error object
 * @returns String description of error
 */
export function getErrorDescription(error: unknown): string {
  if (!error) {
    return "No error provided";
  } else if ((error as { stderr: string }).stderr) {
    return (error as { stderr: string }).stderr;
  } else if ((error as { error: string }).error) {
    return JSON.stringify((error as { error: string }).error);
  } else if (error instanceof Error) {
    return error.message;
  } else {
    return JSON.stringify(error);
  }
}
