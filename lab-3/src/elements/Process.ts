import Distribution from '../Distribution';
import Element from './Element';
import Worker, { WorkerState } from './Worker';
import Variation from './Variation';

export interface ProcessOptions {
  maxWorkersNumber: number;
  maxQueueSize: number;
  variation: Variation;
  distribution: Distribution;
  withBlocking: boolean;
}

export default class Process extends Element {
  private _queue: number;
  private _maxQueueSize: number;
  private _failuresNumber: number;
  private _maxWorkersNumber: number;
  private _workers: Worker[];
  private _meanQueue: number;
  private _workingTime: number;
  private _withBlocking: boolean;

  constructor(
    name: string,
    delay: number,
    {
      maxWorkersNumber,
      maxQueueSize,
      withBlocking,
      variation,
      distribution,
    }: ProcessOptions,
  ) {
    super(name, delay);
    this._failuresNumber = 0;
    this._meanQueue = 0;
    this._workers = [];
    this._workingTime = 0;
    this._queue = 0;
    this._maxQueueSize = maxQueueSize;
    this._maxWorkersNumber = maxWorkersNumber;
    this.variation = variation;
    this.distribution = distribution;
    this._withBlocking = withBlocking;

    for (let i = 0; i < this._maxWorkersNumber; i++) {
      this._workers.push(new Worker(i));
    }
  }

  public inAct() {
    const freeWorker = this.getFreeWorker();

    if (freeWorker) {
      freeWorker.state = WorkerState.BUSY;
      const delay = this.delay;
      freeWorker.tNext = this.tCurrent + delay;
      this._workingTime += delay;
      this.tNext = freeWorker.tNext;
      return;
    }

    if (this._queue < this._maxQueueSize) {
      this._queue += 1;
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

    const nextElement = this.getNextElement();
    // @ts-ignore
    if (nextElement?.isBusy() && nextElement?.withBlocking) {
      busyWorker.tNext = nextElement.tNext;
      busyWorker.state = WorkerState.BUSY;
      return;
    }

    if (this._queue > 0) {
      this._queue -= 1;
      busyWorker.state = WorkerState.BUSY;
      busyWorker.tNext = this.tCurrent + this.delay;
      this._workingTime += this.delay;
      this.tNext = this.getMinimumWorkersTNext();
    }

    nextElement?.inAct();
  }

  public get queue() {
    return this._queue;
  }

  public set queue(queue: number) {
    this._queue = queue;
  }

  public get state() {
    return this.getBusyWorker()?.id ?? 0;
  }

  public get failuresNumber() {
    return this._failuresNumber;
  }

  public get maxQueueSize() {
    return this._maxQueueSize;
  }

  public get maxWorkersNumber() {
    return this._maxWorkersNumber;
  }

  public get meanQueue() {
    return this._meanQueue;
  }

  public get workingTime() {
    return this._workingTime;
  }

  public get withBlocking() {
    return this._withBlocking;
  }

  public set withBlocking(withBlocking: boolean) {
    this._withBlocking = withBlocking;
  }

  public isFree() {
    return this.getFreeWorker() !== null || this._queue < this._maxQueueSize;
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
    this._meanQueue = this._meanQueue + this._queue * delta;
  }

  private getBusyWorkers() {
    return this._workers.filter((worker) => worker.state === WorkerState.BUSY);
  }

  private getMinimumWorkersTNext() {
    return Math.min(...this._workers.map((worker) => worker.tNext));
  }
}
