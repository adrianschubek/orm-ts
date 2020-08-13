/*
 * Copyright (c) 2020. Adrian Schubek
 * https://adriansoftware.de
 */

import { Driver } from "./Driver";
import { Processor, QueryType } from "./Processor";

export interface Query {
    type?: QueryType;
    table?: string;
    columns?: string[];
    joins?: JoinStatement[];
    orders?: string[];
    groupbys?: string[];
    having?: string[];
    wheres?: WhereStatement[];
    unions?: string[];
    distinct?: boolean;
    limit?: string[];
    offset?: string[];
}

export interface JoinStatement {
    type: JoinType
    otherTable: string
    localColumn: string
    operator: string
    otherColumn: string
}

export enum JoinType {
    INNER,
    LEFT,
    RIGHT,
    OUTER,
    CROSS
}

export type Operator = "=" | "<" | ">" | ">=" | "<=" | "<>" | "LIKE"

export type Connector = "" | "and" | "or"

export interface WhereStatement {
    beforeConnector: Connector
    column: string
    operator: Operator
    value: any
}

export function select(...attrs: string[]): QueryBuilder {
    return new QueryBuilder().select(...attrs)
}

export function use(table: string) {
    
}

export class QueryBuilder {
    protected static defaultCon?: Driver;

    protected localProcessor: Processor;

    protected query: Query = {
        type: QueryType.SELECT,
        table: "",
        columns: ["*"],
        joins: [],
        wheres: [],
        orders: [],
        groupbys: [],
        having: [],
        unions: [],
        distinct: false,
        limit: [],
        offset: [],
    }

    constructor(query?: Query) {
        this.query = { ...this.query, ...query }
    }

    static useDriver(driver: Driver) {
        this.defaultCon = driver;
    }

    static use(table: string): QueryBuilder {
        return new QueryBuilder({ table });
    }

    protected static newSubQuery(): Query {
        return { type: QueryType.SUBQUERY }
    }

    useProcessor(processor: Processor) {
        this.localProcessor = processor;
    }

    select(...attrs: string[]): this {
        this.query.columns = attrs;
        return this;
    }

    from(table: string): this {
        this.query.table = table
        return this
    }

    distinct(value: boolean = true): this {
        this.query.distinct = value;
        return this;
    }

    andWhere(obj: {}): this

    andWhere(builder: (builder: QueryBuilder) => void): this

    andWhere(column: string, operator?: Operator, value?: any): this

    andWhere(column: {} | string, operator?: Operator, value?: any): this {
        return this.where(column, operator, value, "and")
    }

    orWhere(obj: {}): this

    orWhere(column: {}, operator?: Operator, value?: any): this

    orWhere(column: {} | string, operator?: Operator, value?: any): this {
        return this.where(column, operator, value, "or")
    }

    where(obj: {}): this

    where(column: {} | string, operator?: Operator, value?: any, beforeConnector?: Connector): this

    where(column: {} | string, operator?: Operator, value?: any, beforeConnector: Connector = ""): this {
        if (typeof column === "string") {
            if (!column) throw "Column name must be set";
            this.query.wheres.push({ beforeConnector, operator, column, value })
            return this
        }

        for (let property in column) {
            let whereStatement: WhereStatement = {
                beforeConnector,
                operator: "=",
                column: "",
                value: ""
            }

            if (typeof column[property] !== "string") {
                whereStatement.column = property
                whereStatement.value = column[property]
            } else {
                if (column[property].startsWith(">")) {
                    whereStatement.operator = ">"
                    whereStatement.value = column[property].substr(1)
                } else if (column[property].startsWith("<")) {
                    whereStatement.operator = "<"
                    whereStatement.value = column[property].substr(1)
                } else if (column[property].startsWith(">=")) {
                    whereStatement.operator = ">="
                    whereStatement.value = column[property].substr(2)
                } else if (column[property].startsWith("<=")) {
                    whereStatement.operator = "<="
                    whereStatement.value = column[property].substr(2)
                } else if (column[property].startsWith("<>") || column[property].startsWith("!=")) {
                    whereStatement.operator = "<>"
                    whereStatement.value = column[property].substr(2)
                } else if (column[property].startsWith("=")) {
                    whereStatement.value = column[property].substr(1)
                } else {
                    whereStatement.value = column[property]
                }
            }
            this.query.wheres.push(whereStatement)
        }
        return this;
    }

    whereNull(column: string, values: any[]): this {
        return this;
    }

    whereNotNull(column: string, values: any[]): this {
        return this;
    }

    whereBetween(column: string, values: any[]): this {
        return this;
    }

    whereIn(column: string, values: any[]): this {
        return this;
    }

    whereNotIn(column: string, values: any[]): this {
        return this;
    }

    join(otherTable: string, localColumn: string, operator: string = "=", otherColumn: string): this {
        this.query.joins.push({ otherTable, localColumn, operator, otherColumn, type: JoinType.INNER })
        return this
    }

    leftJoin(otherTable: string, localColumn: string, operator: string = "=", otherColumn: string): this {
        this.query.joins.push({ otherTable, localColumn, operator, otherColumn, type: JoinType.LEFT })
        return this
    }

    rightJoin(otherTable: string, localColumn: string, operator: string = "=", otherColumn: string): this {
        this.query.joins.push({ otherTable, localColumn, operator, otherColumn, type: JoinType.RIGHT })
        return this
    }

    fullJoin(otherTable: string, localColumn: string, operator: string = "=", otherColumn: string): this {
        this.query.joins.push({ otherTable, localColumn, operator, otherColumn, type: JoinType.OUTER })
        return this
    }

    crossJoin(otherTable: string): this {
        this.query.joins.push({
            otherTable,
            type: JoinType.CROSS,
            localColumn: null,
            operator: null,
            otherColumn: null
        })
        return this
    }

    insert() {

    }

    sql(): string {
        if (this.localProcessor) {
            return this.localProcessor.compile(this.query);
        }

        let grammar = QueryBuilder.defaultCon.grammar;
        if (!grammar) throw `${QueryBuilder.defaultCon.constructor.name}: Neither a local nor a default grammar specified`;

        return grammar.compile(this.query);
    }

    fetch(driver?: Driver): Promise<[]> {
        return new Promise<[]>((resolve) => {
            if (!driver) {
                if (!QueryBuilder.defaultCon) {
                    throw "No default adapter configured for MySqlQueryBuilder";
                }
                driver = QueryBuilder.defaultCon;
            }
            resolve(driver.query(this.sql()));
        });
    }
}

// TODO
export class CachedQueryBuilder extends QueryBuilder {
    // if sql same [key]
    // redis
}
