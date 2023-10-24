import Delay from './Delay';
import Element from './Element';

export default class Dispose<TItem> extends Element<TItem> {
  private _tPrevious: number;
  private _totalTimeBeforeLeave: number;

  constructor(name: string, delays: { delay: Delay }[]) {
    super(name, delays);
    this.tNext = Infinity;
    this._tPrevious = 0;
    this._totalTimeBeforeLeave = 0;
  }

  public inAct() {
    this._totalTimeBeforeLeave += this.tCurrent - this._tPrevious;
    this._tPrevious = this.tCurrent;
    this.outAct();
  }

  public get totalTimeBeforeLeave() {
    return this._totalTimeBeforeLeave;
  }
}
