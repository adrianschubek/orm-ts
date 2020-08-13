/*
 * Copyright (c) 2020. Adrian Schubek
 * https://adriansoftware.de
 */

import { JoinType, Query } from "./Builder";

export enum QueryType {
    SELECT,
    INSERT,
    UPDATE,
    DELETE,
    SUBQUERY
}

export abstract class Processor {
    protected query: Query

    // Default operators
    protected operatorsMap = {
        "=": "=",
        "<": "<",
        ">": ">",
        "<=": "<=",
        "<>": "<>",
        "BETWEEN": "BETWEEN",
        "LIKE": "LIKE",
        "IN": "IN",
        "NULL": "NULL",
        "NOT NULL": "NOT NULL"
    }

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

        const { type } = this.query;
        switch (type) {
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

        return type === QueryType.SUBQUERY ? "(" + sql + ")" : sql;
    }

    protected formatSingleQuotes(str: any, useDelimiter: boolean = true): string {
        return typeof str === "string" ? this.format(str, "'", useDelimiter) : str;
    }

    protected formatBacktick(str: string, useDelimiter: boolean = true): string {
        return str === "*" ? str : this.format(str, "`", useDelimiter);
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
        sql += this.useWhere()
        return sql
    }

    protected useSelectAndDistinct(): string {
        return "SELECT " + (this.query.distinct ? "DISTINCT " : "")
            + this.query.columns.map(value => this.formatBackticksWithTable(value)).join(", ")
            + " FROM " + this.formatBacktick(this.query.table)
    }

    protected emulateFullOuterJoin(): string {

        return ""
    }

    protected useJoins(): string {
        if (!this.query.joins.length) return ""
        let sql: string = ""

        this.query.joins.forEach(join => {
            switch (join.type) {
                case JoinType.INNER:
                    sql = " INNER JOIN "
                    break
                case JoinType.LEFT:
                    sql = " LEFT JOIN "
                    break
                case JoinType.RIGHT:
                    sql = " RIGHT JOIN "
                    break
                case JoinType.OUTER:
                    // TODO: emulateFullOuterJoin (MySQL)
                    sql = " OUTER JOIN "
                    break
                case JoinType.CROSS:
                    sql = " CROSS JOIN "
            }
            sql += this.formatBacktick(join.otherTable) + " ON "
                + this.formatBacktick(this.query.table + "." + join.localColumn)
                + " " + join.operator + " " + this.formatBacktick(join.otherTable + "." + join.otherColumn)
        })
        return sql
    }

    protected formatBackticksWithTable(str: string, table: string = this.query.table): string {
        if (str.includes(".")) {
            return this.formatBacktick(str)
        }
        return this.formatBacktick(table) + "." + this.formatBacktick(str)
    }

    protected useWhere(): string {
        if (!this.query.wheres.length) return ""
        let sql: string = " WHERE "

        this.query.wheres.forEach(whereStmnt => {
            if (whereStmnt.beforeConnector === "and") sql += " AND ";
            if (whereStmnt.beforeConnector === "or") sql += " OR ";

            sql += this.formatBackticksWithTable(whereStmnt.column) + " " + this.operatorsMap[whereStmnt.operator]
                + " " + this.formatSingleQuotes(whereStmnt.value)
        })

        return sql
    }
}
