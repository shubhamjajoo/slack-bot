
const REGEX = {
  REMOTE: /.*remote.*/i,
  TIMINGS_STRING: /[0-9]{1,2}(:||\.)?[0-9]{0,2}\s?(A\.?|P\.?)M\.?\s(to|-)\s[0-9]{1,2}(:||\.)?[0-9]{0,2}\s?(A\.?|P\.?)M\.?/gi,
  START_END_TIME: /to|-/i,
  EXTRACT_TIME: /(^(0?[1-9]|1[0-2])|^(0?[1-9]|1[0-2])(:|\.)(0?[0-9]|[1-5][0-9]))\s?(A\.?M\.?|P\.?M\.?)$/gi
};

const TextResponseType = {
  GREET_TEXT: 'GREET_TEXT',
  ERROR_TEXT: 'ERROR_TEXT',
  UNPROCESSABLE_TEXT: 'UNPROCESSABLE_TEXT',
  SUCCESS_TEXT: 'SUCCESS_TEXT',
  EXCEPTION_TEXT: 'EXCEPTION_TEXT',
  REMOTE_CHANNEL_TEXT: 'REMOTE_CHANNEL_TEXT',
  INCORRECT_TIME_VALUE: 'INCORRECT_TIME_VALUE',
  AUTHORIZATION_TEXT: 'AUTHORIZATION_TEXT',
  RE_AUTHORIZATION_TEXT: 'RE_AUTHORIZATION_TEXT',
  USER_READ_AUTHORIZATION_TEXT: 'USER_READ_AUTHORIZATION_TEXT'
};

const Emoji = {
  HOME: ':house_with_garden:'
};

const SLACK_API_URL = "https://slack.com/api";

const STATS_REPORT_TYPE = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY'
};

export { REGEX, TextResponseType, Emoji, SLACK_API_URL, STATS_REPORT_TYPE };
