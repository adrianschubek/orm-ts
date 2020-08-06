import mysql, { FieldInfo, MysqlError } from "mysql";
import { Processor, MySqlProcessor } from "./Processor";

export abstract class Driver {
    public grammar?: Processor;

    abstract all(): {}

    abstract find()

    abstract query(query: string, parameters?: []): Promise<[]>
}

export class ArrayDriver implements Driver {
    protected db = new Map<string, object>();

    all(): {} {
        return {};
    }

    find() {

    }

    query(query: string, parameters?: []): Promise<[]> {
        throw "rawQuery not supported in ArrayAdapter";
    }
}

export class MySqlDriver extends Driver {
    protected connection: mysql.Connection;

    constructor({ host, user, password, database }: { host: string, user: string, password: string, database: string }) {
        super();
        this.connection = mysql.createConnection({ host, user, password, database });
        this.grammar = new MySqlProcessor()
    }

    static create({ host, user, password, database }: { host: string, user: string, password: string, database: string }): MySqlDriver {
        return new MySqlDriver({ host, user, password, database });
    }

    all(): {} {
        return {};
    }

    find() {

    }

    query(sql: string, parameters?: []): Promise<[]> {
        return new Promise<[]>(resolve => {
            this.connection.query(sql, parameters, (err: MysqlError, results, fields: FieldInfo[]) => {
                if (err) throw err;
                resolve(results);
            });
        });
    }

    async connect(onError?: (err: mysql.MysqlError) => {}): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.connect(err => {
                if (!err) {
                    return resolve();
                }
                if (!onError) {
                    throw err;
                }
                onError(err);
                reject();
            });
        });
    }

    async disconnect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.end((err?: MysqlError) => {
                if (err) {
                    reject();
                }
                resolve();
            });
        });
    }
}
