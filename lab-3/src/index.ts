import { Create, Delay, Process } from './elements';
import Queue from './elements/Queue';
import Variation from './elements/Variation';
import Model from './Model';

const create = new Create('CREATE', Delay.getExponential(1), {
  variation: Variation.RANDOM,
});

const process1 = new Process(
  'PROCESS 1',
  Delay.getExponential(1),
  new Queue(0),
  {
    maxWorkersNumber: 1,
    variation: Variation.RANDOM,
    minimumDifferenceToSwap: Infinity,
  },
);

const process2 = new Process(
  'PROCESS 2',
  Delay.getExponential(2),
  new Queue(Infinity),
  {
    maxWorkersNumber: 2,
    variation: Variation.RANDOM,
    minimumDifferenceToSwap: Infinity,
  },
);

const process3 = new Process(
  'PROCESS 3',
  Delay.getExponential(2),
  new Queue(5),
  {
    maxWorkersNumber: 1,
    variation: Variation.RANDOM,
    minimumDifferenceToSwap: 2,
  },
);

const process4 = new Process(
  'PROCESS 4',
  Delay.getExponential(2),
  new Queue(5),
  {
    maxWorkersNumber: 1,
    variation: Variation.RANDOM,
    minimumDifferenceToSwap: 2,
  },
);

create.nextElements = [
  { element: process1, probability: 1, withBlocking: false, priority: 1 },
];

process1.nextElements = [
  { element: process2, probability: 1, withBlocking: false, priority: 1 },
];

process3.neighbors = [process4];
process4.neighbors = [process3];
process2.nextElements = [
  { element: process3, probability: 0.5, withBlocking: false, priority: 1 },
  { element: process4, probability: 0.5, withBlocking: false, priority: 2 },
];

const model = new Model([create, process1, process2, process3, process4]);
model.simulate(1000);
