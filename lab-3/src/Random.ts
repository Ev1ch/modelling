export default class Random {
  public static exponential(mean: number) {
    let number = 0;

    while (number === 0) {
      number = Math.random();
    }

    number = -mean * Math.log(number);

    return number;
  }

  public static uniform(min: number, max: number) {
    let number = 0;

    while (number === 0) {
      number = Math.random();
    }

    number = min + number * (max - min);

    return number;
  }

  public static normal(mean: number, deviation: number) {
    let number = 0;

    for (let i = 0; i < 12; i++) {
      number += Math.random();
    }

    number -= 6;

    return mean + number * deviation;
  }

  public static erlang(mean: number, deviation: number) {
    let number = 0;

    for (let i = 0; i < deviation; i++) {
      number += Random.exponential(mean);
    }

    return -1 / deviation / mean + Math.log(number);
  }
}
