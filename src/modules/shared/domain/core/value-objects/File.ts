import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import { StringValueObject } from '../ValueObject';

export class File extends StringValueObject {
  async toBase64(): Promise<string> {
    const buffer = Buffer.from(this.value, 'binary');
    const base64 = buffer.toString('base64');
    return base64;
  }

  async download(): Promise<void> {
    const fileName = this.value.split('/').pop();
    const response = await fetch(this.value);
    const stream = createWriteStream(fileName);
    await finished(Readable.fromWeb(response.body as any).pipe(stream));
  }

  static toBuffer(readStream: Readable) {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      readStream.on('data', (chunk) => {
        if (typeof chunk === 'string') {
          chunks.push(Buffer.from(chunk, 'utf-8'));
        } else if (chunk instanceof Buffer) {
          chunks.push(chunk);
        } else {
          const jsonData = JSON.stringify(chunk);
          chunks.push(Buffer.from(jsonData, 'utf-8'));
        }
      });
      readStream.on('end', () => resolve(Buffer.concat(chunks)));
      readStream.on('error', reject);
    });
  }
}
