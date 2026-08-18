export class AiNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set -- this feature's real AI mode is not configured yet.");
    this.name = "AiNotConfiguredError";
  }
}
