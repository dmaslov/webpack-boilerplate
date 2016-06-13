export default class Module {
  text = '';
  constructor(text) {
    this.text = text;
  }

  printText() {
    console.log(this.text);
  }
}
