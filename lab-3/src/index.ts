import {
  Create,
  Delay,
  Dispose,
  Process,
  Queue,
  Variation,
  Element,
} from './elements';
import Model from './Model';

class Models {
  public static getBankModel() {
    const clients = new Create(
      'CLIENTS ARRIVAL',
      [Element.getDelayWithProbability(Delay.getConstant(0.1), 1)],
      {
        variation: Variation.BY_QUEUE_LENGTH,
      },
    );
    clients.outAct();
    clients.delays = [
      Element.getDelayWithProbability(Delay.getExponential(0.5), 1),
    ];

    const cashier1 = new Process(
      'CASHIER 1',
      [Element.getDelayWithProbability(Delay.getNormal(1, 0.3), 1)],
      new Queue(3, 2),
      {
        maxWorkersNumber: 1,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: 2,
      },
    );
    cashier1.inAct();
    cashier1.delays = [
      Element.getDelayWithProbability(Delay.getExponential(0.3), 1),
    ];

    const cashier2 = new Process(
      'CASHIER 2',
      [Element.getDelayWithProbability(Delay.getNormal(1, 0.3), 1)],
      new Queue(3, 2),
      {
        maxWorkersNumber: 1,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: 2,
      },
    );
    cashier2.inAct();
    cashier2.delays = [
      Element.getDelayWithProbability(Delay.getExponential(0.3), 1),
    ];

    const dispose = new Dispose('DISPOSE', [
      Element.getDelayWithProbability(Delay.getConstant(0), 1),
    ]);

    clients.nextElements = [
      { element: cashier1, probability: 0.5, priority: 1, withBlocking: false },
      { element: cashier2, probability: 0.5, priority: 2, withBlocking: false },
    ];
    cashier1.neighbors = [cashier2];
    cashier2.neighbors = [cashier1];

    cashier1.nextElements = [
      {
        element: dispose,
        probability: 1,
        priority: 1,
        withBlocking: false,
      },
    ];

    cashier2.nextElements = [
      {
        element: dispose,
        probability: 1,
        priority: 1,
        withBlocking: false,
      },
    ];

    return new Model([clients, cashier1, cashier2, dispose]);
  }
}

const model = Models.getBankModel();
model.simulate(1000);
