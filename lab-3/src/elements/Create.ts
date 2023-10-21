import Element from './Element';

export default class Create extends Element {
  constructor(name: string, delay: number) {
    super(name, delay);
    this.tNext = 0;
  }

  public outAct() {
    super.outAct();

    this.tNext = this.tCurrent + this.delay;

    this.getNextElement()?.inAct();
  }
}
