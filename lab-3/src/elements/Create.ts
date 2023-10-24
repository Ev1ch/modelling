import Delay from './Delay';
import Element from './Element';
import Process from './Process';
import Variation from './Variation';

interface CreateOptions {
  variation: Variation;
}

interface DelayWithCreator<TItem> {
  delay: Delay;
  probability: number;
  creator: () => TItem;
}

export default class Create<TItem> extends Element<TItem> {
  constructor(
    name: string,
    delays: DelayWithCreator<TItem>[],
    { variation }: CreateOptions,
  ) {
    super(name, delays);
    this.tNext = 0;
    this.variation = variation;
  }

  public outAct() {
    super.outAct();

    const { delay, creator } = this.getDelayWithCreator();

    this.tNext = this.tCurrent + delay.get();

    this.getNextElement()?.inAct(creator());
  }

  public get delays() {
    return super.delays as DelayWithCreator<TItem>[];
  }

  public set delays(delays: DelayWithCreator<TItem>[]) {
    super.delays = delays;
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
        (a.element as Process<TItem>).queue.size -
        (b.element as Process<TItem>).queue.size,
    );

    for (const { element } of sortedNextElements) {
      if (element.isFree()) {
        return element;
      }
    }

    return sortedNextElements[0].element;
  }

  private getDelayWithCreator() {
    const random = Math.random();

    if (
      this.delays.reduce((sum, { probability }) => sum + probability, 0) !== 1
    ) {
      throw new Error('Sum of probabilities is not equal to 1');
    }

    let sum = 0;
    for (const delay of this.delays) {
      sum += delay.probability;

      if (random <= sum) {
        return delay;
      }
    }

    return null;
  }

  public static getDelayWithCreator<TItem>(
    delay: Delay,
    probability: number,
    creator: () => TItem,
  ) {
    return { delay, probability, creator };
  }
}
