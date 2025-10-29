import { Injectable } from '@nestjs/common';

@Injectable()
export class SleepService {
    private entries: any[] = [];

    create(entry: any) {
        this.entries.push(entry);
        return entry;
    }

    findAll() {
        return this.entries;
    }
}
