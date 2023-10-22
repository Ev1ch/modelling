import Element from './Element';
import Worker, { WorkerState } from './Worker';
import Variation from './Variation';
import Queue from './Queue';
import Delay from './Delay';

export interface ProcessOptions {
  maxWorkersNumber: number;
  variation: Variation;
  minimumDifferenceToSwap: number;
}

export default class Process extends Element {
  private _queue: Queue;
  private _failuresNumber: number;
  private _maxWorkersNumber: number;
  private _swapsNumber: number;
  private _minimumDifferenceToSwap: number;
  private _workers: Worker[];
  private _queueTime: number;
  private _workingTime: number;
  private _neighbors: Process[];

  constructor(
    name: string,
    delay: Delay,
    queue: Queue,
    { maxWorkersNumber, variation, minimumDifferenceToSwap }: ProcessOptions,
  ) {
    super(name, delay);
    this._failuresNumber = 0;
    this._queueTime = 0;
    this._workers = [];
    this._workingTime = 0;
    this._queue = queue;
    this._maxWorkersNumber = maxWorkersNumber;
    this.variation = variation;
    this.delay = delay;
    this._neighbors = [];
    this._swapsNumber = 0;
    this._minimumDifferenceToSwap = minimumDifferenceToSwap;

    for (let i = 0; i < this._maxWorkersNumber; i++) {
      this._workers.push(new Worker(i));
    }
  }

  public inAct() {
    const freeWorker = this.getFreeWorker();

    if (freeWorker) {
      freeWorker.state = WorkerState.BUSY;
      const delay = this.delay.get();
      freeWorker.tNext = this.tCurrent + delay;
      this._workingTime += delay;
      this.tNext = freeWorker.tNext;
      return;
    }

    if (!this._queue.isFull()) {
      this._queue.addItem();
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

    busyWorker.tNext = Infinity;
    this.tNext = this.getMinimumWorkersTNext();
    busyWorker.state = WorkerState.FREE;

    this.swapQueueItems();

    const fullNextElement = this.getFullNextElement();

    if (
      fullNextElement &&
      !fullNextElement.element.isFree() &&
      fullNextElement.withBlocking
    ) {
      busyWorker.tNext = fullNextElement.element.tNext;
      busyWorker.state = WorkerState.BUSY;
      return;
    }

    if (!this._queue.isEmpty()) {
      this._queue.removeItem();
      busyWorker.state = WorkerState.BUSY;
      const delay = this.delay.get();
      busyWorker.tNext = this.tCurrent + delay;
      this._workingTime += delay;
      this.tNext = this.getMinimumWorkersTNext();
    }

    fullNextElement?.element.inAct();
  }

  private swapQueueItems() {
    for (const neighbor of this._neighbors) {
      if (
        this._queue.size - neighbor.queue.size >=
        this._minimumDifferenceToSwap
      ) {
        neighbor.queue.addItem();
        this._queue.removeItem();
        this._swapsNumber++;
        return;
      }
    }
  }

  public get queue() {
    return this._queue;
  }

  public set queue(queue: Queue) {
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

  public set neighbors(neighbors: Process[]) {
    this._neighbors = neighbors;
  }

  public get swapsNumber() {
    return this._swapsNumber;
  }

  public get workers() {
    return this._workers;
  }

  public isFree() {
    return Boolean(this.getFreeWorker()) || !this._queue.isFull();
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
}
