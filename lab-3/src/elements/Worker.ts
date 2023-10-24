export enum WorkerState {
  FREE = 'free',
  BUSY = 'busy',
}

export default class Worker<TItem> {
  private _id: number;
  private _state: WorkerState;
  private _tNext: number;
  private _item: TItem;

  constructor(id: number) {
    this._state = WorkerState.FREE;
    this._id = id;
    this._tNext = Infinity;
  }

  public get id() {
    return this._id;
  }

  public get tNext() {
    return this._tNext;
  }

  public set tNext(tNext: number) {
    this._tNext = tNext;
  }

  public get state() {
    return this._state;
  }

  public set state(state: WorkerState) {
    this._state = state;
  }

  public get item() {
    return this._item;
  }

  public set item(item: TItem) {
    this._item = item;
  }
}
