export class Timer {
  moduleName: string;
  startTime: number;

  constructor(moduleName: string) {
    this.moduleName = moduleName;
    this.startTime = Date.now();
  }

  startTimer() {
    return Date.now();
  }

  endTimer(start: number) {
    return Date.now() - start;
  }

  resetStartTime() {
    this.startTime = Date.now();
  }

  printTimeTaken(timerName: string, startTime?: number) {
    console.log(
      `${this.moduleName} - ${timerName} has taken ${
        Date.now() - (startTime ? startTime : this.startTime)
      }ms to complete`
    );
  }
}
