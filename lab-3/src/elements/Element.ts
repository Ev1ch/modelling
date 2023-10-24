import chalk from 'chalk';

import Settings from '../Settings';
import Variation from './Variation';
import Delay from './Delay';

export interface NextElement<TItem> {
  element: Element<TItem>;
  probability?: number;
  priority?: number;
  withBlocking?: boolean;
}

class Element<TItem> {
  private _name: string;
  private _tNext: number;
  private _delays: { delay: Delay }[];
  private _quantity: number = 0;
  private _tCurrent: number;
  private _state: number;
  private _nextElements: NextElement<TItem>[];
  private _id: number;
  private _variation: Variation;

  private static nextId = 0;

  constructor(name: string, delays: { delay: Delay }[]) {
    this._tNext = Infinity;
    this._delays = delays;
    this._tCurrent = 0;
    this._state = 0;
    this._nextElements = [];
    this._id = Element.nextId++;
    this._name = name || `element_${this._id}`;
    this._variation = Variation.RANDOM;

    console.log(`id=${this._id}`);
  }

  public get delays() {
    return this._delays;
  }

  public set delays(delays: { delay: Delay }[]) {
    this._delays = delays;
  }

  public set nextElements(nextElements: NextElement<TItem>[]) {
    this._nextElements = nextElements;
  }

  public get nextElements() {
    return this._nextElements;
  }

  public get quantity() {
    return this._quantity;
  }

  public get tCurrent() {
    return this._tCurrent;
  }

  public set tCurrent(tCurrent: number) {
    this._tCurrent = tCurrent;
  }

  public get state() {
    return this._state;
  }

  public set state(state: number) {
    this._state = state;
  }

  public inAct(item: TItem | null) {}

  public outAct() {
    this._quantity++;
  }

  public get tNext() {
    return this._tNext;
  }

  public set tNext(tNext: number) {
    this._tNext = tNext;
  }

  public get id() {
    return this._id;
  }

  public set id(id: number) {
    this._id = id;
  }

  public get name() {
    return this._name;
  }

  public set name(name: string) {
    this._name = name;
  }

  public get variation() {
    return this._variation;
  }

  public set variation(variation: Variation) {
    this._variation = variation;
  }

  public isFree() {
    return this._state === 0;
  }

  public printResult() {
    process.stdout.write(
      [chalk.green(this._name), `quantity = ${this._quantity}`]
        .map((x) => x.padEnd(Settings.PADDING))
        .join(Settings.DIVIDER),
    );
  }

  public printInfo() {
    console.log(
      [
        chalk.green(this._name),
        `quantity = ${this.quantity}`,
        `tNext = ${this.tNext.toFixed(Settings.PRECISION)}`,
      ]
        .map((x) => x.padEnd(Settings.PADDING))
        .join(Settings.DIVIDER),
    );
  }

  public doStatistics(delta?: number) {}

  protected getNextElement(item: TItem) {
    switch (this._variation) {
      case Variation.PROBABILISTIC:
        return this.getNextElementByProbability();
      case Variation.PRIORITIZED:
        return this.getNextElementByPriority();
      case Variation.RANDOM:
        return this.getRandomNextElement();
      default:
        throw new Error('Wrong variation type');
    }
  }

  protected getFullNextElement(item: TItem) {
    const element = this.getNextElement(item);

    if (element === null) {
      return null;
    }

    return this._nextElements.find(
      ({ element: nextElement }) => nextElement === element,
    );
  }

  protected getNextElementByPriority() {
    if (this._nextElements.length === 0) {
      return null;
    }

    if (
      this._nextElements.some(
        (nextElement) => nextElement.priority === undefined,
      )
    ) {
      throw new Error('Priority is not defined');
    }

    const sortedNextElements = [...this._nextElements].sort(
      (a, b) => b.priority! - a.priority!,
    );

    for (const { element } of sortedNextElements) {
      if (element.isFree()) {
        return element;
      }
    }

    return sortedNextElements[0].element;
  }

  protected getNextElementByProbability() {
    const random = Math.random();

    if (
      this._nextElements.some(
        (nextElement) => nextElement.probability === undefined,
      )
    ) {
      throw new Error('Probability is not defined');
    }

    if (
      this._nextElements.reduce(
        (sum, { probability }) => sum + probability!,
        0,
      ) !== 1
    ) {
      throw new Error('Sum of probabilities is not equal to 1');
    }

    let sum = 0;
    for (const { probability, element } of this._nextElements) {
      sum += probability!;

      if (random <= sum) {
        return element;
      }
    }

    return null;
  }

  public getRandomNextElement() {
    if (this._nextElements.length === 0) {
      return null;
    }

    return this._nextElements[
      Math.floor(Math.random() * this._nextElements.length)
    ].element;
  }

  public static getDelay(delay: Delay) {
    return { delay };
  }
}

export default Element;
