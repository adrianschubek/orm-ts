/*
 * Copyright (c) 2020. Adrian Schubek
 * https://adriansoftware.de
 */

import { Driver } from "./Driver";

export class Model {
    private static adapter: Driver;

    static connection(adapter: Driver) {
        this.adapter = adapter
    }

    static async all<T extends typeof Model>(this: T): Promise<InstanceType<T>[]> {
        this.adapter.all()

        return [new this() as InstanceType<T>]
    }

    static async create<T extends typeof Model>(this: T): Promise<InstanceType<T>> {
        return (new this()) as InstanceType<T>
    }

    static async find<T extends typeof Model>(this: T): Promise<InstanceType<T>> {
        return undefined
    }
}
