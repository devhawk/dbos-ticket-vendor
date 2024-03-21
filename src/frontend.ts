import { ArgSource, ArgSources, GetApi, HandlerContext } from "@dbos-inc/dbos-sdk";
import { Liquid } from "liquidjs";
import { TicketVendor } from "./operations";
import path from 'path';

const engine = new Liquid({
    root: path.resolve(__dirname, '..', 'public'),
    extname: ".liquid"
});

function render(file: string, ctx?: object): Promise<string> {
    return engine.renderFile(file, ctx) as Promise<string>;
}

export class Frontend {

    @GetApi('/')
    static async index(ctx: HandlerContext) {
        const productions = await ctx.invoke(TicketVendor).getProductions();
        return await render("index", { productions });
    }

    @GetApi('/production/:id')
    static async production(ctx: HandlerContext, @ArgSource(ArgSources.URL) id: number) {
        const production = await ctx.invoke(TicketVendor).getProduction(id);
        const performances = await ctx.invoke(TicketVendor).getPerformances(id);
        return await render("production", { production, performances });
    }
}  