export default class Queue<TItem> {
  private _capacity: number;
  private _items: TItem[];

  constructor(capacity: number, items: TItem[] = []) {
    this._capacity = capacity;
    this._items = items;
  }

  public get capacity() {
    return this._capacity;
  }

  public get size() {
    return this._items.length;
  }

  public addItem(item: TItem) {
    if (this.isFull()) {
      throw new Error('Queue is full');
    }

    this._items.push(item);
    return item;
  }

  public removeItem() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }

    return this._items.shift();
  }

  public removeLastItem() {
    if (this.isEmpty()) {
      throw new Error('Queue is empty');
    }

    return this._items.pop();
  }

  public isFull() {
    return this._items.length === this._capacity;
  }

  public isEmpty() {
    return this._items.length === 0;
  }
}
