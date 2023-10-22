import Distribution from '../Distribution';
import Delay from './Delay';
import Element from './Element';
import Variation from './Variation';

interface CreateOptions {
  variation: Variation;
  distribution: Distribution;
}

export default class Create extends Element {
  constructor(
    name: string,
    delay: Delay,
    { variation, distribution }: CreateOptions,
  ) {
    super(name, delay);
    this.tNext = 0;
    this.variation = variation;
    this.distribution = distribution;
  }

  public outAct() {
    super.outAct();

    this.tNext = this.tCurrent + this.delay.get();

    this.getNextElement()?.inAct();
  }
}
