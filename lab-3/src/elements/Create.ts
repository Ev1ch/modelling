import Distribution from '../Distribution';
import Delay from './Delay';
import Element from './Element';
import Variation from './Variation';

interface CreateOptions {
  variation: Variation;
}

export default class Create extends Element {
  constructor(name: string, delay: Delay, { variation }: CreateOptions) {
    super(name, delay);
    this.tNext = 0;
    this.variation = variation;
  }

  public outAct() {
    super.outAct();

    this.tNext = this.tCurrent + this.delay.get();

    this.getNextElement()?.inAct();
  }
}
