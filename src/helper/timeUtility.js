exports.getTimestampInEpoch = (inputTime, userTimezoneOffsetInSeconds = 0) => {
  const is12HourFormat = inputTime.toLowerCase().includes("pm");
  const time = inputTime.split(/am|pm/i)[0];

  let [hour, minute] = time.split(/[:,.]/);

  const isNoon = hour === "12" && inputTime.toLowerCase().includes("pm");
  const isMidnight = hour === "12" && inputTime.toLowerCase().includes("am");

  hour =
    (is12HourFormat && !isNoon) || isMidnight
      ? 12 + Number(hour)
      : Number(hour);
  hour = hour.length === 1 ? Number(`0${hour}`) : hour;

  minute = Number(minute || "00");

  const newDate = new Date();
  const serverOffset = newDate.getTimezoneOffset() * 60;
  const hasOffsetDifference = userTimezoneOffsetInSeconds + serverOffset;
  let epochTime = Math.floor(newDate.setHours(hour, minute, 0) / 1000);

  if (userTimezoneOffsetInSeconds && hasOffsetDifference) {
    epochTime -= userTimezoneOffsetInSeconds;
  }

  return epochTime;
};
