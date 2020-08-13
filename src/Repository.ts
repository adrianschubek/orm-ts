/*
 * Copyright (c) 2020. Adrian Schubek
 * https://adriansoftware.de
 */

import { Driver } from "./Driver";

export abstract class Repository {
    protected adapter: Driver

    constructor(adapter: Driver) {
        this.adapter = adapter;
    }

    all() {
        return this.adapter.all()
    }
}
