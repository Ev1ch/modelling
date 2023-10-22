import Delay from './Delay';
import Element from './Element';
import Process from './Process';
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

  protected getNextElement() {
    switch (this.variation) {
      case Variation.PROBABILISTIC:
        return this.getNextElementByProbability();
      case Variation.PRIORITIZED:
        return this.getNextElementByPriority();
      case Variation.RANDOM:
        return this.getRandomNextElement();
      case Variation.BY_QUEUE_LENGTH:
        return this.getNextElementByQueueLength();
      default:
        throw new Error('Wrong variation type');
    }
  }

  protected getNextElementByQueueLength() {
    if (this.nextElements.length === 0) {
      return null;
    }

    const sortedNextElements = [...this.nextElements].sort(
      (a, b) =>
        (a.element as Process).queue.size - (b.element as Process).queue.size,
    );

    for (const { element } of sortedNextElements) {
      if (element.isFree()) {
        return element;
      }
    }

    return sortedNextElements[0].element;
  }
}
