import { Create, Process } from './elements';
import Model from './Model';

const MAX_QUEUE_SIZE = 5;
const MAX_WORKERS_NUMBER = 1;

const create = new Create('CREATOR', 1);
const process1 = new Process('PROCESS 1', (10 + 2) / 2, {
  maxWorkersNumber: 1,
  maxQueueSize: Infinity,
});
const process2 = new Process('PROCESS 2', (10 + 2) / 2, {
  maxWorkersNumber: 1,
  maxQueueSize: Infinity,
});
const process3 = new Process('PROCESS 3', (2 + 4) / 2, {
  maxWorkersNumber: 1,
  maxQueueSize: Infinity,
});

create.nextElements = [process1, process2];
process1.nextElements = [process3];
process2.nextElements = [process3];

const model = new Model([create, process1, process2, process3]);
model.simulate(1000);
