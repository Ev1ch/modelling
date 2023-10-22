import chalk from 'chalk';

import { Dispose, Element, Process } from './elements';
import Settings from './Settings';

export default class Model {
  private list: Element[];
  private tNext: number;
  private tCurrent: number;
  private event: number;
  private time: number;

  constructor(list: Element[]) {
    this.list = list;
    this.tNext = 0;
    this.event = 0;
    this.time = 0;
    this.tCurrent = this.tNext;
  }

  public simulate(time: number) {
    this.time = time;

    while (this.tCurrent < time) {
      this.tNext = Infinity;

      for (const element of this.list) {
        if (element.tNext < this.tNext) {
          this.tNext = element.tNext;
          this.event = element.id;
        }
      }

      console.log(
        chalk.yellow(
          `Event in ${chalk.green(
            this.list[this.event].name,
          )}, time = ${this.tNext.toFixed(Settings.PRECISION)}:`,
        ),
      );

      for (const element of this.list) {
        element.doStatistics(this.tNext - this.tCurrent);
      }

      this.tCurrent = this.tNext;
      for (const element of this.list) {
        element.tCurrent = this.tCurrent;
      }

      this.list[this.event].outAct();
      for (const element of this.list) {
        if (element.tNext === this.tCurrent) {
          element.outAct();
        }
      }

      this.printInfo();
    }

    this.printResults();
  }

  printInfo() {
    for (const el of this.list) {
      el.printInfo();
    }

    console.log();
  }

  printResults() {
    console.log(chalk.yellow('Results'));

    for (const element of this.list) {
      element.printResult();

      if (element instanceof Process) {
        process.stdout.write(
          [
            `mean length of queue = ${(element.queueTime / this.time).toFixed(
              Settings.PRECISION,
            )}`,
            `failure = ${element.failuresNumber} (${(
              element.failuresNumber /
              (element.quantity + element.failuresNumber)
            ).toFixed(Settings.PRECISION)})`,
            `mean work time = ${(element.workingTime / this.time).toFixed(
              Settings.PRECISION,
            )}`,
            `swaps number = ${element.swapsNumber}`,
          ]
            .map((x) => x.padEnd(Settings.PADDING))
            .join(Settings.DIVIDER) + '\n',
        );
      } else {
        process.stdout.write('\n');
      }
    }

    process.stdout.write(
      [
        `total failures = ${this.getTotalFailuresNumber()}`,
        `mean items number in all processes = ${this.getMeanItemsNumberInAllProcesses().toFixed(
          Settings.PRECISION,
        )}`,
        `mean time between disposes = ${this.getMeanTimeBetweenDisposes().toFixed(
          Settings.PRECISION,
        )}`,
        `mean time in system = ${this.getMeanTimeInSystem().toFixed(
          Settings.PRECISION,
        )}`,
      ]
        .map((x) => x.padEnd(Settings.PADDING))
        .join(Settings.DIVIDER) + '\n',
    );
  }

  private getDisposes() {
    return this.list.filter(
      (element) => element instanceof Dispose,
    ) as Dispose[];
  }

  private getMeanTimeBetweenDisposes() {
    return (
      this.getDisposes().reduce(
        (sum, element) => sum + element.totalTimeBeforeLeave,
        0,
      ) / this.getProcessesQuantitiesSum()
    );
  }

  private getProcesses() {
    return this.list.filter(
      (element) => element instanceof Process,
    ) as Process[];
  }

  private getProcessesQuantitiesSum() {
    return this.getProcesses().reduce(
      (sum, element) => sum + element.quantity,
      0,
    );
  }

  private getMeanTimeInSystem() {
    return (
      this.getProcesses().reduce(
        (sum, element) => sum + element.workingTime + element.queueTime,
        0,
      ) / this.getProcessesQuantitiesSum()
    );
  }

  private getMeanItemsNumberInAllProcesses() {
    return this.getProcesses().reduce(
      (sum, element) =>
        sum + element.workers.length + element.queueTime / this.time,
      0,
    );
  }

  private getTotalFailuresNumber() {
    return this.getProcesses().reduce(
      (sum, element) => sum + element.failuresNumber,
      0,
    );
  }
}
