import Element, { type NextElement } from './Element';
import Worker, { WorkerState } from './Worker';
import Variation from './Variation';
import Queue from './Queue';
import Delay from './Delay';

interface DelayWithProcessor<TItem> {
  delay: Delay;
  condition: (item: TItem) => boolean;
  processor: (item: TItem) => void;
}

interface NextElementWithCondition<TItem> extends NextElement<TItem> {
  condition?: (item: TItem) => boolean;
}

export interface ProcessOptions {
  maxWorkersNumber: number;
  variation: Variation;
  minimumDifferenceToSwap: number;
}

export default class Process<TItem> extends Element<TItem> {
  private _queue: Queue<TItem>;
  private _failuresNumber: number;
  private _maxWorkersNumber: number;
  private _swapsNumber: number;
  private _minimumDifferenceToSwap: number;
  private _workers: Worker<TItem>[];
  private _queueTime: number;
  private _workingTime: number;
  private _neighbors: Process<TItem>[];
  private _totalTimeBeforeIn: number;
  private _tPrevious: number;

  constructor(
    name: string,
    delays: DelayWithProcessor<TItem>[],
    queue: Queue<TItem>,
    { maxWorkersNumber, variation, minimumDifferenceToSwap }: ProcessOptions,
  ) {
    super(name, delays);
    this._failuresNumber = 0;
    this._queueTime = 0;
    this._workers = [];
    this._workingTime = 0;
    this._queue = queue;
    this._maxWorkersNumber = maxWorkersNumber;
    this.variation = variation;
    this.delays = delays;
    this._neighbors = [];
    this._swapsNumber = 0;
    this._minimumDifferenceToSwap = minimumDifferenceToSwap;
    this._totalTimeBeforeIn = 0;
    this._tPrevious = 0;

    for (let i = 0; i < this._maxWorkersNumber; i++) {
      this._workers.push(new Worker(i));
    }
  }

  public get totalTimeBeforeIn() {
    return this._totalTimeBeforeIn;
  }

  public inAct(item: TItem) {
    const freeWorker = this.getFreeWorker();

    this._totalTimeBeforeIn += this.tCurrent - this._tPrevious;
    this._tPrevious = this.tCurrent;

    if (freeWorker) {
      const delayWithProcessor = this.getDelayWithCondition(item);
      const delay = delayWithProcessor.delay.get();
      freeWorker.state = WorkerState.BUSY;
      delayWithProcessor.processor(item);
      freeWorker.item = item;
      freeWorker.tNext = this.tCurrent + delay;
      this._workingTime += delay;
      this.tNext = freeWorker.tNext;
      return;
    }

    if (!this._queue.isFull()) {
      this._queue.addItem(item);
      return;
    }

    this._failuresNumber++;
  }

  public outAct() {
    super.outAct();

    const busyWorker = this.getBusyWorker();

    if (!busyWorker) {
      throw new Error('There is no busy workers');
    }

    const item = busyWorker.item;
    busyWorker.tNext = Infinity;
    busyWorker.state = WorkerState.FREE;
    busyWorker.item = null;
    this.tNext = this.getMinimumWorkersTNext();

    this.swapQueueItems();

    const fullNextElement = this.getFullNextElement(item);

    if (
      fullNextElement &&
      !fullNextElement.element.isFree() &&
      fullNextElement.withBlocking
    ) {
      busyWorker.tNext = fullNextElement.element.tNext;
      busyWorker.item = item;
      busyWorker.state = WorkerState.BUSY;
      return;
    }

    if (!this._queue.isEmpty()) {
      const item = this._queue.removeItem();
      const delayWithProcessor = this.getDelayWithCondition(item);
      const delay = delayWithProcessor.delay.get();
      busyWorker.state = WorkerState.BUSY;
      delayWithProcessor.processor(item);
      busyWorker.item = item;
      busyWorker.tNext = this.tCurrent + delay;
      this._workingTime += delay;
      this.tNext = this.getMinimumWorkersTNext();
    }

    fullNextElement?.element.inAct(item);
  }

  private swapQueueItems() {
    for (const neighbor of this._neighbors) {
      if (
        this._queue.size - neighbor.queue.size >=
        this._minimumDifferenceToSwap
      ) {
        const item = this._queue.removeLastItem();
        neighbor.queue.addItem(item);
        this._swapsNumber++;
        return;
      }
    }
  }

  protected getNextElement(item: TItem) {
    switch (this.variation) {
      case Variation.PROBABILISTIC:
        return this.getNextElementByProbability();
      case Variation.PRIORITIZED:
        return this.getNextElementByPriority();
      case Variation.RANDOM:
        return this.getRandomNextElement();
      case Variation.BY_CONDITION:
        return this.getNextElementByCondition(item);
      default:
        throw new Error('Wrong variation type');
    }
  }

  public get delays() {
    return super.delays as DelayWithProcessor<TItem>[];
  }

  public set delays(delays: DelayWithProcessor<TItem>[]) {
    super.delays = delays;
  }

  public get queue() {
    return this._queue;
  }

  public set queue(queue: Queue<TItem>) {
    this._queue = queue;
  }

  public get state() {
    return this.getBusyWorker()?.id ?? 0;
  }

  public get failuresNumber() {
    return this._failuresNumber;
  }

  public get maxWorkersNumber() {
    return this._maxWorkersNumber;
  }

  public get queueTime() {
    return this._queueTime;
  }

  public get workingTime() {
    return this._workingTime;
  }

  public get neighbors() {
    return this._neighbors;
  }

  public set neighbors(neighbors: Process<TItem>[]) {
    this._neighbors = neighbors;
  }

  public get swapsNumber() {
    return this._swapsNumber;
  }

  public get workers() {
    return this._workers;
  }

  public get nextElements() {
    return super.nextElements as NextElementWithCondition<TItem>[];
  }

  public set nextElements(nextElements: NextElementWithCondition<TItem>[]) {
    super.nextElements = nextElements;
  }

  public isFree() {
    return Boolean(this.getFreeWorker());
  }

  private getFreeWorkers() {
    return this._workers.filter((worker) => worker.state === WorkerState.FREE);
  }

  public getFreeWorker() {
    return this.getFreeWorkers().at(0);
  }

  public getBusyWorker() {
    const busyWorkers = this.getBusyWorkers();

    if (busyWorkers.length === 0) {
      return null;
    }

    let busyWorker = busyWorkers[0];

    for (const worker of busyWorkers) {
      if (worker.tNext < busyWorker.tNext) {
        busyWorker = worker;
      }
    }

    return busyWorker;
  }

  public doStatistics(delta: number) {
    this._queueTime += this._queue.size * delta;
  }

  private getBusyWorkers() {
    return this._workers.filter((worker) => worker.state === WorkerState.BUSY);
  }

  private getMinimumWorkersTNext() {
    return Math.min(...this._workers.map((worker) => worker.tNext));
  }

  private getDelayWithCondition(item: TItem) {
    for (const delay of this.delays) {
      if (delay.condition(item)) {
        return delay;
      }
    }

    throw new Error('Wrong delay');
  }

  public static getDelayWithCondition<TItem>(
    delay: Delay,
    condition: (item: TItem) => boolean,
    processor = (item: TItem) => {},
  ) {
    return { delay, condition, processor };
  }

  private getNextElementByCondition(item: TItem) {
    if (this.nextElements.length === 0) {
      return null;
    }

    for (const { element, condition } of this.nextElements) {
      if (condition(item)) {
        return element;
      }
    }

    return null;
  }
}
