export default class Queue {
  private _size: number;
  private _itemsNumber: number;

  constructor(capacity: number) {
    this._size = capacity;
    this._itemsNumber = 0;
  }

  public get size() {
    return this._size;
  }

  public set size(size: number) {
    this._size = size;
  }

  public addItem() {
    this._itemsNumber++;
  }

  public removeItem() {
    this._itemsNumber--;
  }

  public isFull() {
    return this._itemsNumber === this._size;
  }
}
