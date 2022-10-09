// add leading zero for hours, minutes, seconds less than 10
// force hh:mm:ss time format
function leadingZero(x) {
  if (Number(x) < 10) {
    return "0" + x;
  } else {
    return String(x);
  }
}