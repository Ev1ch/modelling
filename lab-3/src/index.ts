import Distribution from './Distribution';
import { Create, Process } from './elements';
import Queue from './elements/Queue';
import Variation from './elements/Variation';
import Model from './Model';

const create = new Create('CREATE', 1, {
  variation: Variation.RANDOM,
  distribution: Distribution.EXPONENTIAL,
});

const process1 = new Process('PROCESS 1', 1, new Queue(0), {
  maxWorkersNumber: 1,
  variation: Variation.RANDOM,
  distribution: Distribution.EXPONENTIAL,
});

const process2 = new Process('PROCESS 2', 2, new Queue(Infinity), {
  maxWorkersNumber: 2,
  distribution: Distribution.EXPONENTIAL,
  variation: Variation.PROBABILISTIC,
});

const process3 = new Process('PROCESS 3', 2, new Queue(5), {
  maxWorkersNumber: 1,
  distribution: Distribution.EXPONENTIAL,
  variation: Variation.RANDOM,
});

create.nextElements = [
  { element: process1, probability: 1, withBlocking: false, priority: 1 },
];
process1.nextElements = [
  { element: process2, probability: 1, withBlocking: false, priority: 1 },
];
process2.nextElements = [
  { element: process3, probability: 1, withBlocking: true, priority: 1 },
];

const model = new Model([create, process1, process2, process3]);
model.simulate(1000);
