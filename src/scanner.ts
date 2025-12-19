export class Scanner {
  public pos = 0;
  constructor(public input: string) {}

  peek(n = 1): string {
    return this.input.slice(this.pos, this.pos + n);
  }

  consume(): string {
    return this.input[this.pos++] || "";
  }

  hasMore(): boolean {
    return this.pos < this.input.length;
  }

  peekLine(): string {
    const end = this.input.indexOf("\n", this.pos);
    return end === -1
      ? this.input.slice(this.pos)
      : this.input.slice(this.pos, end);
  }

  consumeLine(): string {
    const end = this.input.indexOf("\n", this.pos);
    let line: string;
    if (end === -1) {
      line = this.input.slice(this.pos);
      this.pos = this.input.length;
    } else {
      line = this.input.slice(this.pos, end);
      this.pos = end + 1;
    }
    return line;
  }

  match(regex: RegExp): RegExpMatchArray | null {
    return this.input.slice(this.pos).match(regex);
  }

  matchAndConsume(regex: RegExp): RegExpMatchArray | null {
    const m = this.match(regex);
    if (m && m.index === 0 && m[0].length > 0) {
      this.pos += m[0].length;
      return m;
    }
    return null;
  }
}
