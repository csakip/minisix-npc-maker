export default class RollNotification {
  static counter = 0;
  id;
  title;
  time;
  text;
  roll;
  constructor(title, textOrRoll) {
    this.id = RollNotification.counter++;
    this.title = title;
    this.time = new Date();
    if (typeof textOrRoll === "object") {
      this.roll = textOrRoll;
    } else {
      this.text = textOrRoll;
    }
  }
}
