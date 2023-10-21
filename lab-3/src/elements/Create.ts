import Distribution from '../Distribution';
import Element from './Element';
import Variation from './Variation';

interface CreateOptions {
  variation: Variation;
  distribution: Distribution;
}

export default class Create extends Element {
  constructor(
    name: string,
    delay: number,
    { variation, distribution }: CreateOptions,
  ) {
    super(name, delay);
    this.tNext = 0;
    this.variation = variation;
    this.distribution = distribution;
  }

  public outAct() {
    super.outAct();

    this.tNext = this.tCurrent + this.delay;

    this.getNextElement()?.inAct();
  }
}
