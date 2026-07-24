export class AiNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set -- real chart analysis is not configured yet.");
    this.name = "AiNotConfiguredError";
  }
}
