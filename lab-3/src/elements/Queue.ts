export default class Queue {
  private _size: number;
  private _itemsNumber: number;

  constructor(capacity: number, itemsNumber = 0) {
    this._size = capacity;
    this._itemsNumber = itemsNumber;
  }

  public get size() {
    return this._size;
  }

  public set size(size: number) {
    this._size = size;
  }

  public addItem() {
    if (this._itemsNumber === this._size) {
      throw new Error('Queue is full');
    }

    this._itemsNumber++;
  }

  public removeItem() {
    if (this._itemsNumber === 0) {
      throw new Error('Queue is empty');
    }

    this._itemsNumber--;
  }

  public get itemsNumber() {
    return this._itemsNumber;
  }

  public isFull() {
    return this._itemsNumber === this._size;
  }

  public isEmpty() {
    return this._itemsNumber === 0;
  }
}
