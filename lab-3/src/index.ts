import { Create, Delay, Dispose, Process, Queue, Variation } from './elements';
import Model from './Model';
import Random from './Random';

const truthy = () => true;

class Models {
  public static getBankModel() {
    class Client {}

    const clients = new Create(
      'CLIENTS ARRIVAL',
      [
        Create.getDelayWithCreator(
          Delay.getConstant(0.1),
          1,
          () => new Client(),
        ),
      ],
      {
        variation: Variation.BY_QUEUE_LENGTH,
      },
    );
    clients.outAct();
    clients.delays = [
      Create.getDelayWithCreator(
        Delay.getExponential(0.5),
        1,
        () => new Client(),
      ),
    ];

    const cashier1 = new Process(
      'CASHIER 1',
      [Process.getDelayWithCondition(Delay.getNormal(1, 0.3), truthy)],
      new Queue(3, [new Client(), new Client()]),
      {
        maxWorkersNumber: 1,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: 2,
      },
    );
    cashier1.inAct(new Client());
    cashier1.delays = [
      Process.getDelayWithCondition(Delay.getExponential(0.3), truthy),
    ];

    const cashier2 = new Process(
      'CASHIER 2',
      [Process.getDelayWithCondition(Delay.getNormal(1, 0.3), truthy)],
      new Queue(3, [new Client(), new Client()]),
      {
        maxWorkersNumber: 1,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: 2,
      },
    );
    cashier2.inAct(new Client());
    cashier2.delays = [
      Process.getDelayWithCondition(Delay.getExponential(0.3), truthy),
    ];

    const dispose = new Dispose('DISPOSE', [
      Process.getDelayWithCondition(Delay.getConstant(0), truthy),
    ]);

    clients.nextElements = [{ element: cashier1 }, { element: cashier2 }];
    cashier1.neighbors = [cashier2];
    cashier2.neighbors = [cashier1];

    cashier1.nextElements = [
      {
        element: dispose,
      },
    ];

    cashier2.nextElements = [
      {
        element: dispose,
      },
    ];

    return new Model([clients, cashier1, cashier2, dispose]);
  }

  public static getHospitalModel() {
    class Patient {
      public type: number;
    }

    const getPatientOfType = (type: number) => {
      const patient = new Patient();
      patient.type = type;
      return patient;
    };

    const patients = new Create(
      'PATIENTS',
      [
        Create.getDelayWithCreator(Delay.getExponential(15), 0.5, () =>
          getPatientOfType(1),
        ),
        Create.getDelayWithCreator(Delay.getExponential(15), 0.1, () =>
          getPatientOfType(2),
        ),
        Create.getDelayWithCreator(Delay.getExponential(15), 0.4, () =>
          getPatientOfType(3),
        ),
      ],
      {
        variation: Variation.PROBABILISTIC,
      },
    );

    const registration = new Process<Patient>(
      'REGISTRATION',
      [
        Process.getDelayWithCondition(
          Delay.getConstant(15),
          (patient) => patient.type === 1,
        ),
        Process.getDelayWithCondition(
          Delay.getConstant(40),
          (patient) => patient.type === 2,
        ),
        Process.getDelayWithCondition(
          Delay.getConstant(30),
          (patient) => patient.type === 3,
        ),
      ],
      new Queue(99999),
      {
        maxWorkersNumber: 2,
        variation: Variation.BY_CONDITION,
        minimumDifferenceToSwap: Infinity,
      },
    );

    const goingToWards = new Process<Patient>(
      'GOING TO WARDS',
      [Process.getDelayWithCondition(Delay.getConstant((3 + 8) / 2), truthy)],
      new Queue(99999),
      {
        maxWorkersNumber: 3,
        variation: Variation.PROBABILISTIC,
        minimumDifferenceToSwap: Infinity,
      },
    );

    const goingToLaboratory = new Process(
      'GOING TO LABORATORY',
      [Process.getDelayWithCondition(Delay.getConstant((2 + 5) / 2), truthy)],
      new Queue(99999),
      {
        maxWorkersNumber: 99999,
        variation: Variation.PROBABILISTIC,
        minimumDifferenceToSwap: Infinity,
      },
    );

    const laboratory = new Process(
      'LABORATORY',
      [Process.getDelayWithCondition(Delay.getErlang(4.5, 3), truthy)],
      new Queue(99999),
      {
        maxWorkersNumber: 1,
        variation: Variation.PROBABILISTIC,
        minimumDifferenceToSwap: Infinity,
      },
    );

    const analysis = new Process<Patient>(
      'ANALYSIS',
      [
        Process.getDelayWithCondition(
          Delay.getErlang(4, 2),
          Random.boolean,
          (patient) => {
            patient.type = 1;
          },
        ),
        Process.getDelayWithCondition(Delay.getErlang(4, 2), truthy),
      ],
      new Queue(Infinity),
      {
        maxWorkersNumber: 2,
        variation: Variation.RANDOM,
        minimumDifferenceToSwap: Infinity,
      },
    );

    const dispose = new Dispose<Patient>('DISPOSE', []);

    patients.nextElements = [
      {
        element: registration,
        probability: 1,
        withBlocking: true,
      },
    ];

    registration.nextElements = [
      {
        element: goingToWards,
        condition: (patient) => patient.type === 1,
        withBlocking: true,
      },
      {
        element: goingToLaboratory,
        condition: (patient) => patient.type !== 1,
      },
    ];

    goingToWards.nextElements = [
      {
        element: dispose,
        probability: 1,
      },
    ];

    goingToLaboratory.nextElements = [
      {
        element: laboratory,
        probability: 1,
        withBlocking: true,
      },
    ];

    laboratory.nextElements = [
      {
        element: analysis,
        probability: 1,
        withBlocking: true,
      },
    ];

    analysis.nextElements = [
      {
        element: registration,
        condition: (patient) => patient.type === 1,
        withBlocking: true,
      },
      {
        element: dispose,
        condition: (patient) => patient.type !== 1,
      },
    ];

    return new Model([
      patients,
      registration,
      goingToWards,
      goingToLaboratory,
      laboratory,
      analysis,
      dispose,
    ]);
  }
}

const model = Models.getHospitalModel();
model.simulate(1000);
