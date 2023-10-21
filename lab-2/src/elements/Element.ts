import chalk from 'chalk';

import Distribution from '../Distribution';
import Random from '../Random';
import Settings from '../Settings';

class Element {
  private _name: string;
  private _tNext: number;
  private _delayMean: number;
  private _distribution: Distribution;
  private _quantity: number = 0;
  private _tCurrent: number;
  private _state: number;
  private _nextElements: Element[];
  private _id: number;

  private static nextId = 0;

  constructor(name?: string, delay = 1) {
    this._tNext = Infinity;
    this._delayMean = delay;
    this._distribution = Distribution.EXPONENTIAL;
    this._tCurrent = this._tNext;
    this._state = 0;
    this._nextElements = [];
    this._id = Element.nextId++;
    this._name = name || `element_${this._id}`;

    console.log(`id=${this._id}`);
  }

  public get delay() {
    switch (this._distribution) {
      case Distribution.EXPONENTIAL:
        return Random.exponential(this._delayMean);
      default:
        throw new Error('Wrong distribution type!');
    }
  }

  public set nextElements(nextElements: Element[]) {
    this._nextElements = nextElements;
  }

  public get nextElements() {
    return this._nextElements;
  }

  public get distribution() {
    return this._distribution;
  }

  public set distribution(distribution: Distribution) {
    this._distribution = distribution;
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

  public inAct() {}

  public outAct() {
    this._quantity++;
  }

  public get tNext() {
    return this._tNext;
  }

  public set tNext(tNext: number) {
    this._tNext = tNext;
  }

  public get delayMean() {
    return this._delayMean;
  }

  public set delayMean(delay: number) {
    this._delayMean = delay;
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

  protected getRandomNextElement() {
    if (this._nextElements.length === 0) {
      return null;
    }

    return this._nextElements[
      Math.floor(Math.random() * this._nextElements.length)
    ];
  }
}

export default Element;
