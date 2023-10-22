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

  public static gaussian() {
    let number = 0;

    for (let i = 0; i < 6; i += 1) {
      number += Math.random();
    }

    return number / 6;
  }

  public static normal(mean: number, deviation: number) {
    return mean + Random.gaussian() * deviation;
  }

  public static erlang(mean: number, deviation: number) {
    let number = 0;

    for (let i = 0; i < deviation; i++) {
      number += Random.exponential(mean);
    }

    return -1 / deviation / mean + Math.log(number);
  }
}
