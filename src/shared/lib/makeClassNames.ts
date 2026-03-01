export const makeClassName = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(" ");
