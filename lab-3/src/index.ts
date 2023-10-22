import { Create, Delay, Process, Queue, Variation } from './elements';
import Model from './Model';

class Models {
  public static getBankModel() {
    const clients = new Create('CLIENTS ARRIVAL', Delay.getConstant(0.1), {
      variation: Variation.BY_QUEUE_LENGTH,
    });
    clients.outAct();
    clients.delay = Delay.getExponential(0.5);

    const cashier1 = new Process(
      'CASHIER 1',
      Delay.getNormal(1, 0.3),
      new Queue(3, 2),
      {
        maxWorkersNumber: 1,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: 2,
      },
    );
    cashier1.inAct();
    cashier1.delay = Delay.getExponential(0.3);

    const cashier2 = new Process(
      'CASHIER 2',
      Delay.getNormal(1, 0.3),
      new Queue(3, 2),
      {
        maxWorkersNumber: 1,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: 2,
      },
    );
    cashier2.inAct();
    cashier2.delay = Delay.getExponential(0.3);

    clients.nextElements = [
      { element: cashier1, probability: 0.5, priority: 1, withBlocking: false },
      { element: cashier2, probability: 0.5, priority: 2, withBlocking: false },
    ];
    cashier1.neighbors = [cashier2];
    cashier2.neighbors = [cashier1];

    return new Model([clients, cashier1, cashier2]);
  }
}

const model = Models.getBankModel();
model.simulate(1000);
