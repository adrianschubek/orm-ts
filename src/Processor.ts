import { Query } from "./Builder";

export enum QueryType {
    SELECT,
    INSERT,
    UPDATE,
    DELETE,
    SUBQUERY
}

export abstract class Processor {

    abstract compile(query: Query): string
}

export class MySqlProcessor extends Processor {
    query: Query
    sql: string

    compile(query: Query): string {
        this.query = query
        console.log(query);

        switch (this.query.type) {
            case QueryType.SELECT:
                this.sql = this.processSelect()
                break
            default:
        }

        if (this.query.type === QueryType.SUBQUERY) {
            this.sql = "(" + this.sql + ")"
        }

        return this.sql;
    }

    protected tick(string) {
    }

    protected processSelect(): string {
        return "SELECT " + (this.query.distinct ? "DISTINCT " : "") + this.query.columns.join(", ")
    }
}
