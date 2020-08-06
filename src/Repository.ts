import {Driver} from "./Driver";

export abstract class Repository {
    protected adapter: Driver

    constructor(adapter: Driver) {
        this.adapter = adapter;
    }

    all() {
        return this.adapter.all()
    }
}
