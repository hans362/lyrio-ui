// Reordered for displaying in a select list
export enum SubmissionStatus {
  Accepted = "Accepted",
  PartiallyCorrect = "PartiallyCorrect",
  WrongAnswer = "WrongAnswer",
  RuntimeError = "RuntimeError",
  TimeLimitExceeded = "TimeLimitExceeded",
  MemoryLimitExceeded = "MemoryLimitExceeded",
  CompilationError = "CompilationError",
  FileError = "FileError",
  OutputLimitExceeded = "OutputLimitExceeded",
  InvalidInteraction = "InvalidInteraction",
  JudgementFailed = "JudgementFailed",
  ConfigurationError = "ConfigurationError",
  SystemError = "SystemError",
  Canceled = "Canceled",
  Pending = "Pending"
}

export enum SubmissionStatusAll {
  Pending = "Pending",

  ConfigurationError = "ConfigurationError",
  SystemError = "SystemError",
  Canceled = "Canceled",

  CompilationError = "CompilationError",

  FileError = "FileError",
  RuntimeError = "RuntimeError",
  TimeLimitExceeded = "TimeLimitExceeded",
  MemoryLimitExceeded = "MemoryLimitExceeded",
  OutputLimitExceeded = "OutputLimitExceeded",
  InvalidInteraction = "InvalidInteraction",

  PartiallyCorrect = "PartiallyCorrect",
  WrongAnswer = "WrongAnswer",
  Accepted = "Accepted",

  JudgementFailed = "JudgementFailed",

  Waiting = "Waiting",
  Compiling = "Compiling",
  Running = "Running",
  Skipped = "Skipped"
}
