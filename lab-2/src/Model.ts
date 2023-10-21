import chalk from 'chalk';

import Element from './elements/Element';
import Process from './elements/Process';
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

    let totalFailures = 0;

    for (const element of this.list) {
      element.printResult();

      if (element instanceof Process) {
        const mean = element.meanQueue / this.tCurrent;
        totalFailures += element.failuresNumber;

        process.stdout.write(
          [
            `mean length of queue = ${mean.toFixed(Settings.PRECISION)}`,
            `failure = ${element.failuresNumber} (${(
              element.failuresNumber /
              (element.quantity + element.failuresNumber)
            ).toFixed(Settings.PRECISION)})`,
            `mean work time = ${(element.workingTime / this.time).toFixed(
              Settings.PRECISION,
            )}`,
          ]
            .map((x) => x.padEnd(Settings.PADDING))
            .join(Settings.DIVIDER) + '\n',
        );
      } else {
        process.stdout.write('\n');
      }
    }

    console.log(`Total failures = ${totalFailures}`);
  }
}
