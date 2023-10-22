export default class Queue {
  private _capacity: number;
  private _size: number;

  constructor(capacity: number, size = 0) {
    this._capacity = capacity;
    this._size = size;
  }

  public get capacity() {
    return this._capacity;
  }

  public get size() {
    return this._size;
  }

  public set size(size: number) {
    this._size = size;
  }

  public addItem() {
    if (this._size === this._size) {
      throw new Error('Queue is full');
    }

    this._size++;
  }

  public removeItem() {
    if (this._size === 0) {
      throw new Error('Queue is empty');
    }

    this._size--;
  }

  public isFull() {
    return this._size === this._size;
  }

  public isEmpty() {
    return this._size === 0;
  }
}
