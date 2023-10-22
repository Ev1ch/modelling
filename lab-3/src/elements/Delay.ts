import Random from '../Random';

export default class Delay<TGenerator extends (...args: any[]) => number> {
  constructor(
    private _generator: TGenerator,
    private _args: Parameters<TGenerator>,
  ) {}

  public get() {
    return this._generator(...this._args);
  }

  public static getExponential(mean: number) {
    return new Delay(Random.exponential, [mean]);
  }

  public static getUniform(min: number, max: number) {
    return new Delay(Random.uniform, [min, max]);
  }

  public static getNormal(mean: number, deviation: number) {
    return new Delay(Random.normal, [mean, deviation]);
  }

  public static getErlang(mean: number, deviation: number) {
    return new Delay(Random.erlang, [mean, deviation]);
  }
}
