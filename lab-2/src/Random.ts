export default class Random {
  public static exponential(mean: number) {
    let number = 0;

    while (number === 0) {
      number = Math.random();
    }

    number = -mean * Math.log(number);

    return number;
  }
}
