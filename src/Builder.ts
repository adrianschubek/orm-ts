import { Driver } from "./Driver";
import { Processor, QueryType } from "./Processor";

export interface Query {
    type?: QueryType;
    table?: string;
    columns?: string[];
    joins?: JoinQuery[];
    orders?: string[];
    groupbys?: string[];
    having?: string[];
    wheres?: string[];
    unions?: string[];
    distinct?: boolean;
    limit?: string[];
    offset?: string[];
}

export interface JoinQuery {
    otherTable: string,
    localColumn: string,
    operator: string
    otherColumn: string
}

export function select(...attrs: string[]): QueryBuilder {
    return new QueryBuilder().select(...attrs)
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

    where(obj: {}): this {
        for (let x in obj) {
            console.log(x, obj[x])
        }
        return this;
    }

    whereIn(column: string, values: any[]): this {
        return this;
    }

    whereNotIn(column: string, values: any[]): this {
        return this;
    }

    join(otherTable: string, localColumn: string, operator: string = "=", otherColumn: string): this {
        this.query.joins.push({ otherTable, localColumn, operator, otherColumn })
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

    // sql(): string {
    //     let query = ""
    //
    //     switch (this.queryType) {
    //         case QueryType.SELECT:
    //             query = "SELECT " + (this.distinctBool ? " DISTINCT " : "") + this.selectedColumns.join(", ") + " FROM " + this.fromTable
    //             break
    //         case QueryType.UPDATE:
    //
    //             break
    //         case QueryType.INSERT:
    //             query += "INSERT INTO "
    //         case QueryType.DELETE:
    //             query += "DELETE FROM "
    //             break
    //     }
    //
    //     return query
    // }

    get(driver?: Driver): Promise<[]> {
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

export class CachedQueryBuilder extends QueryBuilder {
    // if sql same [key]
}
