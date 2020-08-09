import { Query } from "./Builder";

export const enum QueryType {
    SELECT,
    INSERT,
    UPDATE,
    DELETE,
    SUBQUERY
}

export abstract class Processor {
    protected query: Query

    abstract compile(query: Query): string

    protected format(str: string, delimiter: string, useDelimiter: boolean = true, separator: string = "."): string {
        if (useDelimiter) {
            return str.split(separator).map(value => delimiter + value + delimiter).join(separator) // => `users`.`id`
        }
        return delimiter + str + delimiter // => `users.id`
    }
}

export class MySqlProcessor extends Processor {

    compile(query: Query): string {
        this.query = query
        let sql: string = ""
        console.log(query);

        switch (this.query.type) {
            case QueryType.SELECT:
                sql = this.createSelectQuery()
                break
            case QueryType.UPDATE:
                sql = this.createUpdateQuery()
                break
            case QueryType.INSERT:
                sql = this.createInsertQuery()
                break
            case QueryType.DELETE:
                sql = this.createDeleteQuery()
                break
        }

        if (this.query.type === QueryType.SUBQUERY) {
            sql = "(" + sql + ")"
        }

        return sql;
    }

    protected formatSingleQuotes(str: string, useDelimiter: boolean = true): string {
        return this.format(str, "'", useDelimiter)
    }

    protected formatBacktick(str: string, useDelimiter: boolean = true): string {
        return this.format(str, "`", useDelimiter)
    }

    protected createInsertQuery(): string {
        return
    }

    protected createUpdateQuery(): string {
        return
    }

    protected createDeleteQuery(): string {
        return
    }

    protected createSelectQuery(): string {
        let sql: string = this.useSelectAndDistinct()
        sql += this.useJoins()
        return sql
    }

    protected useSelectAndDistinct(): string {
        return "SELECT " + (this.query.distinct ? "DISTINCT " : "")
            + this.query.columns.map(value => this.formatBacktick(value)).join(", ")
            + " FROM " + this.formatBacktick(this.query.table)
    }

    protected useJoins(): string {
        if (!this.query.joins.length) return ""
    }
}
